@echo off
title Push StaffSync to GitHub
echo ========================================================
echo          Uploading StaffSync to GitHub...
echo ========================================================
echo.

cd /d "%~dp0"

echo Repository: https://github.com/Prabhakar-Singh20/StaffSync
echo Branch:     main
echo.
echo Running: git push -u origin main
echo (If a browser window pops up, click "Sign in with your browser")
echo.

git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo  [SUCCESS] Uploaded to GitHub successfully!
    echo  Link: https://github.com/Prabhakar-Singh20/StaffSync
) else (
    echo  [NOTE] If login was needed, please retry or sign in.
)
echo ========================================================
echo.
pause
