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

/* ==================== BOTPRESS CHAT CUSTOM FUNCTION (ROBUSTE) ==================== */
document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('open-chat-button');
    
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            function showBotpressChat() {
                // Vérifie si l'objet Botpress est chargé et prêt
                if (window.botpressWebChat && window.botpressWebChat.sendEvent) {
                    // C'est l'appel API qui ouvre la fenêtre de chat
                    window.botpressWebChat.sendEvent({type: 'show'}); 
                } else {
                    // Si l'objet n'est pas encore prêt, on réessaie après un court délai
                    console.warn("Botpress n'est pas prêt, réessai...");
                    setTimeout(showBotpressChat, 100); 
                }
            }
            // Lance la vérification
            showBotpressChat();
        });
    } else {
        console.error("Erreur critique : Bouton #open-chat-button non trouvé.");
    }
});