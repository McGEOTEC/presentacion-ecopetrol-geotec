<#
.SYNOPSIS
    Script de subida automática a GitHub para Presentacion_Interactiva.
.DESCRIPTION
    Realiza git add, commit automático o con mensaje personalizado,
    pull con rebase y push a origin main.
.EXAMPLE
    .\subir_a_github.ps1
.EXAMPLE
    .\subir_a_github.ps1 -Mensaje "Ajuste de diapositiva de costos"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Mensaje = ""
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   GEOTEC - SUBIDA AUTOMATICA A GITHUB Y GITHUB PAGES  " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Verificando estado del repositorio local..." -ForegroundColor Yellow
git status -s

if ([string]::IsNullOrWhiteSpace($Mensaje)) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $defaultMsg = "Actualización automática de presentación interactiva - $timestamp"
    $inputMsg = Read-Host "Mensaje de commit (Presiona ENTER para usar '$defaultMsg')"
    if ([string]::IsNullOrWhiteSpace($inputMsg)) {
        $Mensaje = $defaultMsg
    } else {
        $Mensaje = $inputMsg
    }
}

Write-Host "`n[2/4] Agregando archivos..." -ForegroundColor Yellow
git add .

Write-Host "`n[3/4] Creando commit: '$Mensaje'..." -ForegroundColor Yellow
try {
    git commit -m "$Mensaje"
} catch {
    Write-Host "No hay cambios nuevos pendientes de commit." -ForegroundColor DarkGray
}

Write-Host "`n[4/4] Sincronizando y enviando cambios a GitHub (rama main)..." -ForegroundColor Yellow
try {
    git pull --rebase origin main
    git push origin main
    Write-Host "`n=======================================================" -ForegroundColor Green
    Write-Host " [EXITO] Cambios subidos exitosamente a GitHub." -ForegroundColor Green
    Write-Host " GitHub Pages actualizara la presentacion en:" -ForegroundColor Green
    Write-Host " https://mcgeotec.github.io/presentacion-ecopetrol-geotec/" -ForegroundColor White
    Write-Host "=======================================================" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Ocurrió un fallo al comunicarse con GitHub: $_" -ForegroundColor Red
}
