# Script de déplacement des fichiers vers les dossiers organisés
# À exécuter depuis d:\dev\portfolio

Write-Host "🚀 Démarrage du déplacement des fichiers..." -ForegroundColor Cyan
Write-Host ""

# ==================== DOCUMENTATION ====================
Write-Host "📚 Déplacement des fichiers de DOCUMENTATION..." -ForegroundColor Yellow

$docs = @(
    "START.md",
    "README.md",
    "DOCUMENTATION_INDEX.md",
    "ADMIN_SECURITY_GUIDE.md",
    "SECURITY_CLEAN_GUIDE.md",
    "SECURITY_FIX_URGENT.md",
    "SECURITY_IMPLEMENTATION_SUMMARY.md",
    "SECURITY.md",
    "AUDIT_COHERENCE.md",
    "CHANGELOG_SECURITY.md",
    "DEPLOYMENT_CHECKLIST.md",
    "QUICKSTART_SECURITY.md",
    "FIREBASE_VERIFICATION.md",
    "RESUME_FINAL.md",
    "CORRECTIONS_SUMMARY.md",
    "BOTPRESS_PROMPT_FINAL.md",
    "FILE_INDEX_COMPLETE.md",
    "ORGANIZATION_SUMMARY.md"
)

foreach ($file in $docs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "_DOCUMENTATION/$file" -Force
        Write-Host "  ✅ $file → _DOCUMENTATION/"
    }
}

# ==================== SECURITY ====================
Write-Host ""
Write-Host "🔐 Déplacement des fichiers de SÉCURITÉ..." -ForegroundColor Yellow

$security = @(
    "admin-auth.js",
    "admin-security-tests.js",
    "FIRESTORE_SECURITY_RULES.js"
)

foreach ($file in $security) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "_SECURITY/$file" -Force
        Write-Host "  ✅ $file → _SECURITY/"
    }
}

# ==================== SCRIPTS & SETUP ====================
Write-Host ""
Write-Host "⚙️  Déplacement des SCRIPTS DE SETUP..." -ForegroundColor Yellow

$scripts = @(
    "init-users-role.js",
    "init-demo-data.js",
    "setup.sh",
    "setup.bat",
    "create-icons.sh",
    "deploy-admin-security.sh",
    "deploy-admin-security.bat"
)

foreach ($file in $scripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "_SCRIPTS_SETUP/$file" -Force
        Write-Host "  ✅ $file → _SCRIPTS_SETUP/"
    }
}

# ==================== TESTS ====================
Write-Host ""
Write-Host "🧪 Déplacement des fichiers de TEST..." -ForegroundColor Yellow

$tests = @(
    "test-admin-auth.html",
    "TESTS_CHECKLIST.html"
)

foreach ($file in $tests) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "_TESTS/$file" -Force
        Write-Host "  ✅ $file → _TESTS/"
    }
}

# ==================== ARCHIVE ====================
Write-Host ""
Write-Host "🗑️  Déplacement des fichiers ARCHIVE..." -ForegroundColor Yellow

# FIRESTORE_SECURITY_RULES.js a déjà été traité
# Ajouter d'autres fichiers obsolètes ici au besoin

Write-Host ""
Write-Host "✅ Déplacement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  📚 Documentation: $(@(Get-ChildItem -Path '_DOCUMENTATION' -File 2>/dev/null | Measure-Object).Count) fichiers"
Write-Host "  🔐 Sécurité: $(@(Get-ChildItem -Path '_SECURITY' -File 2>/dev/null | Measure-Object).Count) fichiers"
Write-Host "  ⚙️  Scripts: $(@(Get-ChildItem -Path '_SCRIPTS_SETUP' -File 2>/dev/null | Measure-Object).Count) fichiers"
Write-Host "  🧪 Tests: $(@(Get-ChildItem -Path '_TESTS' -File 2>/dev/null | Measure-Object).Count) fichiers"
Write-Host ""
