param([Parameter(Position = 0)][string]$Url)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Desktop = Join-Path $Root 'desktop'
$Electron = Join-Path $Desktop 'node_modules\electron\dist\electron.exe'
$Python = Join-Path $Root '.venv-edge\Scripts\python.exe'
# O protocolo aceita somente um ID numérico; nenhuma chave, servidor ou comando.
if ($Url -notmatch '^steelcontrol://connect/?(?:\?maquinaId=([1-9][0-9]{0,9}))?$') { exit 2 }
$MachineId = $Matches[1]
if ($MachineId -and [long]$MachineId -gt 2147483647) { exit 2 }
if (-not (Test-Path $Python) -or -not (Test-Path $Electron)) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show('Execute INSTALAR_STEELCONTROL_EDGE.ps1 na pasta extraida para instalar o Edge integrado ao Desktop.','SteelControl Edge') | Out-Null
  exit 1
}
$Target = 'steelcontrol://connect'
if ($MachineId) { $Target += '?maquinaId=' + $MachineId }
Start-Process -FilePath $Electron -ArgumentList @(('"' + $Desktop + '"'), $Target) -WorkingDirectory $Desktop
