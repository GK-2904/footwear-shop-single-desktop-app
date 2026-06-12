# Deploy / update Shivam Footwear on client PC at D:\SHIVAM_FOOTWEAR\ShivamFootwear
# Run: powershell -ExecutionPolicy Bypass -File desktop\deploy-to-client.ps1

$ErrorActionPreference = "Stop"
$ClientDir = "D:\SHIVAM_FOOTWEAR\ShivamFootwear"
$DesktopDir = $PSScriptRoot

Write-Host "=== Deploying to $ClientDir ===" -ForegroundColor Cyan

if (-not (Test-Path $ClientDir)) {
    New-Item -ItemType Directory -Path $ClientDir -Force | Out-Null
}

$AppImageDir = Join-Path $DesktopDir "ShivamFootwear-App"
$PortableDir = Join-Path $DesktopDir "ShivamFootwear"

# Build latest app if EXE package missing
if (-not (Test-Path (Join-Path $AppImageDir "ShivamFootwear.exe")) -and
    -not (Test-Path (Join-Path $AppImageDir "Shivam Footwear.exe")) -and
    -not (Test-Path (Join-Path $PortableDir "app\footwear-backend.jar"))) {
    Write-Host "Building app first..." -ForegroundColor Yellow
    & (Join-Path $DesktopDir "build-desktop.ps1")
}

$SourceDir = $null
if ((Test-Path (Join-Path $AppImageDir "ShivamFootwear.exe")) -or (Test-Path (Join-Path $AppImageDir "Shivam Footwear.exe"))) {
    $SourceDir = $AppImageDir
    Write-Host "Deploying desktop EXE package..." -ForegroundColor Yellow
} elseif (Test-Path (Join-Path $PortableDir "app\footwear-backend.jar")) {
    $SourceDir = $PortableDir
    Write-Host "Deploying portable package (no EXE)..." -ForegroundColor Yellow
} else {
    throw "No build output found. Run build-desktop.ps1 first."
}

Write-Host "Copying files to client folder..." -ForegroundColor Yellow

# Copy EXE + runtime (native desktop app)
if (Test-Path (Join-Path $SourceDir "ShivamFootwear.exe")) {
    Copy-Item (Join-Path $SourceDir "ShivamFootwear.exe") $ClientDir -Force
}
# Remove old EXE name from previous builds (causes cfg mismatch errors)
$OldExe = Join-Path $ClientDir "Shivam Footwear.exe"
if (Test-Path $OldExe) { Remove-Item $OldExe -Force -ErrorAction SilentlyContinue }

if (Test-Path (Join-Path $SourceDir "launch-desktop.bat")) {
    Copy-Item (Join-Path $SourceDir "launch-desktop.bat") $ClientDir -Force
}
if (Test-Path (Join-Path $SourceDir "javafx")) {
    if (Test-Path "$ClientDir\javafx") { Remove-Item "$ClientDir\javafx" -Recurse -Force -ErrorAction SilentlyContinue }
    Copy-Item (Join-Path $SourceDir "javafx") $ClientDir -Recurse -Force
}

if (Test-Path (Join-Path $SourceDir "runtime")) {
    $RuntimeDest = Join-Path $ClientDir "runtime"
    if (Test-Path $RuntimeDest) {
        try { Remove-Item $RuntimeDest -Recurse -Force -ErrorAction Stop }
        catch { Write-Host "Runtime folder locked - skipping runtime refresh." -ForegroundColor Yellow; $RuntimeDest = $null }
    }
    if ($RuntimeDest) {
        Copy-Item (Join-Path $SourceDir "runtime") $ClientDir -Recurse -Force
    }
}

# Copy full app folder (jars + jpackage .cfg required by EXE)
$AppSource = Join-Path $SourceDir "app"
$AppDest = Join-Path $ClientDir "app"
New-Item -ItemType Directory -Path $AppDest -Force | Out-Null
Copy-Item (Join-Path $AppSource "*") $AppDest -Force

# Copy launchers and docs
Copy-Item (Join-Path $DesktopDir "Start Shivam Footwear.bat") $ClientDir -Force
Copy-Item (Join-Path $DesktopDir "Stop Shivam Footwear.bat") $ClientDir -Force
Copy-Item (Join-Path $DesktopDir "README.txt") $ClientDir -Force
if (Test-Path (Join-Path $SourceDir "run-launcher.ps1")) {
    Copy-Item (Join-Path $SourceDir "run-launcher.ps1") $ClientDir -Force
}

# Copy Universal CRT DLLs for Windows 7 support (app-local deployment)
Write-Host "Bundling Universal CRT DLLs for Windows 7 support..." -ForegroundColor Yellow
$System32 = "C:\Windows\System32"
$UcrtDlls = @("ucrtbase.dll", "vcruntime140.dll", "msvcp140.dll")
foreach ($dll in $UcrtDlls) {
    if (Test-Path (Join-Path $System32 $dll)) {
        Copy-Item (Join-Path $System32 $dll) $ClientDir -Force
        if (Test-Path "$ClientDir\runtime\bin") {
            Copy-Item (Join-Path $System32 $dll) "$ClientDir\runtime\bin" -Force
        }
        if (Test-Path "$ClientDir\jre\bin") {
            Copy-Item (Join-Path $System32 $dll) "$ClientDir\jre\bin" -Force
        }
    }
}
if (Test-Path (Join-Path $System32 "api-ms-win-crt-*.dll")) {
    Copy-Item (Join-Path $System32 "api-ms-win-crt-*.dll") $ClientDir -Force
    if (Test-Path "$ClientDir\runtime\bin") {
        Copy-Item (Join-Path $System32 "api-ms-win-crt-*.dll") "$ClientDir\runtime\bin" -Force
    }
    if (Test-Path "$ClientDir\jre\bin") {
        Copy-Item (Join-Path $System32 "api-ms-win-crt-*.dll") "$ClientDir\jre\bin" -Force
    }
}


# Legacy JRE bundle (only for non-EXE portable fallback)
if (-not (Test-Path (Join-Path $ClientDir "runtime\bin\java.exe"))) {
    $JreCache = Join-Path $DesktopDir "jre-cache"
    if (-not (Test-Path (Join-Path $JreCache "bin\java.exe"))) {
        & (Join-Path $DesktopDir "download-jre.ps1") -TargetDir $JreCache
    }
    $JreDest = "$ClientDir\jre"
    if (Test-Path $JreDest) {
        try { Remove-Item $JreDest -Recurse -Force -ErrorAction Stop }
        catch { Write-Host "JRE folder locked - skipping JRE refresh." -ForegroundColor Yellow; $JreDest = $null }
    }
    if ($JreDest) {
        Copy-Item $JreCache $JreDest -Recurse -Force
    }
}

# Preserve data and backups (do not overwrite)
New-Item -ItemType Directory -Path "$ClientDir\data" -Force | Out-Null
New-Item -ItemType Directory -Path "$ClientDir\backups" -Force | Out-Null

Write-Host "`n=== DEPLOY COMPLETE ===" -ForegroundColor Green
Write-Host "Client path: $ClientDir"
$hasExe = (Test-Path (Join-Path $ClientDir "ShivamFootwear.exe")) -or (Test-Path (Join-Path $ClientDir "Shivam Footwear.exe"))
Write-Host "Desktop EXE:   $hasExe"
Write-Host "Java bundled:  $(Test-Path "$ClientDir\runtime\bin\java.exe")"
if (Test-Path (Join-Path $ClientDir "ShivamFootwear.exe")) {
    Write-Host "`nNow double-click: $ClientDir\ShivamFootwear.exe"
} elseif ($hasExe) {
    Write-Host "`nNow double-click: $ClientDir\Shivam Footwear.exe"
} else {
    Write-Host "`nNow double-click: $ClientDir\Start Shivam Footwear.bat"
}
