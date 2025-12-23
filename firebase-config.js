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

/* ==================== OUTILS GLOBAUX ==================== */
window.deleteItem = async (col, id) => {
  if (!isAdmin) return;
  if (confirm("Supprimer définitivement ?")) await deleteDoc(doc(db, col, id));
};

window.approveItem = async (col, id) => {
  if (!isAdmin) return;
  await updateDoc(doc(db, col, id), { approved: true });
};

window.likeProject = async (id) => {
  await updateDoc(doc(db, "projets", id), { likes: increment(1) });
};

/* ==================== PROJETS (RENDU CSS OPTIMISÉ) ==================== */
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
      loadComments(id);
    });
  });
};

/* ==================== COMMENTAIRES ==================== */
window.loadComments = (projId) => {
  const commList = document.getElementById(`comments-${projId}`);
  if (!commList) return;

  const q = query(collection(db, "comments"), where("projectId", "==", projId), where("approved", "==", true), orderBy("date", "asc"));

  onSnapshot(q, (snapshot) => {
    commList.innerHTML = '';
    snapshot.forEach(d => {
      const c = d.data();
      commList.innerHTML += `
        <div class="comment-item ${c.isAdmin ? 'admin-comment' : ''}">
            <div class="comment-content">
                <span class="comment-text">${c.text}</span>
            </div>
            ${isAdmin ? `<button class="admin-comm-del-btn" onclick="deleteItem('comments','${d.id}')">×</button>` : ''}
        </div>
      `;
    });
  });
};

window.addComment = async (projId) => {
  const input = document.getElementById(`input-${projId}`);
  if (!input.value.trim()) return;

  await addDoc(collection(db, "comments"), {
    projectId: projId,
    text: input.value,
    approved: isAdmin, // Auto-approuvé si admin
    isAdmin: isAdmin,
    date: serverTimestamp()
  });
  input.value = '';
  if(!isAdmin) alert("Votre commentaire sera visible après validation.");
};

/* ==================== ADMIN : CHARGEMENT LISTES ==================== */
function loadAdminMessages() {
  const box = document.getElementById('admin-messages-list');
  if (!box) return;
  onSnapshot(collection(db, "messages"), snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const m = d.data();
      box.innerHTML += `<div class="admin-box"><b>${m.nom}</b> (${m.email}): ${m.message} 
      <button class="delete-btn" onclick="deleteItem('messages','${d.id}')">Supprimer</button></div>`;
    });
  });
}

function loadAdminReviews() {
  const box = document.getElementById('admin-reviews-list');
  if (!box) return;
  const q = query(collection(db, "testimonials"), where("approved", "==", false));
  onSnapshot(q, snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const r = d.data();
      box.innerHTML += `<div class="admin-box"><p>${r.nom}: ${r.texte}</p>
      <button class="approve-btn" onclick="approveItem('testimonials','${d.id}')">Approuver</button>
      <button class="delete-btn" onclick="deleteItem('testimonials','${d.id}')">Supprimer</button></div>`;
    });
  });
}

function loadAdminComments() {
  const box = document.getElementById("admin-comments-list");
  if (!box) return;
  const q = query(collection(db, "comments"), where("approved", "==", false));
  onSnapshot(q, snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const c = d.data();
      box.innerHTML += `<div class="admin-box"><p>${c.text} (Projet: ${c.projectId})</p>
      <button class="approve-btn" onclick="approveItem('comments','${d.id}')">Approuver</button>
      <button class="delete-btn" onclick="deleteItem('comments','${d.id}')">Supprimer</button></div>`;
    });
  });
}

/* ==================== FORMULAIRES ==================== */
const projectForm = document.getElementById('add-project-form');
projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "projets"), {
      titre: document.getElementById('proj-title').value,
      description: document.getElementById('proj-desc').value,
      image: document.getElementById('proj-img').value,
      tag: document.getElementById('proj-tag').value,
      likes: 0,
      date: serverTimestamp()
    });
    projectForm.reset();
    alert("Projet ajouté !");
});

const contactForm = document.getElementById('firebase-contact-form');
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "messages"), {
    nom: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    tel: document.getElementById('contact-phone').value,
    sujet: document.getElementById('contact-subject').value,
    message: document.getElementById('contact-message').value,
    date: serverTimestamp()
  });
  alert("Message envoyé");
  contactForm.reset();
});

const reviewForm = document.getElementById('review-form');
reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "testimonials"), {
    nom: document.getElementById('review-name').value,
    texte: document.getElementById('review-text').value,
    approved: false,
    date: serverTimestamp()
  });
  alert("Merci ! Votre avis est en attente de validation.");
  reviewForm.reset();
});

/* ==================== TÉMOIGNAGES PUBLICS ==================== */
const reviewList = document.getElementById('testimonials-list');
if (reviewList) {
  const q = query(collection(db, "testimonials"), where("approved", "==", true), orderBy("date", "desc"));
  onSnapshot(q, snap => {
    reviewList.innerHTML = '';
    snap.forEach(d => {
      const t = d.data();
      reviewList.innerHTML += `<div class="testimonial-box">
          <i class='bx bxs-quote-alt-left'></i>
          <p>${t.texte}</p>
          <div class="client-details"><h4>${t.nom}</h4></div>
      </div>`;
    });
  });
}

/* ==================== TIPS (CONSEILS) ==================== */
function loadTips() {
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
      if(tip.type === 'os') osList.innerHTML += html;
      else if(tip.type === 'hardware') hardList.innerHTML += html;
      else if(tip.type === 'error') errList.innerHTML += `<li>${tip.text}</li>`;
    });
  });
}


/* ============================================================
   SCRIPT DE PEUPLEMENT (SEEDING) - VALDES.TECH
   ============================================================ */

async function seedDatabase() {
    console.log("🚀 Début du peuplement de la base de données...");

    const projects = [
        {
            titre: "Optimisation Système IUGET",
            description: "Maintenance préventive et curative du parc informatique. Optimisation des performances de 15% sur les postes de travail.",
            tag: "Maintenance",
            image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=500",
            likes: 12,
            date: serverTimestamp()
        },
        {
            titre: "Déploiement Réseau Cisco",
            description: "Configuration de commutateurs et routeurs pour une architecture réseau sécurisée en entreprise.",
            tag: "Réseaux",
            image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=500",
            likes: 8,
            date: serverTimestamp()
        },
        {
            titre: "Récupération de Données Critiques",
            description: "Intervention sur un disque dur endommagé physiquement. Récupération de 98% des données professionnelles.",
            tag: "Récupération",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=500",
            likes: 25,
            date: serverTimestamp()
        }
    ];

    const tips = [
        // OS
        { text: "Désactivez les applications de démarrage inutiles pour booster Windows.", type: "os" },
        { text: "Utilisez la commande 'sfc /scannow' pour réparer les fichiers système corrompus.", type: "os" },
        // Hardware
        { text: "Nettoyez vos ventilateurs tous les 6 mois pour éviter le 'Thermal Throttling'.", type: "hardware" },
        { text: "Vérifiez l'état de santé de votre SSD avec CrystalDiskInfo.", type: "hardware" },
        // Erreurs
        { text: "Écran Bleu (BSOD) : Vérifiez souvent vos pilotes graphiques.", type: "error" },
        { text: "Erreur 0x80070005 : Problème de permissions Windows Update.", type: "error" }
    ];

    try {
        // Injection Projets
        for (const p of projects) {
            await addDoc(collection(db, "projets"), p);
        }
        console.log("✅ Projets injectés avec succès.");

        // Injection Tips
        for (const t of tips) {
            await addDoc(collection(db, "tips"), t);
        }
        console.log("✅ Conseils (Tips) injectés avec succès.");

        alert("Base de données peuplée ! Actualisez la page pour voir les résultats.");
    } catch (error) {
        console.error("❌ Erreur lors du peuplement :", error);
    }
}

// Pour lancer le peuplement, décommentez la ligne suivante une seule fois :
// seedDatabase();