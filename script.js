/* ==================== INITIALISATION DES VARIABLES ==================== */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

/* ==================== ANIMATIONS SCROLLREVEAL ==================== */
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

/* ==================== TYPED JS (Animation texte) ==================== */
const typed = new Typed('.multiple-text', {
    strings: ['Technicien Informatique', 'Expert Réseaux', 'Spécialiste Sécurité'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

/* ==================== GESTION ACTIVE DES LIENS (SCROLL SPY) ==================== */
window.addEventListener('scroll', () => {
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (current && link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
});