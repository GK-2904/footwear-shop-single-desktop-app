@echo off
title Shivam Footwear Shop
cd /d "%~dp0"

if not exist "app\footwear-launcher.jar" (
    echo ERROR: app\footwear-launcher.jar not found!
    pause
    exit /b 1
)

set "JAVA_CMD="
if exist "%~dp0jre\bin\java.exe" set "JAVA_CMD=%~dp0jre\bin\java.exe"
if not defined JAVA_CMD if exist "%~dp0runtime\bin\java.exe" set "JAVA_CMD=%~dp0runtime\bin\java.exe"
if not defined JAVA_CMD (
    echo ERROR: Java not found in jre or runtime folder.
    pause
    exit /b 1
)

set "MODULE_PATH=%~dp0javafx\lib"
if not exist "%MODULE_PATH%\javafx.web.jar" set "MODULE_PATH=%~dp0..\javafx-sdk\lib"
if not exist "%MODULE_PATH%\javafx.web.jar" (
    echo ERROR: JavaFX libraries not found.
    pause
    exit /b 1
)

if exist "%~dp0javafx\bin" set "PATH=%~dp0javafx\bin;%PATH%"

if not exist "data" mkdir data
if not exist "backups" mkdir backups

set "INSTALL_DIR=%~dp0"
if "%INSTALL_DIR:~-1%"=="\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo Starting Shivam Footwear desktop window...
"%JAVA_CMD%" --module-path "%MODULE_PATH%" --add-modules javafx.controls,javafx.web -Dshivam.install.dir="%INSTALL_DIR%" -jar "app\footwear-launcher.jar"
exit /b %ERRORLEVEL%
