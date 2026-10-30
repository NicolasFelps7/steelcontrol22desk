# Validação da revisão de segurança — 30/10/2026

Base Git: d36f11f (`Sincroniza lista do Edge e simplifica cadastro de maquinas`). Alterações preparadas localmente; esta evidência não afirma que o Railway ou uma instalação Edge já estejam atualizados.

| Verificação | Resultado |
| --- | --- |
| Backend com Node.js 22.23.4, dependências reinstaladas a partir do novo lockfile | 205 testes passaram, 0 falhas |
| Edge com Python 3.12 e requests/pyserial instalados | 49 testes passaram, 0 falhas |
| Desktop/Electron, testes de política e ciclo de vida com Node.js 22.23.4 | 11 testes passaram, 0 falhas |
| `npm audit --omit=dev` no backend, consulta de 30/10/2026 | 0 vulnerabilidades conhecidas retornadas |
| Checks de produção, estático, controladores, Dobot, segredos, Docker, plataforma e hashes de código | Passaram |
| `git diff --check` | Passou |
| Patch aplicado em checkout limpo da base | Passou: checkout limpo d36f11f, aplicação e `git diff --check` |

Total: 265 testes automatizados. Nenhum teste desta revisão executou movimento em equipamento físico. As baterias usam fakes/mocks, HTTP local, driver MOCK e PGlite nos testes de banco existentes. O script PowerShell não foi executado em Windows nesta revisão; seu payload foi decodificado e aplicado com Git em checkout limpo, e os arquivos resultantes foram comparados byte a byte. O runtime Electron gráfico não foi aberto nesta revisão; os testes do desktop exercitam políticas/processos. Flutter não foi recompilado/testado nesta revisão; a API compartilhada aplica as mesmas autorizações aos clientes mobile.

A consulta inicial npm apontava 4 alertas (2 altos e 2 moderados), relacionados a body-parser, multer, nodemailer e qs. O lockfile foi atualizado, incluindo body-parser 2.4.0, multer 2.5.0, nodemailer 10.3.1 e qs 6.17.1. Zero alertas conhecidos retornados pela consulta não demonstra ausência de falhas desconhecidas nem cobre sistema operacional, Electron, dependências Python ou infraestrutura.

Os testes novos em `backend/test/security-hardening.test.js`, o teste de MFA concorrente e `steelcontrol-edge/tests/test_command_security.py` exercitam:

- Usuário de outra empresa, empresa forjada no token e comando de outra máquina.
- Chave revogada, cargo revogado, sessão expirada e autenticação privilegiada sem MFA.
- Consumo concorrente do mesmo desafio MFA em modo de teste local (um sucesso, uma rejeição). O código Redis usa GETDEL; não houve teste contra um serviço Redis real nesta execução.
- Mudança de e-mail/IP para tentar contornar limites e requisições por cookie sem origem válida.
- Datas de comando ausentes/alteradas/vencidas, IDs inválidos, driver/comando desconhecido, NaN/infinito/booleanos, limites de movimento e alteração de conteúdo após entrega.
- Resultado incerto após reinício, duas conexões ao mesmo registro SQLite, reentrega e deduplicação persistente.
- Cancelamento concorrente com ACK, perda de comunicação, trava local após falha e proteção de logs.
- Conexão Dobot sem recuperação automática de alarme/fila; HOME remoto bloqueado.

Não houve pentest externo, ensaio do Dobot real, validação de parada física, inspeção das variáveis privadas do Railway, assinatura do instalador ou teste de carga/múltiplas réplicas. Limites e pendências estão em `SEGURANCA_COMANDOS.md`.

Reprodução:

```sh
cd backend
npm ci --include=dev --ignore-scripts
npm run prisma:generate
node --test --test-concurrency=1 test/*.test.js
npm audit --omit=dev
cd ..
python -m unittest discover -s steelcontrol-edge/tests
node --test desktop/test/*.test.cjs
npm run check
npm run check:static
npm run check:controllers
npm run check:dobot
npm run check:secrets
npm run check:docker
npm run check:platform
npm run check:freeze
```

Para Python, instalar primeiro as dependências do Edge em ambiente virtual. Para reproduzir somente os testes usados nesta execução bastam requests e pyserial: os demais drivers são importados de forma tardia e foram substituídos por fakes nos cenários testados. Isso não equivale a validar cada protocolo físico suportado.
