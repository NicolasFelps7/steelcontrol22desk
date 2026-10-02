# Validação da entrega 3.1.0

Executado em 2026-09-28:

- sintaxe dos runtimes JavaScript: aprovada;
- estrutura HTML e balanceamento CSS: aprovados;
- verificação estática de rotas, IDs, assets locais e política offline: aprovada;
- sete perfis de controladores e IHM supervisionada: aprovados;
- verificação profissional do Dobot: aprovada;
- 54 testes automatizados do backend passaram no ambiente de empacotamento;
- cinco testes adicionais exigem a instalação local completa das dependências `dotenv` e `redis`; elas já constam no `package.json` e no lockfile e são instaladas pelo inicializador/NPM.

Para repetir a suíte completa em uma estação de desenvolvimento:

```powershell
cd backend
npm ci
cd ..
npm test
npm run check:static
npm run check:controllers
npm run check:dobot
```
