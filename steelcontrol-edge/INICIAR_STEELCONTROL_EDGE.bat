@echo off
setlocal
cd /d "%~dp0"
set "PY=%~dp0..\.venv-edge\Scripts\python.exe"
if not exist "%PY%" (
  echo Instale as dependencias do Edge uma vez:
  echo powershell -ExecutionPolicy Bypass -File "%~dp0INSTALAR_EDGE.ps1"
  pause
  exit /b 1
)
if not exist "%~dp0..\desktop\node_modules\electron\package.json" (
  echo Instale as dependencias do Desktop uma vez:
  echo npm --prefix "%~dp0..\desktop" ci
  pause
  exit /b 1
)
set "STEELCONTROL_PYTHON=%PY%"
cd /d "%~dp0..\desktop"
call npm start
endlocal
