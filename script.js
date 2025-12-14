/* ==================== MENU MOBILE (HAMBURGER) ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    // Bascule entre l'icône burger et la croix
    menuIcon.classList.toggle('fa-xmark');
    navbar.classList.toggle('active');
};

/* ==================== LIEN ACTIF AU SCROLL & STICKY HEADER ==================== */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                // Sécurité : Vérifie si le lien existe avant d'ajouter la classe
                let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            });
        };
    });

    /* --- Sticky Navbar --- */
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /* --- Fermer le menu mobile au scroll --- */
    // Cela ferme le menu automatiquement si l'utilisateur fait défiler la page
    menuIcon.classList.remove('fa-xmark');
    navbar.classList.remove('active');
};

/* ==================== SCROLL REVEAL (ANIMATIONS) ==================== */
// Vérification que ScrollReveal est chargé pour éviter les erreurs
if (typeof ScrollReveal !== 'undefined') {
    ScrollReveal({ 
        reset: true,
        distance: '80px',
        duration: 2000,
        delay: 200
    });

    ScrollReveal().reveal('.home-content, .heading, #assistant-invitation h2', { origin: 'top' });
    ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form, #assistant-invitation p, #assistant-invitation button', { origin: 'bottom' });
    ScrollReveal().reveal('.home-content h1, .skills-column:first-child', { origin: 'left' });
    ScrollReveal().reveal('.home-content p, .skills-column:last-child', { origin: 'right' });
    ScrollReveal().reveal('.timeline-item:nth-child(odd)', { origin: 'left' });
    ScrollReveal().reveal('.timeline-item:nth-child(even)', { origin: 'right' });
}

/* ==================== TYPED JS (TEXTE DYNAMIQUE) ==================== */
// Vérification stricte pour éviter l'erreur "Uncaught Error" à la ligne 41
if (typeof Typed !== 'undefined' && document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Technicien Informatique', 'Expert Maintenance', 'Administrateur Réseau', 'Expert Sécurité'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}