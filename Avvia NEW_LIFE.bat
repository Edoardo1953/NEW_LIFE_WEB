@echo off
title NEW LIFE Sarl
cd /d "%~dp0"
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Avvio del server NEW LIFE Sarl...
    start "" python "%~dp0server.py"
) else (
    echo Apertura diretta dell'applicazione...
    start "" "%~dp0index.html"
)
exit
