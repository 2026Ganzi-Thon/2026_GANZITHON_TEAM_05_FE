@echo off
cd /d "%~dp0"
set "LETIT_NODE=node"
if exist ".local-runtime\node.exe" (
  set "LETIT_NODE=%~dp0.local-runtime\node.exe"
  set "PATH=%~dp0.local-runtime;%PATH%"
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Run npm ci with Node.js 24 first.
  pause
  exit /b 1
)
"%LETIT_NODE%" node_modules\vite\bin\vite.js --open /home
