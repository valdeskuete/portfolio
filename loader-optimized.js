/**
 * ========== OPTIMIZED LOADER - INSTANT RENDERING + DEFERRED CACHING ==========
 * Stratégie:
 * 1. DOM se charge INSTANTANÉMENT (< 100ms, sans attendre Firebase)
 * 2. Firebase se prépare EN PARALLÈLE (non-bloquant, en background)
 * 3. Contenu dynamique s'affiche APRÈS Firebase (mais pas obligatoire)
 * 4. Service Worker cache APRÈS tout stable
 */

window.LoaderOptimized = {
  isPageReady: false,
  isFirebaseReady: false,
  isContentStable: false,
  startTime: performance.now(),
  firebasePromise: null,

  /**
   * Phase 1: DOM visible IMMÉDIATEMENT (< 100ms)
   * Ne pas attendre Firebase - afficher le contenu statique tout de suite
   */
  renderPage() {
    // Le DOM est déjà dans le HTML, il est visible maintenant
    // CSS inline rend la page visible sans attendre les scripts
    this.isPageReady = true;
    const renderTime = performance.now() - this.startTime;
    console.log(`⚡ [Loader] Page visible in ${renderTime.toFixed(0)}ms (instant, no Firebase wait)`);
    
    // Déclencher Firebase en PARALLÈLE sans bloquer
    this.startFirebaseLoadAsync();
  },

  /**
   * Phase 2: Firebase charge EN ARRIÈRE-PLAN (non-bloquant)
   * Ne pas utiliser await - laisser charger en parallèle
   */
  startFirebaseLoadAsync() {
    // Créer la promise mais ne pas l'attendre
    this.firebasePromise = this.waitForFirebase();
    // Retourner immédiatement sans attendre
  },

  /**
   * Attendre Firebase (interne seulement)
   */
  waitForFirebase() {
    return new Promise((resolve) => {
      let attempts = 0;
      const checkFirebase = setInterval(() => {
        if (window.loadProjects && typeof window.loadProjects === 'function' && 
            window.db && window.auth !== undefined) {
          clearInterval(checkFirebase);
          this.isFirebaseReady = true;
          const fbTime = performance.now() - this.startTime;
          console.log(`✅ [Loader] Firebase ready in ${fbTime.toFixed(0)}ms`);
          
          // Déclencher événement quand Firebase est prêt
          window.dispatchEvent(new CustomEvent('firebase-ready', { 
            detail: { time: fbTime } 
          }));
          resolve();
          return;
        }
        attempts++;
        if (attempts > 300) { // 15 secondes max
          clearInterval(checkFirebase);
          this.isFirebaseReady = true;
          console.warn('⚠️ [Loader] Firebase timeout (15s), page works without it');
          window.dispatchEvent(new CustomEvent('firebase-ready', { 
            detail: { timeout: true } 
          }));
          resolve();
        }
      }, 50);
    });
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
      detail: { time: totalTime } 
    }));
  },

  /**
   * Attendre que Firebase soit prêt (pour les scripts qui en ont besoin)
   */
  async getFirebaseReady() {
    if (this.isFirebaseReady) {
      return Promise.resolve();
    }
    if (this.firebasePromise) {
      return this.firebasePromise;
    }
    return Promise.resolve(); // Fallback
  },

  /**
   * Attendre que tout soit stable
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

// Auto-start on DOM ready (but don't block rendering)
// Use requestAnimationFrame for truly instant rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      window.LoaderOptimized.renderPage();
    });
  }, { once: true });
} else {
  // DOM already loaded - render immediately
  requestAnimationFrame(() => {
    window.LoaderOptimized.renderPage();
  });
}

// Expose metrics in console
window.getLoaderMetrics = () => window.LoaderOptimized.getMetrics();
console.log('💾 Type: window.getLoaderMetrics() to see loading timeline');
