# 🚀 GUIDE DE DÉPLOIEMENT - PLAN SPARK (Sans Cloud Functions)

## 📋 PRÉ-DÉPLOIEMENT

### 1️⃣ Vérifier Configuration Locale

```bash
# S'assurer que tous les fichiers sont présents
ls -la d:\dev\portfolio\

# Vérifier que .env existe (avec placeholder)
cat .env
# Output: VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Vérifier que .env n'a PAS la vraie clé
grep "AIzaSy" .env
# Output: (vide - bon signe!)
```

### 2️⃣ Configurer la Clé Gemini Localement

```bash
# Option A: Directement dans .env (développement local)
echo "VITE_GEMINI_API_KEY=AIzaSy..." >> .env

# Option B: Via env-loader.js (recommandé - non-persistant)
# Ouvrir DevTools Console (F12)
# Taper: window.EnvLoader.set('VITE_GEMINI_API_KEY', 'AIzaSy...')
```

### 3️⃣ Tester Localement

```bash
# Lancer le serveur local (si vous en avez un)
npm run dev
# Ou ouvrir simplement index.html dans le navigateur

# Ouvrir DevTools (F12) → Console
# Vérifier les logs:
# ✅ [EnvLoader] Variables d'environnement chargées
# ✅ [Gemini] API configurée et prête
```

---

## 🔐 CONFIGURATION GOOGLE CLOUD (IMPORTANT!)

### Étape 1: Ajouter Restriction de Domaine

**Purpose**: Empêcher les autres sites d'utiliser votre clé API

1. Aller à: https://console.cloud.google.com/apis/credentials
2. Sélectionner le projet: **valde-tech**
3. Trouver votre clé API Gemini
4. Cliquer: **"Restrict key"**
5. Sous **"Application restrictions"**:
   - Sélectionner: **HTTP referrers (websites)**
6. Cliquer: **"Add an HTTP referrer"**
7. Ajouter:
   ```
   https://valde-tech.web.app/*
   https://localhost:*
   https://127.0.0.1:*
   ```
8. Cliquer: **"Save"**

**Résultat**: Clé ne fonctionne QUE depuis votre domaine ✅

---

## 🚀 DÉPLOIEMENT SUR FIREBASE HOSTING

### Étape 1: Préparer le Déploiement

```bash
# Depuis le dossier portfolio
cd d:\dev\portfolio

# Vérifier la configuration Firebase
firebase list
# Output: valde-tech    us-central1

# Vérifier qu'on est sur le bon projet
firebase use
# Output: valde-tech (default)
```

### Étape 2: Vérifier les Fichiers Critiques

```bash
# ✅ Ces fichiers DOIVENT exister:
ls -1 \
  index.html \
  manifest.json \
  service-worker.js \
  env-loader.js \
  gemini-config.js \
  firebase-config.js \
  gemini-ai.js
```

### Étape 3: Déployer Hosting

```bash
# Déployer seulement Hosting (pas de functions)
firebase deploy --only hosting

# Output attendu:
# ✔ Deploying hosting files from current folder...
# ✔ Firebase Hosting URLs:
# 	- https://valde-tech.web.app [default]
# 	- https://valde-tech.firebaseapp.com
```

### Étape 4: Vérifier Déploiement

```bash
# Ouvrir le site
start https://valde-tech.web.app

# Ouvrir DevTools (F12) → Console
# Chercher les logs:
✅ [EnvLoader] Variables d'environnement chargées
✅ [Gemini] API configurée et prête
✅ Service Worker registered

# Si erreurs:
❌ [Gemini] Clé API non trouvée
  → Vérifier que .env a la bonne clé AVANT déploiement
```

---

## ⚙️ CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### Option 1: Variable d'Env via `.env` (Développement)

`.env` (local seulement - NE PAS commiter):
```
VITE_GEMINI_API_KEY=AIzaSyCKl94mrms0qVUjMBEQoXQgnKm_oZwGRQc
```

**Avantages**:
- ✅ Facile à utiliser localement
- ✅ env-loader.js le charge automatiquement

**Inconvénients**:
- ❌ Exposé en localStorage (mais c'est prévu)

### Option 2: Injecter via HTML (Production)

**Dans index.html avant env-loader.js:**
```html
<script>
  // Injecter depuis Google Secret Manager ou autre
  window.VITE_GEMINI_API_KEY = '{{GEMINI_API_KEY}}';
</script>
<script src="env-loader.js"></script>
```

Remplacer `{{GEMINI_API_KEY}}` à la compilation via:
- Build script
- Firebase CLI custom deploy
- Secrets Manager

---

## 📊 MONITORING QUOTA

### Vérifier l'Utilisation Quota

```bash
# Via Google Cloud Console:
1. Aller à: https://console.cloud.google.com/apis/dashboard
2. Chercher: Generative Language API
3. Cliquer: Voir les métriques
4. Filtrer par: Derniers 30 jours
```

### Activer Alertes par Email

```bash
# Via Google Cloud Console:
1. Aller à: APIs & Services > Quotas
2. Filtrer: generativelanguage
3. Cliquer sur la ligne "Requests per day"
4. Cliquer: "Edit quotas"
5. Entrer email
6. Cocher: "Notify when quota is exceeded"
7. Cliquer: "Save"
```

**Résultat**: Email automatique si quota dépassé ✅

---

## 🛠️ TROUBLESHOOTING

### Problem: "GEMINI_API_KEY not found"

**Cause**: Clé pas chargée par env-loader

**Solution**:
```bash
# 1. Vérifier que .env existe
cat .env | grep VITE_GEMINI

# 2. Vérifier qu'env-loader.js est chargé
# DevTools Console → Chercher: [EnvLoader]

# 3. Vérifier manuellement en Console:
window.VITE_GEMINI_API_KEY
# Output: (votre clé) ou undefined

# 4. Si undefined, définir manuellement:
window.EnvLoader.set('VITE_GEMINI_API_KEY', 'AIzaSy...')
```

### Problem: "Rate limit exceeded"

**Cause**: Plus de 60 requêtes en 1 minute

**Solution**:
```bash
# Attendre 1 minute (localizedRateLimit reset)
# Ou rafraîchir la page: Ctrl+F5

# Vérifier le quota:
# DevTools → Network → XHR calls
# Compter les appels à generativelanguage.googleapis.com
```

### Problem: "CORS error" sur Gemini API

**Cause**: Restriction de domaine pas configurée OU domaine incorrect

**Solution**:
```bash
# 1. Vérifier URL actuelle:
console.log(window.location.origin)

# 2. Ajouter à Google Cloud Console:
https://VOTRE_DOMAINE/*

# 3. Attendre 5 min (cache Google Cloud)

# 4. Tester: F5 (refresh)
```

### Problem: Service Worker pas enregistré

**Cause**: Service Worker pas au bon chemin

**Solution**:
```bash
# Vérifier que le fichier existe:
# /service-worker.js (à la racine)

# Vérifier la console:
DevTools → Console
# Chercher: ✅ Service Worker registered
# Ou: ❌ Failed to register service worker

# Si erreur:
# 1. Vérifier que service-worker.js existe
# 2. Vérifier qu'il n'y a pas d'erreur de syntaxe
# 3. Vérifier que pwa-init.js est chargé
```

---

## 📝 POST-DÉPLOIEMENT CHECKLIST

- [ ] Site accessible: https://valde-tech.web.app
- [ ] Pas d'erreurs DevTools (F12 → Console)
- [ ] Service Worker enregistré: ✅ 
- [ ] Gemini API répond: Tester avec Ctrl+F5
- [ ] Quota monitoring activé: Google Cloud Console
- [ ] .env a placeholder (pas vraie clé)
- [ ] Pas de `AIzaSy` dans les fichiers .js
- [ ] Firebase Security Rules actives
- [ ] Firestore collections restreintes
- [ ] Test offline mode (F12 → Network → Offline)

---

## 🔄 MISE À JOUR FUTURE

Si passage au **plan Blaze**:

```bash
# 1. Créer Cloud Functions:
firebase init functions

# 2. Implémenter proxy Gemini
# (voir SECURITY.md pour code)

# 3. Déployer functions:
firebase deploy --only functions

# 4. Mettre à jour gemini-ai.js:
# Appeler functions.httpsCallable() au lieu de fetch()

# 5. Supprimer la clé de .env
```

---

## 📞 EN CAS DE PROBLÈME

1. **Vérifier les logs Firebase**:
   ```bash
   firebase hosting:channel:list
   firebase deploy:log
   ```

2. **Vérifier la console du site**:
   - Ouvrir: https://valde-tech.web.app
   - DevTools → Console (F12)
   - Chercher les erreurs

3. **Vérifier les quotas**:
   - https://console.cloud.google.com/apis/dashboard

4. **Reset complet** (derniers recours):
   ```bash
   # Vider le cache du site
   # DevTools → Application → Clear All
   
   # Redéployer
   firebase deploy --only hosting
   ```

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-01-05  
**Plan actuel**: Spark (Gratuit)  
**Statut**: ✅ Prêt pour déploiement
