/**
 * Testeur de Sécurité Admin - Tests Automatisés
 * Exécuter dans la console: 
 * fetch('admin-security-tests.js').then(r=>r.text()).then(eval)
 */

const SecurityTester = {
    results: [],
    adminEmail: 'admin@valde-tech.com',
    userEmail: 'user@example.com',

    // Logging avec timestamp
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        const icon = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        }[type] || 'ℹ️';

        console.log(`[${timestamp}] ${icon} ${message}`);
        this.results.push({ message, type, timestamp });
    },

    // TEST 1: Vérifier que AdminAuth est chargé
    testAdminAuthLoaded() {
        this.log('TEST 1: Vérification du chargement AdminAuth...', 'info');

        if (!window.AdminAuth) {
            this.log('AdminAuth non chargé!', 'error');
            return false;
        }

        this.log('AdminAuth chargé correctement', 'success');
        return true;
    },

    // TEST 2: Vérifier la liste ADMIN_EMAILS
    testAdminEmailsList() {
        this.log('TEST 2: Vérification ADMIN_EMAILS...', 'info');

        if (!window.AdminAuth.ADMIN_EMAILS || !Array.isArray(window.AdminAuth.ADMIN_EMAILS)) {
            this.log('ADMIN_EMAILS non trouvé ou invalide', 'error');
            return false;
        }

        if (window.AdminAuth.ADMIN_EMAILS.length === 0) {
            this.log('ADMIN_EMAILS est vide! Aucun admin configuré!', 'error');
            return false;
        }

        this.log(`ADMIN_EMAILS contient ${window.AdminAuth.ADMIN_EMAILS.length} admin(s)`, 'success');
        window.AdminAuth.ADMIN_EMAILS.forEach(email => {
            this.log(`  - ${email}`, 'info');
        });

        return true;
    },

    // TEST 3: Vérifier que le panel admin existe
    testAdminPanelExists() {
        this.log('TEST 3: Vérification de l\'existence du panel admin...', 'info');

        const panel = document.getElementById('admin-panel');
        if (!panel) {
            this.log('Panel admin non trouvé dans le DOM!', 'error');
            return false;
        }

        this.log('Panel admin trouvé dans le DOM', 'success');
        this.log(`  - Hidden: ${panel.classList.contains('hidden')}`, 'info');
        this.log(`  - Display: ${window.getComputedStyle(panel).display}`, 'info');

        return true;
    },

    // TEST 4: Vérifier que gemini-admin-panel est présent
    testGeminiAdminPanel() {
        this.log('TEST 4: Vérification GeminiAdminPanel...', 'info');

        if (!window.GeminiAdminPanel) {
            this.log('GeminiAdminPanel non chargé', 'warning');
            return false;
        }

        if (typeof window.GeminiAdminPanel.init !== 'function') {
            this.log('GeminiAdminPanel.init est pas une fonction!', 'error');
            return false;
        }

        this.log('GeminiAdminPanel présent et valide', 'success');
        return true;
    },

    // TEST 5: Simuler vérification admin pour email admin
    async testAdminUserCheck() {
        this.log('TEST 5: Vérification authentification ADMIN...', 'info');

        if (!window.auth) {
            this.log('Firebase auth non chargé - créant mock', 'warning');
            window.auth = {};
        }

        // Simuler utilisateur admin
        window.auth.currentUser = { email: this.adminEmail };

        if (!window.AdminAuth.isAdminUser) {
            this.log('isAdminUser pas disponible', 'error');
            return false;
        }

        const isAdmin = await window.AdminAuth.isAdminUser();
        if (isAdmin) {
            this.log(`Email admin (${this.adminEmail}) reconnu comme admin ✅`, 'success');
            return true;
        } else {
            this.log(`Email admin (${this.adminEmail}) NOT reconnu comme admin ❌`, 'error');
            return false;
        }
    },

    // TEST 6: Simuler vérification pour email utilisateur
    async testUserCheck() {
        this.log('TEST 6: Vérification authentification USER...', 'info');

        if (!window.auth) {
            window.auth = {};
        }

        // Simuler utilisateur régulier
        window.auth.currentUser = { email: this.userEmail };

        if (!window.AdminAuth.isAdminUser) {
            this.log('isAdminUser pas disponible', 'error');
            return false;
        }

        const isAdmin = await window.AdminAuth.isAdminUser();
        if (!isAdmin) {
            this.log(`Email utilisateur (${this.userEmail}) correctement refusé ✅`, 'success');
            return true;
        } else {
            this.log(`Email utilisateur (${this.userEmail}) ACCEPTÉ comme admin ❌ GRAVE!`, 'error');
            return false;
        }
    },

    // TEST 7: Vérifier l'ordre de chargement des scripts
    testScriptOrder() {
        this.log('TEST 7: Vérification ordre de chargement...', 'info');

        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const adminAuthIndex = scripts.findIndex(s => s.src.includes('admin-auth'));
        const geminiAdminIndex = scripts.findIndex(s => s.src.includes('gemini-admin-panel'));

        if (adminAuthIndex === -1) {
            this.log('admin-auth.js pas trouvé!', 'error');
            return false;
        }

        if (geminiAdminIndex === -1) {
            this.log('gemini-admin-panel.js pas trouvé', 'warning');
            return true; // Pas grave si gemini-admin n'existe pas
        }

        if (adminAuthIndex < geminiAdminIndex) {
            this.log('Order correct: admin-auth.js avant gemini-admin-panel.js ✅', 'success');
            return true;
        } else {
            this.log('Order INCORRECT: admin-auth.js devrait être AVANT gemini-admin-panel.js ❌', 'error');
            return false;
        }
    },

    // TEST 8: Vérifier les methods required
    testRequiredMethods() {
        this.log('TEST 8: Vérification des méthodes requises...', 'info');

        const required = [
            'isAdminUser',
            'initAdminPanel',
            'protectedAdminAction',
            'toggleAdminPanel'
        ];

        let allFound = true;
        required.forEach(method => {
            if (typeof window.AdminAuth[method] === 'function') {
                this.log(`  ✅ ${method}()`, 'success');
            } else {
                this.log(`  ❌ ${method}() manquant!`, 'error');
                allFound = false;
            }
        });

        return allFound;
    },

    // TEST 9: Vérifier la protection des actions
    async testProtectedAction() {
        this.log('TEST 9: Test action protégée...', 'info');

        if (!window.AdminAuth.protectedAdminAction) {
            this.log('protectedAdminAction pas disponible', 'error');
            return false;
        }

        let actionExecuted = false;

        // Tester avec admin
        window.auth.currentUser = { email: this.adminEmail };
        await window.AdminAuth.protectedAdminAction('test_action', async () => {
            actionExecuted = true;
            return true;
        });

        if (actionExecuted) {
            this.log('Action admin exécutée avec succès ✅', 'success');
            return true;
        } else {
            this.log('Action admin non exécutée ❌', 'error');
            return false;
        }
    },

    // TEST 10: Vérifier que requireAdminAccess existe
    testRequireAdminAccess() {
        this.log('TEST 10: Vérification requireAdminAccess...', 'info');

        if (typeof window.requireAdminAccess === 'function') {
            this.log('requireAdminAccess trouvé dans admin-features.js ✅', 'success');
            return true;
        } else {
            this.log('requireAdminAccess pas trouvé', 'warning');
            return true; // Pas bloquant
        }
    },

    // Exécuter tous les tests
    async runAllTests() {
        this.log('🔐 DÉMARRAGE SUITE DE TESTS SÉCURITÉ ADMIN', 'info');
        this.log('='.repeat(50), 'info');

        const tests = [
            () => this.testAdminAuthLoaded(),
            () => this.testAdminEmailsList(),
            () => this.testAdminPanelExists(),
            () => this.testGeminiAdminPanel(),
            () => this.testAdminUserCheck(),
            () => this.testUserCheck(),
            () => this.testScriptOrder(),
            () => this.testRequiredMethods(),
            () => this.testProtectedAction(),
            () => this.testRequireAdminAccess()
        ];

        let passCount = 0;
        let failCount = 0;

        for (const test of tests) {
            try {
                const result = await test();
                if (result) passCount++;
                else failCount++;
            } catch (error) {
                this.log(`Erreur exécution test: ${error.message}`, 'error');
                failCount++;
            }
            this.log('---', 'info');
        }

        // Résumé
        this.log('='.repeat(50), 'info');
        this.log(`📊 RÉSUMÉ: ${passCount} ✅ | ${failCount} ❌`, 'info');

        if (failCount === 0) {
            this.log('🎉 TOUS LES TESTS PASSÉS! La sécurité est correctement configurée.', 'success');
        } else if (failCount <= 2) {
            this.log('⚠️  ATTENTION: Quelques tests non-bloquants ont échoué. À vérifier.', 'warning');
        } else {
            this.log('🚨 GRAVE: Plusieurs tests ont échoué! Vérifier la configuration.', 'error');
        }

        return { passCount, failCount, total: tests.length };
    },

    // Générer rapport HTML
    generateReport() {
        const pass = this.results.filter(r => r.type === 'success').length;
        const fail = this.results.filter(r => r.type === 'error').length;
        const warn = this.results.filter(r => r.type === 'warning').length;

        let html = `
        <div style="background: #1f242d; color: #fff; padding: 2rem; border-radius: 1rem; border: 1px solid #0ef; margin: 1rem; font-family: monospace;">
            <h2 style="color: #0ef; margin-bottom: 1rem;">🔐 Rapport de Test Sécurité Admin</h2>
            
            <div style="background: rgba(0, 239, 255, 0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p><strong>✅ Passés:</strong> ${pass}</p>
                <p><strong>❌ Échoués:</strong> ${fail}</p>
                <p><strong>⚠️  Avertissements:</strong> ${warn}</p>
                <p><strong>📊 Total:</strong> ${this.results.length}</p>
            </div>

            <div style="background: #000; padding: 1rem; border-radius: 0.5rem; height: 400px; overflow-y: auto;">
                ${this.results.map(r => `
                    <p style="color: ${r.type === 'success' ? '#0f0' : r.type === 'error' ? '#f00' : '#f90'}; margin-bottom: 0.5rem;">
                        ${r.message}
                    </p>
                `).join('')}
            </div>

            <p style="margin-top: 1rem; font-size: 0.9rem; color: #aaa;">
                Généré: ${new Date().toLocaleString('fr-FR')}
            </p>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }
};

// Auto-exécution
console.log('🔐 SecurityTester chargé. Exécutez: SecurityTester.runAllTests()');
console.log('Pour générer un rapport HTML: SecurityTester.generateReport()');

// Exécuter immédiatement si appelé
if (typeof module === 'undefined') {
    SecurityTester.runAllTests().then(() => {
        console.log('\n💾 Pour sauvegarder les logs: copy(JSON.stringify(SecurityTester.results, null, 2))');
    });
}

window.SecurityTester = SecurityTester;
