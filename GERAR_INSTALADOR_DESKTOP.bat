@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0desktop\GERAR_INSTALADOR.ps1"
if errorlevel 1 (
  echo.
  echo Nao foi possivel gerar o instalador. Confira a mensagem acima.
)
pause
