# Login do funcionário com sufixo fixo da empresa

Atualização de 19/10/2026, sobre a correção de autorização empresarial.

## Como ficou a tela Novo funcionário

Apenas o administrador da empresa cadastra funcionários na Gestão Industrial.

Exemplo de empresa: **Metalúrgica Alfa**.

| Campo | Exemplo |
|---|---|
| Nome completo | João Silva |
| Login interno: parte digitada | joao.silva |
| Sufixo fixo mostrado ao lado | @metalurgicaalfa.com |
| E-mail real de contato | joao.silva@gmail.com |
| Senha inicial | definida pelo administrador |
| Cargo inicial | Visitante; pode ser ajustado depois pelo administrador |

O login completo será **joao.silva@metalurgicaalfa.com**. O administrador digita
somente `joao.silva`: o backend monta o restante com a empresa da sessão.
O campo do sufixo não pode ser editado. Enviar outro sufixo/empresa pela API
não muda a empresa nem o login atribuído.

**O endereço gerado é um identificador interno. Não registra domínio nem cria
caixa de e-mail.** O e-mail real de contato é separado e recebe os códigos do
segundo fator. A senha e a biometria continuam funcionando; ambos os caminhos
exigem o segundo fator antes de liberar a sessão.

Na tela de entrada, o funcionário pode usar o login completo e a senha.
O e-mail real também continua aceito como alternativa, com os mesmos controles.
O administrador inicial continua usando seu e-mail real.

## Sufixo, duplicidade e contas antigas

O sufixo vem do nome da empresa sem espaços, acentos ou pontuação. Por exemplo,
`Metalúrgica Alfa` gera `metalurgicaalfa.com`. Empresas com nome igual recebem
um complemento numérico apenas quando necessário, para não compartilhar logins.
O sistema preserva o sufixo quando o nome de exibição da empresa muda.

Novos nomes de login aceitam letras sem acentos, números, ponto, hífen e
sublinhado; não aceitam `@`, espaços nem mais de 64 caracteres. Não é possível
criar dois logins iguais ou usar como login o e-mail de outra conta. Essa regra
também tem proteção no banco para chamadas concorrentes.

As contas anteriores são preservadas com seus e-mails e senhas. Não recebem
novos nomes automaticamente. O login interno de novos funcionários aparece na
listagem e na edição, separado do contato; o editor não o renomeia ao trocar o
e-mail de contato.

O cadastro público não cria funcionário com um CNPJ de empresa ativa. Ele orienta a
pessoa a procurar o responsável para que o cadastro seja feito na Gestão
Industrial. Solicitações legadas ainda podem ser analisadas pelo administrador.

## Como aplicar

Atualize o backend antes dos aplicativos. Faça backup do banco e, na raiz do
projeto desktop, execute com Node 20/22:

```powershell
npm --prefix backend ci --include=dev
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:deploy
npm test
npm start
```

A nova migration desta etapa é `20261019180000_login_interno_funcionario`.
Ela cria os campos `Empresa.loginDomain` e `Usuario.loginInterno`, reserva sufixos
para empresas existentes e protege identificadores contra duplicações.
Não use `prisma migrate reset`.

Depois de entrar como administrador, abra **Gestão Industrial → Novo funcionário**.
Se a tela informar que não há sufixo configurado, confira se o backend atualizado
e a migration estão em execução. O aplicativo não inventa um sufixo local como
alternativa.

Para Flutter, atualize o projeto mobile e execute `flutter pub get`,
`flutter analyze`, `flutter test` e `flutter run` no seu computador.

## O que esta alteração não faz

O nome da empresa e o sufixo interno não validam a autorização do primeiro
administrador. A autorização inicial agora exige assinatura com e-CNPJ. Leia
`AUTORIZACAO_ECNPJ.md` para esse procedimento.
Este login interno não atribui automaticamente permissão sobre máquinas.

## Verificação

- 121 testes do backend passaram, incluindo 17 testes novos de login interno.
- Testes cobrem sufixo derivado do nome, nomes inválidos, empresas homônimas,
  cadastro exclusivo por administrador, tentativa de adulterar empresa/sufixo,
  duplicidade e envio de MFA ao e-mail real, mesmo ao entrar com login interno.
- Todas as migrations foram executadas em PostgreSQL embarcado (PGlite).
  Uma base com empresas homônimas e usuários antigos confirmou que os sufixos
  são distintos e os logins antigos são preservados. O banco também rejeitou
  colisões entre login interno e e-mail de outra conta, inclusive em maiúsculas.
- `npm run quality` inclui testes, validações estáticas e integridade do projeto.
- Não houve execução de Flutter/APK nem teste visual em navegador neste ambiente.
  Provedor de e-mail, Face API e máquinas reais precisam de validação na implantação.
