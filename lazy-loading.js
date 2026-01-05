/**
 * ========== LAZY LOADING & IMAGE OPTIMIZATION ==========
 * Optimise le chargement des images et performances mobile
 */

// Lazy loading des images avec IntersectionObserver
function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback pour navigateurs anciens
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        });
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Charger l'image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                // Ajouter classe de chargement
                img.classList.add('loaded');
                
                // Arrêter l'observation
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Observer toutes les images lazy
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Lazy loading des projets portfolio (dynamiquement chargés)
function setupPortfolioLazyLoading() {
    const observer = new MutationObserver(() => {
        const newImages = document.querySelectorAll('.portfolio-box img[data-src]:not([data-observed])');
        newImages.forEach(img => {
            img.setAttribute('data-observed', 'true');
            
            // Créer un IntersectionObserver pour cette image
            const imgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                            image.classList.add('loaded');
                        }
                        imgObserver.unobserve(image);
                    }
                });
            }, { rootMargin: '50px' });
            
            imgObserver.observe(img);
        });
    });

    observer.observe(document.getElementById('portfolio-list'), {
        childList: true,
        subtree: true
    });
}

// Optimiser les images dynamiques (articles, astuces, etc)
function optimizeDynamicImages() {
    // Observer le conteneur des astuces
    const tipsContainer = document.getElementById('tips-display');
    if (tipsContainer) {
        const observer = new MutationObserver(() => {
            initLazyLoading();
        });
        observer.observe(tipsContainer, { childList: true, subtree: true });
    }

    // Observer le conteneur du journal
    const journalContainer = document.getElementById('journal-display');
    if (journalContainer) {
        const observer = new MutationObserver(() => {
            initLazyLoading();
        });
        observer.observe(journalContainer, { childList: true, subtree: true });
    }
}

// Réduire les animations si demandé par l'utilisateur
function respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.scrollBehavior = 'auto';
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Optimiser les performances réseau
function networkOptimization() {
    // Vérifier la vitesse de connexion
    if (navigator.connection) {
        const connection = navigator.connection.effectiveType;
        const saveData = navigator.connection.saveData;

        // Désactiver certaines animations sur 4g lent ou 3g
        if (connection === '4g' || saveData) {
            document.documentElement.classList.add('reduced-animations');
        }
    }
}

// Optimiser les fonts - charger uniquement les poids nécessaires
function optimizeFonts() {
    // Vérifier si les fonts sont déjà chargées
    if (document.fonts && document.fonts.status === 'loaded') {
        document.documentElement.classList.add('fonts-loaded');
    }
}

// Initialisation au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initLazyLoading();
        setupPortfolioLazyLoading();
        optimizeDynamicImages();
        respectReducedMotion();
        networkOptimization();
        optimizeFonts();
    });
} else {
    initLazyLoading();
    setupPortfolioLazyLoading();
    optimizeDynamicImages();
    respectReducedMotion();
    networkOptimization();
    optimizeFonts();
}

// Écouter les changements de préférences de mouvement
window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
    if (e.matches) {
        document.documentElement.style.scrollBehavior = 'auto';
    } else {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
});
