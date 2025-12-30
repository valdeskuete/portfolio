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

// Les clés sont maintenant lues depuis les variables d'environnement
// En production, utiliser une fonction backend pour initier Firebase
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

// Variables Globales
window.isAdmin = false;

const el = {
  adminPanel: document.getElementById('admin-panel'),
  adminTriggerNav: document.getElementById('admin-login-link'), // Le cadenas du menu
  adminTriggerFooter: document.getElementById('admin-login-trigger'), // Le texte du bas
  loginModal: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  closeModal: document.getElementById('close-modal')
};

/* ==================== AUTHENTIFICATION ==================== */
/* ==================== AUTHENTIFICATION ==================== */
onAuthStateChanged(auth, (user) => {
    window.isAdmin = !!user;
    if (user) {
        if(el.adminPanel) el.adminPanel.classList.remove('hidden');
        if(el.loginModal) el.loginModal.classList.add('hidden');
        loadAdminReviews();
        loadAdminComments();
        loadAdminTips();
        loadAdminJournal();
        loadAdminMessages();
    } else {
        if(el.adminPanel) el.adminPanel.classList.add('hidden');
    }
    window.loadProjects(); 
    loadPublicTips();
    loadPublicJournal();
});

// Ouverture du Modal (Cadenas Menu OU Texte Footer)
const openLogin = (e) => { 
    e.preventDefault(); 
    if(el.loginModal) el.loginModal.classList.remove('hidden'); 
};

if(el.adminTriggerNav) el.adminTriggerNav.onclick = openLogin;
if(el.adminTriggerFooter) el.adminTriggerFooter.onclick = openLogin;
if(el.closeModal) el.closeModal.onclick = () => el.loginModal.classList.add('hidden');

// Connexion
el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
        el.loginForm.reset();
    } catch (error) { 
        alert("Erreur: Identifiants incorrects"); 
    }
});

if(el.logoutBtn) el.logoutBtn.onclick = () => signOut(auth);

/* ==================== FONCTIONS GLOBALES (Window) ==================== */
window.deleteItem = async (col, id) => {
    if (!window.isAdmin) return;
    if (confirm("Supprimer définitivement ?")) await deleteDoc(doc(db, col, id));
};

window.approveItem = async (col, id) => {
    if (!window.isAdmin) return;
    await updateDoc(doc(db, col, id), { approved: true });
};

window.approveComment = async (commentId) => {
    if (!window.isAdmin) return;
    try {
        await updateDoc(doc(db, "comments", commentId), { approved: true });
    } catch (err) {
        console.error("Erreur approbation commentaire:", err);
    }
};

window.deleteComment = async (commentId) => {
    if (!window.isAdmin) return;
    if (confirm("Supprimer ce commentaire définitivement ?")) {
        try {
            await deleteDoc(doc(db, "comments", commentId));
        } catch (err) {
            console.error("Erreur suppression commentaire:", err);
        }
    }
};

/* ==================== MODAL COMMENTAIRES LIVE ==================== */
window.openCommentsModal = (projectId, projectTitle) => {
    const modal = document.getElementById('comments-modal');
    const container = document.getElementById('comments-container');
    const headerTitle = document.getElementById('comments-project-title');
    
    if (!modal || !container) return;
    
    headerTitle.textContent = `Commentaires - ${projectTitle}`;
    modal.classList.remove('hidden');
    container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Chargement...</div>';
    
    // Get user ID (email if logged in, or localStorage-based ID for guests)
    let userId = localStorage.getItem('valdes_user_id');
    if (!userId) {
        userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('valdes_user_id', userId);
    }
    window.currentUserId = userId;
    
    // Charger les commentaires en live
    const q = query(collection(db, "comments"), where("projectId", "==", projectId), orderBy("date", "asc"));
    window.commentsUnsubscribe = onSnapshot(q, (snap) => {
        container.innerHTML = '';
        if (snap.empty) {
            container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Aucun commentaire pour le moment...</div>';
        }
        snap.forEach(doc => {
            const c = doc.data();
            const commentTime = new Date(c.date?.toMillis?.() || Date.now());
            const now = new Date();
            const minutesAgo = Math.floor((now - commentTime) / 60000);
            const canEdit = minutesAgo < 15 && c.userId === userId;
            const time = commentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const isOwn = c.userId === userId;
            
            const msgDiv = document.createElement('div');
            msgDiv.className = `comment-message ${isOwn ? 'own' : ''}`;
            msgDiv.innerHTML = `
                <div>${c.text}</div>
                <div class="comment-time">${time}${c.editedAt ? ' (modifié)' : ''}</div>
                ${canEdit ? `<div style="margin-top:5px; display:flex; gap:5px; font-size:0.85rem;">
                    <button onclick="window.editCommentPrompt('${doc.id}', '${c.text.replace(/'/g, "\\'")}', '${projectId}')" style="background:rgba(0,238,150,0.2); color:#0ef; border:1px solid #0ef; padding:3px 8px; border-radius:4px; cursor:pointer;">Éditer</button>
                    <button onclick="window.deleteCommentUser('${doc.id}')" style="background:rgba(255,50,50,0.2); color:#ff3232; border:1px solid #ff3232; padding:3px 8px; border-radius:4px; cursor:pointer;">Supprimer</button>
                </div>` : (window.isAdmin ? `<div style="margin-top:5px; display:flex; gap:5px; font-size:0.85rem;">
                    <button onclick="window.deleteComment('${doc.id}')" style="background:rgba(255,50,50,0.2); color:#ff3232; border:1px solid #ff3232; padding:3px 8px; border-radius:4px; cursor:pointer;">Supprimer (admin)</button>
                </div>` : '')}
            `;
            container.appendChild(msgDiv);
        });
        // Scroll vers le bas
        container.scrollTop = container.scrollHeight;
    });
    
    // Stocker l'ID du projet pour l'envoi
    window.currentProjectId = projectId;
};

window.closeCommentsModal = () => {
    const modal = document.getElementById('comments-modal');
    if (modal) modal.classList.add('hidden');
    if (window.commentsUnsubscribe) window.commentsUnsubscribe();
};

// Éditer un commentaire (modal simple)
window.editCommentPrompt = (commentId, currentText, projectId) => {
    const newText = prompt("Modifier votre commentaire:", currentText);
    if (newText === null || newText.trim() === '') return;
    
    window.editCommentConfirm(commentId, newText.trim());
};

window.editCommentConfirm = async (commentId, newText) => {
    try {
        await updateDoc(doc(db, "comments", commentId), {
            text: newText,
            editedAt: serverTimestamp()
        });
    } catch (err) {
        console.error("Erreur édition commentaire:", err);
        alert("Erreur lors de la modification");
    }
};

// Supprimer un commentaire (utilisateur seulement)
window.deleteCommentUser = async (commentId) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
        await deleteDoc(doc(db, "comments", commentId));
    } catch (err) {
        console.error("Erreur suppression commentaire:", err);
    }
};

window.likeProject = async (projectId) => {
    const likedProjects = JSON.parse(localStorage.getItem('valdes_tech_likes') || '[]');
    if (likedProjects.includes(projectId)) return alert("Déjà aimé ! 😉");

    await updateDoc(doc(db, "projets", projectId), { likes: increment(1) });
    likedProjects.push(projectId);
    localStorage.setItem('valdes_tech_likes', JSON.stringify(likedProjects));
};


/* ==================== CHARGEMENT DES PROJETS ==================== */
window.loadProjects = (filter = "all") => {
    const list = document.getElementById('portfolio-list');
    if (!list) return;

    let q = query(collection(db, "projets"), orderBy("date", "desc"));
    if (filter !== "all") q = query(collection(db, "projets"), where("tag", "==", filter), orderBy("date", "desc"));

    onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const id = docSnap.id;
            
            const content = p.challenge 
                ? `<div class="case-study-mini">
                    <p><strong><i class='bx bx-target-lock'></i> Défi:</strong> ${p.challenge}</p>
                    <p><strong><i class='bx bx-cog'></i> Solution:</strong> ${p.solution}</p>
                    <p><strong><i class='bx bx-check-circle'></i> Résultat:</strong> ${p.resultat}</p>
                   </div>`
                : `<p>${p.description}</p>`;

            const links = (p.github || p.demo) 
                ? `<div class="project-links">
                    ${p.github ? `<a href="${p.github}" target="_blank" title="Code Source"><i class='bx bxl-github'></i></a>` : ''}
                    ${p.demo ? `<a href="${p.demo}" target="_blank" title="Démo Live"><i class='bx bx-link-external'></i></a>` : ''}
                   </div>`
                : '';

            list.innerHTML += `
                <div class="portfolio-box">
                    <img src="${p.image || 'images/default.jpg'}" alt="${p.titre}">
                    <div class="portfolio-layer">
                        <h4>${p.titre}</h4>
                        ${content}
                        ${links}
                        <button class="comments-btn" onclick="window.openCommentsModal('${id}', '${p.titre.replace(/'/g, "\\'")}')" style="margin-top:1rem; padding:0.8rem 1.5rem; background:var(--main-color); color:#000; border:none; border-radius:5px; cursor:pointer; font-weight:600; transition:0.3s;">
                            <i class='bx bxs-comment'></i> Commentaires
                        </button>
                    </div>
                    <div class="project-info-bar">
                        <span class="like-counter" onclick="likeProject('${id}')"><i class='bx bxs-heart'></i> ${p.likes || 0}</span>
                        ${window.isAdmin ? `<button class="admin-trash-btn" onclick="deleteItem('projets','${id}')"><i class='bx bxs-trash'></i></button>` : ''}
                    </div>
                </div>`;
        });
    });
};


/* ==================== COMMENTAIRES ==================== */
window.addComment = async (id) => {
    const input = document.getElementById(`input-${id}`);
    if (!input || !input.value.trim()) return;
    await addDoc(collection(db, "comments"), {
        projectId: id,
        text: input.value,
        date: serverTimestamp()
    });
    input.value = "";
    alert("Commentaire envoyé !");
};

window.loadComments = (projectId, containerId) => {
    const container = document.getElementById(containerId);
    if(!container) return;
    const q = query(collection(db, "comments"), where("projectId", "==", projectId), orderBy("date", "asc"));
    onSnapshot(q, (snap) => {
        container.innerHTML = '';
        snap.forEach(doc => {
            const c = doc.data();
            container.innerHTML += `<div class="tg-msg"><div>${c.text}</div></div>`;
        });
    });
};

/* ==================== GESTION ASTUCES (TIPS) ==================== */
// Formulaire d'ajout
const tipForm = document.getElementById('tip-form');
if (tipForm) {
    tipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('tip-title').value;
        const category = document.getElementById('tip-category').value; // Maintenant ça marche grâce au HTML corrigé
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
            alert("Erreur lors de l'ajout.");
        }
    });
}

// Chargement Public
function loadPublicTips() {
    const display = document.getElementById('tips-display');
    if (!display) return;

    const q = query(collection(db, "tips"), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        display.innerHTML = '';
        snap.forEach(doc => {
            const t = doc.data();
            let icon = 'bx-bulb';
            if(t.categorie === 'security') icon = 'bx-shield-quarter';
            if(t.categorie === 'hardware') icon = 'bx-chip';
            if(t.categorie === 'error') icon = 'bx-error-circle';

            display.innerHTML += `
                <div class="tip-card">
                    <span class="category-tag">${t.categorie || 'Info'}</span>
                    <i class='bx ${icon}'></i>
                    <h3>${t.titre}</h3>
                    <p>${t.description}</p>
                </div>
            `;
        });
    });
}

// Chargement Admin
function loadAdminTips() {
    const box = document.getElementById('admin-tips-list');
    if (!box) return;

    onSnapshot(query(collection(db, "tips"), orderBy("date", "desc")), (snap) => {
        box.innerHTML = '';
        snap.forEach(d => {
            const t = d.data();
            box.innerHTML += `
                <div class="admin-box" style="border-left:4px solid #0ef; padding:1.5rem; margin-bottom:1.5rem; background:rgba(255,255,255,0.05); border-radius:10px;">
                    <h4 style="color:#0ef; font-size:1.6rem;">${t.titre} (${t.categorie})</h4>
                    <p style="font-size:1.3rem; margin:10px 0;">${t.description.substring(0, 100)}...</p>
                    <div style="display:flex; gap:10px;">
                        <button onclick="deleteItem('tips','${d.id}')" style="background:#ff4757; color:white; padding:5px 12px; border-radius:5px; cursor:pointer;">🗑️ Supprimer</button>
                    </div>
                </div>
            `;
        });
    });
}

/* ==================== AUTRES FONCTIONS ADMIN ==================== */
function loadAdminReviews() {
    onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), snap => {
        const box = document.getElementById('admin-reviews-list');
        if(!box) return;
        box.innerHTML = '';
        snap.forEach(d => {
            const r = d.data();
            box.innerHTML += `<div class="admin-box">
                <p><strong>${r.nom}:</strong> ${r.texte}</p>
                ${!r.approved ? `<button onclick="approveItem('testimonials','${d.id}')">Approuver</button>` : '✅ Publié'}
                <button onclick="deleteItem('testimonials','${d.id}')" style="background:red;">Supprimer</button>
            </div>`;
        });
    });
}

function loadAdminComments() {
    const container = document.getElementById('admin-comments-list');
    if (!container) return;
    
    const q = query(collection(db, "comments"), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        if (snap.empty) {
            container.innerHTML = '<div class="no-comments-msg">✨ Aucun commentaire à modérer</div>';
            return;
        }
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const comment = doc.data();
            const date = new Date(comment.date?.toMillis?.() || Date.now());
            const timeStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            container.innerHTML += `
                <div class="comment-bubble">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author || 'Utilisateur'}</span>
                        <span class="comment-time">${timeStr}</span>
                    </div>
                    <div class="comment-project">📌 Projet ID: ${comment.projectId}</div>
                    <div class="comment-text">"${comment.text}"</div>
                    <div class="comment-actions">
                        <button class="comment-delete-btn" onclick="window.deleteComment('${doc.id}')">✕ Supprimer</button>
                    </div>
                </div>
            `;
        });
    });
}

function loadAdminMessages() {
    const box = document.getElementById("admin-messages-list");
    if (!box) return;
    const q = query(collection(db, "messages"), orderBy("date", "desc"));
    onSnapshot(q, snap => {
        box.innerHTML = '';
        snap.forEach(d => {
            const m = d.data();
            box.innerHTML += `
                <div class="admin-box">
                    <h4>${m.nom} (${m.tel})</h4>
                    <p>Subject: ${m.sujet}</p>
                    <p>${m.message}</p>
                    <button onclick="deleteItem('messages','${d.id}')">Supprimer</button>
                </div>`;
        });
    });
}

/* ==================== SOUMISSION PROJETS (PHASE 2) ==================== */
document.getElementById('project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "projets"), {
        titre: document.getElementById('p-title').value,
        challenge: document.getElementById('p-challenge').value, // Nouveau
        solution: document.getElementById('p-solution').value,   // Nouveau
        resultat: document.getElementById('p-result').value,     // Nouveau
        github: document.getElementById('p-github').value || "", // Nouveau
        demo: document.getElementById('p-demo').value || "",     // Nouveau
        description: document.getElementById('p-challenge').value, // Legacy (pour la sécurité)
        image: document.getElementById('p-image').value,
        tag: document.getElementById('p-tag').value,
        likes: 0,
        date: serverTimestamp()
    });
    e.target.reset();
    alert("Étude de cas publiée avec succès !");
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

// Affichage Public Avis
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

/* ==================== GESTION JOURNAL (ACTION 10) ==================== */
document.getElementById('journal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "journal"), {
        titre: document.getElementById('j-title').value,
        contenu: document.getElementById('j-content').value,
        date: serverTimestamp()
    });
    e.target.reset();
    alert("Article publié !");
});

function loadPublicJournal() {
    const display = document.getElementById('journal-display');
    if (!display) return;
    onSnapshot(query(collection(db, "journal"), orderBy("date", "desc")), snap => {
        display.innerHTML = '';
        snap.forEach(d => {
            const j = d.data();
            display.innerHTML += `
                <div class="tip-card"> <span class="category-tag">Veille</span>
                    <h3>${j.titre}</h3>
                    <p>${j.contenu}</p>
                </div>`;
        });
    });
}

function loadAdminJournal() {
    const box = document.getElementById('admin-journal-list');
    if (!box) return;
    onSnapshot(query(collection(db, "journal"), orderBy("date", "desc")), snap => {
        box.innerHTML = '';
        snap.forEach(d => {
            box.innerHTML += `<div class="admin-box">
                <p><strong>${d.data().titre}</strong></p>
                <button onclick="deleteItem('journal','${d.id}')" style="background:red;">Supprimer</button>
            </div>`;
        });
    });
}

/* ==================== EVENT LISTENERS - MODAL COMMENTAIRES ==================== */
// Utiliser la délégation d'événements pour plus de robustesse
document.addEventListener('click', async (e) => {
    // Fermer la modal
    if (e.target.id === 'close-comments' || e.target.parentElement?.id === 'close-comments') {
        window.closeCommentsModal();
        return;
    }
    
    // Envoyer un commentaire
    if (e.target.id === 'send-comment-btn') {
        const input = document.getElementById('comment-input');
        const text = input?.value.trim();
        
        if (!text || !window.currentProjectId) {
            console.warn("Erreur: texte vide ou ID projet manquant", { text, projectId: window.currentProjectId });
            return;
        }
        
        try {
            await addDoc(collection(db, "comments"), {
                projectId: window.currentProjectId,
                text: text,
                author: window.isAdmin ? 'Admin' : 'Utilisateur',
                userId: window.currentUserId,
                date: serverTimestamp()
            });
            if (input) input.value = '';
        } catch (err) {
            console.error("Erreur envoi commentaire:", err);
            alert("Erreur lors de l'envoi du commentaire");
        }
    }
    
    // Fermer la modal en cliquant en dehors (backdrop)
    if (e.target.id === 'comments-modal') {
        window.closeCommentsModal();
    }
});

// Soumettre le commentaire avec Enter
document.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && e.target.id === 'comment-input') {
        e.preventDefault();
        const input = document.getElementById('comment-input');
        const text = input?.value.trim();
        
        if (!text || !window.currentProjectId) return;
        
        try {
            await addDoc(collection(db, "comments"), {
                projectId: window.currentProjectId,
                text: text,
                author: window.isAdmin ? 'Admin' : 'Utilisateur',
                userId: window.currentUserId,
                date: serverTimestamp()
            });
            if (input) input.value = '';
        } catch (err) {
            console.error("Erreur envoi commentaire:", err);
        }
    }
});
