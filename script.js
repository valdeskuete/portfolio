/* ==================== CONFIGURATION INITIALE & VARIABLES ==================== */
const adminTrigger = document.querySelector('#admin-login-link');
const adminModal = document.querySelector('#admin-modal');
const closeModal = document.querySelector('.close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

/* ==================== 1. GESTION DE L'ADMIN (MODAL & TABS) ==================== */

// Ouvrir la modal admin
adminTrigger.onclick = () => {
    let password = prompt("Accès restreint. Entrez le mot de passe :");
    if (password === "TON_MOT_DE_PASSE") { // Remplace par ton code
        adminModal.classList.remove('hidden');
    } else {
        alert("Accès refusé.");
    }
};

// Fermer la modal
closeModal.onclick = () => adminModal.classList.add('hidden');

// Gestion des onglets (Projets / Avis)
tabBtns.forEach(btn => {
    btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    };
});

/* ==================== 2. LOGIQUE TÉMOIGNAGES (CLIENT & ADMIN) ==================== */

// Afficher le formulaire de témoignage pour le client
const btnShowReview = document.querySelector('#btn-show-review-form');
const reviewForm = document.querySelector('#client-review-form');

if(btnShowReview) {
    btnShowReview.onclick = () => reviewForm.classList.toggle('hidden');
}

// Note : La fonction d'envoi (submit) vers Firebase sera dans firebase-config.js
// Mais voici la logique d'affichage admin pour l'approbation :
function renderPendingReview(id, data) {
    const container = document.querySelector('#pending-reviews-list');
    const html = `
        <div class="pending-item" id="review-${id}">
            <p><strong>${data.name}</strong> : "${data.message}"</p>
            <div class="admin-actions">
                <button class="approve-btn" onclick="approveReview('${id}')">Approuver</button>
                <button class="delete-btn" onclick="deleteReview('${id}')">Supprimer</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

/* ==================== 3. FILTRAGE DU PORTFOLIO ==================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-box');

filterBtns.forEach(btn => {
    btn.onclick = () => {
        // UI
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filtre
        let filter = btn.dataset.filter;
        portfolioItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    };
});

/* ==================== 4. FONCTIONS DE BASE MAINTENUES & OPTIMISÉES ==================== */

// MENU MOBILE
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('fa-xmark');
    navbar.classList.toggle('active');
};

// SCROLL & STICKY
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
                let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                if (targetLink) targetLink.classList.add('active');
            });
        }
    });

    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // Fermeture auto menu mobile sur scroll pour meilleure UX
    if(navbar.classList.contains('active')) {
        menuIcon.classList.remove('fa-xmark');
        navbar.classList.remove('active');
    }
};

// SCROLL REVEAL
const sr = ScrollReveal({ 
    reset: false, // "false" pour éviter que ça clignote à chaque scroll
    distance: '60px',
    duration: 2000,
    delay: 200
});

sr.reveal('.home-content, .heading', { origin: 'top' }); 
sr.reveal('.home-img, .services-container, .portfolio-container, .contact form, .submit-review-box', { origin: 'bottom' }); 
sr.reveal('.home-content h1, .timeline-item:nth-child(odd)', { origin: 'left' });
sr.reveal('.home-content p, .timeline-item:nth-child(even)', { origin: 'right' });

// TYPED JS
if (document.querySelector('.multiple-text')) {
    new Typed('.multiple-text', {
        strings: ['Technicien Informatique', 'Expert Maintenance', 'Administrateur Réseau', 'Expert Sécurité'],
        typeSpeed: 70,
        backSpeed: 50,
        backDelay: 1500,
        loop: true
    });
}

// BOTPRESS TRIGGER
document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('open-chat-button');
    if (chatButton) {
        chatButton.onclick = () => {
            if (window.botpressWebChat) {
                window.botpressWebChat.sendEvent({type: 'show'});
                window.botpressWebChat.sendEvent({type: 'open'});
            }
        };
    }
});