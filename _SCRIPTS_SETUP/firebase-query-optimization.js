// ==================== FIREBASE QUERY OPTIMIZATION ====================
// Recommandations pour optimiser les requêtes Firestore
// Generated: 7 janvier 2026

/* ==================== PROBLÈME #1: TESTIMONIALS SANS FILTER ====================
ACTUEL (inefficace):
  onSnapshot(query(collection(db, "testimonials"), orderBy("date", "desc")), snap => {
      testimonials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

PROBLÈME:
  - Récupère TOUS les témoignages (approuvés ET non-approuvés)
  - Charge inutile sur la bande passante
  - Firestore ne peut pas filtrer client-side automatiquement
  - Règles de sécurité masquent les non-approuvés, mais requête récupère quand même

SOLUTION OPTIMISÉE:
  onSnapshot(
      query(
          collection(db, "testimonials"),
          where("approved", "==", true),
          orderBy("date", "desc")
      ),
      snap => {
          testimonials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
  );

BÉNÉFICE:
  ✅ Firestore filtre côté serveur
  ✅ Moins de données transmises
  ✅ Index testimonials déjà existant supporte cette requête
  ✅ Lecture facturée seulement pour documents approuvés
*/

/* ==================== PROBLÈME #2: MESSAGES SANS INDEX ====================
ACTUEL:
  const q = query(collection(db, "messages"), orderBy("date", "desc"));
  const snap = await getDocs(q);

PROBLÈME:
  - orderBy sur un champ sans where requiert un index composite si >100 docs
  - Sans index, Firestore crée automatiquement ou rejette la requête
  - Performance dégradée sur grandes collections

SOLUTION:
  Option A - Pour admin seulement (recommandé):
    const q = query(
        collection(db, "messages"),
        orderBy("date", "desc"),
        limit(50)  // Paginer les résultats
    );

  Option B - Ajouter index composite dans firestore.indexes.json:
    {
        "collectionGroup": "messages",
        "queryScope": "COLLECTION",
        "fields": [
            { "fieldPath": "date", "order": "DESCENDING" }
        ]
    }

BÉNÉFICE:
  ✅ Pagination améliore les perf et limite les coûts
  ✅ Utilisateurs ne voient que les 50 derniers messages
  ✅ Chargement plus rapide
*/

/* ==================== OPTIMISATION #3: PAGINATION ====================
POUR GRANDES COLLECTIONS (>100 docs):

Implémenter pagination:
  let firstPageQ = query(
      collection(db, "projets"),
      where("tag", "==", "web"),
      orderBy("date", "desc"),
      limit(20)
  );

  let firstSnap = await getDocs(firstPageQ);
  let lastVisible = firstSnap.docs[firstSnap.docs.length - 1];

  // Page suivante:
  let nextPageQ = query(
      collection(db, "projets"),
      where("tag", "==", "web"),
      orderBy("date", "desc"),
      startAfter(lastVisible),
      limit(20)
  );

BÉNÉFICE:
  ✅ Charge seulement 20 docs à la fois
  ✅ Meilleure réactivité UX
  ✅ Moins de coûts Firestore
  ✅ Permet le scroll infini
*/

/* ==================== OPTIMISATION #4: REAL-TIME LISTENERS ====================
ATTENTION: onSnapshot crée une connexion persistante

À UTILISER:
  ✅ Tips (mise à jour en temps réel souvent)
  ✅ Commentaires pour un projet (interactif)
  ✅ Testimonials (contenu public, peu changeant)

À ÉVITER:
  ❌ Messages d'admin (utilisé une fois - utiliser getDocs)
  ❌ Collections privées grandes (audit logs avec beaucoup d'items)

EXEMPLE CORRECT:
  // ✅ CORRECT - Tips changent rarement
  onSnapshot(
      query(collection(db, "tips"), orderBy("date", "desc"), limit(10)),
      snap => {
          tips = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
  );

  // ⚠️ À REVOIR - Messages devraient utiliser getDocs
  // (récupéré une seule fois au chargement du panel admin)
*/

/* ==================== CHECKLIST OPTIMISATION ====================
Avant de déployer une nouvelle requête:

□ Vérifier qu'il existe un index pour combos (where + orderBy)
□ Ajouter limit() pour éviter grandes récupérations
□ Utiliser onSnapshot seulement si contenu change souvent
□ Documenter les requêtes complexes
□ Tester avec Firestore Emulator localement
□ Monitorer usage via Firebase Console

Commandes utiles:
firebase emulators:start  // Pour développement local
firebase deploy --only firestore:indexes  // Déployer indexes
*/

// ==================== SUMMARY ====================
// ✅ 6 indexes existants - suffisants
// ⚠️ 2 requêtes à optimiser (testimonials, messages)
// 📈 Recommander pagination pour collections >100 docs
// 🔒 Règles de sécurité - validées et correctes
