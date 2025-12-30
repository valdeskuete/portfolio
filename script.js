/* ==================== 1. MENU MOBILE ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('active');
        navbar.classList.toggle('active');
    };
}

/* ==================== 2. GESTION DES ONGLETS ADMIN ==================== */
window.openTab = function(tabName) {
    let tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    let tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
};

/* ==================== 3. SCROLL SPY & NAVIGATION ==================== */
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

    // Sticky Header
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);
};

/* Fermer le menu mobile au clic sur un lien */
document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (menuIcon) menuIcon.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    });
});

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

const typed = new Typed('.multiple-text', {
    strings: ['Technicien Informatique', 'Expert Réseaux', 'Spécialiste Sécurité'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});
