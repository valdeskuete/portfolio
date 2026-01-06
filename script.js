/* ==================== TYPED.JS INITIALIZATION ==================== */
// Will initialize after DOM is fully loaded
let typed; // Global reference to Typed instance

// Variables globales pour le menu - DÉCLARATION AVANT UTILISATION
let menuIcon = null;
let navbar = null;

// ATTENDRE QUE LE DOM ET FIREBASE SOIENT PRÊTS
async function initializeApp() {
    try {
        console.log('🚀 script.js starting initialization...');
        
        // Attendre que Firebase soit prêt en arrière-plan (sans bloquer)
        if (window.LoaderOptimized) {
            window.LoaderOptimized.getFirebaseReady().then(() => {
                console.log('✅ Firebase ready from background');
            });
        }
        
        // Attendre que le DOM soit chargé (mais il l'est déjà)
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once: true}));
        }
        
        console.log('✅ DOM is ready, initializing app...');
    
    // Menu mobile - INITIALISATION ROBUSTE
    menuIcon = document.querySelector('#menu-icon');
    navbar = document.querySelector('.navbar');
    
    if (menuIcon && navbar) {
        // Gestion du menu avec clavier et tactile
        const toggleMenu = () => {
            if (!menuIcon || !navbar) return; // Safety check
            const isOpen = navbar.classList.contains('active');
            if (isOpen) {
                menuIcon.classList.remove('active');
                navbar.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
            } else {
                menuIcon.classList.add('active');
                navbar.classList.add('active');
                menuIcon.setAttribute('aria-expanded', 'true');
                navbar.querySelector('a')?.focus();
            }
        };
        
        // Click handler
        menuIcon.addEventListener('click', toggleMenu);
        
        // Fermer le menu en cliquant sur le fond (navbar en dehors)
        navbar.addEventListener('click', (e) => {
            if (e.target === navbar) {
                menuIcon.classList.remove('active');
                navbar.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
                menuIcon.focus();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('active')) {
                menuIcon.classList.remove('active');
                navbar.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
                menuIcon.focus();
            }
        });
        
        // Fermer le menu quand on clique sur un lien
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                menuIcon.classList.remove('active');
                navbar.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Initialiser aria-expanded
        menuIcon.setAttribute('aria-label', 'Menu');
        menuIcon.setAttribute('aria-expanded', 'false');
        menuIcon.setAttribute('role', 'button');
        menuIcon.setAttribute('tabindex', '0');
        
        console.log('✅ Menu mobile initialized');
    } else {
        console.warn('⚠️ Menu elements not found');
    }
    
    // INITIALISER LES FILTRES - Firebase EST GARANTI ÊTRE PRÊT
    console.log('🔍 Checking Firebase before initializing filters...');
    if (window.loadProjects && typeof window.loadProjects === 'function') {
        console.log('✅ Firebase is available! Initializing filters...');
        initFilterButtons();
    } else {
        console.error('❌ Firebase not available even after waiting!');
    }
    
    console.log('✅ script.js initialization complete');
    
    // Signal que le contenu est stable (pour Service Worker caching)
    setTimeout(() => {
      if (window.LoaderOptimized) {
        window.LoaderOptimized.markContentStable();
      }
    }, 500); // Petit délai pour s'assurer que tout est complètement rendu
    } catch (error) {
        if (window.logError) window.logError('initializeApp', error);
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
}

// Démarrer l'initialisation avec gestion d'erreurs
try {
    initializeApp();
} catch (error) {
    console.error('❌ Erreur initialisation app:', error);
    if (window.logError) window.logError('initializeApp', error);
}

/* ==================== 1. MENU MOBILE ==================== */

/* ==================== 2. GESTION DES ONGLETS ADMIN ==================== */
window.openTab = function(tabName, clickedBtn) {
    console.log('🔄 Changing tab to:', tabName);
    
    let tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    let tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add("active");
        console.log('✅ Tab content activated:', tabName);
    } else {
        console.error('❌ Tab not found:', tabName);
    }
    
    // Mark the clicked button as active
    if (clickedBtn) {
        clickedBtn.classList.add("active");
        console.log('✅ Button activated:', clickedBtn.textContent.trim());
    }
};

/* ==================== 3. SCROLL SPY & NAVIGATION (OPTIMISÉ) ==================== */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

// Debounce scroll events pour meilleure performance
let scrollTimeout;
let lastScrollTime = 0;

// Calcul dynamique de la hauteur du header
function getHeaderOffset() {
    const header = document.querySelector('header');
    return header ? header.offsetHeight + 50 : 200; // 50px padding supplémentaire
}

window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime < 100) return; // Debounce 100ms
    lastScrollTime = now;
    
    const headerOffset = getHeaderOffset(); // CALCUL DYNAMIQUE
    
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - headerOffset; // Utiliser la hauteur dynamique
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
            });
            
            // Chercher le lien correspondant de manière robuste
            if (id) {
                const activeLink = document.querySelector(`header nav a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        }
    });

    // Fermer le menu si on scrolle
    if (menuIcon) menuIcon.classList.remove('active');
    if (navbar) navbar.classList.remove('active');
    if (menuIcon) menuIcon.setAttribute('aria-expanded', 'false');

    // Sticky Header
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);
}, { passive: true }); // passive pour meilleure perf

/* Amélioration: Fermer le menu au clic en dehors (mobile) */
document.addEventListener('click', (e) => {
    if (navbar && menuIcon && navbar.classList.contains('active')) {
        if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
            menuIcon.classList.remove('active');
            navbar.classList.remove('active');
            menuIcon.setAttribute('aria-expanded', 'false');
        }
    }
});

/* Fermer le menu mobile au clic sur un lien */
document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (menuIcon) menuIcon.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    });
});

/* ==================== FILTRAGE DU PORTFOLIO ==================== */
function initFilterButtons() {
    console.log('🔄 initFilterButtons() called');
    
    const filterContainer = document.querySelector('.filter-buttons');
    console.log('📍 Filter container found:', !!filterContainer);
    
    if (!filterContainer) {
        console.error('❌ .filter-buttons container not found');
        console.log('📸 All divs with "filter" in class:', 
            Array.from(document.querySelectorAll('[class*="filter"]')).map(el => ({
                tag: el.tagName,
                class: el.className,
                id: el.id
            }))
        );
        return;
    }
    
    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    console.log(`✅ Found ${filterButtons.length} filter buttons:`, 
        Array.from(filterButtons).map(btn => btn.getAttribute('data-filter'))
    );
    
    if (filterButtons.length === 0) {
        console.error('❌ No filter buttons found inside container');
        return;
    }

    // DELEGATION : écouter au niveau du container
    filterContainer.addEventListener('click', (e) => {
        console.log('🖱️ Click detected on filter container, target:', e.target);
        
        const button = e.target.closest('.filter-btn');
        if (!button) {
            console.log('⚠️ Click was not on a filter button');
            return;
        }

        // 1. Gérer l'état actif
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // 2. Récupérer le filtre
        const filterValue = button.getAttribute('data-filter');
        console.log('🔄 Filter clicked:', filterValue);

        // 3. Charger les projets
        if (window.loadProjects) {
            console.log('✅ Calling window.loadProjects with:', filterValue);
            window.loadProjects(filterValue);
        } else {
            console.error('❌ window.loadProjects is NOT available!', typeof window.loadProjects);
        }
    });

    console.log('✅ Filter buttons event listener attached');
}


/* ==================== 4. ANIMATIONS ==================== */
ScrollReveal({
    reset: false,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

// Typed.js - Attendre que la librairie soit chargée
window.addEventListener('DOMContentLoaded', () => {
    if (typeof Typed !== 'undefined') {
        typed = new Typed('.multiple-text', {
            strings: ['Technicien Informatique', 'Expert Réseaux', 'Spécialiste Sécurité'],
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 1000,
            loop: true
        });
        console.log('✅ Typed.js initialized');
    } else {
        console.warn('⚠️ Typed.js library not loaded');
    }
});

/* ==================== 5. FONCTIONS GLOBALES FIREBASE ====================*/
// IMPORTANT: Toutes les fonctions Firebase sont définies dans firebase-config.js
// - window.deleteItem()
// - window.approveItem()
// - window.deleteComment()
// - window.likeProject()
// - window.openCommentsModal()
// - window.closeCommentsModal()
// - window.addComment()
// Aucune duplication ici pour éviter les conflits

// Initialiser les globals utilisateur
window.currentProjectId = null;
window.currentUserId = localStorage.getItem('valdes_user_id') || 'guest_' + Date.now();
localStorage.setItem('valdes_user_id', window.currentUserId);
