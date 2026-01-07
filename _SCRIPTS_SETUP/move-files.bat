@echo off
REM Script de déplacement des fichiers vers les dossiers organisés

echo.
echo ========================================
echo Deplacement des fichiers en cours...
echo ========================================
echo.

REM ==================== DOCUMENTATION ====================
echo Deplacement DOCUMENTATION...
move "START.md" "_DOCUMENTATION\" >nul 2>&1
move "README.md" "_DOCUMENTATION\" >nul 2>&1
move "DOCUMENTATION_INDEX.md" "_DOCUMENTATION\" >nul 2>&1
move "ADMIN_SECURITY_GUIDE.md" "_DOCUMENTATION\" >nul 2>&1
move "SECURITY_CLEAN_GUIDE.md" "_DOCUMENTATION\" >nul 2>&1
move "SECURITY_FIX_URGENT.md" "_DOCUMENTATION\" >nul 2>&1
move "SECURITY_IMPLEMENTATION_SUMMARY.md" "_DOCUMENTATION\" >nul 2>&1
move "SECURITY.md" "_DOCUMENTATION\" >nul 2>&1
move "AUDIT_COHERENCE.md" "_DOCUMENTATION\" >nul 2>&1
move "CHANGELOG_SECURITY.md" "_DOCUMENTATION\" >nul 2>&1
move "DEPLOYMENT_CHECKLIST.md" "_DOCUMENTATION\" >nul 2>&1
move "QUICKSTART_SECURITY.md" "_DOCUMENTATION\" >nul 2>&1
move "FIREBASE_VERIFICATION.md" "_DOCUMENTATION\" >nul 2>&1
move "RESUME_FINAL.md" "_DOCUMENTATION\" >nul 2>&1
move "CORRECTIONS_SUMMARY.md" "_DOCUMENTATION\" >nul 2>&1
move "BOTPRESS_PROMPT_FINAL.md" "_DOCUMENTATION\" >nul 2>&1
move "FILE_INDEX_COMPLETE.md" "_DOCUMENTATION\" >nul 2>&1
move "ORGANIZATION_SUMMARY.md" "_DOCUMENTATION\" >nul 2>&1
echo [OK] Documentation

REM ==================== SECURITY ====================
echo Deplacement SECURITY...
move "admin-auth.js" "_SECURITY\" >nul 2>&1
move "admin-security-tests.js" "_SECURITY\" >nul 2>&1
move "FIRESTORE_SECURITY_RULES.js" "_SECURITY\" >nul 2>&1
echo [OK] Security

REM ==================== SCRIPTS ====================
echo Deplacement SCRIPTS...
move "init-users-role.js" "_SCRIPTS_SETUP\" >nul 2>&1
move "init-demo-data.js" "_SCRIPTS_SETUP\" >nul 2>&1
move "setup.sh" "_SCRIPTS_SETUP\" >nul 2>&1
move "setup.bat" "_SCRIPTS_SETUP\" >nul 2>&1
move "create-icons.sh" "_SCRIPTS_SETUP\" >nul 2>&1
move "deploy-admin-security.sh" "_SCRIPTS_SETUP\" >nul 2>&1
move "deploy-admin-security.bat" "_SCRIPTS_SETUP\" >nul 2>&1
echo [OK] Scripts

REM ==================== TESTS ====================
echo Deplacement TESTS...
move "test-admin-auth.html" "_TESTS\" >nul 2>&1
move "TESTS_CHECKLIST.html" "_TESTS\" >nul 2>&1
echo [OK] Tests

echo.
echo ========================================
echo Deplacement termine!
echo ========================================
pause
