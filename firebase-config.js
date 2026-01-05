import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, query,
  orderBy, where, deleteDoc, doc, updateDoc, getDocs,
  increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBirIXLKxkuWT7js3CB4_pGB6tk4wPa2AM",
  authDomain: "valde-tech.firebaseapp.com",
  projectId: "valde-tech",
  storageBucket: "valde-tech.firebasestorage.app",
  messagingSenderId: "1057527881640",
  appId: "1:1057527881640:web:0fa2badcf46267bee7879d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exposer globalement pour accès aux autres scripts
window.db = db;
window.auth = auth;
window.Firebase = {
  collection, addDoc, onSnapshot, query, orderBy, where, 
  deleteDoc, doc, updateDoc, getDocs, increment, serverTimestamp
};

// Variables Globales
window.isAdmin = false;

// Utilité pour accéder aux éléments DOM avec vérification de sécurité
const el = {
  adminPanel: document.getElementById('admin-panel'),
  adminTriggerNav: document.getElementById('admin-login-link'),
  adminTriggerFooter: document.getElementById('admin-login-trigger'),
  loginModal: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  closeModal: document.getElementById('close-modal')
};

// Gestion d'erreurs globale
window.appErrors = [];
window.logError = function(context, error) {
  const errorObj = {
    timestamp: new Date().toISOString(),
    context: context,
    message: error.message || String(error),
    stack: error.stack || ''
  };
  window.appErrors.push(errorObj);
  console.error(`[${context}]`, error);
  // Garder seulement les 50 derniers erreurs en mémoire
  if (window.appErrors.length > 50) {
    window.appErrors.shift();
  }
};

// Exposer les fonctions Firestore globalement pour les scripts non-module
window.firebaseDb = db;
window.firebaseAuth = auth;
window.getFirestore = getFirestore;
window.collection = collection;
window.addDoc = addDoc;
window.onSnapshot = onSnapshot;
window.query = query;
window.orderBy = orderBy;
window.where = where;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.updateDoc = updateDoc;
window.getDocs = getDocs;
window.increment = increment;
window.serverTimestamp = serverTimestamp;

// Ajouter les méthodes à window.db pour compatibilité avec les scripts non-module
window.db.collection = collection;
window.db.addDoc = addDoc;
window.db.onSnapshot = onSnapshot;
window.db.query = query;
window.db.orderBy = orderBy;
window.db.where = where;
window.db.deleteDoc = deleteDoc;
window.db.doc = doc;
window.db.updateDoc = updateDoc;
window.db.getDocs = getDocs;
window.db.increment = increment;
window.db.serverTimestamp = serverTimestamp;

/* ==================== AUTHENTIFICATION ==================== */
onAuthStateChanged(auth, async (user) => {
    try {
        window.isAdmin = !!user;
        if (user) {
            if(el.adminPanel) el.adminPanel.classList.remove('hidden');
            if(el.loginModal) el.loginModal.classList.add('hidden');
            // Charger les données admin avec gestion d'erreurs
            try { await loadAdminReviews(); } catch(e) { window.logError('loadAdminReviews', e); }
            try { await loadAdminComments(); } catch(e) { window.logError('loadAdminComments', e); }
            try { await loadAdminTips(); } catch(e) { window.logError('loadAdminTips', e); }
            try { await loadAdminJournal(); } catch(e) { window.logError('loadAdminJournal', e); }
            try { await loadAdminMessages(); } catch(e) { window.logError('loadAdminMessages', e); }
        } else {
            if(el.adminPanel) el.adminPanel.classList.add('hidden');
        }
        // Charger les projets si le DOM est prêt
        if (document.getElementById('portfolio-list')) {
            try { window.loadProjects(); } catch(e) { window.logError('loadProjects', e); }
        }
        try { loadPublicTips(); } catch(e) { window.logError('loadPublicTips', e); }
        try { loadPublicJournal(); } catch(e) { window.logError('loadPublicJournal', e); }
        try { loadAboutContent(); } catch(e) { window.logError('loadAboutContent', e); }
        try { loadStatistics(); } catch(e) { window.logError('loadStatistics', e); }
    } catch (error) {
        window.logError('onAuthStateChanged', error);
    }
});

// Ouverture du Modal (Cadenas Menu OU Texte Footer)
const openLogin = (e) => { 
    e.preventDefault(); 
    if(el.loginModal) el.loginModal.classList.remove('hidden'); 
};

if(el.adminTriggerNav) el.adminTriggerNav.onclick = openLogin;
if(el.adminTriggerFooter) el.adminTriggerFooter.onclick = openLogin;
if(el.closeModal) el.closeModal.onclick = () => el.loginModal.classList.add('hidden');

// Connexion avec gestion d'erreurs améliorée + notifications
el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Validation basique
        if (!email || !password) {
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.warning("⚠️ Veuillez remplir email et mot de passe");
            } else {
                alert("Veuillez remplir email et mot de passe");
            }
            return;
        }
        
        // Valider email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.warning("⚠️ Format email invalide");
            } else {
                alert("Format email invalide");
            }
            return;
        }
        
        await signInWithEmailAndPassword(auth, email, password);
        el.loginForm.reset();
        if (el.loginModal) el.loginModal.classList.add('hidden');
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.success("✅ Connexion réussie!");
        } else {
            alert("✅ Connexion réussie!");
        }
    } catch (error) {
        window.logError('loginForm', error);
        const errorMsg = error.code === 'auth/invalid-credential' 
            ? "❌ Identifiants incorrects"
            : error.code === 'auth/user-not-found'
            ? "❌ Utilisateur non trouvé"
            : error.code === 'auth/too-many-requests'
            ? "⏳ Trop de tentatives. Essayez plus tard"
            : `❌ Erreur: ${error.message}`;
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.error(errorMsg);
        } else {
            alert(errorMsg);
        }
    }
});

if(el.logoutBtn) el.logoutBtn.onclick = () => {
    signOut(auth);
    if (typeof NotificationSystem !== 'undefined') {
        NotificationSystem.success('👋 Déconnecté avec succès');
    }
};

/* ==================== INITIALISATION CONTENU DÉMO ==================== */
// Ajouter du contenu de démonstration si les collections sont vides
async function initializeDemoContent() {
    // Vérifier si des projets existent
    const projetsSnap = await query(collection(db, "projets"));
    onSnapshot(projetsSnap, (snap) => {
        if (snap.empty && window.isAdmin) {
            // Ajouter un projet de démonstration
            addDoc(collection(db, "projets"), {
                titre: "[DÉMO] Sécurisation Réseau Entreprise",
                challenge: "Client avait des vulnérabilités réseau importantes",
                solution: "Audit complet, installation firewall, VPN et segmentation réseau",
                resultat: "Réduction 95% des risques de sécurité, conformité atteinte",
                image: "images/project-demo.jpg",
                tag: "Sécurité",
                likes: 5,
                date: serverTimestamp(),
                github: "",
                demo: ""
            }).catch(() => {});
        }
    });
}

/* ==================== FONCTIONS GLOBALES (Window) ==================== */
window.deleteItem = async (col, id) => {
    if (!window.isAdmin) return;
    
    // Utiliser le système de confirmation amélioré
    if (typeof ConfirmDialog !== 'undefined') {
        ConfirmDialog.show(
            `❌ <strong>Supprimer définitivement?</strong><br><br>Cette action est <strong>irréversible</strong>. Vous allez supprimer cet élément de la collection <strong style="color: #0ef;">${col}</strong>.`,
            async () => {
                try {
                    await deleteDoc(doc(db, col, id));
                    if (typeof NotificationSystem !== 'undefined') {
                        NotificationSystem.success('✅ Élément supprimé avec succès');
                    }
                } catch (error) {
                    window.logError('deleteItem', error);
                    if (typeof NotificationSystem !== 'undefined') {
                        NotificationSystem.error('❌ Erreur lors de la suppression');
                    }
                }
            }
        );
    } else {
        // Fallback standard
        if (confirm("Supprimer définitivement ?")) {
            try {
                deleteDoc(doc(db, col, id));
            } catch (error) {
                window.logError('deleteItem', error);
            }
        }
    }
};

window.approveItem = async (col, id) => {
    if (!window.isAdmin) return;
    try {
        await updateDoc(doc(db, col, id), { approved: true });
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.success('✅ Élément approuvé');
        }
    } catch (error) {
        window.logError('approveItem', error);
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.error('❌ Erreur approbation');
        }
    }
};

window.approveComment = async (commentId) => {
    if (!window.isAdmin) return;
    try {
        await updateDoc(doc(db, "comments", commentId), { approved: true });
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.success('✅ Commentaire approuvé');
        }
    } catch (err) {
        console.error("Erreur approbation commentaire:", err);
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.error('❌ Erreur approbation');
        }
    }
};

window.deleteComment = async (commentId) => {
    if (!window.isAdmin) return;
    if (typeof ConfirmDialog !== 'undefined') {
        ConfirmDialog.show(
            '❌ Supprimer ce commentaire définitivement?',
            async () => {
                try {
                    await deleteDoc(doc(db, "comments", commentId));
                    if (typeof NotificationSystem !== 'undefined') {
                        NotificationSystem.success('✅ Commentaire supprimé');
                    }
                } catch (err) {
                    console.error("Erreur suppression commentaire:", err);
                    if (typeof NotificationSystem !== 'undefined') {
                        NotificationSystem.error('❌ Erreur suppression');
                    }
                }
            }
        );
    } else {
        if (confirm("Supprimer ce commentaire définitivement ?")) {
            try {
                await deleteDoc(doc(db, "comments", commentId));
            } catch (err) {
                console.error("Erreur suppression commentaire:", err);
            }
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
// Variable globale pour gérer les snapshots d'écoute
let currentProjectSnapshot = null;

window.loadProjects = (filter = "all") => {
    console.log('📦 window.loadProjects called with filter:', filter);
    const list = document.getElementById('portfolio-list');
    if (!list) {
        console.error('❌ portfolio-list element not found');
        return;
    }

    console.log('✅ portfolio-list found, loading projects...');
    // Arrêter l'écoute précédente si elle existe
    if (currentProjectSnapshot) {
        console.log('🔄 Unsubscribing from previous snapshot');
        currentProjectSnapshot();
    }

    let q = query(collection(db, "projets"), orderBy("date", "desc"));
    if (filter !== "all") q = query(collection(db, "projets"), where("tag", "==", filter), orderBy("date", "desc"));

    currentProjectSnapshot = onSnapshot(q, 
        (snapshot) => {
            list.innerHTML = '';
            if (snapshot.empty) {
                list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">Aucun projet trouvé pour cette catégorie</div>`;
                return;
            }
            
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
                        <span class="like-counter" onclick="window.likeProject('${id}')"><i class='bx bxs-heart'></i> ${p.likes || 0}</span>
                        ${window.isAdmin ? `<button class="admin-trash-btn" onclick="window.deleteItem('projets','${id}')"><i class='bx bxs-trash'></i></button>` : ''}
                    </div>
                </div>`;
            });
        },
        (error) => {
            console.error('❌ Error loading projects with filter:', filter, error.message);
            list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f00; padding: 2rem;">Erreur lors du chargement des projets</div>`;
        }
    );
};

console.log('✅ firebase-config.js: window.loadProjects defined');
console.log('🔍 Verifying window.loadProjects:', {
    exists: !!window.loadProjects,
    type: typeof window.loadProjects,
    isFunction: typeof window.loadProjects === 'function'
});


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
        const category = document.getElementById('tip-category').value;
        const difficulty = document.getElementById('tip-difficulty').value;
        const content = document.getElementById('tip-content').value;
        const stepsText = document.getElementById('tip-steps').value;
        const conseil = document.getElementById('tip-conseil').value;
        const temps = document.getElementById('tip-temps').value;

        try {
            // Convertir les étapes en array
            const etapes = stepsText.split('\n').filter(s => s.trim().length > 0);
            
            await addDoc(collection(db, "tips"), {
                titre: title,
                categorie: category,
                difficulte: difficulty,
                description: content,
                etapes: etapes.length > 0 ? etapes : null,
                conseil: conseil || null,
                temps: temps || null,
                date: serverTimestamp()
            });
            tipForm.reset();
            alert("Astuce publiée avec succès ! 🎉");
        } catch (e) {
            console.error("Erreur d'ajout : ", e);
            alert("Erreur lors de l'ajout.");
        }
    });
}

// Chargement Public
let allTipsData = []; // Cache global des astuces

function loadPublicTips() {
    const display = document.getElementById('tips-display');
    if (!display) return;

    const q = query(collection(db, "tips"), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        allTipsData = []; // Réinitialiser le cache
        snap.forEach(doc => {
            allTipsData.push(doc.data());
        });
        
        // Afficher toutes les astuces initialement
        filterAndDisplayTips('all', 'all');
    });
}

// Fonction de filtrage
function filterAndDisplayTips(selectedDifficulty, selectedCategory) {
    const display = document.getElementById('tips-display');
    if (!display) return;

    display.innerHTML = '';
    
    // Filtrer les astuces
    const filteredTips = allTipsData.filter(t => {
        const matchDifficulty = selectedDifficulty === 'all' || t.difficulte === selectedDifficulty;
        const matchCategory = selectedCategory === 'all' || t.categorie === selectedCategory;
        return matchDifficulty && matchCategory;
    });

    // Si aucune astuce ne correspond
    if (filteredTips.length === 0) {
        display.innerHTML = `
            <div class="tips-empty" style="grid-column: 1/-1;">
                <div class="tips-empty-icon">🔍</div>
                <p>Aucune astuce trouvée pour cette combinaison...</p>
            </div>
        `;
        return;
    }

    // Afficher les astuces filtrées
    filteredTips.forEach(t => {
        const difficulty = t.difficulte || 'intermediaire';
        const category = t.categorie || 'os';
        const categoryIcons = {
            'os': '🖥️',
            'hardware': '⚙️',
            'security': '🔒',
            'network': '🌐',
            'software': '📦'
        };
        const categoryEmoji = categoryIcons[category] || '💡';
        
        // HTML structuré avec toutes les classes CSS
        display.innerHTML += `
            <div class="tip-card" data-difficulty="${difficulty}" data-category="${category}">
                <div class="tip-card-header">
                    <h3 class="tip-card-title">
                        <i class="fa-solid fa-lightbulb"></i>
                        ${t.titre || 'Astuce'}
                    </h3>
                    <span class="difficulty-badge ${difficulty}">
                        ${difficulty === 'debutant' ? '🟢 Débutant' : 
                          difficulty === 'intermediaire' ? '🟡 Intermédiaire' : 
                          '🔴 Avancé'}
                    </span>
                </div>
                
                <span class="tip-category-tag">${categoryEmoji} ${category}</span>
                
                <div class="tip-card-content">
                    <p class="tip-description">${t.description || 'Astuce pratique'}</p>
                    
                    ${t.etapes && Array.isArray(t.etapes) ? `
                        <div class="tip-steps">
                            ${t.etapes.map((step, i) => `
                                <div class="tip-step">
                                    <div class="step-number">${i + 1}</div>
                                    <div class="step-text">${step}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${t.conseil ? `
                        <div class="tip-highlight">
                            <strong>💡 Conseil :</strong> ${t.conseil}
                        </div>
                    ` : ''}
                </div>
                
                <div class="tip-card-footer">
                    <div class="tip-meta">
                        ${t.temps ? `<span class="tip-meta-item">⏱️ ${t.temps}</span>` : ''}
                        <span class="tip-meta-item">📅 ${new Date(t.date?.toDate?.() || t.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Variable globale pour suivre les filtres actuels
let currentTipsFilters = {
    difficulty: 'all',
    category: 'all'
};

// Initialiser les événements de filtrage
function initTipsFilters() {
    console.log('🔧 Initializing tips filters...');
    
    const filterBtns = document.querySelectorAll('.tip-filter-btn');
    console.log(`✅ Found ${filterBtns.length} filter buttons`);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('🖱️ Filter button clicked');
            
            const difficulty = e.target.dataset.difficulty;
            const category = e.target.dataset.category;
            
            // Mettre à jour difficulté
            if (difficulty !== undefined) {
                currentTipsFilters.difficulty = difficulty;
                // Mettre à jour les boutons actifs
                document.querySelectorAll('[data-difficulty]').forEach(b => {
                    b.classList.toggle('active', b.dataset.difficulty === difficulty);
                });
                console.log(`📊 Difficulty filter set to: ${difficulty}`);
            }
            
            // Mettre à jour catégorie
            if (category !== undefined) {
                currentTipsFilters.category = category;
                // Mettre à jour les boutons actifs
                document.querySelectorAll('[data-category]').forEach(b => {
                    b.classList.toggle('active', b.dataset.category === category);
                });
                console.log(`📂 Category filter set to: ${category}`);
            }
            
            // Appliquer les filtres
            filterAndDisplayTips(currentTipsFilters.difficulty, currentTipsFilters.category);
        });
    });
}

// Appeler initTipsFilters une fois que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTipsFilters, 500);
});

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
                        <button onclick="window.deleteItem('tips','${d.id}')" style="background:#ff4757; color:white; padding:5px 12px; border-radius:5px; cursor:pointer;">🗑️ Supprimer</button>
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
                ${!r.approved ? `<button onclick="window.approveItem('testimonials','${d.id}')">Approuver</button>` : '✅ Publié'}
                <button onclick="window.deleteItem('testimonials','${d.id}')" style="background:red;">Supprimer</button>
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
                    <button onclick="window.deleteItem('messages','${d.id}')">Supprimer</button>
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
    
    const messageData = {
        nom: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        tel: document.getElementById('contact-phone').value,
        sujet: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        date: serverTimestamp()
    };

    // 🤖 MODÉRER AVEC GEMINI
    if (window.GeminiAI) {
        console.log('🤖 Modération message avec IA...');
        const moderation = await window.GeminiAI.moderateMessage(
            `${messageData.sujet}\n${messageData.message}`
        );
        
        if (moderation) {
            messageData.moderation = {
                checked: true,
                isSpam: moderation.isSpam || false,
                isSafe: moderation.isSafe !== false,
                confidence: moderation.confidence || 0,
                category: moderation.category || 'normal'
            };

            // Avertir si spam détecté
            if (moderation.isSpam) {
                console.warn('⚠️ Message marqué comme potentiel spam');
            }
        }
    }

    await addDoc(collection(db, "messages"), messageData);
    alert("Message envoyé ! ✅");
    e.target.reset();
});

document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get or create user ID for tracking
    let userId = localStorage.getItem('valdes_user_id');
    if (!userId) {
        userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('valdes_user_id', userId);
    }
    
    // Préparer les données MINIMALES pour soumission immédiate
    const reviewData = {
        nom: document.getElementById('review-name').value,
        texte: document.getElementById('review-text').value,
        userId: userId,
        approved: false,
        date: serverTimestamp()
    };

    try {
        // SOUMETTRE L'AVIS IMMÉDIATEMENT (sans attendre Gemini)
        const docRef = await addDoc(collection(db, "testimonials"), reviewData);
        console.log('✅ Avis soumis avec succès (ID:', docRef.id, ')');
        alert("Merci ! Votre avis a été soumis. ✅");
        e.target.reset();
        
        // NOTE: Vérification Gemini RGPD désactivée (CORS bloquer API Gemini côté client)
        // Solution: Nécessite Cloud Function ou backend tier tiers (frais)
        // Les avis sont acceptés directement dans Firestore et peuvent être modérés manuellement
        
        // VÉRIFICATION RGPD DÉSACTIVÉE (Gemini API inaccessible depuis navigateur sans Cloud Function)
        // if (window.GeminiAI && window.GEMINI_API_KEY) {
        //     Déclencher vérification asynchrone sans bloquer
        //     setTimeout(async () => {
        //         try {
        //             console.log('🔄 Vérification RGPD en arrière-plan...');
        //             const compliance = await window.GeminiAI.checkRGPDCompliance(reviewData.texte);
        //             
        //             if (compliance && !compliance.isCompliant) {
        //                 // Ajouter une note si non conforme
        //                 await updateDoc(doc(db, "testimonials", docRef.id), {
        //                     rgpd_compliance: {
        //                         checked: true,
        //                         isCompliant: compliance.isCompliant,
        //                         issues: compliance.issues || [],
        //                         recommendation: compliance.recommendation || 'flag'
        //                     }
        //                 });
        //                 console.log('⚠️ Avis marqué pour révision RGPD');
        //             }
        //         } catch (geminiError) {
        //             console.warn('⚠️ Vérification RGPD échouée:', geminiError.message);
        //             // Continuer - l'avis est déjà soumis
        //         }
        //     }, 100);
        // }
    } catch (error) {
        console.error('❌ Erreur lors de la soumission de l\'avis:', error);
        alert('❌ Erreur: ' + (error.message || 'Impossible de soumettre l\'avis. Veuillez réessayer.'));
    }
});

// Affichage Public Avis
const reviewList = document.getElementById('testimonials-list');
if (reviewList) {
    const q = query(collection(db, "testimonials"), where("approved", "==", true), orderBy("date", "desc"));
    onSnapshot(q, 
        snap => {
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
        },
        error => {
            console.error('❌ Error loading testimonials:', error.message);
            console.log('💡 This may be a Firestore index issue. Trying fallback...');
            // Fallback: afficher sans tri
            const qFallback = query(collection(db, "testimonials"), where("approved", "==", true));
            onSnapshot(qFallback, snap => {
                reviewList.innerHTML = '';
                const sorted = [];
                snap.forEach(d => sorted.push({...d.data(), id: d.id}));
                sorted.sort((a, b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0));
                sorted.forEach(t => {
                    reviewList.innerHTML += `
                        <div class="testimonial-box">
                            <i class='bx bxs-quote-alt-left'></i>
                            <p>${t.texte}</p>
                            <div class="client-details"><h4>${t.nom}</h4></div>
                        </div>`;
                });
            });
        }
    );
}

/* ==================== GESTION JOURNAL (ACTION 10) ==================== */
document.getElementById('journal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "journal"), {
        titre: document.getElementById('j-title').value,
        resume: document.getElementById('j-resume')?.value || document.getElementById('j-title').value.substring(0, 100),
        contexte: document.getElementById('j-context')?.value || "",
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
        if (snap.empty) {
            display.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888;">Aucun article pour le moment</div>';
        }
        snap.forEach(d => {
            const j = d.data();
            const dateStr = new Date(j.date?.toMillis?.() || Date.now()).toLocaleDateString('fr-FR');
            display.innerHTML += `
                <div class="tip-card">
                    <span class="category-tag">Veille</span>
                    <h3>${j.titre}</h3>
                    <p><strong>Résumé:</strong> ${j.resume || j.contenu.substring(0, 100)}...</p>
                    ${j.contexte ? `<p><strong>Contexte:</strong> ${j.contexte.substring(0, 80)}...</p>` : ''}
                    <p style="color: #999; font-size: 0.85rem; margin-top: 10px;">${dateStr}</p>
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
                <button onclick="window.deleteItem('journal','${d.id}')" style="background:red;">Supprimer</button>
            </div>`;
        });
    });
}

/* ==================== CHARGEMENT CONTENU "À PROPOS" ==================== */
function loadAboutContent() {
    const aboutContent = document.getElementById('about-content-dynamic');
    if (!aboutContent) return;
    
    onSnapshot(doc(db, "about", "main"), (docSnap) => {
        if (!docSnap.exists()) {
            aboutContent.innerHTML = '<p style="text-align:center; color:#888;">Contenu "À propos" en cours de chargement...</p>';
            return;
        }
        
        const data = docSnap.data();
        aboutContent.innerHTML = `
            ${data.photo ? `<img src="${data.photo}" alt="Photo profil" style="width:200px; height:200px; border-radius:50%; object-fit:cover; margin-bottom:2rem;">` : ''}
            <h3 style="color:#0ef; margin-bottom:1rem;">Qui suis-je?</h3>
            <p style="font-size:1.4rem; line-height:1.8; margin-bottom:2rem;">${data.whoAmI || 'Contenu à venir...'}</p>
            <h3 style="color:#0ef; margin-bottom:1rem;">Mon Parcours</h3>
            <p style="font-size:1.4rem; line-height:1.8;">${data.myJourney || 'Contenu à venir...'}</p>
        `;
    });
}

/* ==================== CHARGEMENT STATISTIQUES ==================== */
function loadStatistics() {
    const statsDisplay = document.getElementById('about-stats-dynamic');
    if (!statsDisplay) return;
    
    onSnapshot(doc(db, "stats", "main"), (docSnap) => {
        if (!docSnap.exists()) {
            statsDisplay.innerHTML = '';
            return;
        }
        
        const data = docSnap.data();
        statsDisplay.innerHTML = `
            <div class="stats-container" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:2rem; margin-top:2rem;">
                <div class="stat-box" style="text-align:center; padding:2rem; background:rgba(0,239,255,0.1); border-radius:10px; border-left:4px solid #0ef;">
                    <h4 style="font-size:3rem; color:#0ef; margin-bottom:0.5rem;">${data.projectsCount || 0}+</h4>
                    <p style="font-size:1.2rem; color:#aaa;">Projets Réalisés</p>
                </div>
                <div class="stat-box" style="text-align:center; padding:2rem; background:rgba(0,239,255,0.1); border-radius:10px; border-left:4px solid #0ef;">
                    <h4 style="font-size:3rem; color:#0ef; margin-bottom:0.5rem;">${data.clientsCount || 0}+</h4>
                    <p style="font-size:1.2rem; color:#aaa;">Clients Satisfaits</p>
                </div>
                <div class="stat-box" style="text-align:center; padding:2rem; background:rgba(0,239,255,0.1); border-radius:10px; border-left:4px solid #0ef;">
                    <h4 style="font-size:3rem; color:#0ef; margin-bottom:0.5rem;">${data.yearsExperience || 0}+</h4>
                    <p style="font-size:1.2rem; color:#aaa;">Ans d'Expérience</p>
                </div>
            </div>
        `;
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

// Exposer une promesse pour attendre que Firebase soit prêt
window.firebaseReady = new Promise((resolve) => {
    onAuthStateChanged(auth, () => {
        resolve();
    });
});

console.log('✅ Firebase Config Module Loaded Successfully');
console.log('🚀 Firebase initialized and ready to use');
