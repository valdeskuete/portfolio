/**
 * ========== RECAPTCHA V3 INTEGRATION ==========
 * Protection gratuite contre le spam automatisé
 * Pas d'interaction utilisateur requise
 */

window.RecaptchaManager = {
    SITE_KEY: '6Le1SN8pAAAAAF1e2xZLKJvVJ-p8Zk3V-Ym8W9q5', // À remplacer par votre clé
    ready: false,

    init() {
        // Charger le script reCAPTCHA
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=' + this.SITE_KEY;
        script.onload = () => {
            this.ready = true;
            console.log('✅ reCAPTCHA v3 chargé');
        };
        document.head.appendChild(script);
    },

    /**
     * Obtient le token reCAPTCHA
     * @param {string} action - Action à protéger (ex: 'contact_form')
     * @returns {Promise<string>} Token reCAPTCHA
     */
    async getToken(action = 'contact_form') {
        if (!this.ready) {
            console.warn('⚠️ reCAPTCHA non prêt');
            return null;
        }
        try {
            return await grecaptcha.execute(this.SITE_KEY, { action });
        } catch (e) {
            console.error('❌ Erreur reCAPTCHA:', e);
            return null;
        }
    },

    /**
     * Protège l'envoi d'un formulaire
     * @param {HTMLFormElement} form - Formulaire à protéger
     */
    protectForm(form) {
        form.addEventListener('submit', async (e) => {
            if (!this.ready) {
                console.warn('⚠️ reCAPTCHA pas encore chargé');
                return;
            }

            e.preventDefault();

            try {
                // Montrer un loading
                const submitBtn = form.querySelector('[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '⏳ Vérification...';
                submitBtn.disabled = true;

                // Obtenir le token
                const token = await this.getToken('form_submit');

                if (!token) {
                    throw new Error('Impossible d\'obtenir le token reCAPTCHA');
                }

                // Ajouter le token au formulaire
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'g-recaptcha-response';
                tokenInput.value = token;
                form.appendChild(tokenInput);

                // Soumettre le formulaire
                form.submit();

            } catch (error) {
                console.error('❌ Erreur protection formulaire:', error);
                NotificationSystem.error('❌ Erreur de sécurité. Veuillez réessayer.');
                const submitBtn = form.querySelector('[type="submit"]');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
};

// Initialiser si le script charge
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        RecaptchaManager.init();
    });
} else {
    RecaptchaManager.init();
}

console.log('✅ reCAPTCHA v3 intégré');
