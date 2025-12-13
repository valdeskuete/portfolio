/* ==================== MENU MOBILE (HAMBURGER) ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    // Bascule entre l'icône burger et la croix (fa-xmark est pour FontAwesome 6)
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
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    /* --- Sticky Navbar --- */
    let header = document.querySelector('header');
    // Ajoute la classe 'sticky' si on scrolle de plus de 100px
    header.classList.toggle('sticky', window.scrollY > 100);

    /* --- Fermer le menu mobile si on scrolle (Optionnel mais recommandé) --- */
    menuIcon.classList.remove('fa-xmark');
    navbar.classList.remove('active');
};

/* ==================== SCROLL REVEAL (ANIMATIONS) ==================== */
ScrollReveal({ 
    reset: true, // true = l'animation se rejoue à chaque fois
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .skills-column:first-child', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .skills-column:last-child', { origin: 'right' });
// NOUVELLES LIGNES POUR LA CHRONOLOGIE (EDUCATION)
// Fait apparaître les conteneurs du parcours (alternance droite/gauche)
ScrollReveal().reveal('.timeline-item:nth-child(odd)', { origin: 'left' });
ScrollReveal().reveal('.timeline-item:nth-child(even)', { origin: 'right' });

/* ==================== TYPED JS (TEXTE DYNAMIQUE) ==================== */
// Assure-toi que la classe .multiple-text existe bien dans le HTML
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Technicien Informatique', 'Expert Maintenance', 'Administrateur Réseau', 'Expert Sécurité'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}