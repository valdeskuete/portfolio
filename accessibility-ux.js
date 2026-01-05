/**
 * ========== ACCESSIBILITÉ ARIA & AMÉLIORATIONS UX ==========
 * Améliore l'accessibilité WCAG 2.1 et l'UX de l'application
 */

window.AccessibilityManager = {
    init() {
        console.log('🎯 Initialisation du gestionnaire d\'accessibilité...');
        this.enhanceModals();
        this.enhanceButtons();
        this.enhanceIcons();
        this.enhanceFormLabels();
        this.enhanceLinks();
        this.setupKeyboardNavigation();
        console.log('✅ Accessibilité optimisée');
    },

    /**
     * Améliore les modals avec ARIA attributes
     */
    enhanceModals() {
        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach((modal, index) => {
            if (!modal.hasAttribute('role')) {
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
                modal.setAttribute('aria-label', `Modal ${index + 1}`);
            }
        });
    },

    /**
     * Améliore les boutons avec ARIA labels et rôles
     */
    enhanceButtons() {
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(btn => {
            // Si le bouton n'a pas de texte visible, ajouter aria-label
            if (!btn.textContent.trim() && btn.innerHTML.includes('fa-')) {
                const ariaLabel = btn.getAttribute('title') || this.extractIconLabel(btn);
                if (ariaLabel) {
                    btn.setAttribute('aria-label', ariaLabel);
                }
            }
        });
    },

    /**
     * Améliore les icônes Font Awesome
     */
    enhanceIcons() {
        const icons = document.querySelectorAll('i.fa:not([aria-hidden])');
        icons.forEach(icon => {
            const parent = icon.closest('a, button, [role="button"]');
            // Si l'icône est standalone, elle doit être aria-hidden
            // Si elle est dans un lien/bouton avec du texte, c'est bon
            if (parent && !parent.textContent.trim()) {
                icon.setAttribute('aria-hidden', 'false');
            } else if (!parent) {
                icon.setAttribute('aria-hidden', 'true');
            }
        });
    },

    /**
     * Améliore les labels de formulaires
     */
    enhanceFormLabels() {
        const inputs = document.querySelectorAll('input[id], textarea[id], select[id]');
        inputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label) {
                const placeholder = input.placeholder;
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
    },

    /**
     * Améliore les liens
     */
    enhanceLinks() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            if (targetId) {
                link.setAttribute('aria-label', `Navigate to ${targetId} section`);
            }
        });
    },

    /**
     * Configure la navigation au clavier
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Échap pour fermer les modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            // Tab pour navigation
            // Alt + J pour sauter au contenu principal
            if (e.altKey && e.key === 'j') {
                const main = document.querySelector('main') || document.querySelector('[role="main"]');
                if (main) {
                    main.focus();
                    main.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    },

    closeAllModals() {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
    },

    extractIconLabel(element) {
        const classes = Array.from(element.classList);
        const iconClass = classes.find(c => c.startsWith('fa-'));
        if (iconClass) {
            return iconClass.replace('fa-', '').replace(/-/g, ' ');
        }
        return '';
    }
};

/* ========== UTILITAIRES POUR CONFIRMATIONS BEFORE DELETE ========== */
window.SafeDelete = {
    /**
     * Demande confirmation avant suppression
     * @param {string} itemName - Nom de l'élément à supprimer
     * @param {function} onConfirm - Callback de confirmation
     */
    confirm(itemName, onConfirm) {
        if (typeof ConfirmDialog === 'undefined') {
            console.warn('⚠️ ConfirmDialog non disponible, utilisant confirm() standard');
            if (window.confirm(`❌ Êtes-vous sûr de vouloir supprimer "${itemName}"?\n\nCette action est irréversible.`)) {
                onConfirm();
            }
            return;
        }

        ConfirmDialog.show(
            `❌ <strong>Êtes-vous sûr?</strong><br><br>Vous êtes sur le point de supprimer: <strong style="color: #0ef;">${itemName}</strong><br><br><small>Cette action est <strong>irréversible</strong></small>`,
            onConfirm
        );
    }
};

/* ========== GESTIONNAIRE DE DONNÉES LOCALES ========== */
window.LocalStorageManager = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('⚠️ LocalStorage unavailable:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('⚠️ LocalStorage read error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('⚠️ LocalStorage remove error:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('⚠️ LocalStorage clear error:', e);
            return false;
        }
    }
};

/* ========== DARK MODE PERSISTANT ========== */
window.DarkModeManager = {
    KEY: 'valdes-dark-mode',
    ENABLED_CLASS: 'dark-mode-enabled',

    init() {
        const isDarkMode = LocalStorageManager.get(this.KEY, true);
        if (isDarkMode) {
            this.enable();
        }
    },

    enable() {
        document.documentElement.classList.add(this.ENABLED_CLASS);
        LocalStorageManager.set(this.KEY, true);
    },

    disable() {
        document.documentElement.classList.remove(this.ENABLED_CLASS);
        LocalStorageManager.set(this.KEY, false);
    },

    toggle() {
        if (document.documentElement.classList.contains(this.ENABLED_CLASS)) {
            this.disable();
            NotificationSystem.success('Mode clair activé');
        } else {
            this.enable();
            NotificationSystem.success('Mode sombre activé');
        }
    }
};

/* ========== UTILITAIRES DE VALIDATION AVEC FEEDBACK ========== */
window.FormValidator = {
    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
        phone: /^[\d\s\+\-\(\)]{7,}$/,
        url: /^(https?:\/\/)?.+\..+/i,
        name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
        message: /^.{10,500}$/s,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    },

    validate(value, pattern) {
        if (!value) return false;
        return this.patterns[pattern]?.test(value) ?? false;
    },

    showErrorForField(field, message) {
        field.classList.add('form-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        const existing = field.nextElementSibling;
        if (existing?.classList.contains('error-message')) {
            existing.remove();
        }
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    },

    clearError(field) {
        field.classList.remove('form-error');
        const error = field.nextElementSibling;
        if (error?.classList.contains('error-message')) {
            error.remove();
        }
    },

    showSuccessForField(field) {
        field.classList.add('form-success');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Validé ✓';
        const existing = field.nextElementSibling;
        if (existing?.classList.contains('error-message')) {
            existing.remove();
        }
        if (existing?.classList.contains('success-message')) {
            return;
        }
        field.parentNode.insertBefore(successDiv, field.nextSibling);
    }
};

/* ========== DÉTECTEUR DE CONNEXION RÉSEAU ========== */
window.NetworkMonitor = {
    init() {
        window.addEventListener('online', () => {
            NotificationSystem.success('✅ Connexion rétablie');
        });
        window.addEventListener('offline', () => {
            NotificationSystem.error('⚠️ Pas de connexion Internet', 10000);
        });
    }
};

/* ========== INITIALISATION ========== */
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityManager.init();
    DarkModeManager.init();
    NetworkMonitor.init();
});

console.log('✅ Accessibilité et UX chargées');
