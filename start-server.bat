@echo off
title Brew & Bean Local Server
echo Starting Brew & Bean Coffee Store on http://localhost:8000 ...
start http://localhost:8000
"C:\xampp\php\php.exe" -S localhost:8000
pause
