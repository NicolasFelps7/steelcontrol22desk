# Publicar o download do SteelControl Edge

O pacote de download está em `frontend/downloads/SteelControl-Edge-Windows.zip`. O backend já serve a pasta `frontend` como conteúdo estático, então após enviar estes arquivos e fazer deploy, o download deverá estar em:

- `https://SEU-DOMINIO/downloads/SteelControl-Edge-Windows.zip`
- `https://SEU-DOMINIO/app/downloads/SteelControl-Edge-Windows.zip`

A tela de máquinas já aponta para `/downloads/SteelControl-Edge-Windows.zip`.

**Nota de distribuição:** este pacote usa PowerShell + Python e não é um `.exe` assinado. O usuário precisa ter Python 3.11+ e internet durante a instalação. Para distribuir um `.exe` assinado e independente, é necessário gerar o artefato em ambiente Windows e publicar o binário em uma Release do GitHub ou em armazenamento persistente. Não foi feito deploy nem publicação em conta externa por este patch.
