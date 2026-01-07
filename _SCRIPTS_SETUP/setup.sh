#!/bin/bash

# 🚀 SETUP SCRIPT - Valdes.Tech Portfolio
# Ce script configure automatiquement le portfolio

echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 INSTALLATION PORTFOLIO VALDES.TECH - v2.0     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1️⃣ Vérifier Git
echo -e "${YELLOW}[1/5]${NC} Vérification de Git..."
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git trouvé${NC}"
    git --version
else
    echo -e "${RED}❌ Git non trouvé${NC}"
    echo "Installez Git: https://git-scm.com/download"
    exit 1
fi
echo ""

# 2️⃣ Initialiser le dépôt Git
echo -e "${YELLOW}[2/5]${NC} Configuration Git..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Dépôt Git déjà initialisé${NC}"
else
    git init
    echo -e "${GREEN}✅ Dépôt Git initialisé${NC}"
fi
echo ""

# 3️⃣ Créer le fichier .env
echo -e "${YELLOW}[3/5]${NC} Configuration des variables d'environnement..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Fichier .env créé à partir de .env.example${NC}"
        echo -e "${YELLOW}⚠️  Editez .env et ajoutez vos clés Firebase!${NC}"
    else
        cat > .env << EOF
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=valdes-tech
VITE_FIREBASE_AUTH_DOMAIN=valdes-tech.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=valdes-tech.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=359469879862
VITE_FIREBASE_APP_ID=1:359469879862:web:6ede2896e55a9822ef7e97
EOF
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
        echo -e "${YELLOW}⚠️  Éditez .env et ajoutez votre clé API Firebase!${NC}"
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi
echo ""

# 4️⃣ Vérifier .gitignore
echo -e "${YELLOW}[4/5]${NC} Configuration .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# 🔐 Environnement
.env
.env.local
.env.*.local

# 📦 Node
node_modules/
package-lock.json
yarn.lock

# 🔨 Build
dist/
build/
*.min.js
*.min.css

# 💾 Système
.DS_Store
Thumbs.db
*.log

# 📝 IDE
.vscode/
.idea/
*.swp
EOF
    echo -e "${GREEN}✅ Fichier .gitignore créé${NC}"
else
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✅ .env est déjà dans .gitignore${NC}"
    else
        echo ".env" >> .gitignore
        echo -e "${GREEN}✅ .env ajouté à .gitignore${NC}"
    fi
fi
echo ""

# 5️⃣ Vérifier les fichiers essentiels
echo -e "${YELLOW}[5/5]${NC} Vérification des fichiers essentiels..."
FILES=("index.html" "style.css" "script.js" "firebase-config.js")
ALL_GOOD=true

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (MANQUANT!)"
        ALL_GOOD=false
    fi
done
echo ""

# Résumé
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✨ INSTALLATION TERMINÉE ✨                       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ Tous les fichiers sont présents!${NC}"
else
    echo -e "${RED}⚠️  Certains fichiers manquent!${NC}"
fi

echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo ""
echo "1️⃣  Éditez le fichier .env:"
echo "   nano .env"
echo "   # Remplacez VITE_FIREBASE_API_KEY par votre clé"
echo ""
echo "2️⃣  Vérifiez la configuration:"
echo "   cat .env"
echo ""
echo "3️⃣  Lancez un serveur local:"
echo "   python -m http.server 8000"
echo ""
echo "4️⃣  Ouvrez dans le navigateur:"
echo "   http://localhost:8000"
echo ""
echo "5️⃣  Lisez la documentation:"
echo "   cat README.md"
echo ""
echo "📚 Documentation disponible:"
echo "   - README.md - Guide complet"
echo "   - GUIDE_COMPLET.md - Workflows"
echo "   - PLAN_AMELIORATIONS.md - Roadmap"
echo "   - CHECKLIST_DEPLOIEMENT.md - Avant production"
echo ""
echo -e "${GREEN}🎉 Bon développement! 🎉${NC}"
echo ""
