# 📝 **GUIDE COMPLET - Commandes & Workflows**

## 🎯 **DÉMARRAGE RAPIDE**

### 1️⃣ Cloner et configurer

```bash
# Cloner le dépôt
git clone https://github.com/valdeskuete/portfolio.git
cd portfolio

# Copier la configuration
cp .env.example .env

# Éditer .env avec vos clés Firebase
nano .env
```

### 2️⃣ Tester localement

```bash
# Lancer un serveur local (Python)
python -m http.server 8000

# Ou avec Node (si npm installé)
npx http-server

# Accéder à http://localhost:8000
```

### 3️⃣ Publier les changements

```bash
# 1. Ajouter vos changements
git add .

# 2. Créer une version
git commit -m "Portfolio v2.0 - Améliorations sécurité"

# 3. Pousser vers GitHub (pour version control)
git push origin main

# 4. Déployer sur Firebase Hosting (pour publication)
firebase deploy --only hosting
```

---

## 🔥 **COMMANDES GIT ESSENTIELLES**

### Créer une branche de développement

```bash
# Créer la branche
git checkout -b feature/ma-fonctionnalite

# Faire vos changements...

# Pousser la branche
git push origin feature/ma-fonctionnalite

# Créer une Pull Request sur GitHub
```

### Revert un changement

```bash
# Voir l'historique
git log --oneline

# Revenir à une version antérieure
git revert COMMIT_ID

# Ou réinitialiser complètement
git reset --hard HEAD~1
```

### Fusionner les branches

```bash
# Se placer sur main
git checkout main

# Récupérer les dernières mises à jour
git pull origin main

# Fusionner la branche
git merge feature/ma-fonctionnalite

# Pousser
git push origin main
```

---

## 🚀 **DÉPLOIEMENT FIREBASE HOSTING**

### Configuration (Déjà faite ✅)

Firebase Hosting est déjà configuré et le site est en ligne:
```
https://valde-tech.web.app
```

### À chaque mise à jour

```bash
# 1. Faire les changements locaux
git add .
git commit -m "Mon changement"
git push origin main

# 2. Déployer sur Firebase
firebase deploy --only hosting

# Ou déployer tout (Firestore + Hosting)
firebase deploy

# 3. Attendre ~30 secondes
# Le site https://valde-tech.web.app se met à jour automatiquement
```

### Vérifier le déploiement

```bash
# Voir l'historique des déploiements
firebase hosting:channel:list

# Voir les logs du déploiement
firebase deploy:log

# Ouvrir le site
start https://valde-tech.web.app
```

---

## 🛡️ **GESTION DE LA SÉCURITÉ**

### Ne PAS commiter le .env

```bash
# Vérifier que .env est dans .gitignore
cat .gitignore | grep ".env"

# Le résultat doit inclure:
# .env
# .env.local

# Si ce n'est pas le cas, l'ajouter
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push origin main
```

### Si vous avez accidentellement commité des clés

```bash
# URGENCE: Révoquer les clés Firebase
# 1. Aller sur console.firebase.google.com
# 2. Créer de nouvelles clés
# 3. Mettre à jour .env

# Puis nettoyer l'historique Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Pousser (forcer!)
git push origin main --force

# ⚠️ Attention: Ne faire que si absolument nécessaire!
```

---

## 📦 **GESTION DES DÉPENDANCES**

### Si vous utilisez NPM

```bash
# Initialiser package.json
npm init -y

# Installer les dépendances (exemple)
npm install --save-dev webpack webpack-cli
npm install firebase

# Mettre à jour package.json
npm update

# Vérifier les mises à jour disponibles
npm outdated
```

---

## 🧪 **TESTING & VALIDATION**

### Valider le HTML

```bash
# Option 1: Via curl
curl -X POST -F "uploaded_file=@index.html" \
  https://validator.w3.org/check

# Option 2: En ligne
# https://validator.w3.org/
```

### Valider le CSS

```bash
# Via curl
curl -X POST -F "file=@style.css" \
  https://jigsaw.w3.org/css-validator/validate
```

### Tester la performance

```bash
# Lighthouse via CLI
npm install -g @lhci/cli@latest
lhci autorun

# Ou en ligne: https://pagespeed.web.dev
```

---

## 🔍 **DEBUGGING**

### Voir les logs Firebase

```javascript
// Dans console browser (F12)
firebase.initializeApp(config);
firebase.firestore().enableLogging(true); // Verbose logging
```

### Tester les API

```bash
# Tester une requête GET
curl https://api.example.com/data

# Tester une requête POST
curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Analyser les performances

```bash
# Dans DevTools (F12)
# 1. Onglet "Performance"
# 2. Cliquer le bouton record
# 3. Faire des actions
# 4. Analyser le timeline
```

---

## 📊 **MONITORING**

### Configurer Google Analytics

```html
<!-- Ajouter dans <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
</script>
```

### Erreurs en production

```javascript
// Intégrer Sentry
Sentry.init({
  dsn: "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx",
  tracesSampleRate: 1.0,
});
```

---

## � **WORKFLOW CONTINU**

### Chaque matin (15 min)

```bash
# 1. Récupérer les mises à jour du repo
git pull origin main

# 2. Vérifier l'état
git status

# 3. Voir les logs
git log --oneline -5
```

### Chaque changement (5-10 min)

```bash
# 1. Créer une branche (optionnel pour petit projet)
git checkout -b feature/nom

# 2. Faire les changements

# 3. Tester localement
# - Ouvrir http://localhost:8000
# - Vérifier fonctionnalités
# - DevTools (F12) pour erreurs

# 4. Commiter
git add .
git commit -m "Courte description"

# 5. Pousser vers GitHub (version control)
git push origin feature/nom

# 6. Créer PR sur GitHub (recommandé)
# - Aller sur https://github.com/valdeskuete/portfolio
# - Compare & pull request
# - Ajouter description
# - Créer la PR

# 7. Fusionner
# - Attendre validation (ou approuver soi-même)
# - Merger sur GitHub
# - Supprimer la branche
```

### Avant chaque publication (15 min)

```bash
# 1. Tests
# - Lancer localement: http://localhost:8000
# - Tester tous les formulaires
# - Vérifier les liens
# - Tester sur mobile

# 2. Sécurité
# - Vérifier .env n'est pas commité
# - Vérifier .gitignore protège .env
# - Valider les règles Firestore

# 3. Perf check
# - DevTools (F12) → Console (pas d'erreurs?)
# - PageSpeed Insights: https://pagespeed.web.dev
# - Lighthouse score 90+?

# 4. Déployer
git add .
git commit -m "Description du changement"
git push origin main           # Sauvegarder sur GitHub
firebase deploy --only hosting  # Publier sur Firebase
```

---

## 🆘 **TROUBLESHOOTING**

### Le site ne se met pas à jour sur Firebase

```bash
# Solution 1: Vérifier qu'on a bien déployé
firebase hosting:channel:list

# Solution 2: Vider le cache du navigateur
# Ctrl+Shift+R (Refresh cache)
# Ou DevTools (F12) → Network → Disable cache → Refresh

# Solution 3: Redéployer
firebase deploy --only hosting

# Solution 4: Vérifier les logs
firebase deploy:log
```

### Erreur "Firebase not initialized"

```bash
# Vérifier que firebase-config.js est chargé
# DevTools (F12) → Console
# Chercher: ✅ Firebase initialized

# Si erreur, vérifier:
# 1. .env a les bonnes clés Firebase
# 2. env-loader.js est en premier dans index.html
# 3. firebase-config.js charge SANS defer
```

### Les fichiers .env ne se cachent pas

```bash
# Vérifier que .gitignore est à jour
cat .gitignore | grep "\.env"

# Si absent, ajouter
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Fix gitignore"
git push origin main
```

### Port 8000 déjà utilisé (test local)

```bash
# Trouver le processus
lsof -i :8000
# ou sur Windows:
netstat -ano | findstr :8000

# Utiliser un autre port
python -m http.server 8001
```

---

## 📚 **RESSOURCES**

### Git
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [GitHub Learning Lab](https://github.com/skills)
- [Atlassian Git Tutorials](https://www.atlassian.com/git)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org)
- [JavaScript.info](https://javascript.info)
- [Eloquent JavaScript](https://eloquentjavascript.net)

### Firebase
- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase YouTube](https://www.youtube.com/firebasedevelopers)
- [StackOverflow Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)

---

## ✅ **CHECKLIST FINAL**

Avant de considérer votre projet terminé:

- [ ] `.env` créé et dans `.gitignore`
- [ ] Tous les fichiers validés (HTML/CSS/JS)
- [ ] DevTools console: aucune erreur rouge
- [ ] Responsive testé sur mobile réel
- [ ] Formulaires testés (contact, testimonial, etc.)
- [ ] Firebase Hosting actif et fonctionne: https://valde-tech.web.app
- [ ] Firestore collections créées et sécurisées
- [ ] Documentation mise à jour (README, guides)
- [ ] Code commité avec bons messages
- [ ] Collaborateurs informés
- [ ] Backup .env SÉCURISÉ (pas en repo!)
- [ ] Quota Firebase monitoring configuré

---

**Bonne chance avec votre portfolio! 🚀**

**Site en ligne**: https://valde-tech.web.app  
**Repo GitHub**: https://github.com/valdeskuete/portfolio  
**Database**: Firestore (Google Cloud)  
**Hébergement**: Firebase Hosting
