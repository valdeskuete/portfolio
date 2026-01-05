/**
 * ========== GEMINI AI - MODÉRATION & AMÉLIORATION CONTENU ==========
 * Intégration avec SDK officielle Google Generative AI
 * Cela contourne mieux les problèmes CORS que les appels fetch directs
 * 
 * Setup:
 * 1. Aller à: https://aistudio.google.com/app/apikeys
 * 2. Cliquer "Create API Key" 
 * 3. Copier la clé dans config.json: "VITE_GEMINI_API_KEY": "AIzaSy..."
 */

let GEMINI_API_KEY = null;
let genAI = null;

// Initialize Gemini with official SDK
function initGeminiKey() {
  // 1. Essayer window.VITE_GEMINI_API_KEY (depuis env-loader.js qui charge config.json)
  if (window.VITE_GEMINI_API_KEY && window.VITE_GEMINI_API_KEY.startsWith('AIzaSy')) {
      GEMINI_API_KEY = window.VITE_GEMINI_API_KEY;
      console.log('✅ Clé Gemini depuis window.VITE_GEMINI_API_KEY');
      initializeSDK();
      return true;
  }

  // 2. Essayer window.GEMINI_API_KEY
  if (window.GEMINI_API_KEY && window.GEMINI_API_KEY.startsWith('AIzaSy')) {
      GEMINI_API_KEY = window.GEMINI_API_KEY;
      console.log('✅ Clé Gemini depuis window.GEMINI_API_KEY');
      initializeSDK();
      return true;
  }

  // 3. Essayer depuis window.ENV
  if (window.ENV?.VITE_GEMINI_API_KEY && window.ENV.VITE_GEMINI_API_KEY.startsWith('AIzaSy')) {
      GEMINI_API_KEY = window.ENV.VITE_GEMINI_API_KEY;
      console.log('✅ Clé Gemini depuis window.ENV.VITE_GEMINI_API_KEY');
      initializeSDK();
      return true;
  }
  
  console.warn('⚠️ Clé Gemini API non configurée (cherche AIzaSy...). Les fonctionnalités IA seront désactivées.');
  GEMINI_API_KEY = null;
  return false;
}

// Initialize Google Generative AI SDK
function initializeSDK() {
  if (!GEMINI_API_KEY || !window.GoogleGenerativeAI) {
      console.warn('⚠️ SDK ou clé manquante');
      return false;
  }
  
  try {
      genAI = new window.GoogleGenerativeAI(GEMINI_API_KEY);
      console.log('✅ SDK Google Generative AI initialisé');
      return true;
  } catch (error) {
      console.error('❌ Erreur initialisation SDK:', error);
      return false;
  }
}

let requestCount = 0;
let lastResetTime = Date.now();

const GEMINI_MODEL = 'gemini-1.5-flash';

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
 * Appel générique à Gemini API - avec SDK officielle
 */
async function callGemini(prompt) {
    // Initialize key if not done
    if (!GEMINI_API_KEY) {
        const initialized = initGeminiKey();
        if (!initialized) {
            console.warn('⚠️ Gemini API non configurée');
            return null;
        }
    }

    // Initialize SDK if not done
    if (!genAI) {
        const sdkInit = initializeSDK();
        if (!sdkInit) {
            console.warn('⚠️ SDK Gemini non disponible');
            return null;
        }
    }

    if (!checkRateLimit()) {
        throw new Error('Rate limit: 60 requêtes par minute');
    }

    try {
        // Utiliser la SDK officielle Google
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
            console.error('❌ Réponse Gemini vide');
            return null;
        }

        console.log('✅ Réponse Gemini reçue (' + text.length + ' chars)');
        return text;
    } catch (error) {
        // Gérer les erreurs silencieusement - CORS ou API rate limit
        if (error.message) {
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                // Silently fail - CORS/network issue
                return null;
            }
            if (error.message.includes('429') || error.message.includes('quota')) {
                console.warn('⚠️ API quota exceeded');
                return null;
            }
            if (error.message.includes('401') || error.message.includes('403')) {
                console.warn('⚠️ Clé API invalide ou expiré');
                return null;
            }
        }
        console.warn('⚠️ Gemini API error:', error.message || error);
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
    const status = getStatus();
    if (!status.apiConfigured) {
        alert(`🤖 GEMINI NON CONFIGURÉ

Obtenir votre clé API gratuite:
1. Aller à: https://aistudio.google.com/app/apikeys
2. Cliquer "Create API Key"
3. Copier la clé (commence par AIzaSy...)
4. L'ajouter à config.json: "VITE_GEMINI_API_KEY": "AIzaSy..."
5. Rafraîchir la page (Ctrl+Shift+R)

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
        console.log('✅ Gemini API est configurée:', status);
    }
}

/**
 * ==================== VÉRIFIER STATUS ===================
 */
function getStatus() {
    return {
        apiConfigured: GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy'),
        sdkLoaded: !!window.GoogleGenerativeAI,
        sdkInitialized: !!genAI,
        requestCount: requestCount,
        model: GEMINI_MODEL
    };
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
    getStatus
};

console.log('📦 GeminiAI Module chargé avec SDK officielle - window.GeminiAI disponible');
