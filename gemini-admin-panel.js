/**
 * Panneau Admin pour gérer les permissions Gemini
 */

const GeminiAdminPanel = {
    init() {
        console.log('🎛️ [GeminiAdminPanel] Initialisation...');
        this.renderPanel();
        this.attachEventListeners();
    },

    renderPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (!adminPanel) return;

        const status = window.GeminiIntegration?.getStatus() || {};

        const html = `
        <div id="gemini-admin-section" style="background: rgba(0, 239, 255, 0.05); border: 1px solid #0ef; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
            <h3 style="color: #0ef; margin-bottom: 1.5rem;">
                <i class='bx bx-bot'></i> Gestion Gemini AI
            </h3>

            <!-- Status -->
            <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p><strong>Status:</strong> ${status.initialized ? '✅ Actif' : '❌ Inactif'}</p>
                <p><strong>API Key:</strong> ${status.apiKey || 'Non configurée'}</p>
                <p><strong>Appels aujourd'hui:</strong> ${status.callsToday || 0} / ${status.maxCalls || 100}</p>
                <p><strong>Dernière utilisation:</strong> ${status.lastUsed ? new Date(status.lastUsed).toLocaleTimeString('fr-FR') : 'Jamais'}</p>
            </div>

            <!-- Permissions -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #0ef; margin-bottom: 1rem;">Permissions</h4>
                
                <label style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; cursor: pointer;">
                    <input type="checkbox" id="gemini-rgpd" data-permission="rgpd_moderation" ${status.permissions?.rgpd_moderation ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px;">
                    <span>Modération RGPD des avis</span>
                </label>

                <label style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; cursor: pointer;">
                    <input type="checkbox" id="gemini-content" data-permission="content_improvement" ${status.permissions?.content_improvement ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px;">
                    <span>Amélioration de contenu</span>
                </label>

                <label style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; cursor: pointer;">
                    <input type="checkbox" id="gemini-spam" data-permission="spam_detection" ${status.permissions?.spam_detection ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px;">
                    <span>Détection spam/malveillant</span>
                </label>

                <label style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer;">
                    <input type="checkbox" id="gemini-auto" data-permission="auto_approval" ${status.permissions?.auto_approval ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px;">
                    <span>Auto-approbation si conforme (dangereux!)</span>
                </label>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem;">
                <button id="gemini-save" style="background: #0ef; color: #000; padding: 0.8rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                    💾 Sauvegarder
                </button>
                <button id="gemini-test" style="background: rgba(0, 239, 255, 0.2); color: #0ef; padding: 0.8rem 1.5rem; border: 1px solid #0ef; border-radius: 0.5rem; cursor: pointer;">
                    🧪 Tester Gemini
                </button>
                <button id="gemini-refresh" style="background: rgba(255, 255, 255, 0.1); color: #fff; padding: 0.8rem 1.5rem; border: 1px solid #fff; border-radius: 0.5rem; cursor: pointer;">
                    🔄 Rafraîchir
                </button>
            </div>
        </div>
        `;

        // Injecter ou mettre à jour
        let section = document.getElementById('gemini-admin-section');
        if (section) {
            section.outerHTML = html;
        } else {
            const adminTabs = document.querySelector('[role="tablist"]');
            if (adminTabs) {
                adminTabs.insertAdjacentHTML('afterend', html);
            }
        }
    },

    attachEventListeners() {
        // Sauvegarder permissions
        document.getElementById('gemini-save')?.addEventListener('click', async () => {
            const permissions = {
                rgpd_moderation: document.getElementById('gemini-rgpd')?.checked || false,
                content_improvement: document.getElementById('gemini-content')?.checked || false,
                spam_detection: document.getElementById('gemini-spam')?.checked || false,
                auto_approval: document.getElementById('gemini-auto')?.checked || false
            };

            try {
                // Sauvegarder dans Firestore
                if (window.db) {
                    const configRef = window.db.collection(window.db, 'config');
                    const q = window.db.query(configRef, window.db.where('type', '==', 'gemini_settings'));
                    const snap = await window.db.getDocs(q);

                    if (snap.empty) {
                        await window.db.addDoc(configRef, {
                            type: 'gemini_settings',
                            permissions: permissions,
                            updated_at: new Date(),
                            updated_by: window.currentUser?.email || 'admin'
                        });
                    } else {
                        await window.db.updateDoc(snap.docs[0].ref, {
                            permissions: permissions,
                            updated_at: new Date()
                        });
                    }
                }

                // Mettre à jour en mémoire
                window.GeminiIntegration.state.permissionsEnabled = permissions;
                alert('✅ Permissions sauvegardées!');
            } catch (error) {
                alert('❌ Erreur: ' + error.message);
            }
        });

        // Tester Gemini
        document.getElementById('gemini-test')?.addEventListener('click', async () => {
            alert('🧪 Test en cours...');
            const result = await window.GeminiAI?.callGemini?.('Réponds par: OK');
            if (result) {
                alert('✅ Gemini fonctionne!');
            } else {
                alert('❌ Gemini non disponible');
            }
        });

        // Rafraîchir permissions
        document.getElementById('gemini-refresh')?.addEventListener('click', async () => {
            await window.GeminiIntegration?.refreshPermissions?.();
            this.renderPanel();
            this.attachEventListeners();
            alert('✅ Rafraîchi!');
        });
    }
};

// Initialiser si admin
if (window.isAdmin) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => GeminiAdminPanel.init(), 2000);
    });
}
