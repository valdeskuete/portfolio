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
                // La section IA n'a pas de lien dans la navbar, donc on vérifie si l'ID existe avant d'activer.
                let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                if (targetLink) {
                    targetLink.classList.add('active');
                }
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

// Inclure la nouvelle section IA dans les animations
ScrollReveal().reveal('.home-content, .heading, #assistant-invitation h2', { origin: 'top' }); 
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form, #assistant-invitation p, #assistant-invitation button', { origin: 'bottom' }); 
ScrollReveal().reveal('.home-content h1, .skills-column:first-child', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .skills-column:last-child', { origin: 'right' });

// NOUVELLES LIGNES POUR LA CHRONOLOGIE (EDUCATION)
// Fait apparaître les conteneurs du parcours (alternance droite/gauche)
ScrollReveal().reveal('.timeline-item:nth-child(odd)', { origin: 'left' });
ScrollReveal().reveal('.timeline-item:nth-child(even)', { origin: 'right' });

/* ==================== TYPED JS (TEXTE DYNAMIQUE) ==================== */
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Technicien Informatique', 'Expert Maintenance', 'Administrateur Réseau', 'Expert Sécurité'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}

/* ==================== BOTPRESS CHAT CUSTOM FUNCTION ==================== */
// Fonction pour ouvrir le chat de manière sécurisée, en attendant que Botpress soit prêt.
window.openBotpressChat = function() {
    // Vérifie si l'objet Botpress est déjà prêt
    if (window.botpressWebChat && window.botpressWebChat.sendEvent) {
        window.botpressWebChat.sendEvent({type: 'show'});
    } else {
        // Optionnel : Tentative de forcer l'ouverture après un court délai si le chargement est en cours
        setTimeout(() => {
            if (window.botpressWebChat && window.botpressWebChat.sendEvent) {
                window.botpressWebChat.sendEvent({type: 'show'});
            } else {
                console.error("Botpress WebChat n'est pas encore chargé.");
            }
        }, 500); // Essayer à nouveau après 500ms
    }
}