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

let isAdmin = false;

// ============================================================
// 2. FONCTIONS DE CHARGEMENT (DÉFINIES UNE SEULE FOIS)
// ============================================================

function loadAdminReviews() {
    const box = document.getElementById('admin-reviews-list');
    if(!box) return;

    onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        snapshot.forEach(d => {
            const t = d.data();
            const status = t.approved ? '<span style="color:#00cc00">Public</span>' : '<span style="color:orange">En attente</span>';
            const actionBtn = t.approved ? 
                `<button onclick="window.toggleReview('${d.id}', false)" style="background:orange; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">Masquer</button>` : 
                `<button onclick="window.toggleReview('${d.id}', true)" style="background:green; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">Valider</button>`;

            box.innerHTML += `
                <div class="admin-box" style="background:#1a1a1a; padding:15px; margin-bottom:10px; border-radius:10px; border-left:4px solid ${t.approved ? '#0ef' : 'orange'}">
                    <p><strong>${t.nom}</strong> - ${status}</p>
                    <p>"${t.texte}"</p>
                    <div style="margin-top:10px;">
                        ${actionBtn}
                        <button onclick="window.deleteItem('testimonials', '${d.id}')" style="background:red; color:white; padding:5px 10px; border-radius:5px; margin-left:10px; cursor:pointer;">Supprimer</button>
                    </div>
                </div>`;
        });
    });
}

function loadAdminMessages() {
    const box = document.getElementById('admin-messages-list');
    if(!box) return;

    onSnapshot(query(collection(db, "messages"), orderBy("date", "desc")), (snapshot) => {
        box.innerHTML = '';
        if(snapshot.empty) { box.innerHTML = "<p>Aucun message reçu.</p>"; return; }
        
        snapshot.forEach(d => {
            const m = d.data();
            const dateStr = m.date?.toDate ? m.date.toDate().toLocaleString() : 'Date inconnue';
            box.innerHTML += `
                <div class="admin-box" style="background:#1a1a1a; padding:15px; margin-bottom:10px; border-radius:10px; border-left:4px solid var(--main-color);">
                    <p><strong>De:</strong> ${m.nom} (${m.email})</p>
                    <p><strong>Sujet:</strong> ${m.sujet || 'Sans sujet'}</p>
                    <p><strong>Message:</strong> ${m.message}</p>
                    <p style="font-size:0.9rem; color:gray;">Reçu le: ${dateStr}</p>
                    <button onclick="window.deleteItem('messages', '${d.id}')" style="background:red; color:white; padding:5px 10px; border-radius:5px; margin-top:10px; cursor:pointer;">Supprimer</button>
                </div>`;
        });
    });
}

// ============================================================
// 3. ACTIONS GLOBALES (window.xxx)
// ============================================================

window.deleteItem = async (col, id) => {
    if(confirm("⚠️ Supprimer définitivement ?")) {
        try {
            await deleteDoc(doc(db, col, id));
        } catch (e) { alert("Erreur: " + e.message); }
    }
};

window.toggleReview = async (id, status) => {
    try {
        await updateDoc(doc(db, "testimonials", id), { approved: status });
    } catch (e) { alert("Erreur: " + e.message); }
};

window.likeProject = async (id) => {
    try {
        const docRef = doc(db, "projets", id); // Vérifie que ta collection s'appelle "projets"
        await updateDoc(docRef, { likes: increment(1) });
    } catch (e) { console.error("Erreur like:", e); }
};

window.toggleComments = (id) => {
    const area = document.getElementById(`comment-area-${id}`);
    if(area) {
        area.classList.toggle('hidden');
        if(!area.classList.contains('hidden')) loadProjectComments(id);
    }
};

window.sendComment = async (projId, input) => {
    if(!input.value.trim()) return;
    try {
        await addDoc(collection(db, "comments"), {
            projectId: projId,
            text: input.value,
            isAdmin: isAdmin,
            approved: isAdmin,
            date: new Date()
        });
        input.value = "";
        if(!isAdmin) alert("Merci ! Votre commentaire sera visible après validation.");
    } catch (e) { alert("Erreur commentaire."); }
};

// ============================================================
// 4. SURVEILLANCE AUTH & CHARGEMENT INITIAL
// ============================================================

const adminPanel = document.getElementById('admin-panel');
const adminTrigger = document.getElementById('admin-trigger');

onAuthStateChanged(auth, (user) => {
    isAdmin = !!user;
    if (user) {
        if(adminPanel) adminPanel.classList.remove('hidden');
        if(adminTrigger) adminTrigger.classList.add('hidden');
        loadAdminMessages(); 
        loadAdminReviews();  
    } else {
        if(adminPanel) adminPanel.classList.add('hidden');
        if(adminTrigger) adminTrigger.classList.remove('hidden');
    }
    loadProjects(); 
});

// ============================================================
// 5. PROJETS & PORTFOLIO
// ============================================================

function loadProjects() {
    const container = document.getElementById('portfolio-list');
    if(!container) return;

    onSnapshot(query(collection(db, "projets"), orderBy("date", "desc")), (snapshot) => {
        container.innerHTML = '';
        snapshot.forEach((d) => {
            const p = d.data();
            const id = d.id;
            container.innerHTML += `
                <div class="portfolio-box" data-category="${p.tag || 'all'}">
                    <img src="${p.image || p.img}" alt="">
                    <div class="portfolio-layer">
                        <h4>${p.titre || p.title}</h4>
                        <p>${p.description || p.desc}</p>
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
                </div>`;
        });
    });
}

// Formulaire contact
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

loadTips();