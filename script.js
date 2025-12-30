/* ==================== 1. MENU MOBILE (Code Amélioré) ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('active');
        navbar.classList.toggle('active');
        document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : 'auto';
    };

    // Fermer le menu au clic sur un lien
    navbar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuIcon.classList.remove('active');
            navbar.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

/* ==================== 2. GESTION DES ONGLETS ADMIN (Amélioré) ==================== */
window.openTab = function(tabName) {
    try {
        // Validation du tabName
        if (!tabName || typeof tabName !== 'string') {
            console.error('Invalid tab name provided');
            return;
        }

        // Masquer tous les contenus
        let tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }

        // Désactiver tous les boutons
        let tabBtns = document.getElementsByClassName("tab-btn");
        for (let i = 0; i < tabBtns.length; i++) {
            tabBtns[i].classList.remove("active");
        }

        // Afficher le contenu demandé
        const targetElement = document.getElementById(tabName);
        if (targetElement) {
            targetElement.classList.add("active");
            // Activer le bouton cliqué
            if (event && event.currentTarget) {
                event.currentTarget.classList.add("active");
            }
        } else {
            console.warn(`Tab with id '${tabName}' not found`);
        }
    } catch (error) {
        console.error('Error in openTab:', error);
    }
};

/* ==================== 3. SCROLL SPY & NAVIGATION (Amélioré) ==================== */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    try {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if(top >= offset && top < offset + height) {
                navLinks.forEach(links => {
                    links.classList.remove('active');
                });
                const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });

        // Sticky Header
        let header = document.querySelector('header');
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }
    } catch (error) {
        console.error('Error in scroll event:', error);
    }
};

/* ==================== FILTRAGE DU PORTFOLIO (Correction) ==================== */
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.onclick = () => {
        // 1. Gérer l'état actif des boutons
        document.querySelector('.filter-btn.active').classList.remove('active');
        button.classList.add('active');

        // 2. Récupérer le filtre
        const filterValue = button.getAttribute('data-filter');

        // 3. Appeler la fonction de chargement Firebase (déjà présente dans ton firebase-config.js)
        if (window.loadProjects) {
            window.loadProjects(filterValue);
        }
    };
});


/* ==================== 4. ANIMATIONS & VALIDATION ==================== */
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

const typed = new Typed('.multiple-text', {
    strings: ['Technicien Informatique', 'Expert Réseaux', 'Spécialiste Sécurité'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

/* ==================== VALIDATION FORMULAIRES ==================== */
// Validation pour formulaire de contact
const contactForm = document.getElementById('firebase-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        const email = document.getElementById('contact-email');
        const phone = document.getElementById('contact-phone');
        
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            e.preventDefault();
            email.style.borderColor = '#ff3333';
            alert('Email invalide');
            return;
        }
        
        // Validation téléphone (optionnel si rempli)
        const phoneRegex = /^[\d\s\-\+\(\)]{0,20}$/;
        if (phone.value && !phoneRegex.test(phone.value)) {
            e.preventDefault();
            phone.style.borderColor = '#ff3333';
            alert('Numéro de téléphone invalide');
            return;
        }
        
        email.style.borderColor = '';
        phone.style.borderColor = '';
    });
}
