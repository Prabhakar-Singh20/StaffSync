@echo off
echo ========================================================
echo         Starting StaffSync HRM Solution...
echo ========================================================
echo.

start "StaffSync Backend Server (Port 5000)" cmd /k "cd /d \"%~dp0server\" && npm start"
timeout /t 3 /nobreak >nul
start "StaffSync Frontend Client (Port 5173)" cmd /k "cd /d \"%~dp0client\" && npm run dev"

echo.
echo Servers launched!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
pause
