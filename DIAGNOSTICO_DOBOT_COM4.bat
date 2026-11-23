@echo off
setlocal
cd /d "%~dp0"
set "PY=%~dp0.venv-edge\Scripts\python.exe"
if not exist "%PY%" (
  echo [ERRO] Nao encontrei o Python do Edge em .venv-edge\Scripts\python.exe
  echo Instale o Edge conforme as instrucoes do projeto, depois tente novamente.
  pause
  exit /b 1
)
"%PY%" "%~dp0DIAGNOSTICO_DOBOT_COM4.py"
echo.
echo Relatorio: RESULTADO_DIAGNOSTICO_COM4.txt
pause
endlocal
