/* ============================================================
   CONFIG & LOGIQUE PRINCIPALE (firebase-config.js)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// ============================================================
// 3. GESTION DE L'AUTHENTIFICATION & UI ADMIN
// ============================================================

const adminPanel = document.getElementById('admin-panel');
const loginModal = document.getElementById('login-modal');
const adminTrigger = document.getElementById('admin-trigger');
const closeModalBtn = document.getElementById('close-modal');

// Ouvrir la modal
if(adminTrigger) adminTrigger.onclick = () => loginModal.classList.remove('hidden');
// Fermer la modal
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
        // Remplace le catch du loginForm
        } catch (err) { 
            let msg = "Erreur inconnue";
            if(err.code === "auth/invalid-credential") msg = "Email ou mot de passe incorrect.";
            if(err.code === "auth/too-many-requests") msg = "Trop de tentatives. Réessayez plus tard.";
            alert("Erreur : " + msg); 
        }
    });
}

// Se déconnecter
const logoutBtn = document.getElementById('logout-btn');
if(logoutBtn) logoutBtn.onclick = () => signOut(auth);

// SURVEILLANCE DE L'ÉTAT (Le Cerveau central)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- MODE ADMIN ---
        isAdmin = true;
        if(adminPanel) adminPanel.classList.remove('hidden');
        if(adminTrigger) adminTrigger.classList.add('hidden');
        
        loadAdminMessages(); // Charger la boîte de réception
        loadAdminReviews();  // Charger la modération
    } else {
        // --- MODE PUBLIC ---
        isAdmin = false;
        if(adminPanel) adminPanel.classList.add('hidden');
        if(adminTrigger) adminTrigger.classList.remove('hidden');
    }
    // Recharger les projets pour afficher/cacher les poubelles
    loadProjects(); 
});

// ============================================================
// 4. GESTION DES PROJETS (Portfolio)
// ============================================================

// Chargement dynamique
function loadProjects() {
    const container = document.getElementById('portfolio-list');
    if(!container) return;

    onSnapshot(query(collection(db, "projets"), orderBy("date", "desc")), (snapshot) => {
        container.innerHTML = '';
        
        snapshot.forEach((d) => {
         // Dans la fonction loadProjects, à l'intérieur du snapshot.forEach :
            const p = docSnap.data();
            const id = docSnap.id;

            list.innerHTML += `
                <div class="portfolio-box" data-category="${p.tag}">
                    <img src="${p.img}" alt="">
                    <div class="portfolio-layer">
                        <h4>${p.title}</h4>
                        <p>${p.desc}</p>
                        <div class="project-footer">
                            <span onclick="window.likeProject('${id}')" style="cursor:pointer">
                                <i class="fa-solid fa-heart"></i> ${p.likes || 0}
                            </span>
                            <span onclick="window.toggleComments('${id}')" style="cursor:pointer">
                                <i class="fa-solid fa-comment"></i> Commenter
                            </span>
                        </div>
                    </div>
                    <div id="comment-area-${id}" class="comment-area hidden">
                        <div class="comments-list" id="list-${id}"></div>
                        <input type="text" placeholder="Votre commentaire..." onkeydown="if(event.key==='Enter') window.sendComment('${id}', this)">
                    </div>
                </div>
            `;
        }); // <--- On ferme le forEach ici

        // On synchronise ScrollReveal UNE SEULE FOIS après avoir généré tous les éléments
        if(typeof ScrollReveal === 'function') {
            ScrollReveal().sync();
        }
    });
}

// Ajout d'un projet (Formulaire Admin)
const addProjForm = document.getElementById('add-project-form');
if(addProjForm) {
    addProjForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "projets"), {
                titre: document.getElementById('proj-title').value,
                description: document.getElementById('proj-desc').value,
                image: document.getElementById('proj-img').value, // Assure-toi que l'ID est bien proj-img dans ton HTML
                date: new Date()
            });
            alert("✅ Projet ajouté avec succès !");
            addProjForm.reset();
        } catch (e) { alert("Erreur: " + e.message); }
    });
}

// ============================================================
// 5. CONTACT & MESSAGERIE
// ============================================================

// Envoi (Côté Client)
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
            alert("✅ Message envoyé ! Valdes vous répondra bientôt.");
            contactForm.reset();
        } catch (e) { alert("Erreur d'envoi."); }
    });
}

// Réception (Côté Admin)
function loadAdminMessages() {
    const box = document.getElementById('admin-messages-list');
    if(!box) return;

    onSnapshot(query(collection(db, "messages"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        if(snapshot.empty) { box.innerHTML = '<p>Aucun message.</p>'; return; }

        snapshot.forEach(d => {
            const m = d.data();
            const date = m.date?.toDate ? m.date.toDate().toLocaleDateString() : '';
            box.innerHTML += `
                <div class="admin-box">
                    <p><strong>${m.nom}</strong> <small>(${date})</small></p>
                    <p>📞 ${m.tel} | ✉️ ${m.email}</p>
                    <p style="font-weight:bold; color:#00ffee; margin-top:5px;">${m.sujet}</p>
                    <p style="background:#222; padding:10px; border-radius:5px; margin:5px 0;">${m.message}</p>
                    <button onclick="window.deleteItem('messages', '${d.id}')" class="delete-btn">Archiver</button>
                    <div style="clear:both"></div>
                </div>`;
        });
    });
}

// ============================================================
// 6. TÉMOIGNAGES (PUBLIC & MODÉRATION)
// ============================================================

// Affichage Public (Seulement Approuvés)
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

// Modération (Côté Admin)
function loadAdminReviews() {
    const box = document.getElementById('admin-reviews-list');
    if(!box) return;

    onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        if(snapshot.empty) { box.innerHTML = '<p>Aucun avis.</p>'; return; }

        snapshot.forEach(d => {
            const t = d.data();
            const status = t.approved ? '<span style="color:#00cc00">Public</span>' : '<span style="color:orange">En attente</span>';
            
            // Bouton Toggle : Si approuvé -> Masquer, Sinon -> Valider
            const actionBtn = t.approved ? 
                `<button onclick="window.toggleReview('${d.id}', false)" class="delete-btn" style="background:orange; float:none; margin-right:5px;">Masquer</button>` : 
                `<button onclick="window.toggleReview('${d.id}', true)" class="approve-btn">Valider</button>`;

            box.innerHTML += `
                <div class="admin-box">
                    <p><strong>${t.nom}</strong> - ${status}</p>
                    <p style="font-style:italic;">"${t.texte}"</p>
                    <div style="margin-top:10px;">
                        ${actionBtn}
                        <button onclick="window.deleteItem('testimonials', '${d.id}')" class="delete-btn">Supprimer</button>
                    </div>
                </div>`;
        });
    });
}

// Gestion des Likes
window.likeProject = async (id) => {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, { likes: increment(1) });
};

// Envoi de commentaire (Contrôlé)
window.sendComment = async (projId, input) => {
    if(!input.value.trim()) return;
    
    await addDoc(collection(db, "comments"), {
        projectId: projId,
        text: input.value,
        isAdmin: isAdmin, // Si tu es connecté en admin, isAdmin sera true
        approved: isAdmin, // Les comms admin sont approuvés d'office, sinon false
        date: new Date()
    });
    
    input.value = "";
    if(!isAdmin) alert("Merci ! Votre commentaire sera visible après validation.");
};

// Afficher/Masquer la zone de commentaires
window.toggleComments = (id) => {
    const area = document.getElementById(`comment-area-${id}`);
    area.classList.toggle('hidden');
    if(!area.classList.contains('hidden')) {
        loadProjectComments(id);
    }
};

// Charger les commentaires d'un projet spécifique
function loadProjectComments(projId) {
    const list = document.getElementById(`list-${projId}`);
    const q = query(collection(db, "comments"), where("projectId", "==", projId), orderBy("date", "asc"));

    onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        snapshot.forEach(d => {
            const c = d.data();
            // On ne montre que si approuvé OU si c'est un comm admin
            if(c.approved || c.isAdmin) {
                const isAdminClass = c.isAdmin ? 'admin-comment' : '';
                const adminBadge = c.isAdmin ? '<span class="admin-badge">⭐ Valdes.Tech</span> ' : '';
                list.innerHTML += `<p class="comment-text ${isAdminClass}">${adminBadge}${c.text}</p>`;
            }
        });
    });
}

// Filtrage des projets
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        document.querySelectorAll('.portfolio-box').forEach(box => {
            if(filter === 'all' || box.getAttribute('data-category') === filter) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    });
});

/* --- CHARGEMENT DYNAMIQUE DES CONSEILS --- */
async function loadTips() {
    const osList = document.getElementById('os-tips-list');
    const hwList = document.getElementById('hardware-tips-list');
    const errorList = document.getElementById('errors-list');

    if(!osList || !hwList || !errorList) return;

    // On écoute la collection "tips" sur Firebase
    onSnapshot(collection(db, "tips"), (snapshot) => {
        // Si vide, on affiche des conseils par défaut (Maintenance Préventive)
        if(snapshot.empty) {
            osList.innerHTML = `
                <div class="tip-item"><i class="fa-solid fa-check"></i> Activez les mises à jour de sécurité Windows/Linux.</div>
                <div class="tip-item"><i class="fa-solid fa-check"></i> Nettoyez les fichiers temporaires une fois par mois.</div>`;
            hwList.innerHTML = `
                <div class="tip-item"><i class="fa-solid fa-check"></i> Gardez vos pilotes (drivers) à jour pour la stabilité.</div>
                <div class="tip-item"><i class="fa-solid fa-check"></i> Évitez de boucher les aérations de votre PC portable.</div>`;
            errorList.innerHTML = `
                <li><i class="fa-solid fa-xmark"></i> Éteindre son PC brutalement par le bouton d'alimentation.</li>
                <li><i class="fa-solid fa-xmark"></i> Utiliser un chargeur universel de mauvaise qualité.</li>`;
            return;
        }

        // Si des données existent sur Firebase, on les affiche
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

// Appeler la fonction au chargement
loadTips();

