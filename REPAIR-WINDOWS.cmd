@echo off
cd /d "%~dp0"
call npm run repair
if errorlevel 1 (
  echo Repair failed. Read the message above.
  pause
  exit /b 1
)
echo Installation complete. Fill in .env.local, then run npm run dev.
pause
