/* ==================== GESTION SECTION À PROPOS ==================== */
// Charge et affiche le contenu "À Propos" depuis Firestore
// Permet aux admins de modifier le contenu

let aboutData = null;
let statsData = [];

/**
 * Initialise le chargement du contenu "À propos"
 * IMPORTANT: Attend que Firebase soit prêt!
 */
async function loadAboutSection() {
    console.log('📖 Chargement de la section À Propos...');
    
    try {
        // ⏳ ATTENDRE que les fonctions Firestore soient disponibles
        let retries = 0;
        while (!window.collection || typeof window.collection !== 'function') {
            if (retries > 50) {
                console.error('❌ Timeout: collection function pas disponible');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        const db = window.firebaseDb;
        const col = window.collection;
        const q = window.query;
        const ord = window.orderBy;
        const snap = window.onSnapshot;
        
        // Charger le contenu principal "À propos"
        const aboutCollection = window.collection(db, 'about');
        const aboutQuery = window.query(aboutCollection, window.orderBy('createdAt', 'desc'));
        
        window.onSnapshot(aboutQuery, (snapshot) => {
            if (!snapshot.empty) {
                aboutData = snapshot.docs[0].data();
                aboutData.id = snapshot.docs[0].id;
                displayAboutContent();
            } else {
                // Initialiser avec du contenu par défaut SEULEMENT si admin
                if (window.isAdmin) {
                    initializeDefaultAbout();
                } else {
                    console.log('⚠️ Collection vide - attendez que l\'admin ajoute du contenu');
                }
            }
        });

        // Charger les statistiques
        const statsCollection = window.collection(db, 'stats');
        window.onSnapshot(statsCollection, (snapshot) => {
            statsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => (a.order || 0) - (b.order || 0));
            
            displayAboutStats();
        });
    } catch (error) {
        console.error('❌ Erreur chargement À propos:', error);
    }
}

/**
 * Affiche le contenu "À propos" sur la page publique
 */
function displayAboutContent() {
    const container = document.getElementById('about-content-dynamic');
    if (!container || !aboutData) return;

    let html = '';

    // Section: Qui suis-je?
    if (aboutData.who) {
        html += `
            <h3>🎯 Qui suis-je?</h3>
            <p>${aboutData.who.replace(/\n/g, '<br>')}</p>
        `;
    }

    // Section: Mon Parcours
    if (aboutData.journey) {
        html += `
            <h3>💼 Mon Parcours</h3>
            <p>${aboutData.journey.replace(/\n/g, '<br>')}</p>
        `;
    }

    // Section: Ma Mission
    if (aboutData.mission) {
        html += `
            <h3>🎯 Ma Mission</h3>
            <p>${aboutData.mission.replace(/\n/g, '<br>')}</p>
        `;
    }

    // Section: Mes Valeurs (Approche)
    if (aboutData.values && aboutData.values.length > 0) {
        html += `
            <h3>⚙️ Mon Approche</h3>
            <ul style="color: #fff; font-size: 1.1rem; line-height: 2.5; margin: 1.5rem 0;">
        `;
        
        aboutData.values.forEach(value => {
            html += `<li><strong>${value}</strong></li>`;
        });

        html += `</ul>`;
    }

    // Section: Spécialisations (si disponible)
    if (aboutData.specializations && aboutData.specializations.length > 0) {
        html += `
            <h3>🌟 Spécialisations Clés</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
        `;

        aboutData.specializations.forEach(spec => {
            html += `
                <div style="padding: 1.2rem; background: rgba(14, 239, 239, 0.05); border-radius: 0.8rem; border-top: 3px solid #0ef;">
                    <p style="margin: 0;">${spec}</p>
                </div>
            `;
        });

        html += `</div>`;
    }

    container.innerHTML = html;
    console.log('✅ Contenu À Propos affiché');
}

/**
 * Affiche les statistiques
 */
function displayAboutStats() {
    const container = document.getElementById('about-stats-dynamic');
    if (!container || statsData.length === 0) return;

    let html = '';
    statsData.forEach(stat => {
        html += `
            <div class="stat-box">
                <h4>${stat.number}</h4>
                <p>${stat.label}</p>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('✅ Statistiques affichées');
}

async function initializeDefaultAbout() {
    if (!window.isAdmin) {
        // Pas d'erreur - juste retourner silencieusement pour les utilisateurs non-admin
        return;
    }
    
    console.log('📝 Initialisation du contenu par défaut...');
    
    const defaultAbout = {
        who: "Je m'appelle Valdes Kuete, et je suis un expert en maintenance informatique, réseaux et sécurité IT basé à Douala, au Cameroun. Fort de plus de 5 ans d'expérience, j'accompagne les entreprises et les particuliers pour sécuriser, optimiser et maintenir leurs infrastructures informatiques. Ma spécialité ? Transformer vos défis technologiques en opportunités de croissance.",
        journey: "Mon parcours professionnel a commencé en tant que technicien de support utilisateur, où j'ai appris à écouter et à résoudre les problèmes du terrain. Progressivement, j'ai étendu mes compétences vers l'infrastructure IT avancée et la sécurité informatique. Cette progression m'a donné une perspective unique : comprendre vos enjeux from user experience to architectural complexity.",
        mission: "Mon objectif n'est pas simplement de réparer vos ordinateurs, mais de transformer la technologie en atout stratégique pour votre entreprise. Je crois en construire des partenariats durables, basés sur la confiance mutuelle, la transparence et surtout sur des résultats mesurables qui impactent directement votre bottom line.",
        values: [
            "🔍 Diagnostic approfondi - Analyser avant d'agir, comprendre vos vrais enjeux",
            "🛠️ Solutions pérennes - Pas de rustines temporaires, du vrai travail professionnel",
            "🛡️ Sécurité proactive - Prévenir les incidents avant qu'ils ne vous coûtent cher",
            "💬 Communication claire - Explications en français simple, zéro jargon incompréhensible",
            "💰 Tarification transparente - Prix justes, pas de surprise à la facture",
            "📱 Disponibilité réelle - Support réactif, vraie assistance (pas de boîte vocale)"
        ],
        specializations: [
            "🖥️ Infrastructure IT - Serveurs, stockage, virtualisation, backup, continuité de service",
            "🔒 Sécurité Informatique - Audit, firewall, antivirus, conformité, protection des données",
            "🌐 Réseaux - LAN/WAN, configuration, diagnostic, optimisation, support 24/7",
            "💾 Récupération Données - Disques endommagés, suppression accidentelle, forensique"
        ],
        createdAt: new Date()
    };

    try {
        await window.addDoc(window.collection(window.firebaseDb, 'about'), defaultAbout);
        console.log('✅ Contenu par défaut créé');
    } catch (error) {
        console.error('⚠️ Erreur création contenu (permissions refusées):', error.message);
        // Ne pas relancer - c'est normal si pas authentifié
    }
}

/**
 * Interface Admin: Charge les données actuelles pour édition
 */
async function loadAboutFormForAdmin() {
    console.log('📝 Chargement du formulaire admin...');
    
    try {
        // Charger les données actuelles
        const aboutCollection = window.collection(window.firebaseDb, 'about');
        const snapshot = await window.getDocs(window.query(aboutCollection, window.orderBy('createdAt', 'desc')));
        
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            document.getElementById('about-who').value = data.who || '';
            document.getElementById('about-journey').value = data.journey || '';
            document.getElementById('about-mission').value = data.mission || '';
            
            // Les valeurs sont stockées avec des emojis, on les rejoint
            if (data.values) {
                document.getElementById('about-values').value = data.values.join(' | ');
            }
        }

        // Charger et afficher les statistiques admin
        loadStatsForAdmin();
    } catch (error) {
        console.error('❌ Erreur chargement formulaire:', error);
    }
}

/**
 * Sauvegarde le contenu "À propos" depuis le formulaire admin
 * Avec amélioration IA optionnelle via Gemini
 */
async function saveAboutContent(e) {
    e.preventDefault();
    
    // Vérifier l'authentification
    try {
        const user = window.currentUser;
        if (!user) {
            alert('❌ Vous devez être connecté comme admin');
            console.error('Erreur: Pas d\'utilisateur authentifié');
            return;
        }

        // Vérifier que c'est l'admin (UID exact)
        if (user.uid !== "D6QdYhxO71OCvYmZcrqqrpOHpyP2") {
            alert('❌ Accès admin requis. UID ' + user.uid + ' n\'a pas de permissions');
            console.error('Erreur: UID incorrect - ' + user.uid);
            return;
        }
    } catch (error) {
        alert('❌ Erreur authentification: ' + error.message);
        console.error('Erreur auth:', error);
        return;
    }

    try {
        let data = {
            who: document.getElementById('about-who').value || '',
            journey: document.getElementById('about-journey').value || '',
            mission: document.getElementById('about-mission').value || '',
            values: document.getElementById('about-values').value
                .split('|')
                .map(v => v.trim())
                .filter(v => v.length > 0),
            updatedAt: serverTimestamp()
        };

        if (data.who.trim() === '' && data.journey.trim() === '' && data.mission.trim() === '') {
            alert('⚠️ Veuillez remplir au moins un champ');
            return;
        }

        // 🤖 AMÉLIORER LE CONTENU AVEC GEMINI (si disponible)
        if (window.GeminiAI) {
            console.log('🤖 Amélioration contenu avec IA...');
            
            // Améliorer la mission (plus important)
            if (data.mission && data.mission.length > 30) {
                const missionImprovement = await window.GeminiAI.improveContent(data.mission, 'about');
                if (missionImprovement && missionImprovement.improved) {
                    data.mission = missionImprovement.improved;
                    data.missionKeywords = missionImprovement.keywords || [];
                    console.log('✅ Mission améliorée');
                }
            }

            // Améliorer le "who"
            if (data.who && data.who.length > 30) {
                const whoImprovement = await window.GeminiAI.improveContent(data.who, 'about');
                if (whoImprovement && whoImprovement.improved) {
                    data.who = whoImprovement.improved;
                    data.whoKeywords = whoImprovement.keywords || [];
                }
            }

            // Vérifier conformité RGPD
            const fullText = [data.who, data.journey, data.mission].join(' ');
            const compliance = await window.GeminiAI.checkRGPDCompliance(fullText);
            if (compliance && !compliance.isCompliant && compliance.anonymized_text) {
                console.log('⚠️ Contenu anonymisé pour RGPD');
                data.mission = compliance.anonymized_text;
            }
        }

        // Chercher et mettre à jour le document existant
        const aboutCollection = window.collection(window.firebaseDb, 'about');
        const snapshot = await window.getDocs(aboutCollection);
        
        if (!snapshot.empty) {
            // Mettre à jour le premier document
            const docId = snapshot.docs[0].id;
            console.log('📝 Mise à jour du document:', docId);
            await window.updateDoc(window.doc(window.firebaseDb, 'about', docId), data);
            console.log('✅ Contenu À Propos mis à jour');
            alert('✅ Section À Propos enregistrée! (contenu amélioré avec IA)');
        } else {
            // Créer un nouveau document
            data.createdAt = window.serverTimestamp();
            console.log('📝 Création nouveau document about');
            const docRef = await window.addDoc(aboutCollection, data);
            console.log('✅ Contenu À Propos créé:', docRef.id);
            alert('✅ Section À Propos créée! (contenu amélioré avec IA)');
        }

        // Recharger les données affichées
        setTimeout(() => {
            loadAboutSection();
        }, 500);

    } catch (error) {
        console.error('❌ Erreur sauvegarde détaillée:', {
            code: error.code,
            message: error.message,
            fullError: error
        });
        
        if (error.code === 'permission-denied') {
            alert('❌ Permission refusée. Vérifiez que vous êtes connecté avec le bon compte admin.');
        } else {
            alert('❌ Erreur lors de la sauvegarde:\n' + error.message);
        }
    }
}

/**
 * Charge les statistiques pour l'admin
 */
async function loadStatsForAdmin() {
    console.log('📊 Chargement des statistiques admin...');
    
    try {
        const statsCollection = window.collection(window.firebaseDb, 'stats');
        const snapshot = await window.getDocs(statsCollection);
        
        const container = document.getElementById('about-stats-admin');
        if (!container) return;

        let html = '';
        snapshot.docs.forEach(doc => {
            const stat = doc.data();
            html += `
                <div style="padding: 1rem; background: rgba(14, 239, 239, 0.1); border-radius: 0.8rem; position: relative;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #0ef;">${stat.number}</h5>
                    <p style="margin: 0 0 0.5rem 0; color: #fff;">${stat.label}</p>
                    <button type="button" class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: #ff3333;" onclick="deleteStatistic('${doc.id}')">Supprimer</button>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="color: #888;">Aucune statistique yet</p>';
    } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
    }
}

/**
 * Ajoute une nouvelle statistique
 */
async function addStatistic(e) {
    e.preventDefault();
    
    if (!window.isAdmin) {
        alert('❌ Accès admin requis');
        return;
    }

    try {
        const number = document.getElementById('stat-number').value.trim();
        const label = document.getElementById('stat-label').value.trim();

        if (!number || !label) {
            alert('⚠️ Veuillez remplir tous les champs');
            return;
        }

        // Compter les stats existantes pour l'ordre
        const statsCollection = window.collection(window.firebaseDb, 'stats');
        const snapshot = await window.getDocs(statsCollection);
        const order = snapshot.size;

        await window.addDoc(statsCollection, {
            number,
            label,
            order,
            createdAt: new Date()
        });

        // Réinitialiser le formulaire
        document.getElementById('stat-number').value = '';
        document.getElementById('stat-label').value = '';

        // Recharger la liste
        loadStatsForAdmin();
        console.log('✅ Statistique ajoutée');
        alert('✅ Statistique ajoutée!');
    } catch (error) {
        console.error('❌ Erreur ajout stat:', error);
        alert('Erreur lors de l\'ajout');
    }
}

/**
 * Supprime une statistique
 */
async function deleteStatistic(statId) {
    if (!window.isAdmin) {
        alert('❌ Accès admin requis');
        return;
    }

    if (!confirm('Supprimer cette statistique?')) return;

    try {
        await window.deleteDoc(window.doc(window.firebaseDb, 'stats', statId));
        loadStatsForAdmin();
        console.log('✅ Statistique supprimée');
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        alert('Erreur lors de la suppression');
    }
}

/**
 * Initialise les écouteurs d'événements
 */
function initAboutManager() {
    console.log('🎯 Initialisation gestionnaire À Propos...');

    // Formulaire À propos (admin)
    const aboutForm = document.getElementById('about-form');
    if (aboutForm) {
        aboutForm.addEventListener('submit', saveAboutContent);
    }

    // Formulaire statistiques (admin)
    const statsForm = document.getElementById('stats-form');
    if (statsForm) {
        statsForm.addEventListener('submit', addStatistic);
    }

    // Charger au démarrage
    loadAboutSection();
    
    // Charger les données pour l'admin si connecté
    if (window.isAdmin) {
        setTimeout(loadAboutFormForAdmin, 1000);
    }

    console.log('✅ Gestionnaire À Propos initialisé');
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutManager);
} else {
    initAboutManager();
}

// Exporter les fonctions pour utilisation globale
window.AboutManager = {
    loadAboutSection,
    displayAboutContent,
    displayAboutStats,
    saveAboutContent,
    addStatistic,
    deleteStatistic,
    loadAboutFormForAdmin,
    loadStatsForAdmin
};
