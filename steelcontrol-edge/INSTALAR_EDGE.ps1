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

Write-Host '[4/5] Configurando descoberta local...'
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($IsAdmin) {
  try {
    Get-NetFirewallRule -DisplayName 'SteelControl Edge Provisionamento' -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName 'SteelControl Edge Provisionamento' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4211 | Out-Null
    Write-Host 'Firewall TCP/4211 liberado para provisionamento Edge.' -ForegroundColor Green
  } catch { Write-Host 'Nao foi possivel criar a regra de firewall automaticamente.' -ForegroundColor Yellow }
} else {
  Write-Host 'Execute o instalador como Administrador se o Windows bloquear o TCP/4211 do Edge.' -ForegroundColor Yellow
}

Write-Host '[5/6] Registrando protocolo steelcontrol:// para abrir o Edge...' -ForegroundColor Yellow
$ProtocolKey = 'HKCU:\Software\Classes\steelcontrol'
$ProtocolCommand = Join-Path $EdgeDir 'ABRIR_STEELCONTROL_EDGE.ps1'
New-Item -Path $ProtocolKey -Force | Out-Null
Set-Item -Path $ProtocolKey -Value 'URL:SteelControl Edge Protocol'
New-ItemProperty -Path $ProtocolKey -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
New-Item -Path (Join-Path $ProtocolKey 'shell\open\command') -Force | Out-Null
$Command = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + $ProtocolCommand + '" "%1"'
Set-Item -Path (Join-Path $ProtocolKey 'shell\open\command') -Value $Command

Write-Host '[6/6] Validando instalacao...' -ForegroundColor Yellow
& $Py -c "import requests, serial, tkinter, pymodbus, paho.mqtt.client, asyncua; print('Dependencias Edge 2.1 OK')"

Write-Host ''
Write-Host 'SteelControl Edge 2.1 instalado com sucesso.' -ForegroundColor Green
Write-Host 'Protocolo steelcontrol:// registrado para este usuario.' -ForegroundColor Green
Write-Host "Atalho: $ShortcutPath" -ForegroundColor Gray
Write-Host ''
Write-Host 'Abrindo SteelControl Edge...' -ForegroundColor Cyan
Start-Process (Join-Path $EdgeDir 'INICIAR_STEELCONTROL_EDGE.bat')
