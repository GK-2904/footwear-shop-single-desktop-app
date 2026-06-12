# Build Shivam Footwear.exe using jpackage (requires JDK 17+ with jpackage on PATH)
param(
    [string]$BackendJar = "",
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"
$DesktopDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent $DesktopDir
$LauncherDir = Join-Path $ProjectRoot "desktop-launcher"
$AppName = "ShivamFootwear"

if (-not $OutputDir) {
    $OutputDir = Join-Path $DesktopDir "ShivamFootwear-App"
}

if (-not $BackendJar) {
    $BackendJar = Join-Path $DesktopDir "ShivamFootwear\app\footwear-backend.jar"
    if (-not (Test-Path $BackendJar)) {
        $BackendJar = Join-Path $ProjectRoot "backend\target\footwear-backend-0.0.1-SNAPSHOT.jar"
    }
}

Write-Host "=== Building Shivam Footwear EXE ===" -ForegroundColor Cyan

# 1. Build launcher JAR
Write-Host "`n[1/5] Building launcher JAR..." -ForegroundColor Yellow
Push-Location $LauncherDir
if (Test-Path "..\backend\mvnw.cmd") {
    ..\backend\mvnw.cmd -q package -DskipTests
} else {
    mvn -q package -DskipTests
}
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

$LauncherJar = Join-Path $LauncherDir "target\footwear-launcher.jar"
if (-not (Test-Path $LauncherJar)) { throw "Launcher JAR not found" }

if (-not (Test-Path $BackendJar)) {
    throw "Backend JAR not found. Run build-desktop.ps1 first."
}

# 2. JavaFX SDK
Write-Host "`n[2/5] Preparing JavaFX SDK..." -ForegroundColor Yellow
$JavafxSdk = & (Join-Path $DesktopDir "download-javafx.ps1")
$JavafxLib = Join-Path $JavafxSdk "lib"
$JavafxBin = Join-Path $JavafxSdk "bin"

# 3. Find jpackage (needs full JDK)
Write-Host "`n[3/5] Running jpackage..." -ForegroundColor Yellow
$JpackageCmd = $null
if (Get-Command jpackage -ErrorAction SilentlyContinue) {
    $JpackageCmd = (Get-Command jpackage).Source
} elseif ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\jpackage.exe"))) {
    $JpackageCmd = Join-Path $env:JAVA_HOME "bin\jpackage.exe"
} else {
    $JdkCache = & (Join-Path $DesktopDir "download-jdk.ps1")
    $CachedJpackage = Join-Path $JdkCache "bin\jpackage.exe"
    if (Test-Path $CachedJpackage) {
        $JpackageCmd = $CachedJpackage
    }
}

$InputDir = Join-Path $DesktopDir "launcher-input"
$BuildDir = Join-Path $DesktopDir "app-image-build"
if (Test-Path $InputDir) { Remove-Item $InputDir -Recurse -Force }
if (Test-Path $BuildDir) { Remove-Item $BuildDir -Recurse -Force }
New-Item -ItemType Directory -Path $InputDir -Force | Out-Null
Copy-Item $LauncherJar (Join-Path $InputDir "footwear-launcher.jar") -Force

$AppImage = $null
if ($JpackageCmd) {
    $JpackageArgs = @(
        "--type", "app-image",
        "--name", $AppName,
        "--input", $InputDir,
        "--main-jar", "footwear-launcher.jar",
        "--main-class", "com.footwearshop.launcher.ShivamLauncher",
        "--dest", $BuildDir,
        "--module-path", $JavafxLib,
        "--add-modules", "javafx.controls,javafx.web",
        "--java-options", "-Dfile.encoding=UTF-8"
    )

    $IconPath = Join-Path $DesktopDir "icon.ico"
    if (Test-Path $IconPath) {
        $JpackageArgs += @("--icon", $IconPath)
    }

    & $JpackageCmd @JpackageArgs
    if ($LASTEXITCODE -eq 0) {
        $AppImage = Join-Path $BuildDir $AppName
    } else {
        Write-Host "jpackage failed - using JavaFX launcher fallback only." -ForegroundColor Yellow
    }
} else {
    Write-Host "jpackage not found - using JavaFX launcher fallback only." -ForegroundColor Yellow
}

# 4. Assemble final portable folder
Write-Host "`n[4/5] Assembling portable app folder..." -ForegroundColor Yellow
if (Test-Path $OutputDir) {
    try { Remove-Item $OutputDir -Recurse -Force -ErrorAction Stop }
    catch { Write-Host "Output folder in use - updating in place..." -ForegroundColor Yellow }
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

if ($AppImage -and (Test-Path $AppImage)) {
    Copy-Item -Path (Join-Path $AppImage "*") -Destination $OutputDir -Recurse -Force
    # Copy JavaFX native DLLs into jpackage runtime (required for WebView)
    if (Test-Path (Join-Path $OutputDir "runtime\bin")) {
        Copy-Item (Join-Path $JavafxBin "*.dll") (Join-Path $OutputDir "runtime\bin") -Force
    }
}

New-Item -ItemType Directory -Path (Join-Path $OutputDir "app") -Force | Out-Null
Copy-Item $BackendJar (Join-Path $OutputDir "app\footwear-backend.jar") -Force
Copy-Item $LauncherJar (Join-Path $OutputDir "app\footwear-launcher.jar") -Force
New-Item -ItemType Directory -Path (Join-Path $OutputDir "data") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDir "backups") -Force | Out-Null

# Bundle JRE for Spring Boot backend subprocess
$JreCache = & (Join-Path $DesktopDir "download-jre.ps1")
$JreDest = Join-Path $OutputDir "jre"
if (Test-Path $JreDest) { Remove-Item $JreDest -Recurse -Force -ErrorAction SilentlyContinue }
Copy-Item $JreCache $JreDest -Recurse -Force

# Bundle JavaFX for fallback launcher (launch-desktop.bat)
Write-Host "`n[5/5] Bundling JavaFX for desktop launcher..." -ForegroundColor Yellow
$JavafxDest = Join-Path $OutputDir "javafx"
if (Test-Path $JavafxDest) { Remove-Item $JavafxDest -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $JavafxDest "lib") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $JavafxDest "bin") -Force | Out-Null
Copy-Item (Join-Path $JavafxLib "*") (Join-Path $JavafxDest "lib") -Force
Copy-Item (Join-Path $JavafxBin "*.dll") (Join-Path $JavafxDest "bin") -Force

Copy-Item (Join-Path $DesktopDir "Start Shivam Footwear.bat") $OutputDir -Force
Copy-Item (Join-Path $DesktopDir "Stop Shivam Footwear.bat") $OutputDir -Force
Copy-Item (Join-Path $DesktopDir "launch-desktop.bat") $OutputDir -Force
Copy-Item (Join-Path $DesktopDir "run-launcher.ps1") $OutputDir -Force
Copy-Item (Join-Path $DesktopDir "README.txt") $OutputDir -Force

Remove-Item $InputDir -Recurse -Force -ErrorAction SilentlyContinue

$ExePath = Join-Path $OutputDir "$AppName.exe"
Write-Host "`n=== EXE BUILD COMPLETE ===" -ForegroundColor Green
Write-Host "App folder: $OutputDir"
if (Test-Path $ExePath) {
    Write-Host "Executable: $ExePath"
    Write-Host "Double-click: $ExePath"
} else {
    Write-Host "Fallback: launch-desktop.bat (JavaFX desktop window)"
}
