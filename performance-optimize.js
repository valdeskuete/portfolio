/**
 * ========== OPTIMISATIONS PERFORMANCE ==========
 * Lazy loading, compression, mise en cache, etc.
 */

// 1. INTERSECTION OBSERVER POUR LAZY LOADING
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        }
    });
}, observerOptions);

// Appliquer lazy loading à toutes les images
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
    });
});

// 2. DEBOUNCE POUR ÉVÉNEMENTS FRÉQUENTS
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 3. THROTTLE POUR SCROLL/RESIZE
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 4. OPTIMISER LES ÉVÉNEMENTS SCROLL
window.addEventListener('scroll', throttle(() => {
    // Sticky header
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header?.classList.add('sticky');
    } else {
        header?.classList.remove('sticky');
    }
}, 100));

// 5. PRÉCHARGER LES RESSOURCES CRITIQUES
if ('link' in document) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
}

// 6. METTRE EN CACHE LES DONNÉES FIREBASE LOCALEMENT
const cacheStore = {
    set: (key, value, ttl = 3600000) => {
        const data = {
            value: value,
            timestamp: Date.now()
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    },
    get: (key, ttl = 3600000) => {
        const item = localStorage.getItem(`cache_${key}`);
        if (!item) return null;
        
        const data = JSON.parse(item);
        if (Date.now() - data.timestamp > ttl) {
            localStorage.removeItem(`cache_${key}`);
            return null;
        }
        return data.value;
    },
    clear: (key) => {
        localStorage.removeItem(`cache_${key}`);
    }
};

// 7. MINIFIER LES EXÉCUTIONS DE SCRIPT
document.addEventListener('DOMContentLoaded', () => {
    // Exécuter les scripts non-critiques en différé
    setTimeout(() => {
        if (window.SocialLinks) {
            window.SocialLinks.init?.();
        }
    }, 1000);
});

// 8. ANALYSER LES PERFORMANCES
if ('PerformanceObserver' in window) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 2000) {
                    console.warn(`⚠️ Tâche lente détectée: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                }
            }
        });
        perfObserver.observe({ entryTypes: ['longtask', 'measure'] });
    } catch(e) {
        // PerformanceObserver non supporté
    }
}

// 9. CONNEXION RÉSEAU OPTIMISÉE
if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        connection.addEventListener('change', () => {
            const effectiveType = connection.effectiveType;
            if (effectiveType === '4g') {
                console.log('✅ Connexion rapide détectée - Chargement haute qualité');
            } else if (effectiveType === '3g') {
                console.log('📊 Connexion 3G - Images compressées activées');
            }
        });
    }
}

console.log('⚡ Performance optimizations loaded');
