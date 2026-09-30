@echo off
echo ====================================================
echo   Starting SahaayAI Vite Frontend (Port 3000)
echo ====================================================
cd /d "%~dp0"
call npm.cmd run dev
pause
