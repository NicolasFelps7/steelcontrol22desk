# SteelControl com Edge integrado — 1.2.0

Consulte `STEELCONTROL_EDGE_FLUXO.md` para o fluxo atual. O Edge é instalado no
computador e abre uma janela dedicada ao receber a máquina cadastrada no site.
O servidor continua no Railway e o mobile utiliza o mesmo vínculo.

Para gerar o instalador no Windows, use o workflow desktop-windows já existente
ou execute `GERAR_INSTALADOR_DESKTOP.bat` na raiz com Node 22 e Python 3.12.
O script inclui os drivers Python, testa o motor e empacota o aplicativo. O
artefato será `desktop/release/SteelControl-Instalador-1.2.0.exe`.

O programa registra `steelcontrol://connect?maquinaId=ID`. O link contém somente
um identificador, nunca credenciais ou comandos. A conta e a empresa são validadas
no sistema antes de autorizar o vínculo e a configuração. O Edge precisa estar
atualizado e ter sido aberto após a instalação. O navegador pode exigir um clique
manual ou autorização para abrir aplicativos externos.
