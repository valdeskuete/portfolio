/**
 * ========== CENTRALIZED FORM HANDLER ==========
 * Unifies form validation, submission, and error handling
 * Replaces: form-validation.js patterns, firebase-config loginForm handling, tips-manager forms
 * Date: 7 January 2026
 */

class FormHandler {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.onSubmit = new Map();
        
        // Validation patterns
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\d\s\+\-\(\)]{7,}$/,
            url: /^(https?:\/\/)?.+\..+/i,
            name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
            alphanumeric: /^[a-zA-Z0-9_\-]+$/,
            password: /^.{6,}$/ // Min 6 chars
        };
    }

    /**
     * Register a form with optional validator and submit handler
     * @param {string} formId - Form element ID
     * @param {Function} validatorFn - Optional: validates fields, returns {valid, errors}
     * @param {Function} submitFn - Optional: handles form submission
     */
    register(formId, validatorFn = null, submitFn = null) {
        const formEl = document.getElementById(formId);
        if (!formEl) {
            window.ErrorHandler.warning('FormHandler.register', new Error(`Form "${formId}" not found`));
            return false;
        }

        this.forms.set(formId, formEl);
        if (validatorFn) this.validators.set(formId, validatorFn);
        if (submitFn) this.onSubmit.set(formId, submitFn);

        // Auto-attach submit listener
        formEl.addEventListener('submit', (e) => this.handleSubmit(e, formId));
        
        return true;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(e, formId) {
        e.preventDefault();

        const formEl = this.forms.get(formId);
        if (!formEl) return;

        // Run validator if exists
        if (this.validators.has(formId)) {
            const validator = this.validators.get(formId);
            try {
                const result = await validator(formEl);
                if (!result.valid) {
                    this.showValidationErrors(formId, result.errors);
                    return;
                }
            } catch (error) {
                window.ErrorHandler.error(`FormHandler.validate(${formId})`, error);
                return;
            }
        }

        // Run submit handler if exists
        if (this.onSubmit.has(formId)) {
            const handler = this.onSubmit.get(formId);
            try {
                await handler(formEl);
            } catch (error) {
                window.ErrorHandler.error(`FormHandler.submit(${formId})`, error);
            }
        }
    }

    /**
     * Show validation errors
     */
    showValidationErrors(formId, errors) {
        if (!Array.isArray(errors)) errors = [errors];
        
        errors.forEach(error => {
            window.NotificationSystem?.warning(error, 4000);
        });

        // Also log for debugging
        if (errors.length > 0) {
            window.ErrorHandler.warning(`FormHandler.validation(${formId})`, new Error(errors.join('; ')));
        }
    }

    /**
     * Validate single field
     * @param {string} value - Field value
     * @param {string} type - Validation type (email, phone, url, name, password, etc.)
     * @param {string} fieldName - Display name for error messages
     * @param {object} options - Optional: {minLength, maxLength, required, custom}
     */
    validateField(value, type, fieldName, options = {}) {
        const { minLength, maxLength, required = true, custom } = options;

        // Required check
        if (required && (!value || value.trim() === '')) {
            return { valid: false, error: `${fieldName} est requis` };
        }

        if (!required && (!value || value.trim() === '')) {
            return { valid: true };
        }

        // Length check
        if (minLength && value.trim().length < minLength) {
            return { valid: false, error: `${fieldName} doit contenir au moins ${minLength} caractères` };
        }

        if (maxLength && value.trim().length > maxLength) {
            return { valid: false, error: `${fieldName} ne peut pas dépasser ${maxLength} caractères` };
        }

        // Pattern check
        const pattern = this.patterns[type];
        if (pattern && !pattern.test(value.trim())) {
            const errorMessages = {
                email: 'Email invalide',
                phone: 'Téléphone invalide (min 7 caractères)',
                url: 'URL invalide',
                name: 'Nom invalide (2-50 caractères)',
                password: 'Mot de passe invalide (min 6 caractères)',
                alphanumeric: 'Doit contenir seulement lettres, chiffres, - et _'
            };
            return { valid: false, error: errorMessages[type] || `${fieldName} invalide` };
        }

        // Custom validation
        if (custom && typeof custom === 'function') {
            const customResult = custom(value);
            if (customResult !== true) {
                return { valid: false, error: customResult || `${fieldName} invalide` };
            }
        }

        return { valid: true };
    }

    /**
     * Validate multiple fields at once
     * @param {array} fields - [{value, type, name, options}]
     */
    validateMultiple(fields) {
        const errors = [];

        for (const field of fields) {
            const result = this.validateField(
                field.value,
                field.type,
                field.name,
                field.options
            );
            if (!result.valid) {
                errors.push(result.error);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Get form data as object
     */
    getFormData(formId) {
        const formEl = this.forms.get(formId);
        if (!formEl) return null;

        const formData = new FormData(formEl);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Set form data from object
     */
    setFormData(formId, data) {
        const formEl = this.forms.get(formId);
        if (!formEl) return false;

        Object.keys(data).forEach(key => {
            const el = formEl.querySelector(`[name="${key}"]`);
            if (el) el.value = data[key];
        });

        return true;
    }

    /**
     * Reset form
     */
    resetForm(formId) {
        const formEl = this.forms.get(formId);
        if (formEl) formEl.reset();
        return true;
    }

    /**
     * Enable/disable form
     */
    setFormState(formId, enabled) {
        const formEl = this.forms.get(formId);
        if (!formEl) return false;

        formEl.querySelectorAll('button, input, textarea, select').forEach(el => {
            el.disabled = !enabled;
        });

        return true;
    }

    /**
     * Create quick validator for common patterns
     */
    createContactFormValidator(config = {}) {
        const {
            nameField = 'contact-name',
            emailField = 'contact-email',
            phoneField = 'contact-phone',
            messageField = 'contact-message',
            phoneRequired = false,
            minMessageLength = 10,
            maxMessageLength = 5000
        } = config;

        return (formEl) => {
            const errors = [];

            // Name
            const name = formEl.querySelector(`[name="${nameField}"]`)?.value;
            const nameVal = this.validateField(name, 'name', 'Nom');
            if (!nameVal.valid) errors.push(nameVal.error);

            // Email
            const email = formEl.querySelector(`[name="${emailField}"]`)?.value;
            const emailVal = this.validateField(email, 'email', 'Email');
            if (!emailVal.valid) errors.push(emailVal.error);

            // Phone (optional)
            const phone = formEl.querySelector(`[name="${phoneField}"]`)?.value;
            if (phone || phoneRequired) {
                const phoneVal = this.validateField(phone, 'phone', 'Téléphone', {required: phoneRequired});
                if (!phoneVal.valid) errors.push(phoneVal.error);
            }

            // Message
            const message = formEl.querySelector(`[name="${messageField}"]`)?.value;
            const msgVal = this.validateField(message, '', 'Message', {
                minLength: minMessageLength,
                maxLength: maxMessageLength,
                required: true
            });
            if (!msgVal.valid) errors.push(msgVal.error);

            return { valid: errors.length === 0, errors };
        };
    }

    /**
     * Create login form validator
     */
    createLoginFormValidator(config = {}) {
        const {
            emailField = 'login-email',
            passwordField = 'login-password'
        } = config;

        return (formEl) => {
            const errors = [];

            const email = formEl.querySelector(`[name="${emailField}"]`)?.value;
            const emailVal = this.validateField(email, 'email', 'Email');
            if (!emailVal.valid) errors.push(emailVal.error);

            const password = formEl.querySelector(`[name="${passwordField}"]`)?.value;
            const pwVal = this.validateField(password, 'password', 'Mot de passe');
            if (!pwVal.valid) errors.push(pwVal.error);

            return { valid: errors.length === 0, errors };
        };
    }

    /**
     * Get all registered forms
     */
    getRegisteredForms() {
        return Array.from(this.forms.keys());
    }

    /**
     * Unregister form
     */
    unregister(formId) {
        this.forms.delete(formId);
        this.validators.delete(formId);
        this.onSubmit.delete(formId);
        return true;
    }
}

// Initialize globally
window.FormHandler = new FormHandler();

export default window.FormHandler;
