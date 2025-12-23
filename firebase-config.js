/* ============================================================
   CONFIG & LOGIQUE PRINCIPALE (firebase-config.js)
   CORRIGÉ ET NETTOYÉ
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, deleteDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. CONFIGURATION FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAB7CYuYUyLKihOQ8KstDcj6ko_CLjs4S8",
    authDomain: "valdes-tech.firebaseapp.com",
    projectId: "valdes-tech",
    storageBucket: "valdes-tech.firebasestorage.app",
    messagingSenderId: "359469879862",
    appId: "1:359469879862:web:6ede2896e55a9822ef7e97"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables globales
let isAdmin = false;

// ============================================================
// 2. FONCTIONS GLOBALES (Accessibles depuis le HTML onclick="")
// ============================================================

// Supprimer un élément (Projet, Message ou Avis)
window.deleteItem = async (col, id) => {
    if(confirm("⚠️ Es-tu sûr de vouloir supprimer cet élément définitivement ?")) {
        try {
            await deleteDoc(doc(db, col, id));
            console.log("Suppression réussie");
        } catch (e) {
            alert("Erreur: " + e.message);
        }
    }
};

// Valider ou Masquer un avis (Modération)
window.toggleReview = async (id, status) => {
    try {
        await updateDoc(doc(db, "testimonials", id), { approved: status });
    } catch (e) {
        alert("Erreur: " + e.message);
    }
};

// Gestion des Likes
window.likeProject = async (id) => {
    try {
        const docRef = doc(db, "projets", id);
        await updateDoc(docRef, { likes: increment(1) });
    } catch (e) {
        console.error("Erreur like:", e);
    }
};

// Envoi de commentaire
window.sendComment = async (projId, input) => {
    if(!input.value.trim()) return;
    
    try {
        await addDoc(collection(db, "comments"), {
            projectId: projId,
            text: input.value,
            isAdmin: isAdmin,
            approved: isAdmin, // Les comms admin sont approuvés d'office
            date: new Date()
        });
        
        input.value = "";
        if(!isAdmin) alert("Merci ! Votre commentaire sera visible après validation.");
    } catch (e) {
        alert("Erreur envoi commentaire: " + e.message);
    }
};

// Afficher/Masquer la zone de commentaires
window.toggleComments = (id) => {
    const area = document.getElementById(`comment-area-${id}`);
    if(area) {
        area.classList.toggle('hidden');
        if(!area.classList.contains('hidden')) {
            loadProjectComments(id);
        }
    }
};

// ============================================================
// 3. GESTION DE L'AUTHENTIFICATION & UI ADMIN
// ============================================================

const adminPanel = document.getElementById('admin-panel');
const loginModal = document.getElementById('login-modal');
const adminTrigger = document.getElementById('admin-trigger');
const closeModalBtn = document.getElementById('close-modal');

// Ouvrir/Fermer la modal
if(adminTrigger) adminTrigger.onclick = () => loginModal.classList.remove('hidden');
if(closeModalBtn) closeModalBtn.onclick = () => loginModal.classList.add('hidden');

// Se connecter
const loginForm = document.getElementById('login-form');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pwd = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pwd);
            loginModal.classList.add('hidden');
            loginForm.reset();
        } catch (err) { 
            alert("Erreur de connexion : " + err.message); 
        }
    });
}

// Se déconnecter
const logoutBtn = document.getElementById('logout-btn');
if(logoutBtn) logoutBtn.onclick = () => signOut(auth);

// Surveillance Auth
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAdmin = true;
        if(adminPanel) adminPanel.classList.remove('hidden');
        if(adminTrigger) adminTrigger.classList.add('hidden');
        
        loadAdminMessages(); 
        loadAdminReviews();  
    } else {
        isAdmin = false;
        if(adminPanel) adminPanel.classList.add('hidden');
        if(adminTrigger) adminTrigger.classList.remove('hidden');
    }
    // On charge les projets quoi qu'il arrive
    loadProjects(); 
});

// ============================================================
// 4. GESTION DES PROJETS (Portfolio) - CORRIGÉ
// ============================================================

function loadProjects() {
    const container = document.getElementById('portfolio-list');
    if(!container) return;

    onSnapshot(query(collection(db, "projets"), orderBy("date", "desc")), (snapshot) => {
        container.innerHTML = '';
        
        snapshot.forEach((d) => {
            const p = d.data(); // Correction ici: on utilise 'd', pas 'docSnap'
            const id = d.id;

            container.innerHTML += `
                <div class="portfolio-box" data-category="${p.tag || 'all'}">
                    <img src="${p.image}" alt="${p.titre}">
                    <div class="portfolio-layer">
                        <h4>${p.titre}</h4>
                        <p>${p.description}</p>
                        <div class="project-footer">
                            <span onclick="window.likeProject('${id}')" style="cursor:pointer; margin-right:15px; font-size:1.4rem;">
                                <i class="fa-solid fa-heart"></i> ${p.likes || 0}
                            </span>
                            <span onclick="window.toggleComments('${id}')" style="cursor:pointer; font-size:1.4rem;">
                                <i class="fa-solid fa-comment"></i> Commenter
                            </span>
                        </div>
                    </div>
                    <div id="comment-area-${id}" class="comment-area hidden" style="background:#222; padding:10px; position:absolute; bottom:0; width:100%; z-index:10;">
                        <div class="comments-list" id="list-${id}" style="max-height:100px; overflow-y:auto; font-size:1.2rem; color:#fff; margin-bottom:5px;"></div>
                        <input type="text" placeholder="Entrée pour envoyer..." 
                               style="width:100%; padding:5px; color:black;"
                               onkeydown="if(event.key==='Enter') window.sendComment('${id}', this)">
                    </div>
                </div>
            `;
        });

        // Synchro ScrollReveal
        if(typeof ScrollReveal === 'function') {
            ScrollReveal().sync();
        }
    });
}

// Ajout Projet
const addProjForm = document.getElementById('add-project-form');
if(addProjForm) {
    addProjForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "projets"), {
                titre: document.getElementById('proj-title').value,
                description: document.getElementById('proj-desc').value,
                image: document.getElementById('proj-img').value,
                date: new Date(),
                likes: 0
            });
            alert("✅ Projet ajouté !");
            addProjForm.reset();
        } catch (e) { alert("Erreur: " + e.message); }
    });
}

// Chargement Commentaires Spécifiques
function loadProjectComments(projId) {
    const list = document.getElementById(`list-${projId}`);
    if(!list) return;

    const q = query(collection(db, "comments"), where("projectId", "==", projId), orderBy("date", "asc"));

    onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        snapshot.forEach(d => {
            const c = d.data();
            if(c.approved || c.isAdmin) {
                const styleAdmin = c.isAdmin ? 'color:#0ef; font-weight:bold;' : 'color:#ccc;';
                list.innerHTML += `<div style="border-bottom:1px solid #444; padding:2px;">
                    <span style="${styleAdmin}">${c.isAdmin ? 'Admin' : 'Visiteur'}:</span> ${c.text}
                </div>`;
            }
        });
    });
}

// ============================================================
// 5. CONTACT & ADMIN MESSAGES
// ============================================================

// Formulaire Contact Client
const contactForm = document.getElementById('firebase-contact-form');
if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "messages"), {
                nom: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                tel: document.getElementById('contact-phone').value,
                sujet: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
                date: new Date()
            });
            alert("✅ Message envoyé !");
            contactForm.reset();
        } catch (e) { alert("Erreur d'envoi."); }
    });
}

// Admin : Lire Messages
function loadAdminMessages() {
    const box = document.getElementById('admin-messages-list');
    if(!box) return;

    onSnapshot(query(collection(db, "messages"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        if(snapshot.empty) { box.innerHTML = '<p>Aucun message.</p>'; return; }

        snapshot.forEach(d => {
            const m = d.data();
            box.innerHTML += `
                <div class="admin-box">
                    <p><strong>${m.nom}</strong></p>
                    <p>📞 ${m.tel} | ✉️ ${m.email}</p>
                    <p style="font-weight:bold; color:#00ffee;">${m.sujet}</p>
                    <p style="background:#222; padding:10px; border-radius:5px;">${m.message}</p>
                    <button onclick="window.deleteItem('messages', '${d.id}')" class="delete-btn">Archiver</button>
                </div>`;
        });
    });
}

// ============================================================
// 6. TÉMOIGNAGES & CONSEILS
// ============================================================

// Public Reviews
const reviewList = document.getElementById('testimonials-list');
if(reviewList) {
    onSnapshot(query(collection(db, "testimonials"), where("approved", "==", true)), (snapshot) => {
        reviewList.innerHTML = '';
        snapshot.forEach(d => {
            const t = d.data();
            reviewList.innerHTML += `
                <div class="testimonial-box">
                    <i class="fa-solid fa-quote-left"></i>
                    <p>« ${t.texte} »</p>
                    <div class="client-info">
                        <h4>${t.nom}</h4>
                    </div>
                </div>`;
        });
    });
}

// Admin Reviews
function loadAdminReviews() {
    const box = document.getElementById('admin-reviews-list');
    if(!box) return;

    onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        if(snapshot.empty) { box.innerHTML = '<p>Aucun avis.</p>'; return; }

        snapshot.forEach(d => {
            const t = d.data();
            const status = t.approved ? '<span style="color:#00cc00">Public</span>' : '<span style="color:orange">En attente</span>';
            const btnAction = t.approved ? 
                `<button onclick="window.toggleReview('${d.id}', false)" class="delete-btn" style="background:orange;">Masquer</button>` : 
                `<button onclick="window.toggleReview('${d.id}', true)" class="approve-btn">Valider</button>`;

            box.innerHTML += `
                <div class="admin-box">
                    <p><strong>${t.nom}</strong> - ${status}</p>
                    <p>"${t.texte}"</p>
                    <div style="margin-top:10px;">
                        ${btnAction}
                        <button onclick="window.deleteItem('testimonials', '${d.id}')" class="delete-btn">Supprimer</button>
                    </div>
                </div>`;
        });
    });
}

// Chargement des astuces (Tips)
async function loadTips() {
    const osList = document.getElementById('os-tips-list');
    const hwList = document.getElementById('hardware-tips-list');
    const errorList = document.getElementById('errors-list');

    if(!osList || !hwList || !errorList) return;

    onSnapshot(collection(db, "tips"), (snapshot) => {
        if(snapshot.empty) {
            // Contenu par défaut si Firebase est vide
            osList.innerHTML = `<div class="tip-item"><i class="fa-solid fa-check"></i> Mises à jour Windows régulières.</div>`;
            hwList.innerHTML = `<div class="tip-item"><i class="fa-solid fa-check"></i> Dépoussiérage tous les 6 mois.</div>`;
            errorList.innerHTML = `<li><i class="fa-solid fa-xmark"></i> Éteindre sans passer par Démarrer.</li>`;
            return;
        }
        osList.innerHTML = ''; hwList.innerHTML = ''; errorList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = `<div class="tip-item"><i class="fa-solid fa-lightbulb"></i> ${data.text}</div>`;
            if(data.type === 'os') osList.innerHTML += item;
            else if(data.type === 'hardware') hwList.innerHTML += item;
            else if(data.type === 'error') errorList.innerHTML += `<li><i class="fa-solid fa-triangle-exclamation"></i> ${data.text}</li>`;
        });
    });
}
loadTips();