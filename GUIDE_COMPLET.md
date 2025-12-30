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

### 2️⃣ Déployer localement

```bash
# Lancer un serveur local
python -m http.server 8000

# Accéder à http://localhost:8000
```

### 3️⃣ Publier sur GitHub

```bash
# Ajouter vos changements
git add .

# Créer une version
git commit -m "Portfolio v2.0 - Améliorations sécurité"

# Pousser
git push origin main
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

## 🚀 **DÉPLOIEMENT GITHUB PAGES**

### Première fois

1. **Aller sur GitHub**
   ```
   https://github.com/valdeskuete/portfolio
   ```

2. **Accéder aux Settings**
   ```
   Repository → Settings → Pages
   ```

3. **Configurer**
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

4. **Sauvegarder**
   - Cliquer "Save"
   - Attendre 1-2 minutes
   - Accéder à: https://valdeskuete.github.io/portfolio/

### À chaque mise à jour

```bash
# Faire les changements locaux
git add .
git commit -m "Mon changement"
git push origin main

# GitHub Pages met à jour automatiquement!
# (Attendre 30-60 secondes)
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

## 📅 **WORKFLOW CONTINU**

### Chaque matin (15 min)

```bash
# 1. Récupérer les mises à jour
git pull origin main

# 2. Vérifier l'état
git status

# 3. Voir les logs
git log --oneline -5
```

### Chaque changement (5-10 min)

```bash
# 1. Créer une branche
git checkout -b feature/nom

# 2. Faire les changements

# 3. Tester localement
# - Ouvrir http://localhost:8000
# - Vérifier fonctionnalités

# 4. Commiter
git add .
git commit -m "Courte description"

# 5. Pousser
git push origin feature/nom

# 6. Créer PR sur GitHub
# - Aller sur GitHub
# - Compare & pull request
# - Ajouter description
# - Créer la PR

# 7. Fusionner
# - Attendre validation
# - Merger sur GitHub
# - Supprimer la branche
```

### Avant chaque publication (15 min)

```bash
# 1. Tests
npm test (si applicable)

# 2. Validation
# - Lancer localement
# - Tester tous les formulaires
# - Vérifier liens
# - Tester mobile

# 3. Perf check
# - PageSpeed Insights
# - Lighthouse
# - WebPageTest

# 4. Sécurité
# - Vérifier .env n'est pas commité
# - Valider les règles Firebase
# - Checker pour XSS

# 5. Déployer
git push origin main
```

---

## 🆘 **TROUBLESHOOTING**

### Le site ne se met pas à jour sur GitHub Pages

```bash
# Solution 1: Forcer le refresh
# Ctrl+Shift+R sur le site

# Solution 2: Vider le cache
# Settings > Pages > uncheck cache > check cache

# Solution 3: Vérifier le commit
git log --oneline | head -5

# Solution 4: Forcer push (DANGER!)
git push origin main --force
```

### Les fichiers .env ne se cachent pas

```bash
# Vérifier que .gitignore est à jour
cat .gitignore | grep "\.env"

# Si absent, ajouter
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Fix gitignore"
git push
```

### Port 8000 déjà utilisé

```bash
# Trouver le processus
lsof -i :8000

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
- [ ] Lighthouse score 90+
- [ ] Pas d'erreurs console
- [ ] Responsive testé sur mobile réel
- [ ] Formulaires testés
- [ ] GitHub Pages activé et fonctionne
- [ ] Documentation mise à jour
- [ ] Code commité avec bons messages
- [ ] Collaborateurs informés

---

**Bonne chance avec votre portfolio! 🚀**
