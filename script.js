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
        window.ErrorHandler.warning('script.initializeApp', new Error('Firebase not available after waiting'));
    }
    
    console.log('✅ script.js initialization complete');
    
    // Signal que le contenu est stable (pour Service Worker caching)
    setTimeout(() => {
      if (window.LoaderOptimized) {
        window.LoaderOptimized.markContentStable();
      }
    }, 500); // Petit délai pour s'assurer que tout est complètement rendu
    
    // ===== GESTION DU SCROLL INTELLIGENT POUR LA NAVBAR =====
    initSmartHeaderScroll();
    
    } catch (error) {
        window.ErrorHandler.error('script.initializeApp', error);
    }
}

// ===== SMART HEADER SCROLL SYSTEM =====
function initSmartHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScrollY = 0;
    let ticking = false;
    
    if (!header) return;
    
    function updateScroll() {
        const currentScrollY = window.scrollY;
        
        // Ajouter classe "scrolled" si on a scrollé plus de 50px
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    console.log('✅ Smart header scroll system initialized');
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
        window.ErrorHandler.warning('script.initFilterButtons', new Error('.filter-buttons container not found'));
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
        window.ErrorHandler.warning('script.initFilterButtons', new Error('No filter buttons found inside container'));
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

/* ==================== BOTPRESS CHAT - SIMPLE & ROBUSTE ====================*/
// Exécution après le DOMContentLoaded pour être sûr que Botpress est chargé
document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('open-chat-button');
    
    if (chatButton) {
        chatButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🤖 Ouverture du chat Botpress...');
            
            function showBotpressChat() {
                // Vérifie si l'objet Botpress est chargé et prêt
                if (window.botpressWebChat && window.botpressWebChat.sendEvent) {
                    // C'est l'appel API qui ouvre la fenêtre de chat
                    console.log('✅ Botpress prêt, ouverture du chat');
                    window.botpressWebChat.sendEvent({type: 'show'}); 
                } else {
                    // Si l'objet n'est pas encore prêt, on réessaie après un court délai
                    console.warn("⏳ Botpress en chargement, nouvelle tentative...");
                    setTimeout(showBotpressChat, 100); 
                }
            }
            // Lance la vérification
            showBotpressChat();
        });
    } else {
        console.warn("⚠️ Bouton #open-chat-button non trouvé");
    }
});

/* ==================== 5. GESTIONNAIRES D'ÉVÉNEMENTS ADMIN ====================*/

// Gestionnaire pour le bouton admin dans le footer
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginTrigger = document.getElementById('admin-login-trigger');
    const adminLoginLink = document.getElementById('admin-login-link');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const adminPanel = document.getElementById('admin-panel');

    // Ouvrir la modale de connexion (footer)
    if (adminLoginTrigger) {
        adminLoginTrigger.addEventListener('click', () => {
            console.log('🔐 Ouverture modale connexion admin (footer)');
            if (loginModal) loginModal.classList.remove('hidden');
        });
    }

    // Ouvrir la modale de connexion (navbar)
    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔐 Ouverture modale connexion admin (navbar)');
            if (loginModal) loginModal.classList.remove('hidden');
        });
    }

    // Fermer la modale
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            console.log('❌ Fermeture modale connexion');
            if (loginModal) loginModal.classList.add('hidden');
        });
    }

    // Fermer la modale en cliquant à l'extérieur
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
            }
        });
    }

    // Gestion du formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            console.log('🔐 Tentative de connexion avec:', email);

            // Vérifier si window.adminLogin existe (défini dans admin-auth.js)
            if (window.adminLogin) {
                try {
                    const success = await window.adminLogin(email, password);
                    if (success) {
                        console.log('✅ Connexion admin réussie');
                        if (loginModal) loginModal.classList.add('hidden');
                        if (adminPanel) adminPanel.classList.remove('hidden');
                        // Charger les données admin
                        if (window.loadAdminData) {
                            window.loadAdminData();
                        }
                    } else {
                        console.log('❌ Échec de connexion admin');
                        alert('Email ou mot de passe incorrect');
                    }
                } catch (error) {
                    console.error('❌ Erreur connexion:', error);
                    alert('Erreur lors de la connexion');
                }
            } else {
                console.error('❌ Fonction adminLogin non disponible');
                alert('Système d\'authentification non chargé');
            }
        });
    }

    // Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('🚪 Déconnexion admin');
            if (window.adminLogout) {
                window.adminLogout();
            }
            if (adminPanel) adminPanel.classList.add('hidden');
        });
    }

    // Gestion des boutons "suivre sur les réseaux" (social media)
    const socialMediaLinks = document.querySelectorAll('.social-media a');
    socialMediaLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            console.log('🔗 Clique social media:', href);
            
            // Si c'est un lien téléphonique ou email, laisser agir normalement
            if (href.startsWith('tel:') || href.startsWith('mailto:')) {
                return; // Laisser agir normalement
            }
            
            // Pour les liens externes, ouvrir dans un nouvel onglet
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                e.preventDefault();
                window.open(href, '_blank', 'noopener,noreferrer');
            }
        });
    });

    console.log('✅ Gestionnaires admin et social media initialisés');
});

/* ==================== 6. FONCTIONS GLOBALES FIREBASE ====================*/
// IMPORTANT: Toutes les fonctions Firebase sont définies dans firebase-config.js
// - window.deleteItem()
// - window.approveItem()
// - window.deleteComment()
// - window.likeProject()
// - window.openCommentsModal()
// - window.closeCommentsModal()
// - window.addComment()
