/**
 * Init Users Role Collection
 * À exécuter UNE FOIS pour créer les profils users avec role='user' ou role='admin'
 * 
 * Usage depuis la console Firebase ou un script:
 * 1. Copier le code dans Firebase Console > Functions > Deploy
 * 2. Ou exécuter ce script en local avec Admin SDK
 */

// Pour exécuter en local (nécessite Firebase Admin SDK):
// npm install firebase-admin
// export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
// node init-users-role.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (si pas déjà initialisé)
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// 🔐 Liste des admins (doit être synchronisée avec firestore.rules)
const ADMIN_EMAILS = [
    'admin@valde-tech.com',
    // Ajouter d'autres admins ici
];

/**
 * Créer ou mettre à jour un profil utilisateur
 */
async function createUserProfile(uid, email, role = 'user') {
    try {
        const userRef = db.collection('users').doc(uid);
        const docSnap = await userRef.get();
        
        if (!docSnap.exists) {
            // Créer le profil s'il n'existe pas
            await userRef.set({
                uid: uid,
                email: email,
                role: role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Créé: ${email} (${role})`);
        } else {
            // Mettre à jour si existe déjà
            await userRef.update({
                role: role,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`🔄 Mis à jour: ${email} (${role})`);
        }
    } catch (error) {
        console.error(`❌ Erreur pour ${email}:`, error);
    }
}

/**
 * Récupérer tous les utilisateurs et créer leurs profils
 */
async function initializeAllUsers() {
    try {
        console.log('🔄 Récupération des utilisateurs Firebase Auth...\n');
        
        const usersResult = await admin.auth().listUsers(1000);
        let adminCount = 0;
        let userCount = 0;

        for (const user of usersResult.users) {
            const isAdmin = ADMIN_EMAILS.includes(user.email);
            const role = isAdmin ? 'admin' : 'user';
            
            await createUserProfile(user.uid, user.email, role);
            
            if (isAdmin) adminCount++;
            else userCount++;
        }

        console.log(`\n📊 Résumé:`);
        console.log(`   ✅ Admins créés: ${adminCount}`);
        console.log(`   👤 Users créés: ${userCount}`);
        console.log(`   📝 Total: ${adminCount + userCount}`);
        
        console.log('\n✨ Initialisation complétée!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        process.exit(1);
    }
}

// Lancer l'initialisation
console.log('🚀 Initialisation des profils utilisateurs...\n');
initializeAllUsers();
