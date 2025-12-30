# 🆘 **GUIDE TROUBLESHOOTING - Solutions aux Problèmes Courants**

## 🔥 **PROBLÈMES CRITIQUES**

### ❌ Le site ne fonctionne pas du tout

**Symptôme:** Page blanche, aucun contenu
**Solutions:**

```bash
# 1. Vérifier le serveur local
python -m http.server 8000
# Puis ouvrir: http://localhost:8000

# 2. Vérifier la console du navigateur
# Touche F12 → Onglet "Console" → Chercher les erreurs rouges

# 3. Vérifier les fichiers existent
ls -la index.html style.css script.js

# 4. Si sur GitHub Pages, attendre 1-2 minutes après push
git push origin main
# Puis attendre et rafraîchir
```

---

### ❌ Erreur "Cannot find module firebase"

**Symptôme:** Erreur dans la console: `firebase is not defined`

**Solutions:**

```html
<!-- Vérifier que le script Firebase est chargé -->
<!-- Regarder dans la balise <head> de index.html -->
<script type="module" src="firebase-config.js"></script>

<!-- Si absent, l'ajouter avant la fermeture </body> -->
```

**Ou faire:**
```bash
# Vérifier le fichier firebase-config.js existe
ls -la firebase-config.js

# Si manquant, il faut le créer
```

---

### ❌ Erreur "CORS" ou "Blocked by CORS"

**Symptôme:** Erreur dans console: `Access-Control-Allow-Origin`

**Solution:** Ce n'est généralement PAS un problème avec GitHub Pages

```javascript
// Firebase gère les CORS automatiquement
// Si vous utilisez un serveur perso, configurer CORS:
// https://firebase.google.com/docs/rules
```

---

## 📱 **PROBLÈMES RESPONSIVE & MOBILE**

### ❌ Le site ne s'affiche pas bien sur mobile

**Symptôme:** Texte trop grand, éléments chevauchants

**Vérifications:**

```html
<!-- Vérifier la balise viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Doit être dans <head> -->
```

```bash
# Tester avec Chrome DevTools
# F12 → Cliquer sur l'icône téléphone

# Ou tester sur vrai téléphone:
# Accéder à: http://VOTRE_IP:8000
# (Remplacer VOTRE_IP par votre adresse IP locale)
```

---

### ❌ Le menu hamburger ne fonctionne pas

**Symptôme:** Menu ne s'ouvre pas, icône ne change pas

**Vérifications:**

```html
<!-- Vérifier que ces éléments existent -->
<i class="fa-solid fa-bars" id="menu-icon"></i>
<nav class="navbar">...</nav>

<!-- Puis vérifier la console (F12) -->
<!-- Chercher une erreur JavaScript -->
```

```javascript
// Dans script.js, vérifier ce code existe:
if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        navbar.classList.toggle('active');
    };
}
```

---

### ❌ Les images ne chargent pas

**Symptôme:** Icône image brisée

**Vérifications:**

```bash
# 1. Vérifier le chemin est correct (avec slash /)
# ✅ BON:   images/profile.jpg
# ❌ MAUVAIS: /images/profile.jpg
# ❌ MAUVAIS: \images\profile.jpg

# 2. Vérifier l'extension
# ✅ BON:   .jpg (minuscule)
# ❌ MAUVAIS: .JPG (majuscule)

# 3. Vérifier le fichier existe
ls -la images/
```

**Fix:**
```html
<!-- Avant (mauvais) -->
<img src="/images/profile.jpg">

<!-- Après (bon) -->
<img src="images/profile.jpg">
```

---

## 🔐 **PROBLÈMES SÉCURITÉ & .env**

### ❌ Les clés API sont visibles dans le code

**Symptôme:** Je vois "AIzaSy..." dans le code source

**DANGER:** ⚠️ CRITIQUE - Révoquer les clés immédiatement!

**Solutions:**

```bash
# 1. Créer le fichier .env
cp .env.example .env
nano .env

# 2. Ajouter vos clés dans .env (PAS dans le code!)
VITE_FIREBASE_API_KEY=AIzaSy...

# 3. Vérifier .env est dans .gitignore
echo ".env" >> .gitignore

# 4. Révoquer les clés exposées
# Aller à: https://console.firebase.google.com
# Créer de nouvelles clés
# Mettre à jour .env

# 5. Forcer le nettoyage Git (optionnel mais recommandé)
# Consulter un expert Git pour cette opération!
```

---

### ❌ .env est accidentellement commité

**Symptôme:** Je vois ".env" dans l'historique Git

**SOLUTION URGENTE:**

```bash
# 1. Ne PAS continuer sans le corriger

# 2. Revoke les clés sur Firebase Console
# https://console.firebase.google.com

# 3. Créer de nouvelles clés

# 4. Mettre à jour .env localement

# 5. Supprimer de l'historique Git (avancé!)
# Consulter un expert Git
# Ou réinitialiser le repo à la main
```

---

## 🔥 **PROBLÈMES FIREBASE**

### ❌ "Missing or insufficient permissions"

**Symptôme:** Firebase refuse les requêtes

**Solutions:**

```javascript
// 1. Vérifier les règles Firestore
// Aller à: https://console.firebase.google.com
// Firestore Database → Rules

// 2. Règles par défaut à tester (NON PROD!):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ DANGEREUX!
    }
  }
}

// 3. Après test, mettre des règles strictes!
```

---

### ❌ "Document not found" / "Collection doesn't exist"

**Symptôme:** Firebase ne trouve pas les données

**Solutions:**

```bash
# 1. Vérifier la collection existe
# Aller à: Firebase Console > Firestore Database
# Chercher la collection: "projets", "comments", etc.

# 2. Si elle n'existe pas, la créer
# Cliquer "Start collection"
# Nommer: "projets"
# Ajouter un document vide d'abord

# 3. Vérifier les noms de collections
# Dans firebase-config.js:
collection(db, "projets")  # Doit correspondre exactement!

# 4. Vérifier la base de données sélectionnée
# Firestore peut avoir plusieurs DB
# S'assurer que vous utilisez la bonne
```

---

### ❌ "Auth/user-not-found" / "Auth/wrong-password"

**Symptôme:** Impossible de se logger

**Solutions:**

```bash
# 1. Vérifier le compte existe
# Aller à: Firebase Console > Authentication > Users
# Chercher l'email du compte

# 2. Si le compte n'existe pas:
# Cliquer "Add user"
# Entrer email et password

# 3. Vérifier le mot de passe
# Firebase est sensible aux majuscules/minuscules
# ✅ "MyPassword123" != "mypassword123"

# 4. Test local
# Ouvrir DevTools (F12)
# Aller à Console
# Essayer de se logger

# 5. Si toujours problème
# Réinitialiser le mot de passe via Firebase Console
```

---

## 🎨 **PROBLÈMES AFFICHAGE**

### ❌ Les styles CSS ne s'appliquent pas

**Symptôme:** Page sans styles, tout est noir

**Vérifications:**

```html
<!-- Vérifier le lien CSS existe -->
<link rel="stylesheet" href="style.css">

<!-- Doit être dans <head> -->
```

```bash
# 1. Vérifier le fichier existe
ls -la style.css

# 2. Vérifier qu'il n'est pas cassé (corruption)
head -20 style.css

# 3. Vérifier la console (F12)
# Chercher: "Failed to load style.css"

# 4. Tester localement
python -m http.server 8000
# Puis F12 → Onglet "Network"
# Chercher "style.css"
# Doit avoir un code 200
```

---

### ❌ Les polices ne s'affichent pas

**Symptôme:** Texte avec font par défaut

**Vérifications:**

```html
<!-- Vérifier l'import de police -->
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

<!-- Doit être au début du CSS -->
```

```bash
# 1. Tester la connexion internet
# Ouvrir: https://fonts.googleapis.com

# 2. Si bloqué, utiliser Google Fonts en local
# Télécharger les fichiers .ttf
# Ajouter au dossier fonts/

# 3. Vérifier la console (F12)
# Chercher les erreurs de chargement de font
```

---

### ❌ Les animations saccadent

**Symptôme:** Animations non fluides, ralentissements

**Vérifications:**

```css
/* 1. Vérifier que vous utilisez transform, pas width/height */
/* ✅ BON (performant): */
transform: translateY(-10px);

/* ❌ MAUVAIS (lent): */
top: -10px; /* Cause un reflow! */

/* 2. Utiliser will-change (avec modération) */
will-change: transform;

/* 3. Vérifier la durée */
transition: 0.3s; /* OK */
transition: 5s; /* Trop long! */
```

```bash
# Chrome DevTools:
# F12 → Performance → Record
# Faire l'animation
# Chercher les "red marks" ou FPS bas
```

---

## 📊 **PROBLÈMES PERFORMANCE**

### ❌ Le site charge lentement

**Symptôme:** Page met 5+ secondes à charger

**Diagnostic:**

```bash
# 1. Utiliser Google PageSpeed Insights
# https://pagespeed.web.dev
# Entrer l'URL du site
# Lire les recommandations

# 2. Utiliser Lighthouse
# F12 → Onglet Lighthouse → Analyze

# 3. Vérifier la taille des fichiers
du -h *.{html,css,js}

# 4. Vérifier les images
ls -lh images/
# Chaque image > 500KB? Optimiser!
```

**Solutions:**

```bash
# 1. Compresser les images
# Utiliser: https://tinypng.com/
# Ou installer imagemin

# 2. Minifier CSS/JS
# Utiliser: https://minifier.org/

# 3. Lazy-load les images
<img src="..." loading="lazy">

# 4. Activer compression serveur (GitHub Pages: automatique)
```

---

## 🌐 **PROBLÈMES GITHUB PAGES**

### ❌ Le site ne se met pas à jour après push

**Symptôme:** Je fais un push mais le site ne change pas

**Solutions:**

```bash
# 1. Vérifier que les changements sont bien pushés
git log --oneline | head -5
# Doit montrer votre dernier commit

# 2. Vérifier que GitHub Pages est activé
# Repository Settings → Pages
# Source: main branch

# 3. Attendre 1-2 minutes
# GitHub Pages n'est pas instantané

# 4. Vider le cache navigateur
# Ctrl+Shift+R (hard refresh)

# 5. Si toujours pas:
# Aller à: https://github.com/USERNAME/portfolio/actions
# Chercher des erreurs de déploiement
```

---

### ❌ Le site est en 404 Not Found

**Symptôme:** Page GitHub Pages indisponible

**Solutions:**

```bash
# 1. Vérifier que le repo est public
# Settings → Visibility → Public

# 2. Vérifier que index.html existe à la racine
ls -la index.html

# 3. Vérifier le nom du repo
# URL doit être: https://USERNAME.github.io/portfolio/
# Pas: https://USERNAME.github.io/AUTRE_NOM/

# 4. Attendre que GitHub page se déploie
# Aller à: Repository → Actions
# Attendre le déploiement

# 5. Réinitialiser les settings GitHub Pages
# Settings → Pages → uncheck → check
```

---

## 💬 **PROBLÈMES COMMUNICATION**

### ❌ Les formulaires ne soumettent pas

**Symptôme:** Clic sur "Envoyer" ne fait rien

**Solutions:**

```bash
# 1. Ouvrir la console (F12)
# Chercher les erreurs JavaScript

# 2. Vérifier Firebase est connecté
# Console: type "firebase"
# Doit retourner: "Module"

# 3. Vérifier le formulaire a l'ID correct
# HTML: <form id="firebase-contact-form">
# Firebase-config.js: getElementById('firebase-contact-form')
# Doivent correspondre!

# 4. Vérifier les inputs ont les bons ID
# <input id="contact-name">
# document.getElementById('contact-name')
# Doivent correspondre!

# 5. Tester avec les DevTools
# F12 → Console:
console.log(document.getElementById('contact-name'))
# Doit retourner l'élément, pas null
```

---

### ❌ Les commentaires ne s'affichent pas

**Symptôme:** Je commente mais rien n'apparaît

**Solutions:**

```bash
# 1. Vérifier que le commentaire est approuvé
# Firebase Console > Collection "comments"
# Chercher le commentaire
# Vérifier: approved = true

# 2. Si admin, les commentaires non approuvés s'affichent aussi
# Vérifier que vous êtes loggé en admin
# Console: firebase.auth().currentUser

# 3. Vérifier la structure Firestore
# Collection: "comments"
# Champs: projectId, text, approved, date
# Doivent exister!

# 4. Test local
# Ajouter un console.log dans firebase-config.js:
console.log('Comments loaded:', snapshot.docs.length)
```

---

## 📞 **QUAND DEMANDER DE L'AIDE**

**Avant de contacter quelqu'un:**

1. ✅ Lire cette section troubleshooting complètement
2. ✅ Chercher la solution dans [GUIDE_COMPLET.md](GUIDE_COMPLET.md)
3. ✅ Vérifier la console (F12) pour les erreurs
4. ✅ Tester sur un appareil/navigateur différent
5. ✅ Réinitialiser le cache navigateur (Ctrl+Shift+R)

**Puis contacter:**
- 📧 Email: valdeskuete8@gmail.com
- 💬 WhatsApp: +237 681 031 588
- 🐱 GitHub Issues (si applicable)

**Fournir:**
- La description du problème
- Les étapes pour reproduire
- Le message d'erreur exact (screenshot)
- Quelle version du navigateur
- Quel système d'exploitation

---

## 🎓 **RESSOURCES D'AIDE**

| Problème | Ressource |
|----------|-----------|
| Erreur JavaScript | [MDN JS Errors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors) |
| Firebase | [Firebase Docs](https://firebase.google.com/docs) |
| CSS | [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) |
| Git | [Pro Git Book](https://git-scm.com/book) |
| Chrome DevTools | [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools) |

---

**💪 Vous trouverez toujours une solution! Bon débogage! 🐛**
