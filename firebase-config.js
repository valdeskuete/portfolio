import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Ta configuration réelle
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

/* ==================== TÉMOIGNAGES (CLIENTS) ==================== */

// Envoyer un témoignage (En attente par défaut)
window.submitReview = async (name, message, rating) => {
    try {
        await addDoc(collection(db, "testimonials"), {
            name: name,
            message: message,
            rating: parseInt(rating),
            status: "pending",
            date: new Date()
        });
        alert("Succès ! Valdes vérifiera votre avis avant publication.");
        return true;
    } catch (e) {
        console.error("Erreur : ", e);
        return false;
    }
};

// Affichage en temps réel des avis APPROUVÉS
const qApproved = query(collection(db, "testimonials"), where("status", "==", "approved"), orderBy("date", "desc"));
onSnapshot(qApproved, (snapshot) => {
    const list = document.querySelector('#testimonial-display-list');
    if (!list) return;
    list.innerHTML = ""; 
    snapshot.forEach((doc) => {
        const data = doc.data();
        list.innerHTML += `
            <div class="testimonial-box">
                <i class="fa-solid fa-quote-left"></i>
                <p>« ${data.message} »</p>
                <div class="client-info">
                    <div class="client-details">
                        <h4>${data.name}</h4>
                        <p>${"⭐".repeat(data.rating)}</p>
                    </div>
                </div>
            </div>`;
    });
});

/* ==================== PROJETS (ADMIN) ==================== */

// Ajouter un projet
window.addProject = async (title, desc, category, imgUrl) => {
    try {
        await addDoc(collection(db, "projects"), {
            title: title,
            desc: desc,
            category: category,
            img: imgUrl || "images/default-project.jpg",
            date: new Date()
        });
        alert("Projet ajouté !");
    } catch (e) { alert("Erreur : " + e); }
};

// Affichage des projets
const qProjects = query(collection(db, "projects"), orderBy("date", "desc"));
onSnapshot(qProjects, (snapshot) => {
    const container = document.querySelector('#portfolio-dynamic-list');
    if (!container) return;
    container.innerHTML = ""; 
    snapshot.forEach((doc) => {
        const data = doc.data();
        container.innerHTML += `
            <div class="portfolio-box" data-category="${data.category}">
                <img src="${data.img}" alt="${data.title}">
                <div class="portfolio-layer">
                    <h4>${data.title}</h4>
                    <p>${data.desc}</p>
                    <a href="#"><i class="fa-solid fa-up-right-from-square"></i></a>
                </div>
            </div>`;
    });
});

/* ==================== MODÉRATION (ADMIN) ==================== */

// Écouter les avis EN ATTENTE
const qPending = query(collection(db, "testimonials"), where("status", "==", "pending"));
onSnapshot(qPending, (snapshot) => {
    const pendingList = document.querySelector('#pending-reviews-list');
    if (!pendingList) return;
    pendingList.innerHTML = snapshot.empty ? "<p>Aucun avis à modérer.</p>" : "";
    
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        pendingList.innerHTML += `
            <div class="pending-item">
                <p><strong>${data.name}</strong> : ${data.message}</p>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="approveReview('${id}')">Approuver</button>
                    <button class="delete-btn" onclick="deleteReview('${id}')">Supprimer</button>
                </div>
            </div>`;
    });
});

window.approveReview = async (id) => {
    await updateDoc(doc(db, "testimonials", id), { status: "approved" });
};

window.deleteReview = async (id) => {
    if(confirm("Supprimer cet avis ?")) await deleteDoc(doc(db, "testimonials", id));
};