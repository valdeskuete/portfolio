#!/bin/bash

# 🔐 Script de déploiement de la sécurité Admin
# Usage: ./deploy-admin-security.sh

echo "🔐 ===== DÉPLOIEMENT SÉCURITÉ ADMIN ====="
echo ""

# Vérifier les fichiers requis (maintenant réorganisés)
echo "📋 Vérification des fichiers..."
files=(
    "admin-auth.js"              # À la racine
    "admin-features.js"          # À la racine
    "gemini-admin-panel.js"      # À la racine
    "index.html"                 # À la racine
    "_DOCUMENTATION/ADMIN_SECURITY_GUIDE.md"
    "_SECURITY/admin-security-tests.js"
    "_TESTS/test-admin-auth.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - MANQUANT"
        exit 1
    fi
done

echo ""
echo "🔐 Tous les fichiers de sécurité sont présents!"
echo ""

# Vérifier la configuration admin
echo "⚙️  Configuration Admin actuelle:"
grep -A 5 "ADMIN_EMAILS" admin-auth.js | head -7

echo ""
echo "🔍 Vérification de la séquence de chargement des scripts..."
echo "admin-auth.js doit être chargé AVANT gemini-admin-panel.js"

if grep -q "admin-auth.js.*defer" index.html && \
   grep "admin-auth.js" index.html | grep -q ".*<.*gemini-admin-panel.js"; then
    echo "✅ Ordre des scripts correct"
else
    echo "⚠️  Vérifiez manuellement l'ordre des scripts dans index.html"
fi

echo ""
echo "📝 Modifications apportées:"
echo "  ✅ admin-auth.js (à la racine)"
echo "  ✅ admin-features.js (à la racine)"
echo "  ✅ gemini-admin-panel.js (à la racine)"
echo "  ✅ firestore.rules (à la racine)"
echo "  ✅ Documentation (_DOCUMENTATION/)"
echo "  ✅ Tests (_TESTS/)"
echo "  ✅ Scripts (_SCRIPTS_SETUP/)"

echo ""
echo "🧪 Tests à effectuer:"
echo "  1. Tester login avec admin@valde-tech.com"
echo "  2. Tester login avec user@example.com"
echo "  3. Accéder à _TESTS/test-admin-auth.html pour vérification complète"

echo ""
echo "🚀 Prêt pour le déploiement!"
echo ""

echo "⚠️  AVANT le déploiement production:"
echo "  - Configurer les admins dans ADMIN_EMAILS"
echo "  - Tester avec test-admin-auth.html"
echo "  - Configurer Firestore security rules (optional mais recommandé)"
echo "  - Vérifier les console logs en production"
echo ""
