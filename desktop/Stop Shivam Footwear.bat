@echo off
title Shivam Footwear Shop - Stop
set "PATH=%SystemRoot%\System32;%SystemRoot%;%SystemRoot%\System32\Wbem;%PATH%"
echo Stopping Shivam Footwear Shop...


taskkill /IM "ShivamFootwear.exe" /F >nul 2>&1
taskkill /IM "Shivam Footwear.exe" /F >nul 2>&1

for /f "tokens=5" %%a in ('%SystemRoot%\System32\netstat.exe -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Stopping process PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Application stopped.
%SystemRoot%\System32\timeout.exe /t 3 /nobreak >nul
