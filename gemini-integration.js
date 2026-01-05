/**
 * ========== INTÉGRATION GEMINI COMPLÈTE AVEC SYSTÈME DE PERMISSIONS ==========
 * 
 * Ce module gère:
 * - Initialisation sécurisée de la clé API
 * - Système de permissions admin revocable
 * - Modération RGPD des avis
 * - Amélioration de contenu
 * - Logging et audit
 */

const GeminiIntegration = {
    // État global
    state: {
        apiKey: null,
        isInitialized: false,
        permissionsEnabled: {
            rgpd_moderation: true,
            content_improvement: false,
            auto_approval: false,
            spam_detection: true
        },
        lastUsed: null,
        apiCallsToday: 0,
        maxCallsPerDay: 100
    },

    /**
     * Initialiser Gemini avec la clé depuis config.json
     */
    async init() {
        console.log('🤖 [GeminiIntegration] Initialisation...');
        
        // Attendre que les variables d'environnement soient chargées
        let attempts = 0;
        while (!window.VITE_GEMINI_API_KEY && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        // Récupérer la clé
        this.state.apiKey = window.VITE_GEMINI_API_KEY || window.GEMINI_API_KEY;
        
        if (!this.state.apiKey) {
            console.warn('⚠️ [GeminiIntegration] Clé API non trouvée - Gemini désactivé');
            return false;
        }

        // Vérifier que c'est une vraie clé
        if (this.state.apiKey === 'sk_YOUR_KEY_HERE' || this.state.apiKey.length < 20) {
            console.warn('⚠️ [GeminiIntegration] Clé API invalide');
            this.state.apiKey = null;
            return false;
        }

        // Charger les permissions depuis Firestore (si user est admin)
        if (window.isAdmin) {
            await this.loadPermissionsFromFirebase();
        }

        this.state.isInitialized = true;
        console.log('✅ [GeminiIntegration] Initialisé avec succès');
        window.GeminiIntegration = this;
        return true;
    },

    /**
     * Charger les permissions admin depuis Firestore
     */
    async loadPermissionsFromFirebase() {
        try {
            const docRef = window.db ? 
                await window.db.getDocs(
                    window.db.query(
                        window.db.collection(window.db, 'config'),
                        window.db.where('type', '==', 'gemini_settings')
                    )
                ) : null;
            
            if (docRef && !docRef.empty) {
                const settings = docRef.docs[0].data();
                this.state.permissionsEnabled = {
                    ...this.state.permissionsEnabled,
                    ...settings.permissions
                };
                console.log('✅ Permissions Gemini chargées:', this.state.permissionsEnabled);
            }
        } catch (error) {
            console.warn('⚠️ Erreur chargement permissions:', error.message);
        }
    },

    /**
     * Vérifier si une permission est active
     */
    hasPermission(permissionName) {
        return this.state.permissionsEnabled[permissionName] === true && this.state.isInitialized;
    },

    /**
     * Vérifier et mettre à jour le rate limit
     */
    canMakeCall() {
        // Réinitialiser le compteur à minuit
        const today = new Date().toDateString();
        if (!this.lastDate || this.lastDate !== today) {
            this.state.apiCallsToday = 0;
            this.lastDate = today;
        }

        return this.state.apiCallsToday < this.state.maxCallsPerDay;
    },

    /**
     * Modération RGPD des avis (Non-bloquante)
     */
    async moderateReview(reviewText, reviewId) {
        if (!this.hasPermission('rgpd_moderation')) {
            console.log('ℹ️ Modération RGPD désactivée');
            return null;
        }

        if (!this.canMakeCall()) {
            console.warn('⚠️ Limite API atteinte pour aujourd\'hui');
            return null;
        }

        try {
            const prompt = `Analyse cet avis client pour la conformité RGPD. 
            Détecte les données personnelles sensibles (email, téléphone, adresse).
            Réponse JSON: {isCompliant: boolean, issues: [], recommendation: 'publish'|'anonymize'|'reject'}
            
            Avis: "${reviewText.substring(0, 500)}"`;

            const result = await window.GeminiAI.callGemini(prompt);
            this.state.apiCallsToday++;
            this.state.lastUsed = new Date();

            if (result) {
                console.log('✅ Analyse RGPD complétée');
                // Sauvegarder les résultats en arrière-plan
                if (window.db && reviewId && window.isAdmin) {
                    await window.db.updateDoc(
                        window.db.doc(window.db, 'testimonials', reviewId),
                        { gemini_moderation: result, moderated_at: new Date() }
                    );
                }
                return result;
            }
        } catch (error) {
            console.warn('⚠️ Erreur modération:', error.message);
        }
        return null;
    },

    /**
     * Améliorer le contenu (seulement pour admin)
     */
    async improveContent(text, type = 'tip') {
        if (!window.isAdmin || !this.hasPermission('content_improvement')) {
            console.log('ℹ️ Amélioration contenu désactivée ou non autorisée');
            return null;
        }

        if (!this.canMakeCall()) {
            console.warn('⚠️ Limite API atteinte');
            return null;
        }

        try {
            const prompts = {
                tip: `Améliore ce conseil technique. Ajoute des étapes claires et des points clés. Réponds en JSON: {improved_text: string, key_points: string[]}`,
                project: `Améliore cette étude de cas. Rends-la plus impactante. Réponds en JSON: {improved_challenge: string, improved_solution: string, improved_result: string}`,
                review: `Améliore cette revue client. Ajoute de la clarté. Réponds en JSON: {improved_text: string}`
            };

            const prompt = (prompts[type] || prompts.tip) + `\n\nTexte: "${text.substring(0, 500)}"`;
            const result = await window.GeminiAI.callGemini(prompt);
            this.state.apiCallsToday++;

            return result;
        } catch (error) {
            console.warn('⚠️ Erreur amélioration:', error.message);
        }
        return null;
    },

    /**
     * Détection spam/contenu malveillant
     */
    async detectSpam(text) {
        if (!this.hasPermission('spam_detection')) {
            return false;
        }

        if (!this.canMakeCall()) return false;

        try {
            const prompt = `Détecte si ce texte est du spam ou contient du contenu malveillant.
            Réponds UNIQUEMENT avec: true ou false
            
            Texte: "${text.substring(0, 300)}"`;

            const response = await window.GeminiAI.callGemini(prompt);
            this.state.apiCallsToday++;

            return response && response.toLowerCase() === 'true';
        } catch (error) {
            console.warn('⚠️ Erreur détection spam:', error.message);
        }
        return false;
    },

    /**
     * Tableau de bord admin - Status Gemini
     */
    getStatus() {
        return {
            initialized: this.state.isInitialized,
            apiKey: this.state.apiKey ? `${this.state.apiKey.substring(0, 10)}...` : 'NOT SET',
            permissions: this.state.permissionsEnabled,
            callsToday: this.state.apiCallsToday,
            maxCalls: this.state.maxCallsPerDay,
            lastUsed: this.state.lastUsed
        };
    },

    /**
     * Rafraîchir les permissions depuis Firestore
     */
    async refreshPermissions() {
        if (window.isAdmin) {
            await this.loadPermissionsFromFirebase();
            console.log('🔄 Permissions Gemini rafraîchies');
        }
    }
};

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GeminiIntegration.init());
} else {
    GeminiIntegration.init();
}

// Exporter pour accès global
window.GeminiIntegration = GeminiIntegration;
