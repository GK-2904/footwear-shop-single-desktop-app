# Run JavaFX launcher without jpackage (dev / fallback)
param(
    [string]$InstallDir = (Join-Path $PSScriptRoot "ShivamFootwear-App")
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LauncherDir = Join-Path $ProjectRoot "desktop-launcher"
$JavafxSdk = & (Join-Path $PSScriptRoot "download-javafx.ps1")

if (-not (Test-Path $InstallDir)) {
    $InstallDir = Join-Path $PSScriptRoot "ShivamFootwear"
}

$LauncherJar = Join-Path $LauncherDir "target\footwear-launcher.jar"
if (-not (Test-Path $LauncherJar)) {
    Push-Location $LauncherDir
    if (Test-Path "..\backend\mvnw.cmd") {
        ..\backend\mvnw.cmd -q package -DskipTests
    } else {
        mvn -q package -DskipTests
    }
    Pop-Location
}

$JavaCmd = $null
$runtimeJava = Join-Path $InstallDir "runtime\bin\java.exe"
$jreJava = Join-Path $InstallDir "jre\bin\java.exe"
if (Test-Path $runtimeJava) { $JavaCmd = $runtimeJava }
elseif (Test-Path $jreJava) { $JavaCmd = $jreJava }
elseif ($env:JAVA_HOME) { $JavaCmd = Join-Path $env:JAVA_HOME "bin\java.exe" }
else { $JavaCmd = "java" }

$JavafxLib = Join-Path $InstallDir "javafx\lib"
$JavafxBin = Join-Path $InstallDir "javafx\bin"
if (-not (Test-Path (Join-Path $JavafxLib "javafx.web.jar"))) {
    $JavafxLib = Join-Path $JavafxSdk "lib"
    $JavafxBin = Join-Path $JavafxSdk "bin"
}
if (Test-Path $JavafxBin) {
    $env:PATH = "$JavafxBin;$env:PATH"
}

Write-Host "Starting launcher from $InstallDir"
$JavaArgs = @(
    "--module-path", $JavafxLib,
    "--add-modules", "javafx.controls,javafx.web",
    "-Dshivam.install.dir=$InstallDir",
    "-jar", $LauncherJar
)
& $JavaCmd @JavaArgs
