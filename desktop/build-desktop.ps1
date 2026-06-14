# Build Shivam Footwear portable desktop package
# Run from project root: powershell -ExecutionPolicy Bypass -File desktop\build-desktop.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BackendDir = Join-Path $ProjectRoot "backend"
$StaticDir = Join-Path $BackendDir "src\main\resources\static"
$OutputDir = Join-Path $PSScriptRoot "ShivamFootwear"

Write-Host "=== Building Shivam Footwear Desktop App ===" -ForegroundColor Cyan

$JreCache = Join-Path $PSScriptRoot "jre-cache"
$LauncherDir = Join-Path $ProjectRoot "desktop-launcher"

# 0. Download portable JRE 17 (bundled so client PC needs no Java install)
Write-Host "`n[0/6] Preparing portable Java (JRE 17)..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "download-jre.ps1") -TargetDir $JreCache

# 1. Build React frontend
Write-Host "`n[1/6] Building React frontend..." -ForegroundColor Yellow
Push-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# 2. Copy dist to Spring Boot static
Write-Host "`n[2/6] Copying frontend to Spring Boot static..." -ForegroundColor Yellow
if (Test-Path $StaticDir) { Remove-Item $StaticDir -Recurse -Force }
New-Item -ItemType Directory -Path $StaticDir -Force | Out-Null
Copy-Item -Path (Join-Path $FrontendDir "dist\*") -Destination $StaticDir -Recurse

# 3. Build Spring Boot JAR
Write-Host "`n[3/6] Building Spring Boot JAR..." -ForegroundColor Yellow
Push-Location $BackendDir
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd clean package -DskipTests -q
} else {
    mvn clean package -DskipTests -q
}
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

$JarFile = Get-ChildItem (Join-Path $BackendDir "target\footwear-backend-*.jar") | Where-Object { $_.Name -notlike "*-original*" } | Select-Object -First 1
if (-not $JarFile) { Write-Error "JAR not found in backend/target/"; exit 1 }

# 4. Build desktop launcher JAR
Write-Host "`n[4/6] Building desktop launcher..." -ForegroundColor Yellow
Push-Location $LauncherDir
if (Test-Path "..\backend\mvnw.cmd") {
    ..\backend\mvnw.cmd -q package -DskipTests
} else {
    mvn -q package -DskipTests
}
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location
$LauncherJar = Join-Path $LauncherDir "target\footwear-launcher.jar"

# 5. Assemble portable folder
Write-Host "`n[5/6] Assembling portable folder..." -ForegroundColor Yellow
if (Test-Path $OutputDir) {
    try { Remove-Item $OutputDir -Recurse -Force -ErrorAction Stop }
    catch { Write-Host "Folder in use - updating files in place..." -ForegroundColor Yellow }
}
New-Item -ItemType Directory -Path (Join-Path $OutputDir "app") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDir "data") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDir "backups") -Force | Out-Null

Copy-Item $JarFile.FullName (Join-Path $OutputDir "app\footwear-backend.jar") -Force
if (Test-Path $LauncherJar) {
    Copy-Item $LauncherJar (Join-Path $OutputDir "app\footwear-launcher.jar") -Force
}
Copy-Item (Join-Path $PSScriptRoot "run-launcher.ps1") $OutputDir -Force
Copy-Item (Join-Path $PSScriptRoot "launch-desktop.bat") $OutputDir -Force
Copy-Item (Join-Path $PSScriptRoot "Start Shivam Footwear.bat") $OutputDir -Force
Copy-Item (Join-Path $PSScriptRoot "Stop Shivam Footwear.bat") $OutputDir -Force
Copy-Item (Join-Path $PSScriptRoot "README.txt") $OutputDir -Force

# Bundle portable JRE so client PC does NOT need Java installed
Write-Host "`n[6/6] Bundling portable Java into package..." -ForegroundColor Yellow
$JreDest = Join-Path $OutputDir "jre"
if (Test-Path $JreDest) { Remove-Item $JreDest -Recurse -Force -ErrorAction SilentlyContinue }
Copy-Item -Path $JreCache -Destination $JreDest -Recurse -Force

# Bundle JavaFX for fallback launcher (launch-desktop.bat) in portable folder
Write-Host "`nBundling JavaFX for desktop launcher..." -ForegroundColor Yellow
$JavafxSdk = & (Join-Path $PSScriptRoot "download-javafx.ps1")
$JavafxLib = Join-Path $JavafxSdk "lib"
$JavafxBin = Join-Path $JavafxSdk "bin"
$JavafxDest = Join-Path $OutputDir "javafx"
if (Test-Path $JavafxDest) { Remove-Item $JavafxDest -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path (Join-Path $JavafxDest "lib") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $JavafxDest "bin") -Force | Out-Null
Copy-Item (Join-Path $JavafxLib "*") (Join-Path $JavafxDest "lib") -Force
Copy-Item (Join-Path $JavafxBin "*.dll") (Join-Path $JavafxDest "bin") -Force

# Create zip
$ZipPath = Join-Path $PSScriptRoot "ShivamFootwear.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path $OutputDir -DestinationPath $ZipPath -Force

# Build native EXE (requires JDK with jpackage on dev machine)
Write-Host "`nBuilding desktop EXE (jpackage)..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "build-exe.ps1") -BackendJar (Join-Path $OutputDir "app\footwear-backend.jar")

Write-Host "`n=== BUILD COMPLETE ===" -ForegroundColor Green
Write-Host "Portable folder: $OutputDir"
Write-Host "Desktop EXE app: $(Join-Path $PSScriptRoot 'ShivamFootwear-App')"
Write-Host "Zip package:     $ZipPath"
Write-Host "`nClient: Double-click 'Shivam Footwear.exe' OR 'Start Shivam Footwear.bat' -> Login PIN 1234"
