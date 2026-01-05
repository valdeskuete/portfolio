/**
 * ========== GEMINI AI - MODÉRATION & AMÉLIORATION CONTENU ==========
 * Intégration directe de l'API Gemini (GRATUIT - Aucune Cloud Function requise)
 * 
 * Setup:
 * 1. Aller à: https://aistudio.google.com/app/apikeys
 * 2. Cliquer "Create API Key" 
 * 3. Copier la clé dans .env: VITE_GEMINI_API_KEY=sk_...
 */

// Configuration - Chercher la clé API dans plusieurs endroits
let GEMINI_API_KEY = null;

// Initialize GEMINI_API_KEY (with lazy loading for env vars)
function initGeminiKey() {
  // 1. Essayer window.VITE_GEMINI_API_KEY (depuis env-loader.js qui charge config.json)
  if (window.VITE_GEMINI_API_KEY) {
      GEMINI_API_KEY = window.VITE_GEMINI_API_KEY;
      console.log('✅ Clé Gemini depuis window.VITE_GEMINI_API_KEY');
      return;
  }

  // 2. Essayer window.GEMINI_API_KEY (défini manuellement)
  if (window.GEMINI_API_KEY) {
      GEMINI_API_KEY = window.GEMINI_API_KEY;
      console.log('✅ Clé Gemini depuis window.GEMINI_API_KEY');
      return;
  }

  // 3. Essayer depuis Firebase config (si disponible)
  if (window.geminiConfig?.apiKey) {
      GEMINI_API_KEY = window.geminiConfig.apiKey;
      console.log('✅ Clé Gemini depuis Firebase config');
      return;
  }
  
  // 4. Essayer depuis window.ENV (nouvellement supporté)
  if (window.ENV?.gemini?.apiKey) {
      GEMINI_API_KEY = window.ENV.gemini.apiKey;
      console.log('✅ Clé Gemini depuis window.ENV.gemini.apiKey');
      return;
  }

  // Si pas de clé trouvée
  console.warn('⚠️ Clé Gemini API non configurée. Les fonctionnalités IA seront désactivées.');
  console.warn('  Aller à: https://aistudio.google.com/app/apikeys pour obtenir une clé');
  GEMINI_API_KEY = null;
}

// Attendre que env-loader soit prêt (attend DOMContentLoaded ou exécution immédiate)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGeminiKey);
} else {
  // Si déjà chargé, initialiser immédiatement
  setTimeout(initGeminiKey, 50);
}

let requestCount = 0;
let lastResetTime = Date.now();

const GEMINI_MODEL = 'gemini-pro';
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Rate limiting - Gemini API: 60 req/min
 */
function checkRateLimit() {
    const now = Date.now();
    const elapsed = now - lastResetTime;
    
    if (elapsed > 60000) {
        requestCount = 0;
        lastResetTime = now;
    }
    
    if (requestCount >= 60) {
        console.warn('⚠️ Rate limit atteint (60 req/min). Attendre...');
        return false;
    }
    
    requestCount++;
    return true;
}

/**
 * Appel générique à Gemini API
 */
async function callGemini(prompt) {
    // S'assurer que la clé a été initialisée
    if (!GEMINI_API_KEY) {
        initGeminiKey();
    }

    if (!checkRateLimit()) {
        throw new Error('Rate limit: 60 requêtes par minute');
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'sk_YOUR_KEY_HERE') {
        console.warn('⚠️ Clé API Gemini non configurée. Aller à: https://aistudio.google.com/app/apikeys');
        return null;
    }

    try {
        const response = await fetch(
            `${API_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Erreur Gemini API:', error);
            return null;
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
            console.error('❌ Réponse Gemini vide');
            return null;
        }

        const responseText = data.candidates[0].content.parts[0].text;
        return responseText;
    } catch (error) {
        console.error('❌ Erreur appel Gemini:', error.message);
        return null;
    }
}

/**
 * ==================== MODÉRATION MESSAGES ===================
 */
async function moderateMessage(text) {
    console.log('🤖 Modération avec Gemini...');

    const prompt = `Tu es un modérateur IA. Analyse ce message pour détecter spam, contenu inapproprié, ou données personnelles.

TEXTE: "${text.substring(0, 500)}"

Réponds UNIQUEMENT avec du JSON valide (sans markdown, directement):
{
  "isSpam": false ou true,
  "isSafe": true ou false,
  "reason": "courte explication",
  "confidence": nombre entre 0 et 100,
  "category": "spam" ou "safe" ou "offensive" ou "inappropriate"
}`;

    const response = await callGemini(prompt);
    if (!response) return { isSpam: false, isSafe: true, reason: 'Analyse échouée', confidence: 0 };

    try {
        // Extraire JSON de la réponse
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ Pas de JSON dans la réponse:', response);
            return { isSpam: false, isSafe: true, reason: 'Format réponse invalide', confidence: 0 };
        }

        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Modération:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur parsing JSON:', error);
        return { isSpam: false, isSafe: true, reason: 'Erreur parsing', confidence: 0 };
    }
}

/**
 * ==================== AMÉLIORATION CONTENU ===================
 */
async function improveContent(text, type = 'general') {
    console.log('✨ Amélioration contenu avec IA...');

    let instruction = 'Améliore ce texte pour: grammaire, clarté, style professionnel, SEO.';
    
    if (type === 'project') {
        instruction = 'Améliore cette description de projet: grammaire, clarté, impact, mots-clés IT pertinents.';
    } else if (type === 'about') {
        instruction = 'Améliore ce texte "à propos": grammaire, clarté, personnalité, professionnalisme.';
    } else if (type === 'tip') {
        instruction = 'Améliore ce conseil informatique: clarté, structure, pertinence, exemples si nécessaire.';
    }

    const prompt = `${instruction}

TEXTE ORIGINAL: "${text.substring(0, 1000)}"

Réponds UNIQUEMENT avec du JSON valide:
{
  "improved": "texte amélioré",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "changes": "résumé des changements",
  "seoScore": nombre entre 0 et 100
}`;

    const response = await callGemini(prompt);
    if (!response) return { improved: text, keywords: [], changes: '', seoScore: 0 };

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { improved: text, keywords: [], changes: '', seoScore: 0 };

        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Contenu amélioré - SEO:', result.seoScore);
        return result;
    } catch (error) {
        console.error('❌ Erreur parsing amélioration:', error);
        return { improved: text, keywords: [], changes: '', seoScore: 0 };
    }
}

/**
 * ==================== VÉRIFICATION CONFORMITÉ RGPD ===================
 */
async function checkRGPDCompliance(text) {
    console.log('🔐 Vérification conformité RGPD...');

    const prompt = `Vérifie que ce texte ne contient pas de données personnelles non consenties (numéros, adresses, noms de tiers).

TEXTE: "${text.substring(0, 500)}"

Réponds UNIQUEMENT avec du JSON:
{
  "isCompliant": true ou false,
  "issues": ["problème1", "problème2"],
  "recommendation": "publish" ou "flag" ou "anonymize" ou "reject",
  "anonymized_text": "texte nettoyé si nécessaire"
}`;

    const response = await callGemini(prompt);
    if (!response) return { isCompliant: true, issues: [], recommendation: 'publish' };

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { isCompliant: true, issues: [], recommendation: 'publish' };

        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Conformité vérifiée:', result.recommendation);
        return result;
    } catch (error) {
        console.error('❌ Erreur vérification RGPD:', error);
        return { isCompliant: true, issues: [], recommendation: 'publish' };
    }
}

/**
 * ==================== GÉNÉRATION AUTO TAGS/CATÉGORIES ===================
 */
async function generateTags(title, description, type = 'general') {
    console.log('🏷️ Génération tags avec IA...');

    const prompt = `Génère des tags et catégories pour ce contenu ${type}.

TITRE: ${title}
DESCRIPTION: ${description.substring(0, 300)}

Réponds UNIQUEMENT avec du JSON:
{
  "category": "security" ou "performance" ou "network" ou "software" ou "hardware",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "difficulty": "beginner" ou "intermediate" ou "advanced",
  "audience": "personal" ou "business" ou "both"
}`;

    const response = await callGemini(prompt);
    if (!response) return { category: 'general', tags: [], difficulty: 'intermediate', audience: 'both' };

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { category: 'general', tags: [], difficulty: 'intermediate', audience: 'both' };

        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Tags générés:', result.tags);
        return result;
    } catch (error) {
        console.error('❌ Erreur génération tags:', error);
        return { category: 'general', tags: [], difficulty: 'intermediate', audience: 'both' };
    }
}

/**
 * ==================== RÉSUMÉ AUTOMATIQUE ===================
 */
async function summarizeText(text, maxLength = 200) {
    console.log('📝 Résumé avec IA...');

    const prompt = `Résume ce texte en maximum ${maxLength} caractères, avec points clés.

TEXTE: "${text.substring(0, 1000)}"

Réponds UNIQUEMENT avec du JSON:
{
  "summary": "résumé court",
  "highlights": ["point1", "point2", "point3"],
  "keyTakeaway": "point principal"
}`;

    const response = await callGemini(prompt);
    if (!response) return { summary: text.substring(0, maxLength), highlights: [], keyTakeaway: '' };

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { summary: text.substring(0, maxLength), highlights: [], keyTakeaway: '' };

        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Résumé généré');
        return result;
    } catch (error) {
        console.error('❌ Erreur résumé:', error);
        return { summary: text.substring(0, maxLength), highlights: [], keyTakeaway: '' };
    }
}

/**
 * ==================== CONFIGURATION VIA FENÊTRE MODALE ===================
 */
function showGeminiSetup() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'sk_YOUR_KEY_HERE') {
        alert(`🤖 GEMINI NON CONFIGURÉ

Obtenir votre clé API gratuite:
1. Aller à: https://aistudio.google.com/app/apikeys
2. Cliquer "Create API Key"
3. Copier la clé
4. L'ajouter à .env: VITE_GEMINI_API_KEY=sk_...
5. Ou dans console: window.GEMINI_API_KEY = "sk_..."
6. Rafraîchir la page

Avantages:
✅ Modération automatique des messages
✅ Amélioration contenu automatique
✅ Vérification conformité RGPD
✅ Tags et catégories auto
✅ Résumés automatiques

Limites GRATUITES:
⏱️ 60 requêtes par minute
📊 2 millions d'appels par mois
🔓 Quota public (pas d'identifiants sensibles)
`);
    } else {
        console.log('✅ Gemini API est configurée et prête');
    }
}

// Export global
window.GeminiAI = {
    callGemini,
    moderateMessage,
    improveContent,
    checkRGPDCompliance,
    generateTags,
    summarizeText,
    showGeminiSetup,
    getStatus: () => ({
        apiConfigured: GEMINI_API_KEY !== 'sk_YOUR_KEY_HERE',
        requestCount: requestCount,
        apiEndpoint: API_ENDPOINT
    })
};

console.log('🤖 GeminiAI Module chargé - window.GeminiAI disponible');
