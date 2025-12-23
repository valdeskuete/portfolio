/* ============================================================
   CONFIG & LOGIQUE PRINCIPALE (firebase-config.js)
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   CONFIG & LOGIQUE ADMINISTRATIVE UNIFIÉE
   ============================================================ */

// --- 1. CONFIGURATION FIREBASE (Garde tes imports ici) ---
// import { ... } from "..."

let isAdmin = false; 

const el = {
    adminPanel: document.getElementById('admin-panel'),
    adminTrigger: document.getElementById('admin-login-trigger'),
    loginModal: document.getElementById('login-modal'),
    loginForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-btn'),
    closeModal: document.getElementById('close-modal')
};

// --- 2. SURVEILLANCE DE L'AUTHENTIFICATION ---
onAuthStateChanged(auth, (user) => {
    isAdmin = !!user; 

    if (user) {
        console.log("🔐 Mode Admin : Activé");
        el.adminPanel?.classList.remove('hidden');
        el.adminTrigger?.classList.add('hidden');
        el.loginModal?.classList.add('hidden');
        
        loadAdminMessages();
        loadAdminReviews();
    } else {
        console.log("🔓 Mode Public : Activé");
        el.adminPanel?.classList.add('hidden');
        el.adminTrigger?.classList.remove('hidden');
    }

    // Recharge la galerie pour appliquer les droits (boutons trash/xmark)
    window.loadProjects();
});

/* ============================================================
   3. ACTIONS GLOBALES (ADMINISTRATION & LIKES)
   ============================================================ */

// Connexion / Déconnexion
el.adminTrigger && (el.adminTrigger.onclick = () => el.loginModal.classList.remove('hidden'));
el.closeModal && (el.closeModal.onclick = () => el.loginModal.classList.add('hidden'));

el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pwd = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pwd);
        el.loginForm.reset();
    } catch (err) { alert("Erreur : Identifiants incorrects."); }
});

if(el.logoutBtn) el.logoutBtn.onclick = () => signOut(auth);

// Système de Suppression Universel (Messages, Témoignages)
window.deleteItem = async (col, id) => {
    if(confirm("⚠️ Supprimer définitivement ?")) {
        try { await deleteDoc(doc(db, col, id)); } 
        catch (e) { alert("Erreur: " + e.message); }
    }
};

// Système de Like
window.likeProject = async (id) => {
    try {
        const docRef = doc(db, "projets", id);
        await updateDoc(docRef, { likes: increment(1) });
    } catch (e) { console.error("Erreur like:", e); }
};

/* ============================================================
   4. GESTION DES PROJETS (GALERIE)
   ============================================================ */

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
                    <img src="${p.image}" alt="${p.titre}">
                    
                    <div class="project-info-bar">
                        <div class="stats-group">
                            <span class="like-counter" onclick="window.likeProject('${id}')">
                                <i class="fa-solid fa-heart"></i> ${p.likes || 0}
                            </span>
                            <span class="comment-trigger">
                                <i class="fa-solid fa-comment"></i> <small id="count-${id}">0</small>
                            </span>
                        </div>
                        ${isAdmin ? `
                            <button onclick="window.deleteItem('projets', '${id}')" class="admin-del-btn">
                                <i class="fa-solid fa-trash"></i>
                            </button>` : ''}
                    </div>

                    <div class="portfolio-layer">
                        <h4>${p.titre}</h4>
                        <div class="comments-container">
                            <div class="comments-list" id="comments-${id}"></div>
                            <div class="comment-input-group">
                                <input type="text" id="input-${id}" placeholder="Votre avis...">
                                <button onclick="window.addComment('${id}')"><i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>`;
            window.loadComments(id);
        });
    });
};

/* ============================================================
   5. GESTION DES COMMENTAIRES (AFFICHAGE & MODÉRATION)
   ============================================================ */

window.loadComments = (projId) => {
    const commList = document.getElementById(`comments-${projId}`);
    const commCount = document.getElementById(`count-${projId}`);
    if (!commList) return;

    const q = query(collection(db, "comments"), where("projectId", "==", projId), orderBy("date", "asc"));
    
    onSnapshot(q, (snapshot) => {
        commList.innerHTML = '';
        commCount.innerText = snapshot.size; 
        
        snapshot.forEach(d => {
            const c = d.data();
            commList.innerHTML += `
                <div class="comment-item">
                    <div class="comment-content">
                        <span class="comment-text">${c.text}</span>
                    </div>
                    ${isAdmin ? `
                        <button onclick="window.deleteItem('comments', '${d.id}')" class="admin-comm-del-btn">
                            <i class="fa-solid fa-xmark"></i>
                        </button>` : ''}
                </div>`;
        });
    });
};

window.addComment = async (projId) => {
    const input = document.getElementById(`input-${projId}`);
    if (!input.value.trim()) return;
    try {
        await addDoc(collection(db, "comments"), {
            projectId: projId,
            text: input.value,
            date: new Date()
        });
        input.value = '';
    } catch (e) { alert("Erreur d'envoi."); }
};

/* ============================================================
   6. ADMIN : MESSAGES & TÉMOIGNAGES
   ============================================================ */

function loadAdminMessages() {
    const box = document.getElementById('admin-messages-list');
    if(!box) return;
    onSnapshot(query(collection(db, "messages"), orderBy("date", "desc")), (snap) => {
        box.innerHTML = snap.empty ? "<p>Aucun message.</p>" : "";
        snap.forEach(d => {
            const m = d.data();
            box.innerHTML += `
                <div class="admin-box" style="border-left:4px solid var(--main-color); background:#1a1a1a; padding:1rem; margin-bottom:1rem; border-radius:10px;">
                    <p><strong>${m.nom}</strong> (${m.email})</p>
                    <p>${m.message}</p>
                    <button onclick="window.deleteItem('messages', '${d.id}')" style="color:red; cursor:pointer; background:none; margin-top:10px;">Supprimer</button>
                </div>`;
        });
    });
}

function loadAdminReviews() {
    const box = document.getElementById('admin-reviews-list');
    if(!box) return;
    onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), (snap) => {
        box.innerHTML = '';
        snap.forEach(d => {
            const t = d.data();
            box.innerHTML += `
                <div class="admin-box" style="border-left:4px solid ${t.approved ? '#0ef' : 'orange'}; background:#1a1a1a; padding:1rem; margin-bottom:1rem; border-radius:10px;">
                    <p><strong>${t.nom}</strong> [${t.approved ? 'Public' : 'Attente'}]</p>
                    <p>"${t.texte}"</p>
                    <button onclick="window.toggleReview('${d.id}', ${!t.approved})" style="color:white; background:${t.approved?'orange':'green'}; padding:5px; border-radius:5px; cursor:pointer;">
                        ${t.approved ? 'Masquer' : 'Valider'}
                    </button>
                    <button onclick="window.deleteItem('testimonials', '${d.id}')" style="color:red; background:none; margin-left:10px; cursor:pointer;">Supprimer</button>
                </div>`;
        });
    });
}

window.toggleReview = async (id, status) => {
    await updateDoc(doc(db, "testimonials", id), { approved: status });
};

function setupAdminProjectForm() {
    const form = document.getElementById('add-project-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const newProject = {
            titre: document.getElementById('proj-title').value,
            description: document.getElementById('proj-desc').value,
            image: document.getElementById('proj-img').value,
            tag: document.getElementById('proj-tag').value,
            likes: 0,
            date: new Date()
        };
        try {
            await addDoc(collection(db, "projets"), newProject);
            alert("🚀 Projet publié !");
            form.reset();
        } catch (err) { alert("Erreur."); }
    };
}

// Lancement
setupAdminProjectForm();

// GESTION FORMULAIRE : CONTACT (CLIENT)
// ============================================================
const contactForm = document.getElementById('firebase-contact-form');
if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation(); // EMPÊCHE DE DÉCLENCHER L'ADMIN FORM

        try {
            await addDoc(collection(db, "messages"), {
                nom: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                tel: document.getElementById('contact-phone').value,
                sujet: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
                date: new Date()
            });
            alert("✅ Votre message a été envoyé à Valdes.Tech !");
            contactForm.reset();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi du message de contact.");
        }
    });
}

// ENVOI DES AVIS (Témoignages)
const reviewForm = document.getElementById('review-form');
if(reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "testimonials"), {
                nom: document.getElementById('review-name').value,
                texte: document.getElementById('review-text').value,
                approved: false, // Important : attend ta validation
                date: new Date()
            });
            alert("✅ Témoignage envoyé ! Il sera visible après validation.");
            reviewForm.reset();
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'envoi de l'avis.");
        }
    });
}



// --- AFFICHAGE PUBLIC DES TÉMOIGNAGES ---
const reviewList = document.getElementById('testimonials-list');

if (reviewList) {
    // 1. On ajoute le tri par date pour que ce soit plus joli
    const q = query(
        collection(db, "testimonials"), 
        where("approved", "==", true),
        orderBy("date", "desc") 
    );
    
    onSnapshot(q, (snapshot) => {
        // DEBUG : Regarde ce chiffre dans ta console (F12)
        console.log("Nombre d'avis validés détectés :", snapshot.size); 
        
        reviewList.innerHTML = '';
        
        if (snapshot.empty) {
            reviewList.innerHTML = '<p>Aucun avis vérifié pour le moment.</p>';
            return;
        }

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
    }, (error) => {
        // En cas d'erreur (comme l'index manquant), on le verra ici
        console.error("Erreur témoignages :", error);
    });
}

// Chargement des conseils
async function loadTips() {
    const osList = document.getElementById('os-tips-list');
    const hwList = document.getElementById('hardware-tips-list');
    const errorList = document.getElementById('errors-list');
    if(!osList) return;

    onSnapshot(collection(db, "tips"), (snapshot) => {
        if(snapshot.empty) return; 
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

function loadProjectComments(projId) {
    const list = document.getElementById(`list-${projId}`);
    if(!list) return;
    const q = query(collection(db, "comments"), where("projectId", "==", projId), orderBy("date", "asc"));
    onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        snapshot.forEach(d => {
            const c = d.data();
            if(c.approved || c.isAdmin) {
                const isAdminClass = c.isAdmin ? 'admin-comment' : '';
                list.innerHTML += `<p class="comment-text ${isAdminClass}">${c.text}</p>`;
            }
        });
    });
}


