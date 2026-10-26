param([string]$ProtocolUrl = '')
$ErrorActionPreference = 'Stop'
$EdgeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Bat = Join-Path $EdgeDir 'INICIAR_STEELCONTROL_EDGE.bat'
if (-not (Test-Path $Bat)) { exit 2 }
# The URL is accepted only as a launch trigger; credentials are never read from it.
Start-Process -FilePath $Bat -WorkingDirectory $EdgeDir
