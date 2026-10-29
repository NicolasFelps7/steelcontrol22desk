$ErrorActionPreference = 'Stop'
$EdgeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $EdgeDir
$Venv = Join-Path $Root '.venv-edge'
$Req = Join-Path $EdgeDir 'requirements.txt'

Write-Host ''
Write-Host '=============================================' -ForegroundColor DarkGray
Write-Host ' SteelControl Edge 2.1 - Instalacao' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor DarkGray

$Python = $null
foreach ($candidate in @('py', 'python')) {
  try {
    & $candidate --version *> $null
    if ($LASTEXITCODE -eq 0) { $Python = $candidate; break }
  } catch {}
}
if (-not $Python) {
  throw 'Python 3 nao encontrado. Instale o Python 3.11+ e marque Add Python to PATH.'
}

if (-not (Test-Path $Venv)) {
  Write-Host '[1/4] Criando ambiente isolado...' -ForegroundColor Yellow
  if ($Python -eq 'py') { & py -3 -m venv $Venv } else { & python -m venv $Venv }
}
$Py = Join-Path $Venv 'Scripts\python.exe'
$Pip = Join-Path $Venv 'Scripts\pip.exe'

Write-Host '[2/4] Instalando dependencias...' -ForegroundColor Yellow
& $Py -m pip install --upgrade pip
& $Pip install -r $Req
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar as dependencias Python do Edge.' }

Write-Host '[3/4] Criando atalho na Area de Trabalho...' -ForegroundColor Yellow
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $Desktop 'SteelControl Edge.lnk'
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = Join-Path $EdgeDir 'INICIAR_STEELCONTROL_EDGE.bat'
$Shortcut.WorkingDirectory = $EdgeDir
$Icon = Join-Path $EdgeDir 'assets\steel-icon.png'
$Shortcut.Description = 'SteelControl Edge - Provisionamento de equipamentos industriais'
$Shortcut.Save()

Write-Host '[4/6] Preparando Desktop com Edge integrado ao Railway...' -ForegroundColor Yellow
$Npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $Npm) { throw 'Node.js/npm nao encontrado. Instale Node.js 22 LTS e tente novamente.' }
& $Npm.Source --prefix (Join-Path $Root 'desktop') ci
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar o Desktop. Confira a internet e tente novamente.' }
# O Edge integrado sincroniza por HTTPS de saida; nao precisa abrir TCP/4211.

Write-Host '[5/6] Registrando protocolo steelcontrol:// para este usuario...' -ForegroundColor Yellow
$Handler = Join-Path $EdgeDir 'steelcontrol-protocol-handler.ps1'
if (-not (Test-Path $Handler)) { throw "Manipulador de protocolo nao encontrado: $Handler" }
$ProtocolKey = 'HKCU:\Software\Classes\steelcontrol'
New-Item -Path $ProtocolKey -Force | Out-Null
Set-Item -Path $ProtocolKey -Value 'URL:SteelControl Edge Protocol'
New-ItemProperty -Path $ProtocolKey -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
$CommandKey = Join-Path $ProtocolKey 'shell\open\command'
New-Item -Path $CommandKey -Force | Out-Null
$PowerShellExe = Join-Path $PSHOME 'powershell.exe'
$OpenCommand = '"' + $PowerShellExe + '" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $Handler + '" "%1"'
Set-Item -Path $CommandKey -Value $OpenCommand
Write-Host 'Protocolo steelcontrol:// registrado para o usuario atual.' -ForegroundColor Green

Write-Host '[6/6] Validando instalacao...' -ForegroundColor Yellow
& $Py -c "import requests, serial, tkinter, pymodbus, paho.mqtt.client, asyncua; print('Dependencias Edge 2.1 OK')"

Write-Host ''
Write-Host 'SteelControl Edge 2.1 instalado com sucesso.' -ForegroundColor Green
Write-Host "Atalho: $ShortcutPath" -ForegroundColor Gray
Write-Host ''
Write-Host 'Abrindo SteelControl Edge...' -ForegroundColor Cyan
Start-Process (Join-Path $EdgeDir 'INICIAR_STEELCONTROL_EDGE.bat')
