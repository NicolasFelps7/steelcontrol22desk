$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$DesktopDir = $PSScriptRoot
$Root = Split-Path -Parent $DesktopDir
$EdgeDir = Join-Path $Root 'steelcontrol-edge'
$Venv = Join-Path $DesktopDir '.venv-build'
function Check-Exit([string]$Step) {
  if ($LASTEXITCODE -ne 0) { throw "$Step falhou (codigo $LASTEXITCODE)." }
}
try {
  Push-Location $DesktopDir
  Write-Host 'Gerando SteelControl Desktop + Edge integrado...' -ForegroundColor Cyan
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Instale Node.js 22 LTS para gerar o instalador.' }
  if (-not (Test-Path $Venv)) {
    if (Get-Command py -ErrorAction SilentlyContinue) { & py -3 -m venv $Venv }
    else { & python -m venv $Venv }
    Check-Exit 'Criacao do ambiente Python'
  }
  $PythonBuild = Join-Path $Venv 'Scripts\python.exe'
  & $PythonBuild -m pip install -r (Join-Path $EdgeDir 'requirements.txt') 'pyinstaller==6.22.3'
  Check-Exit 'Dependencias do Edge'
  & $PythonBuild -m PyInstaller --noconfirm --clean --onedir --console --name SteelControlEdge `
    --distpath (Join-Path $DesktopDir 'edge-dist') --workpath (Join-Path $DesktopDir 'build-edge') `
    --specpath (Join-Path $DesktopDir 'build-edge') --paths $EdgeDir `
    --collect-all asyncua --collect-all pymodbus --collect-all serial --collect-all paho `
    (Join-Path $EdgeDir 'desktop_worker.py')
  Check-Exit 'Empacotamento do Edge'
  & (Join-Path $DesktopDir 'edge-dist\SteelControlEdge\SteelControlEdge.exe') --self-test
  Check-Exit 'Validacao do Edge empacotado'
  & $PythonBuild -m unittest discover -s (Join-Path $EdgeDir 'tests') -v
  Check-Exit 'Testes dos drivers e do processo Edge'
  & npm.cmd ci
  Check-Exit 'Dependencias do Desktop'
  & npm.cmd test
  Check-Exit 'Testes do Desktop'
  & npm.cmd run dist:win
  Check-Exit 'Instalador Windows'
  Write-Host "Instalador criado em: $(Join-Path $DesktopDir 'release')" -ForegroundColor Green
} finally { Pop-Location }
