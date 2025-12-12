/* ==================== MENU MOBILE (HAMBURGER) ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    // Change l'icône en "X" quand on clique
    menuIcon.classList.toggle('fa-xmark');
    // Affiche ou cache le menu
    navbar.classList.toggle('active');
};

/* ==================== LIEN ACTIF AU SCROLL ==================== */
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
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    /* ==================== STICKY NAVBAR ==================== */
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /* ==================== FERMER MENU AU CLIC (MOBILE) ==================== */
    menuIcon.classList.remove('fa-xmark');
    navbar.classList.remove('active');
};

/* ==================== SCROLL REVEAL (ANIMATION D'APPARITION) ==================== */
ScrollReveal({ 
    reset: true, // L'animation se rejoue si on remonte
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/* ==================== TYPED JS (TEXTE DYNAMIQUE) ==================== */
const typed = new Typed('.multiple-text', {
    strings: ['Technicien Informatique', 'Expert Maintenance', 'Administrateur Réseau', 'Pro de la Sécurité'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});