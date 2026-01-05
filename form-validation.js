/**
 * ========== VALIDATION DES FORMULAIRES ==========
 * Validation côté client pour tous les formulaires
 */

// Expressions régulières de validation
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\+\-\(\)]{7,}$/,
    url: /^(https?:\/\/)?.+\..+/i,
    name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/
};

// Fonction de validation générique
function validateField(value, type, fieldName) {
    if (!value || value.trim() === '') {
        return { valid: false, error: `${fieldName} est requis` };
    }

    const pattern = VALIDATION_PATTERNS[type];
    if (pattern && !pattern.test(value.trim())) {
        const errorMessages = {
            email: 'Email invalide',
            phone: 'Téléphone invalide (min 7 caractères)',
            url: 'URL invalide',
            name: 'Nom invalide (2-50 caractères, lettres uniquement)'
        };
        return { valid: false, error: errorMessages[type] || `${fieldName} invalide` };
    }

    return { valid: true };
}

// Validation du formulaire de contact
function validateContactForm() {
    const form = document.getElementById('firebase-contact-form');
    if (!form) return true;

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('contact-message').value;

    // Validation du nom
    const nameValidation = validateField(name, 'name', 'Nom');
    if (!nameValidation.valid) {
        alert(nameValidation.error);
        return false;
    }

    // Validation du email
    const emailValidation = validateField(email, 'email', 'Email');
    if (!emailValidation.valid) {
        alert(emailValidation.error);
        return false;
    }

    // Validation du téléphone (optionnel mais si fourni, doit être valide)
    if (phone) {
        const phoneValidation = validateField(phone, 'phone', 'Téléphone');
        if (!phoneValidation.valid) {
            alert(phoneValidation.error);
            return false;
        }
    }

    // Validation du message
    if (!message || message.trim().length < 10) {
        alert('Le message doit contenir au moins 10 caractères');
        return false;
    }

    if (message.trim().length > 5000) {
        alert('Le message ne peut pas dépasser 5000 caractères');
        return false;
    }

    return true;
}

// Validation du formulaire d'avis
function validateReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return true;

    const name = document.getElementById('review-name').value;
    const text = document.getElementById('review-text').value;

    // Validation du nom
    const nameValidation = validateField(name, 'name', 'Nom');
    if (!nameValidation.valid) {
        alert(nameValidation.error);
        return false;
    }

    // Validation du texte
    if (!text || text.trim().length < 10) {
        alert('L\'avis doit contenir au moins 10 caractères');
        return false;
    }

    if (text.trim().length > 1000) {
        alert('L\'avis ne peut pas dépasser 1000 caractères');
        return false;
    }

    return true;
}

// Validation du formulaire de projet (admin)
function validateProjectForm() {
    const form = document.getElementById('project-form');
    if (!form) return true;

    const title = document.getElementById('p-title').value;
    const tag = document.getElementById('p-tag').value;
    const challenge = document.getElementById('p-challenge').value;
    const solution = document.getElementById('p-solution').value;
    const result = document.getElementById('p-result').value;

    // Validations
    if (!title || title.trim().length < 5) {
        alert('Le titre doit contenir au moins 5 caractères');
        return false;
    }

    if (!tag) {
        alert('Sélectionnez une catégorie');
        return false;
    }

    const minLength = 20;
    if (!challenge || challenge.trim().length < minLength) {
        alert(`Le défi doit contenir au moins ${minLength} caractères`);
        return false;
    }

    if (!solution || solution.trim().length < minLength) {
        alert(`La solution doit contenir au moins ${minLength} caractères`);
        return false;
    }

    if (!result || result.trim().length < minLength) {
        alert(`Le résultat doit contenir au moins ${minLength} caractères`);
        return false;
    }

    return true;
}

// Validation du formulaire de conseil (admin)
function validateTipForm() {
    const form = document.getElementById('tip-form');
    if (!form) return true;

    const title = document.getElementById('tip-title').value;
    const category = document.getElementById('tip-category').value;
    const content = document.getElementById('tip-content').value;

    if (!title || title.trim().length < 5) {
        alert('Le titre doit contenir au moins 5 caractères');
        return false;
    }

    if (!category) {
        alert('Sélectionnez une catégorie');
        return false;
    }

    if (!content || content.trim().length < 30) {
        alert('Le contenu doit contenir au moins 30 caractères');
        return false;
    }

    if (content.trim().length > 5000) {
        alert('Le contenu ne peut pas dépasser 5000 caractères');
        return false;
    }

    return true;
}

// Ajouter les validations aux formulaires au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire de contact
    const contactForm = document.getElementById('firebase-contact-form');
    if (contactForm) {
        // Ajouter labels accessibles si manquants
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && input.id) {
                const label = contactForm.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    input.setAttribute('aria-label', input.placeholder || input.id);
                }
            }
        });
        
        contactForm.addEventListener('submit', (e) => {
            if (!validateContactForm()) {
                e.preventDefault();
            }
        });
    }

    // Formulaire d'avis
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        // Ajouter labels accessibles
        const inputs = reviewForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && input.id) {
                const label = reviewForm.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    input.setAttribute('aria-label', input.placeholder || input.id);
                }
            }
        });
        
        reviewForm.addEventListener('submit', (e) => {
            if (!validateReviewForm()) {
                e.preventDefault();
            }
        });
    }

    // Formulaires admin
    const adminForms = document.querySelectorAll('.admin-form');
    adminForms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && input.id) {
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    input.setAttribute('aria-label', input.placeholder || input.id);
                }
            }
        });
    });

    // Real-time validation feedback
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
        input.addEventListener('blur', () => {
            // Créer élément d'erreur s'il n'existe pas
            let errorElement = document.getElementById(`${input.id}-error`);
            if (!errorElement && input.id) {
                errorElement = document.createElement('div');
                errorElement.id = `${input.id}-error`;
                errorElement.style.cssText = 'color: #d32f2f; font-size: 0.875rem; margin-top: 4px; display: none;';
                input.parentElement.appendChild(errorElement);
            }

            if (input.hasAttribute('required') && !input.value.trim()) {
                input.setAttribute('aria-invalid', 'true');
                input.setAttribute('aria-describedby', `${input.id}-error`);
                if (errorElement) {
                    errorElement.textContent = 'Champ requis';
                    errorElement.style.display = 'block';
                }
            } else if (input.type === 'email' && input.value) {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                input.setAttribute('aria-invalid', !isValid);
                if (!isValid && errorElement) {
                    errorElement.textContent = 'Email invalide';
                    errorElement.style.display = 'block';
                } else if (isValid && errorElement) {
                    errorElement.style.display = 'none';
                }
            } else if (input.value.trim() && errorElement) {
                errorElement.style.display = 'none';
                input.setAttribute('aria-invalid', 'false');
            }
        });

        // Focus pour enlever les erreurs
        input.addEventListener('focus', () => {
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            input.setAttribute('aria-invalid', 'false');
        });
    });

    // Formulaire de projet
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            if (!validateProjectForm()) {
                e.preventDefault();
            }
        });
    }

    // Formulaire de conseil
    const tipForm = document.getElementById('tip-form');
    if (tipForm) {
        tipForm.addEventListener('submit', (e) => {
            if (!validateTipForm()) {
                e.preventDefault();
            }
        });
    }
});

// Exporter les fonctions pour utilisation externe
window.FORM_VALIDATION = {
    validateContactForm,
    validateReviewForm,
    validateProjectForm,
    validateTipForm,
    validateField
};
