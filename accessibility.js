/**
 * ========== FOCUS TRAP & ACCESSIBILITY ENHANCEMENTS ==========
 * Gère le focus trap dans les modales et améliore l'accessibilité
 */

class FocusTrap {
    constructor(modalElement) {
        this.modal = modalElement;
        this.previouslyFocused = null;
    }

    activate() {
        this.previouslyFocused = document.activeElement;
        this.setupFocusTrap();
        this.focusFirstElement();
        this.modal.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    deactivate() {
        this.modal.removeEventListener('keydown', this.handleKeydown.bind(this));
        if (this.previouslyFocused && this.previouslyFocused.focus) {
            this.previouslyFocused.focus();
        }
    }

    setupFocusTrap() {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.firstElement = firstElement;
        this.lastElement = lastElement;
    }

    getFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        return Array.from(this.modal.querySelectorAll(focusableSelectors.join(', ')));
    }

    focusFirstElement() {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    handleKeydown(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
}

// Initialiser focus traps au chargement
document.addEventListener('DOMContentLoaded', () => {
    const modals = {
        loginModal: document.getElementById('login-modal'),
        commentsModal: document.getElementById('comments-modal'),
        adminPanel: document.getElementById('admin-panel')
    };

    // Login Modal
    if (modals.loginModal) {
        const focusTrap = new FocusTrap(modals.loginModal);
        
        // Observer les changements de visibilité
        const observer = new MutationObserver(() => {
            if (!modals.loginModal.classList.contains('hidden') && !focusTrap.active) {
                focusTrap.activate();
                focusTrap.active = true;
            } else if (modals.loginModal.classList.contains('hidden') && focusTrap.active) {
                focusTrap.deactivate();
                focusTrap.active = false;
            }
        });

        observer.observe(modals.loginModal, { attributes: true, attributeFilter: ['class'] });

        // Fermeture à l'Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modals.loginModal.classList.contains('hidden')) {
                modals.loginModal.classList.add('hidden');
            }
        });
    }

    // Comments Modal
    if (modals.commentsModal) {
        const focusTrap = new FocusTrap(modals.commentsModal);
        
        const observer = new MutationObserver(() => {
            if (!modals.commentsModal.classList.contains('hidden') && !focusTrap.active) {
                focusTrap.activate();
                focusTrap.active = true;
            } else if (modals.commentsModal.classList.contains('hidden') && focusTrap.active) {
                focusTrap.deactivate();
                focusTrap.active = false;
            }
        });

        observer.observe(modals.commentsModal, { attributes: true, attributeFilter: ['class'] });

        // Fermeture à l'Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modals.commentsModal.classList.contains('hidden')) {
                modals.commentsModal.classList.add('hidden');
            }
        });
    }
});

// Améliorer tous les boutons avec visible focus
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, [role="button"], a[href^="#"]');
    buttons.forEach(btn => {
        btn.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--main-color)';
            this.style.outlineOffset = '2px';
        });
        btn.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

// Gérer les annonces pour lecteurs d'écran
function announceToScreen(message, priority = 'polite') {
    let announcement = document.getElementById('sr-announcement');
    
    if (!announcement) {
        announcement = document.createElement('div');
        announcement.id = 'sr-announcement';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcement);
    }
    
    announcement.setAttribute('aria-live', priority);
    announcement.textContent = message;
}

// Exporter pour usage global
window.FocusTrap = FocusTrap;
window.announceToScreen = announceToScreen;
