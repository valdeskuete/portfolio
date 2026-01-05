/**
 * ========== ENV LOADER - CHARGER LES VARIABLES D'ENVIRONNEMENT ==========
 * Charge les variables depuis .env ou config.json
 * À charger AVANT les autres scripts
 */

window.EnvLoader = {
  config: {},
  loaded: false,

  /**
   * Initialiser le chargement des variables
   */
  async init() {
    console.log('[EnvLoader] Initialisation du chargement env...');
    
    try {
      // 1. Essayer de charger depuis config.json
      await this.loadFromJSON();
      
      // 2. Essayer de charger depuis window (défini directement en HTML)
      if (!this.config.VITE_GEMINI_API_KEY && window.VITE_GEMINI_API_KEY) {
        this.config.VITE_GEMINI_API_KEY = window.VITE_GEMINI_API_KEY;
      }
      
      // 3. Essayer depuis localStorage (développement)
      if (!this.config.VITE_GEMINI_API_KEY) {
        const stored = localStorage.getItem('VITE_GEMINI_API_KEY');
        if (stored) {
          this.config.VITE_GEMINI_API_KEY = stored;
        }
      }
      
      // Exposer globalement pour les autres scripts
      this.exposeGlobally();
      this.loaded = true;
      
      console.log('[EnvLoader] ✅ Variables d\'environnement chargées');
    } catch (error) {
      console.warn('[EnvLoader] ⚠️ Erreur chargement env:', error);
      this.loaded = true; // Continuer même en cas d'erreur
    }
  },

  /**
   * Charger depuis config.json
   */
  async loadFromJSON() {
    try {
      const response = await fetch('/config.json');
      if (response.ok) {
        this.config = await response.json();
        console.log('[EnvLoader] Config chargée depuis config.json');
      }
    } catch (error) {
      console.warn('[EnvLoader] config.json non trouvé (normal en développement)');
    }
  },

  /**
   * Exposer les variables globalement
   */
  exposeGlobally() {
    // Exposer pour gemini-config.js et gemini-ai.js
    window.VITE_GEMINI_API_KEY = this.config.VITE_GEMINI_API_KEY || null;
    window.VITE_FIREBASE_API_KEY = this.config.VITE_FIREBASE_API_KEY || null;
    
    // Exposer l'objet complet pour accès généralisé
    window.ENV = this.config;
    
    console.log('[EnvLoader] Variables exposées dans window.ENV');
  },

  /**
   * Getter pour une variable
   */
  get(key, defaultValue = null) {
    return this.config[key] || defaultValue;
  },

  /**
   * Setter pour une variable (développement)
   */
  set(key, value) {
    this.config[key] = value;
    window[key] = value;
    localStorage.setItem(key, value);
    console.log('[EnvLoader] Variable définie:', key);
  }
};

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.EnvLoader.init();
  });
} else {
  window.EnvLoader.init();
}

// Exposer une promise pour attendre le chargement
window.EnvLoaderReady = new Promise((resolve) => {
  const checkReady = setInterval(() => {
    if (window.EnvLoader.loaded) {
      clearInterval(checkReady);
      resolve();
    }
  }, 50);
  
  // Timeout après 5 secondes
  setTimeout(() => {
    clearInterval(checkReady);
    resolve();
  }, 5000);
});

console.log('[EnvLoader] Script chargé');
