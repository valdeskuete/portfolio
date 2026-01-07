@echo off
REM 🔐 Script de déploiement de la sécurité Admin (Windows)
REM Usage: deploy-admin-security.bat

cls
echo 🔐 ===== DEPLOIEMENT SECURITE ADMIN =====
echo.

REM Vérifier les fichiers requis
echo 📋 Verification des fichiers...
setlocal enabledelayedexpansion

set "files=admin-auth.js admin-features.js gemini-admin-panel.js index.html"

for %%F in (%files%) do (
    if exist "%%F" (
        echo ✅ %%F - OK
    ) else (
        echo ❌ %%F - MANQUANT
        exit /b 1
    )
)

echo.
if exist "_DOCUMENTATION\ADMIN_SECURITY_GUIDE.md" (
    echo ✅ _DOCUMENTATION\ADMIN_SECURITY_GUIDE.md - OK
) else (
    echo ❌ Docs manquantes
)

echo.
echo 🔐 Tous les fichiers de sécurité sont presents!
echo.

REM Vérifier la configuration admin
echo ⚙️  Configuration Admin actuelle:
findstr /N "ADMIN_EMAILS" admin-auth.js | more +5

echo.
echo 📝 Organisation des fichiers:
echo   ✅ admin-auth.js (Racine)
echo   ✅ admin-features.js (Racine)
echo   ✅ gemini-admin-panel.js (Racine)
echo   ✅ firestore.rules (Racine)
echo   ✅ Documentation (_DOCUMENTATION\)
echo   ✅ Tests (_TESTS\)
echo   ✅ Scripts (_SCRIPTS_SETUP\)

echo.
echo 🧪 Tests a effectuer:
echo   1. Tester login avec admin@valde-tech.com
echo   2. Tester login avec user@example.com
echo   3. Acceder a _TESTS\test-admin-auth.html

echo.
echo 🚀 Pret pour le deploiement!
echo.
echo ⚠️  AVANT le deploiement production:
echo   - Configurer les admins dans ADMIN_EMAILS
echo   - Tester avec test-admin-auth.html
echo   - Configurer Firestore security rules (optional mais recommande)
echo   - Verifier les console logs en production
echo.
pause
