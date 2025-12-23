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

/* ============================================================
   CONFIG FIREBASE
   ============================================================ */
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
   ADMIN STATE
   ============================================================ */
let isAdmin = false;

const el = {
  adminPanel: document.getElementById('admin-panel'),
  adminTrigger: document.getElementById('admin-login-trigger'),
  loginModal: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  closeModal: document.getElementById('close-modal')
};

/* ============================================================
   AUTH + INITIALISATION
   ============================================================ */
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
  });

  el.adminTrigger && (el.adminTrigger.onclick = () => el.loginModal.classList.remove('hidden'));
  el.closeModal && (el.closeModal.onclick = () => el.loginModal.classList.add('hidden'));

  el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        document.getElementById('login-email').value,
        document.getElementById('login-password').value
      );
      el.loginForm.reset();
    } catch {
      alert("Identifiants incorrects");
    }
  });

  el.logoutBtn && (el.logoutBtn.onclick = () => signOut(auth));
}
initAdminSystem();

/* ============================================================
   OUTILS GLOBAUX
   ============================================================ */
window.deleteItem = async (col, id) => {
  if (!isAdmin) return alert("Accès refusé");
  if (confirm("Supprimer définitivement ?")) {
    await deleteDoc(doc(db, col, id));
  }
};

window.approveItem = async (col, id) => {
  if (!isAdmin) return;
  await updateDoc(doc(db, col, id), { approved: true });
};

window.likeProject = async (id) => {
  await updateDoc(doc(db, "projets", id), { likes: increment(1) });
};

/* ============================================================
   PROJETS
   ============================================================ */
window.loadProjects = (filter = "all") => {
  const list = document.getElementById('portfolio-list');
  if (!list) return;

  let q = query(collection(db, "projets"), orderBy("date", "desc"));
  if (filter !== "all") {
    q = query(
      collection(db, "projets"),
      where("tag", "==", filter),
      orderBy("date", "desc")
    );
  }

  onSnapshot(q, (snapshot) => {
    list.innerHTML = '';
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const id = docSnap.id;

      list.innerHTML += `
        <div class="project">
          <h3>${p.titre}</h3>
          <p>${p.description}</p>
          <button onclick="likeProject('${id}')">❤️ ${p.likes}</button>
          ${isAdmin ? `<button onclick="deleteItem('projets','${id}')">🗑</button>` : ''}
          <div id="comments-${id}"></div>
          <input id="input-${id}" placeholder="Commentaire">
          <button onclick="addComment('${id}')">Envoyer</button>
        </div>
      `;
      loadComments(id);
    });
  });
};

/* ============================================================
   COMMENTAIRES
   ============================================================ */
window.loadComments = (projId) => {
  const commList = document.getElementById(`comments-${projId}`);
  if (!commList) return;

  const q = query(
    collection(db, "comments"),
    where("projectId", "==", projId),
    where("approved", "==", true),
    orderBy("date", "asc")
  );

  onSnapshot(q, (snapshot) => {
    commList.innerHTML = '';
    snapshot.forEach(d => {
      const c = d.data();
      commList.innerHTML += `
        <p class="${c.isAdmin ? 'admin-comment' : ''}">
          ${c.text}
        </p>
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
    approved: false,
    isAdmin,
    date: serverTimestamp()
  });
  input.value = '';
};

/* ============================================================
   ADMIN : COMMENTAIRES
   ============================================================ */
function loadAdminComments() {
  const box = document.getElementById("admin-comments");
  if (!box) return;

  const q = query(collection(db, "comments"), where("approved", "==", false));
  onSnapshot(q, snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const c = d.data();
      box.innerHTML += `
        <div>
          <p>${c.text}</p>
          <button onclick="approveItem('comments','${d.id}')">✅</button>
          <button onclick="deleteItem('comments','${d.id}')">🗑</button>
        </div>
      `;
    });
  });
}

/* ============================================================
   FORM AJOUT PROJET (ADMIN)
   ============================================================ */
function setupAdminProjectForm() {
  const form = document.getElementById('add-project-form');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "projets"), {
      titre: proj-title.value,
      description: proj-desc.value,
      image: proj-img.value,
      tag: proj-tag.value,
      likes: 0,
      date: serverTimestamp()
    });
    form.reset();
  };
}
setupAdminProjectForm();

/* ============================================================
   CONTACT CLIENT
   ============================================================ */
const contactForm = document.getElementById('firebase-contact-form');
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "messages"), {
    nom: contactForm.name.value,
    email: contactForm.email.value,
    tel: contactForm.phone.value,
    sujet: contactForm.subject.value,
    message: contactForm.message.value,
    date: serverTimestamp()
  });
  alert("Message envoyé");
  contactForm.reset();
});

/* ============================================================
   ADMIN : MESSAGES
   ============================================================ */
function loadAdminMessages() {
  const box = document.getElementById('admin-messages');
  if (!box) return;

  onSnapshot(collection(db, "messages"), snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const m = d.data();
      box.innerHTML += `
        <div>
          <b>${m.nom}</b> : ${m.message}
          <button onclick="deleteItem('messages','${d.id}')">🗑</button>
        </div>
      `;
    });
  });
}

/* ============================================================
   AVIS / TÉMOIGNAGES
   ============================================================ */
const reviewForm = document.getElementById('review-form');
reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, "testimonials"), {
    nom: reviewForm.name.value,
    texte: reviewForm.text.value,
    approved: false,
    date: serverTimestamp()
  });
  alert("Avis envoyé");
  reviewForm.reset();
});

function loadAdminReviews() {
  const box = document.getElementById('admin-reviews');
  if (!box) return;

  const q = query(collection(db, "testimonials"), where("approved", "==", false));
  onSnapshot(q, snap => {
    box.innerHTML = '';
    snap.forEach(d => {
      const r = d.data();
      box.innerHTML += `
        <div>
          <p>${r.texte}</p>
          <button onclick="approveItem('testimonials','${d.id}')">✅</button>
          <button onclick="deleteItem('testimonials','${d.id}')">🗑</button>
        </div>
      `;
    });
  });
}

/* ============================================================
   AFFICHAGE PUBLIC AVIS
   ============================================================ */
const reviewList = document.getElementById('testimonials-list');
if (reviewList) {
  const q = query(
    collection(db, "testimonials"),
    where("approved", "==", true),
    orderBy("date", "desc")
  );

  onSnapshot(q, snap => {
    reviewList.innerHTML = '';
    snap.forEach(d => {
      const t = d.data();
      reviewList.innerHTML += `
        <div class="testimonial-box">
          <p>« ${t.texte} »</p>
          <h4>${t.nom}</h4>
        </div>
      `;
    });
  });
}

/* ============================================================
   TIPS / CONSEILS
   ============================================================ */
function loadTips() {
  onSnapshot(collection(db, "tips"), snap => {
    snap.forEach(d => console.log("Tip:", d.data().text));
  });
}
loadTips();
