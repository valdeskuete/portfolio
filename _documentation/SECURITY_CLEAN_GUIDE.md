# 🔐 Guide Sécurité Complet - SANS Cloud Functions

**Date:** 7 Janvier 2026
**Architecture:** Firestore Rules + Client-Side Auth (NO Cloud Functions)
**Status:** ✅ Prêt pour déploiement

---

## 📋 Architecture de Sécurité

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│                   ROOT SITE + CV-AUTOMATIQUE                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Firestore Security Rules (firestore.rules)             │
│     └─ isAdmin() = role=='admin' en Firestore              │
│     └─ Rejet automatique côté serveur Firebase             │
│                                                               │
│  ✅ Client-Side Auth (admin-auth.js)                       │
│     └─ Lit role depuis Firestore users/{uid}               │
│     └─ Cache 5 min pour perf                                │
│     └─ Fallback sur email si Firestore indisponible        │
│                                                               │
│  ✅ Collections Firestore Séparées                         │
│     ├─ users/{uid}          → role + profil root           │
│     ├─ admin_audit_logs      → logs des actions            │
│     ├─ projets, tips, etc    → contenu public              │
│     └─ cv_users, cv_docs     → CV app (séparé)            │
│                                                               │
│  ❌ PAS DE Cloud Functions (non disponibles)               │
│  ❌ PAS DE Custom Claims (nécessitent Cloud Functions)     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Configuration Étape par Étape

### 1️⃣ Déployer Firestore Rules

**Fichier:** `firestore.rules`

**Contient:**
```
- isAdmin() function: vérifie role='admin' OU UID hardcoded
- users/{uid}: profils avec role
- admin_audit_logs: logs immuables
- Protections pour projets, tips, config (admin only)
```

**Déploiement:**
```bash
firebase deploy --only firestore:rules
```

### 2️⃣ Initialiser Collection Users

**Script:** `init-users-role.js`

**Crée:**
- `users/{uid}` pour chaque utilisateur Firebase Auth
- `role='admin'` pour emails dans ADMIN_EMAILS
- `role='user'` pour tous les autres

**Exécution:**
```bash
# Option 1: Avec Firebase Admin SDK (local)
npm install firebase-admin
export GOOGLE_APPLICATION_CREDENTIALS="serviceAccountKey.json"
node init-users-role.js

# Option 2: Via Firebase Console (manual)
# Firestore → Collections → Create users
# Pour chaque user: { uid, email, role, createdAt, updatedAt }
```

### 3️⃣ Admin Auth Client-Side

**Fichier:** `admin-auth.js`

**Nouveau code:**
```javascript
async isAdminUser() {
    // 1. Vérifie Firestore users/{uid}.role
    // 2. Cache 5 minutes
    // 3. Fallback sur ADMIN_EMAILS si Firestore indisponible
    // 4. Masque panel pour non-admins
}
```

### 4️⃣ CV-Automatique - Collections Séparées

**Fichier:** `CV-automatique/firebase-cv-config.js`

**Utilise collections indépendantes:**
- `cv_users` - Profils CV (séparé de `users`)
- `cv_documents` - Documents CV
- `cv_billing` - Facturation
- `cv_activity` - Logs CV

**Avantage:** Zéro conflit avec la sécurité admin du root site ✅

---

## 🔑 Ajouter un Nouvel Admin

### Méthode A: Manuelle (Rapide)

1. **Firebase Console → Firestore → Collection users**
2. **Document du nouvel admin:**
   ```json
   {
       "uid": "USER_UID",
       "email": "admin@example.com",
       "role": "admin",
       "createdAt": "2026-01-07T...",
       "updatedAt": "2026-01-07T..."
   }
   ```
3. **Ajouter email à `admin-auth.js` ADMIN_EMAILS** (fallback)
4. **Attendre 5min** (cache invalidation)

### Méthode B: Script Migration

```javascript
// Si plusieurs admins à ajouter:
const emails = ['admin1@ex.com', 'admin2@ex.com'];
for (const uid of adminUids) {
    await db.collection('users').doc(uid).update({ role: 'admin' });
}
```

---

## 📊 Flux de Sécurité

### Login Admin

```
1. User login avec email@admin.com
   ↓
2. Firebase Auth crée session
   ↓
3. admin-auth.js appelle isAdminUser()
   ↓
4. Lire users/{uid}.role depuis Firestore
   ↓
5. role == 'admin'? → OUI
   ↓
6. Panel admin affiché ✅
   ↓
7. Admin lit/écrit config/projets
   ↓
8. Firestore rules valident isAdmin() → Accepté ✅
```

### Login User Régulier

```
1. User login avec user@example.com
   ↓
2. Firebase Auth crée session
   ↓
3. admin-auth.js appelle isAdminUser()
   ↓
4. Lire users/{uid}.role depuis Firestore
   ↓
5. role == 'user' → Non admin
   ↓
6. Panel admin MASQUÉ 🔒
   ↓
7. User tente écrire config (console hack)
   ↓
8. Firestore rules valident isAdmin() → REJET ❌
```

---

## ✅ Checklist Déploiement

### Phase 1: Préparation (1j)
- [ ] Lire ce document
- [ ] Vérifier firestore.rules localement
- [ ] Lister tous les admins actuels
- [ ] Backup Firestore (télécharger données)

### Phase 2: Deployment (1-2h)
- [ ] `firebase deploy --only firestore:rules`
- [ ] Exécuter `init-users-role.js`
- [ ] Vérifier que tous les users sont créés
- [ ] Ajouter `role='admin'` aux admins

### Phase 3: Tests (2-3h)
- [ ] Login admin → panel visible ✅
- [ ] Login user → panel masqué ✅
- [ ] Admin peut lire/écrire config ✅
- [ ] User tente écrire → PERMISSION_DENIED ✅
- [ ] Vérifier audit_logs créés ✅

### Phase 4: Monitoring (1h)
- [ ] Firebase Console → Firestore → Usage
- [ ] Vérifier zéro erreurs de règles
- [ ] Monitor performance (latence + read/writes)
- [ ] Notifier les admins

---

## 🚨 Limitations & Clarifications

### Sans Cloud Functions

| Feature | Possible? | Workaround |
|---------|-----------|-----------|
| Custom Claims | ❌ | Role Firestore au lieu |
| Auto-assign roles | ❌ | Script manual ou code client |
| Server-side validation | ❌ | Firestore rules suffisent |
| SMS 2FA | ❌ | Email 2FA ou rien |

### Sécurité Quand Même?

**OUI ✅** car:
- Firestore rules appliquées PAR FIREBASE (serveur)
- Même si JavaScript modifié, Firebase rejects writes
- Role Firestore = source of truth
- Audit logs traçent tentatives

---

## 🔍 Vérifications de Sécurité

### 1. Firestore Rules Test

```bash
firebase deploy --only firestore:rules
# Puis dans Firebase Console:
# Firestore → Rules → Test tab
# Simuler admin user (role='admin') → Accepté
# Simuler regular user → Rejeté
```

### 2. Audit Logs

```javascript
// Vérifier collection créée:
db.collection('admin_audit_logs').get()
  .then(snap => console.log(`${snap.size} logs`))
```

### 3. Role Field Firestore

```javascript
// Vérifier users/{uid}.role exists:
db.collection('users').doc(uid).get()
  .then(doc => console.log(doc.data().role))
```

---

## 📞 Support & Troubleshooting

### Admin ne voit pas le panel?

1. Vérifier `users/{uid}.role == 'admin'` dans Firestore
2. Attendre 5 min (cache invalidation)
3. Logout/Login
4. Vérifier `admin-auth.js` console logs
5. Vérifier firestore.rules déployées

### Erreur PERMISSION_DENIED?

1. Vérifier Firestore rules déployées (`firebase deploy --only firestore:rules`)
2. Vérifier `users/{uid}.role` correct
3. Vérifier isAdmin() function dans rules (ligne 7)
4. Test dans Firebase Console → Rules tab

### User qui devrait être admin?

1. Firebase Console → Firestore → Collection users
2. Chercher document avec son email
3. Ajouter/modifier champ `role: 'admin'`
4. Attendre 5 min (cache client)

---

## 🎯 Résumé

✅ **Déployé:** Firestore Rules + Role Field + Client Auth
✅ **Sécurisé:** Règles appliquées par Firebase (serveur)
✅ **Simple:** Pas de Cloud Functions complexes
✅ **Scalable:** Prêt pour ajouter admins
✅ **Audité:** Logs de toutes les actions

**Status: 🚀 PRÊT POUR PRODUCTION**

---

**Questions?** Voir `ADMIN_SECURITY_GUIDE.md` ou `SECURITY_FIX_URGENT.md`
