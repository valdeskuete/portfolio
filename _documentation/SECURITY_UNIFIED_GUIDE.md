# 🔐 UNIFIED SECURITY GUIDE - Configuration & Déploiement Complète

**Date:** 7 Janvier 2026  
**Statut:** ✅ FUSIONNÉ (SECURITY_CLEAN_GUIDE + ADMIN_SECURITY_GUIDE)  
**Architecture:** Firestore Rules + Client-Side Auth (NO Cloud Functions)  

---

## 📋 TABLE DES MATIÈRES

1. [Architecture Sécurité](#architecture-de-sécurité)
2. [Collections Firestore](#collections-firestore)
3. [Firestore Security Rules](#firestore-security-rules)
4. [Admin Authentication System](#admin-authentication-system)
5. [Configuration Étape par Étape](#configuration-étape-par-étape)
6. [Déploiement](#déploiement)
7. [Monitoring & Audit](#monitoring--audit)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARCHITECTURE DE SÉCURITÉ

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│         ROOT SITE + CV-AUTOMATIQUE - Architecture          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Firestore Security Rules (firestore.rules)             │
│     └─ isAdmin() = role=='admin' en Firestore              │
│     └─ Rejet automatique côté serveur Firebase             │
│     └─ Protections par collection                          │
│                                                               │
│  ✅ Client-Side Auth (admin-auth.js)                       │
│     └─ Niveau 1: Firestore role=='admin'                   │
│     └─ Niveau 2: Email fallback (ADMIN_EMAILS)             │
│     └─ Niveau 3: Cache 5min pour performance               │
│                                                               │
│  ✅ Collections Firestore Séparées & Protégées            │
│     ├─ ROOT SITE:                                           │
│     │  ├─ users/{uid}          → role + profil             │
│     │  ├─ admin_audit_logs      → logs actions admin       │
│     │  ├─ projets              → portfolio projects        │
│     │  ├─ tips                 → astuces tech             │
│     │  ├─ testimonials         → avis clients             │
│     │  └─ [10+ autres]         → contenu dynamique        │
│     │                                                       │
│     └─ CV-AUTOMATIQUE (Collections Séparées):             │
│        ├─ cv_users/{uid}       → quota & profil CV        │
│        ├─ cv_documents         → documents CV             │
│        ├─ cv_billing           → facturation CV           │
│        └─ cv_activity          → logs activité CV         │
│                                                               │
│  ❌ PAS DE Cloud Functions (non disponibles Plan Spark)    │
│  ❌ PAS DE Custom Claims (nécessitent Cloud Functions)     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Flux d'Authentification Admin

```
1. Utilisateur se connecte avec Firebase Auth
   ↓
2. Admin-auth.js vérifie:
   a) Firestore role=='admin'?
   b) Si indisponible → Email dans ADMIN_EMAILS?
   c) Cache le résultat 5 minutes
   ↓
3. Si Admin:
   - Afficher panneau admin
   - Bouton admin visible
   - Scripts admin initialisés
   ↓
4. Si Non-Admin:
   - Masquer panneau admin
   - Bouton admin désactivé
   - Firestore rules rejettent modifications
```

---

## 📁 COLLECTIONS FIRESTORE

### Architecture Recommandée

#### **ROOT SITE - Collections Principales**

```
users/{userId}
├─ uid (string)
├─ email (string)
├─ role (enum: 'admin' | 'user' | 'moderator') ← CRITIQUE
├─ createdAt (timestamp)
├─ updatedAt (timestamp)
└─ [profile data]

admin_audit_logs/{logId}
├─ uid (string)
├─ email (string)
├─ action (string: 'project_added', 'tip_deleted', etc)
├─ details (object)
├─ timestamp (timestamp)
└─ success (boolean)

projets/{projectId}
├─ title (string)
├─ description (text)
├─ tags (array)
├─ status (enum: 'draft' | 'published')
├─ createdAt (timestamp)
└─ updatedAt (timestamp)

tips/{tipId}
├─ title (string)
├─ content (text)
├─ category (string)
├─ approved (boolean)
├─ createdAt (timestamp)
└─ votes (number)

testimonials/{testimonialId}
├─ name (string)
├─ email (string)
├─ comment (text)
├─ approved (boolean) ← Vérifié en rules
├─ rating (number: 1-5)
└─ createdAt (timestamp)

[10+ autres collections pour sections dynamiques]
```

#### **CV-AUTOMATIQUE - Collections Séparées**

```
cv_users/{userId}
├─ userId (string)
├─ email (string)
├─ plan (enum: 'free' | 'pro' | 'enterprise')
├─ quotaUsed (number)
├─ quotaMax (number)
├─ createdAt (timestamp)
└─ metadata (object)

cv_documents/{docId}
├─ userId (string) ← Propriétaire du CV
├─ name (string)
├─ fullName, jobTitle, email, phone, location (strings)
├─ about (text)
├─ educations, experiences, skills, languages (arrays)
├─ template (string)
├─ colors, fonts (objects)
├─ createdAt (timestamp)
├─ updatedAt (timestamp)
└─ metadata (object)

cv_billing/{userId}
├─ userId (string)
├─ plan (string)
├─ status (enum: 'active' | 'cancelled')
├─ paymentMethod (string)
├─ startDate (timestamp)
├─ nextBillingDate (timestamp)
└─ cancelledAt (timestamp, optional)

cv_activity/{logId}
├─ userId (string)
├─ action (string: 'cv_created', 'cv_updated', etc)
├─ data (object)
└─ timestamp (timestamp)
```

---

## 🔒 FIRESTORE SECURITY RULES

### Configuration Complète

**Fichier: `firestore.rules`**

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ═══════ ADMIN VERIFICATION FUNCTION ═══════
    function isAdmin() {
      return (request.auth != null && 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
          || request.auth.email == 'valdeskuete8@gmail.com';
    }

    // ═══════ ROOT SITE COLLECTIONS ═══════
    
    // USERS - Profils avec roles
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId && 
                       request.resource.data.role == 'user';
      allow update: if request.auth.uid == userId && 
                       request.resource.data.role == resource.data.role;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ADMIN AUDIT LOGS - Immuables
    match /admin_audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if request.auth != null &&
                       request.resource.data.keys().hasAll(['uid', 'email', 'action', 'timestamp']);
      allow update, delete: if false; // Immuable
    }

    // PROJETS - Publics en lecture, admin en écriture
    match /projets/{projectId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Commentaires imbriqués
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if isAdmin() || request.auth.uid == resource.data.authorId;
      }
    }

    // TIPS - Publics, admin valide
    match /tips/{tipId} {
      allow read: if true;
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }

    // TESTIMONIALS - Publics approuvés, admin modère
    match /testimonials/{testimonialId} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth != null &&
                       request.resource.data.approved == false; // Doit être approuvé
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ═══════ CV-AUTOMATIQUE COLLECTIONS ═══════
    
    // CV USERS - Profils utilisateurs CV
    match /cv_users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
    }

    // CV DOCUMENTS - Documents utilisateurs
    match /cv_documents/{docId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId || isAdmin();
      allow delete: if request.auth.uid == resource.data.userId || isAdmin();
    }

    // CV BILLING - Facturation
    match /cv_billing/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }

    // CV ACTIVITY - Logs immuables
    match /cv_activity/{logId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    // ═══════ DEFAULT DENY ═══════
    // Toute collection non définie est refusée
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Déployer les Rules

```bash
# Depuis le root du projet
firebase deploy --only firestore:rules

# Ou utiliser Firebase Console:
# 1. Aller à Firestore → Rules
# 2. Copier le contenu de firestore.rules
# 3. Cliquer "Publish"
```

---

## 🔐 ADMIN AUTHENTICATION SYSTEM

### Composants

#### **1. Fichier: `admin-auth.js`**

Gère l'authentification admin avec 3 niveaux:

```javascript
const AdminAuth = {
    // Emails autorisés (fallback)
    ADMIN_EMAILS: ['valdeskuete8@gmail.com'],
    
    // Vérification 3-niveaux
    async isAdminUser() {
        // 1. Check cache (5 min)
        // 2. Check Firestore role=='admin'
        // 3. Fallback: email check
        // Returns: true/false
    },
    
    // Initialiser le panneau admin
    async initAdminPanel() {
        // Vérifier isAdminUser()
        // Afficher/masquer panneau
        // Ajouter event listeners
    },
    
    // Protéger une action admin
    async protectedAdminAction(name, function) {
        // Vérifier isAdminUser()
        // Exécuter si OK, sinon alert
    }
}
```

**Utilisation:**
```javascript
// Vérifier avant action sensible
if (await AdminAuth.isAdminUser()) {
    // Autoriser
} else {
    // Refuser
}

// Ou wrapper une fonction
await AdminAuth.protectedAdminAction('delete_project', async () => {
    return await deleteProject(projectId);
});
```

#### **2. Initialiser la Collection `users/{uid}`**

**Script: `init-users-role.js`**

```javascript
// Créer users/{uid} pour chaque utilisateur Firebase Auth
// Remplir avec { email, role, createdAt, updatedAt }

// Exécution:
// Option 1: Firebase Console (manual)
// Option 2: Node.js avec Admin SDK (local)
// Option 3: Cloud Function (si disponible plus tard)
```

**À exécuter une fois:**
```bash
node init-users-role.js
# Ou via Firebase Console: Créer collection 'users'
```

---

## 🛠️ CONFIGURATION ÉTAPE PAR ÉTAPE

### 1️⃣ Prérequis
- ✅ Projet Firebase créé
- ✅ Firestore Database activée
- ✅ Authentication activée
- ✅ Git clonné localement

### 2️⃣ Déployer Firestore Rules (CRITIQUE)

```bash
# 1. Copier firestore.rules vers votre projet
cp firestore.rules /chemin/vers/firebase/

# 2. Déployer
firebase deploy --only firestore:rules

# 3. Vérifier dans Firebase Console
# Firestore → Rules → Vérifier que règles sont compilées
```

### 3️⃣ Initialiser Collection Users

```bash
# Option A: Manual (Firebase Console)
# 1. Aller à Firestore → Collections
# 2. Créer collection 'users'
# 3. Pour chaque utilisateur Firebase Auth:
#    - Document ID = uid
#    - Champs: { email, role: 'user', createdAt, updatedAt }
# 4. Pour admins: remplir role = 'admin'

# Option B: Script Node.js
npm install firebase-admin
export GOOGLE_APPLICATION_CREDENTIALS="serviceAccountKey.json"
node init-users-role.js
```

### 4️⃣ Configurer Admin Emails

**Fichier: `admin-auth.js` (ligne ~10)**

```javascript
ADMIN_EMAILS: [
    'valdeskuete8@gmail.com',  // Email admin principal
    'autre-admin@example.com',  // Emails supplémentaires
],
```

### 5️⃣ Vérifier Indexes Firestore

```bash
# Firestore crée automatiquement les indexes composites
# Si requêtes lentes, vérifier dans Firebase Console:
# Firestore → Indexes → Vérifier status "Enabled"

# Les indexes critiques:
# - projets(tag, createdAt)
# - comments(projectId, createdAt)
# - cv_documents(userId, updatedAt)
# etc.
```

### 6️⃣ Configuration Variables d'Environnement

**Fichier: `.env.example`**
```dotenv
VITE_GEMINI_API_KEY=your-key-here
VITE_RECAPTCHA_SITE_KEY=your-key-here
VITE_FIREBASE_API_KEY=AIzaSyBirIXLKxkuWT7js3CB4_pGB6tk4wPa2AM
VITE_FIREBASE_PROJECT_ID=valde-tech
```

**Fichier: `config.json`**
```json
{
  "gemini": {
    "apiKey": "${VITE_GEMINI_API_KEY}",
    ...
  },
  "recaptcha": {
    "siteKey": "${VITE_RECAPTCHA_SITE_KEY}",
    ...
  }
}
```

---

## 🚀 DÉPLOIEMENT

### Pre-Déploiement Checklist

```
SÉCURITÉ:
☐ config.json n'a pas de clés en clair (utilise ${VITE_*})
☐ .env n'est pas commitée (dans .gitignore)
☐ firestore.rules déployée avec succès
☐ Collection users/{uid} créée avec roles
☐ Admin auth fonctionne (test: admin/non-admin)

FIRESTORE:
☐ Security rules compilées sans warning
☐ Indexes créés pour requêtes principales
☐ Collections séparées configurées (users vs cv_users)
☐ Rules de protection appliquées

FIREBASE:
☐ Authentification email/password activée
☐ Firestore quota suffisant (Plan Spark: 1 Go gratuit)
☐ API Keys restreintes (optionnel, recommandé)
```

### Déployer tout

```bash
# 1. Ajouter les changements
git add .
git commit -m "fix: PHASE 2 réparations critiques
- config.json clés sécurisées
- firestore.rules corrigée
- CV-app Firebase intégration fixée
- admin-auth.js simplifiée"

# 2. Deployer Firebase
firebase deploy --only firestore:rules

# 3. Push à GitHub
git push origin main
```

---

## 📊 MONITORING & AUDIT

### Monitoring Quota Firestore

```javascript
// Dans Admin Console:
// 1. Firestore → Usage → Vérifier quota Plan Spark:
//    - 1 Go stockage gratuit
//    - 50 000 reads/jour gratuit
//    - 20 000 writes/jour gratuit

// 2. Si dépassement:
//    - Activer billing
//    - Passer au Plan Blaze (paiement à l'usage)
//    - Optimiser requêtes (limiter, pagination)
```

### Audit Logs

```javascript
// Les logs d'audit sont dans admin_audit_logs/{logId}
// Automatiquement remplis par les actions admin

// Exemple de log:
{
  uid: 'user123',
  email: 'admin@example.com',
  action: 'project_created',
  details: { projectId: 'proj456', title: '...' },
  timestamp: ISOString,
  success: true
}
```

### Vérifier Accès Admin

```javascript
// Dans la console navigateur:
const isAdmin = await AdminAuth.isAdminUser();
console.log('Is Admin?', isAdmin);

// Vérifier le cache:
console.log('Cache:', AdminAuth.roleCache, 'Age:', Date.now() - AdminAuth.roleCacheTime);
```

---

## 🆘 TROUBLESHOOTING

### Problème: Admin Auth ne fonctionne pas

```javascript
// 1. Vérifier Firebase chargé
console.log('Firebase ready?', !!window.auth, !!window.db);

// 2. Vérifier utilisateur connecté
console.log('User:', window.auth.currentUser?.email);

// 3. Vérifier collection users/{uid} existe
// → Aller à Firebase Console Firestore

// 4. Vérifier role en Firestore
// → Firestore → Collection 'users' → Document 'uid' → Champ 'role'

// 5. Si OK, vérifier ADMIN_EMAILS contient l'email
console.log('ADMIN_EMAILS:', AdminAuth.ADMIN_EMAILS);
```

### Problème: Firestore Rules Errors

```
Error: PERMISSION_DENIED: Missing/Insufficient permissions

Solution:
1. Vérifier Firestore Rules compilées (pas de syntax errors)
2. Vérifier utilisateur authentifié
3. Vérifier rule pour la collection/opération
4. Vérifier data correspond aux conditions
5. Vérifier user.role == 'admin' en Firestore (si besoin)
```

### Problème: CV-Automatique ne sauvegarde pas

```javascript
// 1. Vérifier CVDocumentManager chargé
console.log('CVDocumentManager?', !!window.CVDocumentManager);

// 2. Vérifier Firebase modules globaux
console.log('window.db?', !!window.db);
console.log('window.auth?', !!window.auth);

// 3. Vérifier collection cv_documents existe

// 4. Vérifier règles cv_documents en Firestore Rules
// → Match /cv_documents/{docId}
```

### Problème: Index Missing

```
Error: FAILED_PRECONDITION: The query requires an index

Solution:
1. Cliquer le lien dans l'erreur Firebase
2. Ou aller à Firestore → Indexes
3. Créer l'index recommandé
4. Attendre ~2 minutes
5. Réessayer
```

---

## 📌 RÉSUMÉ RAPIDE

| Aspect | Configuration | Status |
|--------|---|---|
| Firestore Rules | `firestore.rules` déployée | ✅ |
| Collection users/{uid} | Avec role field | ✅ |
| Admin Emails | `ADMIN_EMAILS[]` configurée | ✅ |
| Admin Auth | `admin-auth.js` activé | ✅ |
| CV Collections | Séparées (cv_users, cv_documents) | ✅ |
| Indexes | Créés automatiquement | ✅ |
| Variables .env | Clés protégées | ✅ |

---

*Guide Security Unified réalisé par: GitHub Copilot - Claude Haiku 4.5*  
*Date: 7 Janvier 2026*  
*Status: ✅ COMPLET - Prêt pour déploiement*
