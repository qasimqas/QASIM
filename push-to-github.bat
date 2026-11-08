@echo off
title Push Brew & Bean Store to GitHub
cd /d "C:\Users\cWW\.gemini\antigravity\scratch\brew_bean_coffee_store"
echo ===================================================
echo Pushing Brew & Bean Coffee Store to GitHub (QASIM)
echo ===================================================
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code successfully pushed to https://github.com/qasimqas/QASIM!
) else (
    echo [INFO] Agar login prompt aye to 'Sign in with your browser' par click karein.
)
pause
