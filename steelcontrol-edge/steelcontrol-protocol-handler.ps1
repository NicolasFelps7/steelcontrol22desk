param(
  [Parameter(Position = 0)]
  [string]$Url
)
$ErrorActionPreference = 'Stop'
$EdgeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Launcher = Join-Path $EdgeDir 'INICIAR_STEELCONTROL_EDGE.bat'
$Python = Join-Path (Split-Path -Parent $EdgeDir) '.venv-edge\Scripts\python.exe'
if (-not (Test-Path $Python)) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show('O SteelControl Edge ainda não foi instalado. Execute INSTALAR_STEELCONTROL_EDGE.ps1 na pasta baixada.','SteelControl Edge') | Out-Null
  exit 1
}
if (Test-Path $Launcher) {
  Start-Process -FilePath $Launcher -WorkingDirectory $EdgeDir
}
