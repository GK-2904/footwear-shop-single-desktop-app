# Downloads portable Temurin JDK 17 for Windows x64 (needed for jpackage on build machine)
param(
    [string]$TargetDir = (Join-Path $PSScriptRoot "jdk-cache")
)

$ErrorActionPreference = "Stop"

if (Test-Path (Join-Path $TargetDir "bin\jpackage.exe")) {
    Write-Host "JDK already exists at $TargetDir"
    return $TargetDir
}

Write-Host "Downloading Temurin JDK 17 for Windows (one-time, ~180 MB)..." -ForegroundColor Yellow

$apiUrl = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse"
$zipPath = Join-Path $env:TEMP "temurin-jdk17.zip"
$extractPath = Join-Path $env:TEMP "temurin-jdk17-extract"

if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }
New-Item -ItemType Directory -Path $extractPath -Force | Out-Null

Invoke-WebRequest -Uri $apiUrl -OutFile $zipPath -UseBasicParsing
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

$jdkRoot = Get-ChildItem $extractPath -Directory | Select-Object -First 1
if (-not $jdkRoot) { throw "Failed to extract JDK" }

if (Test-Path $TargetDir) { Remove-Item $TargetDir -Recurse -Force }
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
Copy-Item -Path (Join-Path $jdkRoot.FullName "*") -Destination $TargetDir -Recurse

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "JDK ready at $TargetDir" -ForegroundColor Green
& (Join-Path $TargetDir "bin\java.exe") -version
return $TargetDir
