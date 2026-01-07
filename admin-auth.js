/**
 * Admin Authentication & Authorization System
 * Sécurise l'accès au panneau d'administration
 * 
 * ARCHITECTURE:
 * 1. Firestore rules: `isAdmin()` check role='admin' OR UID hardcoded
 * 2. Client-side: Admin-auth.js lit user.role depuis Firestore
 * 3. No Cloud Functions - tout est client-side + Firestore rules
 */

const AdminAuth = {
    // Fallback: emails autorisés (backup si Firestore indisponible)
    ADMIN_EMAILS: [
        'valdeskuete8@gmail.com',
    ],
    
    // Cache du role pour éviter trop de reads Firestore
    roleCache: null,
    roleCacheTime: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Vérifier si l'utilisateur actuel est un administrateur
    // SIMPLIFIÉ: 2 niveaux seulement (Firestore + Email fallback)
    async isAdminUser() {
        try {
            if (!window.auth?.currentUser) {
                return false;
            }

            const userId = window.auth.currentUser.uid;
            const userEmail = window.auth.currentUser.email;
            const now = Date.now();

            // 1️⃣ Vérifier le cache (5 min)
            if (this.roleCache && (now - this.roleCacheTime < this.CACHE_DURATION)) {
                return this.roleCache === 'admin';
            }

            // 2️⃣ Vérifier Firestore role
            try {
                const userRef = window.doc(window.db, 'users', userId);
                const userSnap = await window.getDoc(userRef);
                
                if (userSnap.exists() && userSnap.data().role === 'admin') {
                    this.roleCache = 'admin';
                    this.roleCacheTime = now;
                    console.log('✅ [AdminAuth] Admin via Firestore:', userEmail);
                    return true;
                }
            } catch (error) {
                console.warn('⚠️ [AdminAuth] Firestore unavailable, using email fallback');
            }

            // 3️⃣ Fallback: Email check
            const isAdmin = this.ADMIN_EMAILS.includes(userEmail);
            this.roleCache = isAdmin ? 'admin' : 'user';
            this.roleCacheTime = now;
            
            if (isAdmin) {
                console.log('✅ [AdminAuth] Admin via email fallback:', userEmail);
            }
            return isAdmin;
        } catch (error) {
            console.error('❌ [AdminAuth] Error checking admin:', error);
            return false;
        }
    },

    // Initialiser la protection du panneau admin
    async initAdminPanel() {
        console.log('🔐 [AdminAuth] Initializing admin panel protection...');

        const adminPanel = document.getElementById('admin-panel');
        const adminTrigger = document.getElementById('admin-login-trigger');

        if (!adminPanel || !adminTrigger) {
            console.warn('⚠️ [AdminAuth] Admin panel elements not found');
            return;
        }

        // Vérifier l'authentification
        const isAdmin = await this.isAdminUser();

        if (isAdmin) {
            // L'utilisateur est un admin, montrer le bouton
            adminPanel.classList.remove('hidden');
            adminTrigger.style.opacity = '1';
            adminTrigger.style.cursor = 'pointer';
            adminTrigger.addEventListener('click', () => this.toggleAdminPanel());
            console.log('✅ [AdminAuth] Admin panel unlocked');
        } else {
            // L'utilisateur n'est pas un admin, masquer le panneau
            adminPanel.classList.add('hidden');
            adminTrigger.style.opacity = '0.3';
            adminTrigger.style.cursor = 'not-allowed';
            adminTrigger.style.pointerEvents = 'none';
            adminTrigger.title = 'Accès administrateur requis';
            console.log('🔒 [AdminAuth] Admin panel locked for non-admin user');
        }
    },

    // Basculer l'affichage du panneau admin
    toggleAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.toggle('hidden');
            console.log('🔄 [AdminAuth] Admin panel toggled:', !adminPanel.classList.contains('hidden'));
        }
    },

    // Protéger une fonction admin (vérification avant exécution)
    async protectedAdminAction(actionName, actionFunction) {
        const isAdmin = await this.isAdminUser();

        if (!isAdmin) {
            console.error('🚫 [AdminAuth] Unauthorized admin action:', actionName);
            alert('⛔ Accès refusé. Seuls les administrateurs peuvent effectuer cette action.');
            return false;
        }

        try {
            console.log('✅ [AdminAuth] Executing admin action:', actionName);
            return await actionFunction();
        } catch (error) {
            console.error('❌ [AdminAuth] Error executing admin action:', actionName, error);
            throw error;
        }
    },

    // Logger les tentatives d'accès admin (optionnel - pour audit)
    logAccessAttempt(email, allowed) {
        const timestamp = new Date().toISOString();
        const status = allowed ? '✅ ALLOWED' : '🚫 DENIED';
        console.log(`[ADMIN_AUDIT] ${timestamp} - ${status} - ${email} - Admin Panel Access`);

        // En production, envoyer à Firestore pour audit
        if (window.db && allowed === false) {
            this.sendAuditLog(email, 'admin_panel_unauthorized_access', false);
        }
    },

    // Envoyer un log d'audit à Firestore
    async sendAuditLog(email, action, allowed) {
        try {
            if (!window.db || !window.collection || !window.addDoc) {
                console.warn('⚠️ [AdminAuth] Firebase not available for audit logging');
                return;
            }

            const auditRef = window.collection(window.db, 'admin_audit_logs');
            await window.addDoc(auditRef, {
                email: email,
                action: action,
                allowed: allowed,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ipAddress: 'client-side' // Client-side only, server would get real IP
            });

            console.log('📝 [AdminAuth] Audit log recorded:', action);
        } catch (error) {
            console.error('❌ [AdminAuth] Error logging audit:', error);
        }
    }
};

// Initialiser au démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que Firebase soit prêt
        if (window.auth) {
            window.auth.onAuthStateChanged((user) => {
                if (user) {
                    AdminAuth.initAdminPanel();
                } else {
                    // Pas d'utilisateur authentifié, cacher le panneau
                    const adminPanel = document.getElementById('admin-panel');
                    if (adminPanel) adminPanel.classList.add('hidden');
                }
            });
        }
    });
} else {
    // DOM déjà chargé
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                AdminAuth.initAdminPanel();
            } else {
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel) adminPanel.classList.add('hidden');
            }
        });
    }
}

// Exporter pour utilisation dans d'autres scripts
window.AdminAuth = AdminAuth;
