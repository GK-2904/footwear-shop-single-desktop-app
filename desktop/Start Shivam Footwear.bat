@echo off
title Shivam Footwear Shop
cd /d "%~dp0"

echo ============================================
echo   Shivam Footwear Shop - Starting...
echo ============================================
echo.

REM Preferred: native desktop EXE (needs app\ShivamFootwear.cfg)
set "USE_EXE=1"
ver | findstr /i "6.1." >nul
if %ERRORLEVEL% equ 0 (
    echo Windows 7 detected. Bypassing native EXE wrapper for compatibility...
    set "USE_EXE=0"
)

if "%USE_EXE%"=="1" if exist "%~dp0ShivamFootwear.exe" if exist "%~dp0app\ShivamFootwear.cfg" (
    echo Launching Shivam Footwear desktop app...
    start "" "%~dp0ShivamFootwear.exe"
    echo.
    echo App window will open shortly.
    echo To stop: close the window or run "Stop Shivam Footwear.bat"
    echo.
    exit /b 0
)


REM JavaFX desktop window (no browser) - reliable fallback
if exist "%~dp0launch-desktop.bat" (
    call "%~dp0launch-desktop.bat"
    exit /b %ERRORLEVEL%
)

REM PowerShell fallback
if exist "%~dp0run-launcher.ps1" (
    powershell -ExecutionPolicy Bypass -File "%~dp0run-launcher.ps1" -InstallDir "%~dp0"
    exit /b %ERRORLEVEL%
)

REM Legacy browser fallback
set "JAVA_CMD="
if exist "%~dp0jre\bin\java.exe" set "JAVA_CMD=%~dp0jre\bin\java.exe"
if not defined JAVA_CMD if exist "%~dp0runtime\bin\java.exe" set "JAVA_CMD=%~dp0runtime\bin\java.exe"
if not defined JAVA_CMD (
    echo ERROR: Java not found!
    pause
    exit /b 1
)

if not exist "data" mkdir data
if not exist "backups" mkdir backups
if not exist "app\footwear-backend.jar" (
    echo ERROR: app\footwear-backend.jar not found!
    pause
    exit /b 1
)

echo Starting application server...
start "Shivam Footwear Backend" /MIN "%JAVA_CMD%" -jar app\footwear-backend.jar --spring.profiles.active=desktop
timeout /t 15 /nobreak >nul
start "" http://localhost:8080
pause
