@echo off
chcp 65001 >nul
title NEW LIFE Sàrl - Aggiornamento Dati da Excel
echo ====================================================================
echo        NEW LIFE Sàrl - Aggiornamento Automatico Dati Excel
echo ====================================================================
echo.
echo [1/2] Elaborazione file Excel (Conto Corrente e Ammortamenti)...
python "%~dp0update_data_from_excel.py"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo [OK] I dati sono stati aggiornati con successo!
    echo ====================================================================
) else (
    echo.
    echo [ERRORE] Si e verificato un errore durante l'aggiornamento dei dati.
)
echo.
pause
