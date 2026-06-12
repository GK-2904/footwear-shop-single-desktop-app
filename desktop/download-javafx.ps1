# Downloads OpenJFX SDK 21 for Windows x64 (needed for jpackage + launcher)
param(
    [string]$TargetDir = (Join-Path $PSScriptRoot "javafx-sdk")
)

$ErrorActionPreference = "Stop"
$JavafxVersion = "21.0.6"

if (Test-Path (Join-Path $TargetDir "lib\javafx.web.jar")) {
    Write-Host "JavaFX SDK already exists at $TargetDir"
    return $TargetDir
}

Write-Host "Downloading OpenJFX SDK $JavafxVersion for Windows..." -ForegroundColor Yellow

$zipUrl = "https://download2.gluonhq.com/openjfx/$JavafxVersion/openjfx-$JavafxVersion`_windows-x64_bin-sdk.zip"
$zipPath = Join-Path $env:TEMP "openjfx-sdk.zip"
$extractPath = Join-Path $env:TEMP "openjfx-sdk-extract"

if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }
New-Item -ItemType Directory -Path $extractPath -Force | Out-Null

Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

$sdkRoot = Get-ChildItem $extractPath -Directory | Select-Object -First 1
if (-not $sdkRoot) { throw "Failed to extract JavaFX SDK" }

if (Test-Path $TargetDir) { Remove-Item $TargetDir -Recurse -Force }
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
Copy-Item -Path (Join-Path $sdkRoot.FullName "*") -Destination $TargetDir -Recurse

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "JavaFX SDK ready at $TargetDir" -ForegroundColor Green
return $TargetDir
