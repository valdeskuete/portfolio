/**
 * CONFIG GEMINI - Charger la clé API depuis l'environnement
 * 
 * IMPORTANT: Cette clé doit être disponible AVANT que gemini-ai.js se charge
 * 
 * Options de configuration (par ordre de priorité):
 * 1. import.meta.env.VITE_GEMINI_API_KEY (Vite build)
 * 2. window.GEMINI_API_KEY (manuel)
 * 3. Firebase Functions endpoint
 */

async function initGeminiConfig() {
    // Attendre que env-loader ait fini de charger (max 5 secondes)
    let attempts = 0;
    while (!window.VITE_GEMINI_API_KEY && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    // Chercher la clé API depuis plusieurs sources (par ordre de priorité)
    let apiKey = null;

    // Option 1: Depuis .env (chargé par env-loader.js) ← PRIORITAIRE
    if (window.VITE_GEMINI_API_KEY) {
        apiKey = window.VITE_GEMINI_API_KEY;
        console.log('✅ Clé Gemini trouvée: .env (VITE_GEMINI_API_KEY)');
    }

    // Option 2: Directement dans window
    if (!apiKey && window.GEMINI_API_KEY && window.GEMINI_API_KEY !== 'sk_YOUR_KEY_HERE') {
        apiKey = window.GEMINI_API_KEY;
        console.log('✅ Clé Gemini trouvée: window.GEMINI_API_KEY');
    }

    // Option 3: Depuis localStorage (si sauvegardée)
    if (!apiKey) {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored && stored !== 'sk_YOUR_KEY_HERE') {
            apiKey = stored;
            console.log('✅ Clé Gemini trouvée: localStorage');
        }
    }

    // Configurer la clé globale
    if (apiKey) {
        window.GEMINI_API_KEY = apiKey;
        console.log('✅ Gemini API configurée et prête à l\'emploi');
        return true;
    } else {
        console.warn('⚠️ Gemini API clé non trouvée');
        console.warn('  Configuration nécessaire:');
        console.warn('  1. Créer .env avec: VITE_GEMINI_API_KEY=AIzaSy...');
        console.warn('  2. Ou dans console: window.GEMINI_API_KEY = "AIzaSy..."');
        console.warn('  3. Ou depuis: https://aistudio.google.com/app/apikeys');
        return false;
    }
}

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeminiConfig);
} else {
    initGeminiConfig();
}

// Export pour usage dans modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getGeminiKey: () => window.GEMINI_API_KEY || null
    };
}
