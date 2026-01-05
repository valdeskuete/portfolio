/**
 * ========== OPTIMIZED LOADER - INSTANT RENDERING + DEFERRED CACHING ==========
 * Stratégie:
 * 1. DOM se charge IMMÉDIATEMENT (visible en <100ms)
 * 2. Firebase se prépare EN PARALLÈLE (non-bloquant)
 * 3. Scripts s'exécutent APRÈS Firebase prêt
 * 4. Service Worker cache APRÈS tout stable
 */

window.LoaderOptimized = {
  isPageReady: false,
  isFirebaseReady: false,
  isContentStable: false,
  startTime: performance.now(),

  /**
   * Phase 1: DOM visible immédiatement
   */
  async renderPage() {
    // Le DOM est déjà dans le HTML, rien à faire
    // Juste marquer que c'est prêt
    this.isPageReady = true;
    console.log(`⚡ [Loader] Page DOM rendered instantly (${(performance.now() - this.startTime).toFixed(0)}ms)`);
    
    // Trigger le chargement du contenu en parallèle
    this.startFirebaseLoad();
  },

  /**
   * Phase 2: Firebase charge EN PARALLÈLE (non-bloquant)
   */
  async startFirebaseLoad() {
    // Firebase est chargé via firebase-config.js (type="module")
    // On attend juste que window.loadProjects soit disponible
    return new Promise((resolve) => {
      let attempts = 0;
      const checkFirebase = setInterval(() => {
        if (window.loadProjects && typeof window.loadProjects === 'function' && 
            window.db && window.auth !== undefined) {
          clearInterval(checkFirebase);
          this.isFirebaseReady = true;
          console.log(`✅ [Loader] Firebase ready in ${(performance.now() - this.startTime).toFixed(0)}ms`);
          resolve();
          
          // Quand Firebase est prêt, marquer que contenu peut commencer à charger
          this.onFirebaseReady();
          return;
        }
        attempts++;
        if (attempts > 300) { // 15 secondes de timeout
          clearInterval(checkFirebase);
          this.isFirebaseReady = true;
          console.warn('⚠️ [Loader] Firebase timeout, continuing anyway');
          resolve();
          this.onFirebaseReady();
        }
      }, 50);
    });
  },

  /**
   * Called when Firebase is ready
   */
  onFirebaseReady() {
    // Déclencher le chargement du contenu
    window.dispatchEvent(new CustomEvent('firebase-ready', { 
      detail: { 
        time: performance.now() - this.startTime 
      } 
    }));
  },

  /**
   * Phase 3: Marquer quand tout est stable (pour Service Worker)
   */
  markContentStable() {
    this.isContentStable = true;
    const totalTime = performance.now() - this.startTime;
    console.log(`📦 [Loader] Content stable after ${totalTime.toFixed(0)}ms`);
    
    // Trigger Service Worker caching (APRÈS stabilité)
    window.dispatchEvent(new CustomEvent('page-stable', { 
      detail: { 
        time: totalTime 
      } 
    }));
  },

  /**
   * Attendre que tout soit prêt
   */
  async waitForStability() {
    return new Promise((resolve) => {
      if (this.isContentStable) {
        resolve();
        return;
      }
      
      window.addEventListener('page-stable', () => {
        resolve();
      }, { once: true });
      
      // Timeout de 10 secondes max
      setTimeout(() => {
        console.warn('[Loader] Stability timeout, proceeding with caching');
        resolve();
      }, 10000);
    });
  },

  /**
   * Get loader metrics
   */
  getMetrics() {
    return {
      pageReady: this.isPageReady,
      firebaseReady: this.isFirebaseReady,
      contentStable: this.isContentStable,
      elapsedTime: performance.now() - this.startTime
    };
  }
};

// Auto-start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LoaderOptimized.renderPage();
  });
} else {
  // DOM already loaded
  window.LoaderOptimized.renderPage();
}

// Expose metrics in console
window.getLoaderMetrics = () => window.LoaderOptimized.getMetrics();
console.log('💾 Type: window.getLoaderMetrics() to see loading timeline');
