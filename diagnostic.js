/**
 * ========== DIAGNOSTIC SYSTÈME - VALIDATION RUNTIME ==========
 * Vérifie l'état de l'application et signale les problèmes
 */

window.AppDiagnostic = {
  checks: [],
  
  async run() {
    console.log('🔍 Démarrage diagnostic système...');
    
    // Check 1: Firebase
    this.check('Firebase', () => window.db && window.auth !== undefined);
    
    // Check 3: Gemini API (optional - not critical)
    // Gemini API is optional, so this is informational only
    const hasGemini = window.VITE_GEMINI_API_KEY && window.VITE_GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
    if (!hasGemini) {
      console.info('ℹ️ Gemini API non configuré (optionnel)');
    } else {
      this.check('Gemini API', true);
    }
    
    // Check 4: DOM Elements
    this.check('index.html', document.querySelector('header') !== null);
    
    // Check 5: CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    this.check('Feuilles de style', cssLinks.length >= 2);
    
    // Afficher résumé
    this.printSummary();
  },
  
  check(name, result) {
    const status = result ? '✅' : '❌';
    this.checks.push({ name, result, status });
    console.log(`${status} ${name}`);
  },
  
  printSummary() {
    const passed = this.checks.filter(c => c.result).length;
    const total = this.checks.length;
    console.log(`\n📊 Diagnostic: ${passed}/${total} checks réussis`);
    
    if (passed === total) {
      console.log('✅ Tout fonctionne correctement!');
    } else {
      console.warn('⚠️ Certains éléments nécessitent attention');
    }
  }
};

// Lancer après chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.AppDiagnostic.run());
} else {
  window.AppDiagnostic.run();
}
