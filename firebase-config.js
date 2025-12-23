/* ============================================================
   CONFIG & LOGIQUE PRINCIPALE (firebase-config.js)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, query,
  orderBy, where, deleteDoc, doc, updateDoc,
  increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAB7CYuYUyLKihOQ8KstDcj6ko_CLjs4S8",
  authDomain: "valdes-tech.firebaseapp.com",
  projectId: "valdes-tech",
  storageBucket: "valdes-tech.firebasestorage.app",
  messagingSenderId: "359469879862",
  appId: "1:359469879862:web:6ede2896e55a9822ef7e97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isAdmin = false;

const el = {
  adminPanel: document.getElementById('admin-panel'),
  adminTrigger: document.getElementById('admin-login-trigger'),
  loginModal: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  closeModal: document.getElementById('close-modal')
};

/* ==================== AUTH + INITIALISATION ==================== */
function initAdminSystem() {
  onAuthStateChanged(auth, (user) => {
    isAdmin = !!user;
    if (user) {
      el.adminPanel?.classList.remove('hidden');
      el.adminTrigger?.classList.add('hidden');
      el.loginModal?.classList.add('hidden');
      loadAdminMessages();
      loadAdminReviews();
      loadAdminComments();
    } else {
      el.adminPanel?.classList.add('hidden');
      el.adminTrigger?.classList.remove('hidden');
    }
    window.loadProjects(); 
    loadTips(); // Charger les conseils
  });

  if(el.adminTrigger) el.adminTrigger.onclick = () => el.loginModal.classList.remove('hidden');
  if(el.closeModal) el.closeModal.onclick = () => el.loginModal.classList.add('hidden');

  el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
      el.loginForm.reset();
    } catch { alert("Identifiants incorrects"); }
  });

  if(el.logoutBtn) el.logoutBtn.onclick = () => signOut(auth);
}
initAdminSystem();
/* ==================== INITIALISATION DES VARIABLES ET SÉLECTEURS ==================== */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');
const isAdmin = window.isAdmin || false; // Assurez-vous que cette variable est définie lors de la connexion

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
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
});

/* ==================== OUTILS GLOBAUX (ADMIN & LIKES) ==================== */
window.deleteItem = async (col, id) => {
    if (!isAdmin) return;
    if (confirm("Supprimer définitivement ?")) {
        try {
            await deleteDoc(doc(db, col, id));
        } catch (error) {
            console.error("Erreur de suppression:", error);
        }
    }
};

window.approveItem = async (col, id) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, col, id), { approved: true });
};

/* ==================== SYSTÈME DE LIKE SÉCURISÉ ==================== */
window.likeProject = async (projectId) => {
    const likedProjects = JSON.parse(localStorage.getItem('valdes_tech_likes') || '[]');

    if (likedProjects.includes(projectId)) {
        alert("Vous avez déjà aimé ce projet ! 😉");
        return;
    }

    try {
        const projectRef = doc(db, "projets", projectId);
        await updateDoc(projectRef, {
            likes: increment(1)
        });

        likedProjects.push(projectId);
        localStorage.setItem('valdes_tech_likes', JSON.stringify(likedProjects));
        console.log("✅ Like enregistré");
    } catch (error) {
        console.error("Erreur lors du like :", error);
    }
};

/* ==================== PROJETS (RENDU DYNAMIQUE) ==================== */
window.loadProjects = (filter = "all") => {
    const list = document.getElementById('portfolio-list');
    if (!list) return;

    let q = query(collection(db, "projets"), orderBy("date", "desc"));
    if (filter !== "all") {
        q = query(collection(db, "projets"), where("tag", "==", filter), orderBy("date", "desc"));
    }

    onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const id = docSnap.id;

            list.innerHTML += `
                <div class="portfolio-box">
                    <img src="${p.image || 'images/default-project.jpg'}" alt="${p.titre}">
                    <div class="portfolio-layer">
                        <h4>${p.titre}</h4>
                        <p>${p.description}</p>
                        <div class="comments-container">
                            <div class="comments-list" id="comments-${id}"></div>
                            <div class="comment-input-group">
                                <input type="text" id="input-${id}" placeholder="Votre commentaire...">
                                <button onclick="addComment('${id}')"><i class='bx bxs-send'></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="project-info-bar">
                        <div class="stats-group">
                            <span class="like-counter" onclick="likeProject('${id}')">
                                <i class='bx bxs-heart'></i> ${p.likes || 0}
                            </span>
                        </div>
                        ${isAdmin ? `<button class="admin-trash-btn" onclick="deleteItem('projets','${id}')"><i class='bx bxs-trash'></i></button>` : ''}
                    </div>
                </div>
            `;
            // On passe l'ID deux fois : une pour la requête, une pour cibler le container HTML
            loadComments(id, `comments-${id}`);
        });
    });
};

/* ==================== GESTION DES COMMENTAIRES ==================== */
window.addComment = async (projectId) => {
    const input = document.getElementById(`input-${projectId}`);
    if (!input || !input.value.trim()) return;

    try {
        await addDoc(collection(db, "comments"), {
            projectId: projectId,
            text: input.value,
            approved: false, // En attente de modération admin
            date: serverTimestamp()
        });
        input.value = "";
    } catch (e) {
        console.error("Erreur ajout commentaire:", e);
    }
};

window.loadComments = (projectId, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = query(
        collection(db, "comments"), 
        where("projectId", "==", projectId), 
        orderBy("date", "asc")
    );

    onSnapshot(q, (snap) => {
        container.innerHTML = '';
        snap.forEach(doc => {
            const c = doc.data();
            // N'afficher que si approuvé ou si on est admin
            if (c.approved || isAdmin) {
                const time = c.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "--:--";
                container.innerHTML += `
                    <div class="tg-msg ${!c.approved ? 'pending-msg' : ''}">
                        <div class="tg-text">${c.text}</div>
                        <div class="tg-meta">
                            <span>${time}</span>
                            <i class='bx bx-check-double tg-check'></i>
                        </div>
                    </div>
                `;
            }
        });
        container.scrollTop = container.scrollHeight;
    });
};

/* ==================== SECTIONS ADMIN (CHARGEMENT) ==================== */
window.loadAdminReviews = () => {
    const box = document.getElementById('admin-reviews-list');
    if (!box) return;

    const q = query(collection(db, "testimonials"), orderBy("date", "desc"));
    onSnapshot(q, snap => {
        box.innerHTML = '';
        snap.forEach(d => {
            const r = d.data();
            const isApproved = r.approved === true;
            box.innerHTML += `
                <div class="admin-box ${isApproved ? 'status-published' : 'status-pending'}">
                    <p><strong>${r.nom}:</strong> ${r.texte}</p>
                    <div class="admin-actions">
                        ${!isApproved ? `<button class="approve-btn" onclick="approveItem('testimonials','${d.id}')">✅ Approuver</button>` : `<span class="badge-published">✅ En ligne</span>`}
                        <button class="delete-btn" onclick="deleteItem('testimonials','${d.id}')">🗑️ Supprimer</button>
                    </div>
                </div>`;
        });
    });
};

window.loadAdminComments = () => {
    const box = document.getElementById("admin-comments-list");
    if (!box) return;

    const q = query(collection(db, "comments"), orderBy("date", "desc"));
    onSnapshot(q, snap => {
        box.innerHTML = '';
        snap.forEach(d => {
            const c = d.data();
            const isApproved = c.approved === true;
            box.innerHTML += `
                <div class="admin-box">
                    <p><strong>ID Projet:</strong> ${c.projectId.substring(0,6)}... | <strong>Texte:</strong> ${c.text}</p>
                    <div class="admin-actions">
                        ${!isApproved ? `<button class="approve-btn" onclick="approveItem('comments','${d.id}')">✅ Valider</button>` : `<span class="badge-published">Visible</span>`}
                        <button class="delete-btn" onclick="deleteItem('comments','${d.id}')">🗑️ Supprimer</button>
                    </div>
                </div>`;
        });
    });
};

/* ==================== FORMULAIRES (SUBMITS) ==================== */
document.getElementById('add-project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "projets"), {
        titre: document.getElementById('proj-title').value,
        description: document.getElementById('proj-desc').value,
        image: document.getElementById('proj-img').value,
        tag: document.getElementById('proj-tag').value,
        likes: 0,
        date: serverTimestamp()
    });
    e.target.reset();
    alert("Projet ajouté !");
});

document.getElementById('firebase-contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), {
        nom: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        tel: document.getElementById('contact-phone').value,
        sujet: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        date: serverTimestamp()
    });
    alert("Message envoyé !");
    e.target.reset();
});

document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "testimonials"), {
        nom: document.getElementById('review-name').value,
        texte: document.getElementById('review-text').value,
        approved: false,
        date: serverTimestamp()
    });
    alert("Merci ! Votre avis est en attente de validation.");
    e.target.reset();
});

/* ==================== AFFICHAGE PUBLIC (TÉMOIGNAGES & TIPS) ==================== */
const reviewList = document.getElementById('testimonials-list');
if (reviewList) {
    const q = query(collection(db, "testimonials"), where("approved", "==", true), orderBy("date", "desc"));
    onSnapshot(q, snap => {
        reviewList.innerHTML = '';
        snap.forEach(d => {
            const t = d.data();
            reviewList.innerHTML += `
                <div class="testimonial-box">
                    <i class='bx bxs-quote-alt-left'></i>
                    <p>${t.texte}</p>
                    <div class="client-details"><h4>${t.nom}</h4></div>
                </div>`;
        });
    });
}

window.loadTips = () => {
    const osList = document.getElementById('os-tips-list');
    const hardList = document.getElementById('hardware-tips-list');
    const errList = document.getElementById('errors-list');

    onSnapshot(collection(db, "tips"), snap => {
        if(osList) osList.innerHTML = '';
        if(hardList) hardList.innerHTML = '';
        if(errList) errList.innerHTML = '';

        snap.forEach(d => {
            const tip = d.data();
            const html = `<div class="tip-item"><i class="fa-solid fa-check"></i><span>${tip.text}</span></div>`;
            if(tip.type === 'os' && osList) osList.innerHTML += html;
            else if(tip.type === 'hardware' && hardList) hardList.innerHTML += html;
            else if(tip.type === 'error' && errList) errList.innerHTML += `<li>${tip.text}</li>`;
        });
    });
};

/* ============================================================
   SCRIPT DE PEUPLEMENT AUTO-EXÉCUTABLE
   ============================================================ 

const runSeeding = async () => {
    console.log("🚀 Tentative de peuplement de la base de données...");

    const testProjects = [
        {
            titre: "Maintenance Serveur Pro",
            description: "Optimisation complète et sécurisation d'un serveur d'entreprise sous Linux.",
            tag: "Maintenance",
            image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51",
            likes: 15,
            date: serverTimestamp()
        },
        {
            titre: "Installation Réseau Fibre",
            description: "Déploiement d'une infrastructure réseau haute performance.",
            tag: "Réseaux",
            image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
            likes: 10,
            date: serverTimestamp()
        }
    ];

    try {
        // Vérification de la collection Projets
        for (const proj of testProjects) {
            const docRef = await addDoc(collection(db, "projets"), proj);
            console.log("✅ Projet ajouté avec ID:", docRef.id);
        }

        // Ajout de quelques Tips (Conseils)
        await addDoc(collection(db, "tips"), { text: "Nettoyez votre PC régulièrement", type: "hardware" });
        await addDoc(collection(db, "tips"), { text: "Utilisez un mot de passe fort", type: "os" });

        console.log("🎉 Peuplement terminé avec succès !");
        alert("Les données de test ont été injectées. Actualisez la page.");
    } catch (error) {
        console.error("❌ Erreur Firestore : ", error);
        alert("Erreur lors de l'injection. Vérifiez la console (F12) et vos règles Firestore.");
    }
};

// Rendre la fonction disponible dans la console au cas où
window.forceSeed = runSeeding;

// Exécuter immédiatement au chargement (Une seule fois)
// runSeeding();*/

/* ==================== GESTION DES CONSEILS (TIPS) ==================== */

// 1. Ajouter un conseil via l'Admin
const tipForm = document.getElementById('tip-form');
if (tipForm) {
    tipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('tip-title').value;
        const category = document.getElementById('tip-category').value;
        const content = document.getElementById('tip-content').value;

        try {
            await addDoc(collection(db, "tips"), {
                titre: title,
                categorie: category,
                description: content,
                date: serverTimestamp()
            });
            tipForm.reset();
            alert("Conseil ajouté avec succès !");
        } catch (e) {
            console.error("Erreur d'ajout : ", e);
        }
    });
}

// 2. Charger les conseils (Public)
function loadPublicTips() {
    const display = document.getElementById('tips-display');
    if (!display) return;

    const q = query(collection(db, "tips"), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        display.innerHTML = '';
        snap.forEach(doc => {
            const t = doc.data();
            const icon = t.categorie === 'security' ? 'bx-shield-quarter' : 'bx-bulb';
            display.innerHTML += `
                <div class="tip-card">
                    <span class="category-tag">${t.categorie}</span>
                    <i class='bx ${icon}'></i>
                    <h3>${t.titre}</h3>
                    <p>${t.description}</p>
                </div>
            `;
        });
    });
}

// 3. Charger les conseils (Admin - avec option supprimer)
function loadAdminTips() {
    const box = document.getElementById('admin-tips-list');
    if (!box) return;

    onSnapshot(query(collection(db, "tips"), orderBy("date", "desc")), (snap) => {
        box.innerHTML = '';
        snap.forEach(d => {
            const t = d.data();
            box.innerHTML += `
                <div class="admin-box" style="border-left:4px solid #0ef; padding:1.5rem; margin-bottom:1.5rem; background:rgba(255,255,255,0.05); border-radius:10px;">
                    <h4 style="color:#0ef; font-size:1.6rem;">${t.titre}</h4>
                    <p style="font-size:1.3rem; margin:10px 0;">${t.description.substring(0, 100)}...</p>
                    <div style="display:flex; gap:10px;">
                        <button onclick="editTipPrompt('${d.id}', '${t.titre}', '${t.description}')" style="background:transparent; border:1px solid #0ef; color:#0ef; padding:5px 12px; border-radius:5px; cursor:pointer;">✏️ Modifier</button>
                        <button onclick="deleteItem('tips','${d.id}')" style="background:#ff4757; color:white; padding:5px 12px; border-radius:5px; cursor:pointer;">🗑️ Supprimer</button>
                    </div>
                </div>
            `;
        });
    });
}

// Fonction pour modifier rapidement via un prompt (GUI simplifiée)
window.editTipPrompt = async (id, oldTitle, oldDesc) => {
    const newTitle = prompt("Nouveau titre :", oldTitle);
    const newDesc = prompt("Nouveau contenu :", oldDesc);
    
    if (newTitle && newDesc) {
        await updateDoc(doc(db, "tips", id), {
            titre: newTitle,
            description: newDesc
        });
        alert("Astuce mise à jour !");
    }
};

// Appeler les fonctions au chargement
loadPublicTips();
loadAdminTips();

window.addEmoji = (emoji) => {
    // Cette fonction trouve l'input actif et ajoute l'emoji
    const inputs = document.querySelectorAll('input[id^="comm-input-"]');
    inputs.forEach(input => {
        if(document.activeElement === input || input.value !== "") {
            input.value += emoji;
            input.focus();
        }
    });
};

