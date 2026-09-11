@echo off
chcp 65001 >nul
title Subir Presentación Interactiva a GitHub

echo =======================================================
echo    GEOTEC - SUBIDA AUTOMATICA A GITHUB Y GITHUB PAGES
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando estado del repositorio local...
git status -s

set "DEFAULT_MSG=Actualizacion automatica de presentacion interactiva - %date% %time:~0,5%"
echo.
set /p "CUSTOM_MSG=Mensaje de commit (Presiona ENTER para mensaje automatico): "

if "%CUSTOM_MSG%"=="" (
    set "MSG=%DEFAULT_MSG%"
) else (
    set "MSG=%CUSTOM_MSG%"
)

echo.
echo [2/4] Agregando archivos modificados...
git add .

echo.
echo [3/4] Creando commit: "%MSG%"...
git commit -m "%MSG%"

if errorlevel 1 (
    echo.
    echo No hay cambios nuevos para confirmar o ya todo esta al dia.
)

echo.
echo [4/4] Sincronizando y subiendo a GitHub (rama main)...
git pull --rebase origin main
git push origin main

if errorlevel 0 (
    echo.
    echo =======================================================
    echo  LISTO: Los cambios se subieron con exito a GitHub.
    echo  GitHub Actions desplegara la web automaticamente en:
    echo  https://mcgeotec.github.io/presentacion-ecopetrol-geotec/
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo  ERROR: Hubo un problema al subir a GitHub.
    echo  Revisa tu conexion o permisos de Git.
    echo =======================================================
)

echo.
pause
