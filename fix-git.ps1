Write-Host "=== LIMPIANDO ÍNDICE DE GIT ===" -ForegroundColor Cyan

# 1. Verificar que .gitignore existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "❌ Error: .gitignore no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .gitignore encontrado" -ForegroundColor Green

# 2. Limpiar el índice de Git
Write-Host "`n⏳ Eliminando archivos del índice de Git..." -ForegroundColor Yellow
git rm -r --cached . 2>&1 | Out-Null
Write-Host "✅ Índice limpiado" -ForegroundColor Green

# 3. Agregar todo respetando .gitignore
Write-Host "`n⏳ Agregando archivos al índice (respetando .gitignore)..." -ForegroundColor Yellow
git add .
Write-Host "✅ Archivos agregados" -ForegroundColor Green

# 4. Mostrar estado
Write-Host "`n=== ESTADO ACTUAL ===" -ForegroundColor Cyan
git status

# 5. Validar que node_modules y .next NO estén trackeados
$status = git status
$errores = @()
if ($status -match "node_modules") {
    $errores += "❌ node_modules/ todavía aparece en el índice"
}
if ($status -match "\.next") {
    $errores += "❌ .next/ todavía aparece en el índice"
}
if ($status -match "\.env\.local") {
    $errores += "❌ .env.local todavía aparece en el índice"
}

if ($errores.Count -gt 0) {
    Write-Host "`n=== ERRORES ===" -ForegroundColor Red
    foreach ($e in $errores) { Write-Host $e -ForegroundColor Red }
    Write-Host "`n⚠️  Revisa el .gitignore y ejecuta el script de nuevo" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Validación exitosa: node_modules, .next y .env.local NO están trackeados" -ForegroundColor Green
}

# 6. Instrucciones finales
Write-Host "`n📝 PRÓXIMOS PASOS (ejecuta manualmente):" -ForegroundColor Cyan
Write-Host "   git commit -m 'Fix: limpiar gitignore'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
