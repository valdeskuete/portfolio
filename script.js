/* ==================== 1. MENU MOBILE (Code Ajouté) ==================== */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x'); // Transforme l'icône en X
    navbar.classList.toggle('active'); // Affiche le menu
};

/* ==================== 2. GESTION DES ONGLETS ADMIN (Code Ajouté) ==================== */
// Cette fonction est maintenant disponible globalement
window.openTab = function(tabName) {
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

    // Afficher le contenu demandé et activer le bouton cliqué
    document.getElementById(tabName).classList.add("active");
    
    // Astuce pour retrouver le bouton cliqué (event target)
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
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        }
    });

    // Fermer le menu si on scrolle
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // Sticky Header
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);
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


/* ==================== 4. ANIMATIONS ==================== */
ScrollReveal({
    reset: false, // Mettre à true si tu veux que l'animation se répète
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
