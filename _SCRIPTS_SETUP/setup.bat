@echo off
REM 🚀 SETUP SCRIPT - Valdes.Tech Portfolio (Windows)
REM Ce script configure automatiquement le portfolio

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║  🚀 INSTALLATION PORTFOLIO VALDES.TECH - v2.0     ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM 1️⃣ Vérifier Git
echo [1/5] Vérification de Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git trouvé
    git --version
) else (
    echo ❌ Git non trouvé
    echo Installez Git: https://git-scm.com/download
    pause
    exit /b 1
)
echo.

REM 2️⃣ Initialiser Git
echo [2/5] Configuration Git...
if exist ".git" (
    echo ✅ Dépôt Git déjà initialisé
) else (
    git init
    echo ✅ Dépôt Git initialisé
)
echo.

REM 3️⃣ Créer .env
echo [3/5] Configuration des variables d'environnement...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env > nul
        echo ✅ Fichier .env créé à partir de .env.example
        echo ⚠️  Éditez .env et ajoutez vos clés Firebase!
    ) else (
        (
            echo VITE_FIREBASE_API_KEY=
            echo VITE_FIREBASE_PROJECT_ID=valdes-tech
            echo VITE_FIREBASE_AUTH_DOMAIN=valdes-tech.firebaseapp.com
            echo VITE_FIREBASE_STORAGE_BUCKET=valdes-tech.firebasestorage.app
            echo VITE_FIREBASE_MESSAGING_SENDER_ID=359469879862
            echo VITE_FIREBASE_APP_ID=1:359469879862:web:6ede2896e55a9822ef7e97
        ) > .env
        echo ✅ Fichier .env créé
        echo ⚠️  Éditez .env et ajoutez votre clé API Firebase!
    )
) else (
    echo ✅ Fichier .env existe déjà
)
echo.

REM 4️⃣ Vérifier .gitignore
echo [4/5] Configuration .gitignore...
if not exist ".gitignore" (
    (
        echo # 🔐 Environnement
        echo .env
        echo .env.local
        echo .env.*.local
        echo.
        echo # 📦 Node
        echo node_modules/
        echo package-lock.json
        echo yarn.lock
        echo.
        echo # 🔨 Build
        echo dist/
        echo build/
        echo *.min.js
        echo *.min.css
        echo.
        echo # 💾 Système
        echo .DS_Store
        echo Thumbs.db
        echo *.log
        echo.
        echo # 📝 IDE
        echo .vscode/
        echo .idea/
        echo *.swp
    ) > .gitignore
    echo ✅ Fichier .gitignore créé
) else (
    findstr ".env" .gitignore > nul
    if %errorlevel% equ 0 (
        echo ✅ .env est déjà dans .gitignore
    ) else (
        echo .env >> .gitignore
        echo ✅ .env ajouté à .gitignore
    )
)
echo.

REM 5️⃣ Vérifier les fichiers essentiels
echo [5/5] Vérification des fichiers essentiels...
set FILES=index.html style.css script.js firebase-config.js
set ALL_GOOD=true

for %%F in (%FILES%) do (
    if exist "%%F" (
        echo ✅ %%F
    ) else (
        echo ❌ %%F ^(MANQUANT!^)
        set ALL_GOOD=false
    )
)
echo.

REM Résumé
echo ╔════════════════════════════════════════════════════╗
echo ║  ✨ INSTALLATION TERMINÉE ✨                       ║
echo ╚════════════════════════════════════════════════════╝
echo.

if "%ALL_GOOD%"=="true" (
    echo ✅ Tous les fichiers sont présents!
) else (
    echo ⚠️  Certains fichiers manquent!
)

echo.
echo 📝 PROCHAINES ÉTAPES:
echo.
echo 1️⃣  Éditez le fichier .env:
echo    notepad .env
echo    REM Remplacez VITE_FIREBASE_API_KEY par votre clé
echo.
echo 2️⃣  Lancez un serveur local:
echo    python -m http.server 8000
echo    REM ou: npx http-server
echo.
echo 3️⃣  Ouvrez dans le navigateur:
echo    http://localhost:8000
echo.
echo 4️⃣  Lisez la documentation:
echo    type README.md
echo.
echo 📚 Documentation disponible:
echo    - README.md - Guide complet
echo    - GUIDE_COMPLET.md - Workflows
echo    - PLAN_AMELIORATIONS.md - Roadmap
echo    - CHECKLIST_DEPLOIEMENT.md - Avant production
echo.
echo 🎉 Bon développement! 🎉
echo.

pause
