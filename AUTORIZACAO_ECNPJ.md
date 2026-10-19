# Autorização do primeiro administrador por e-CNPJ

Esta etapa substitui a aprovação manual da entrega anterior. O comando
`empresa:validar -- APROVAR` foi desativado e não pode mais liberar empresas.

## O que o responsável faz

1. Cadastra a empresa, confirma seu e-mail real e conclui a biometria.
2. Abre a tela **Validar responsável com e-CNPJ**. A conta ainda não acessa máquinas.
3. Gera e baixa o arquivo de autorização `.txt`. Ele identifica o CNPJ, a conta,
   o endereço oficial desta instalação, um desafio aleatório e o prazo.
4. Confere os dados e assina o arquivo original usando o e-CNPJ da empresa,
   com seu assinador de confiança, em CMS/CAdES **destacado**, DER, SHA-256 ou superior.
5. Envia apenas a assinatura `.p7s`, de até 1 MB.
6. Após a validação, faz login novamente e confirma o segundo fator.

A chave privada e a senha do certificado permanecem no dispositivo/assinador
do responsável. O SteelControl não pede nem aceita PFX/P12 como prova de autorização.
A assinatura deve incluir o certificado público do signatário e, quando
necessário, os certificados intermediários. Não inclua chaves privadas.

**Esta versão aceita assinatura destacada `.p7s` sobre o `.txt` original. Não
aceita PDF/PAdES, foto de certificado, captura de tela, e-CPF nem assinatura
pessoal do gov.br como substitutos do e-CNPJ.** Não foi integrada uma API do
VALIDAR/ITI. A verificação é local, com OpenSSL 3 e análise ASN.1 do certificado.

No mobile, o botão salva o arquivo no dispositivo para ser assinado em ferramenta
compatível. O aplicativo não atua como assinador e não acessa diretamente tokens A3.
O cadastro mantém o suporte atual a CNPJs numéricos de 14 posições; CNPJs
alfanuméricos ainda não são suportados nesta versão.

## Como o backend decide

A assinatura precisa corresponder aos bytes exatos do documento emitido para
aquela conta. Alterar e-mail, CNPJ, origem, prazo ou desafio invalida a prova.
O sistema aceita um único signatário e SHA-256, SHA-384 ou SHA-512. Ele verifica:

- assinatura criptográfica do documento;
- cadeia até raízes ICP-Brasil configuradas pelo operador, sem confiar nas
  raízes gerais do sistema operacional nem em uma raiz enviada pelo cliente;
- validade atual e revogação da cadeia, com LCRs assinadas e vigentes;
- certificado de usuário final com uso de assinatura e política ICP-Brasil;
- CNPJ no `subjectAlternativeName/otherName`, OID `2.16.76.1.3.3`, idêntico ao
  CNPJ da empresa. O texto do CN/titular não substitui esse campo;
- conta, e-mail confirmado, versão de sessão e estado pendente atuais no banco;
- autorização ainda não usada, não revogada e dentro do prazo.

A autorização dura 30 minutos. A sessão restrita para essa etapa dura 45 minutos.
Ela não é uma sessão operacional e nunca é salva como token de acesso do usuário.
Gerar outra autorização revoga as anteriores da mesma conta. Há limite de cinco
emissões por hora, cinco tentativas por documento e limites adicionais por IP.

A ativação, promoção do usuário nomeado, consumo da prova e auditoria acontecem
na mesma transação. Tokens anteriores são revogados. O usuário precisa fazer um
novo login com segundo fator antes de acessar o painel.

Enquanto uma empresa estiver pendente, outro candidato pode registrar sua própria
conta para solicitar autorização com e-CNPJ. Isso evita que alguém reserve um
CNPJ público e impeça o representante legítimo de entrar. Uma assinatura que
nomeia a conta A não ativa a conta B. Quando a empresa estiver ativa, o cadastro
público de funcionários é recusado; o administrador usa a Gestão Industrial.

## Preparação do servidor — necessária para funcionar

A empresa precisa possuir um **e-CNPJ real** e um assinador que produza o formato
suportado. Não é possível simular essa comprovação usando apenas CNPJ e e-mail.

O servidor precisa de Node 20/22, OpenSSL 3, HTTPS e arquivos públicos de confiança
mantidos pelo operador. O Dockerfile já instala OpenSSL. Fora do Docker, instale
o OpenSSL 3 e configure seu caminho se ele não estiver no PATH.

No `.env` real do backend:

```dotenv
ECNPJ_SERVICE_ORIGIN=https://seu-steelcontrol.seudominio.com
ECNPJ_ROOTS_PEM=./trust/icp-brasil-raizes.pem
ECNPJ_CRLS_PEM=./trust/icp-brasil-lcrs.pem
ECNPJ_ALLOWED_POLICY_OIDS=
# Opcional, especialmente no Windows:
# ECNPJ_OPENSSL_BIN=C:/Program Files/OpenSSL-Win64/bin/openssl.exe
```

`ECNPJ_SERVICE_ORIGIN` deve ser a origem HTTPS oficial, sem caminho ou parâmetros.
Os caminhos dos arquivos são relativos à pasta de execução do backend.

`ECNPJ_ROOTS_PEM` deve conter somente raízes públicas autossinadas da ICP-Brasil,
obtidas de fonte oficial e com impressões digitais conferidas pelo operador.
`ECNPJ_CRLS_PEM` deve conter as listas de certificados revogados em PEM para
**todos os emissores da cadeia** que será aceita, incluindo as intermediárias.
Esses arquivos não são o e-CNPJ do cliente nem suas chaves privadas.

Preencha `ECNPJ_ALLOWED_POLICY_OIDS` com a lista **exata** de políticas de e-CNPJ
assinante dos emissores aceitos, conforme suas Políticas de Certificação oficiais.
Isso evita aceitar, por exemplo, um certificado destinado somente a servidor ou
outro perfil empresarial por ele também conter um CNPJ. Não deduza a lista de
um certificado enviado pelo solicitante e não use OIDs sintéticos dos testes.
Sem essa lista, a validação também é recusada.

Fontes oficiais para preparar e conferir o ambiente:

- [Repositório AC-Raiz do ITI](https://www.gov.br/iti/pt-br/assuntos/repositorio/repositorio-ac-raiz)
- [Repositório de cadeias ICP-Brasil](https://www.gov.br/iti/pt-br/assuntos/repositorio/cadeias-da-icp-brasil)
- [Esquema oficial de OIDs](https://www.gov.br/iti/pt-br/assuntos/legislacao/adendos/ADE_ICP_04.01___v_6.7__Esquema_de_OID_.pdf)
- [Verificação CMS no OpenSSL](https://docs.openssl.org/3.0/man1/openssl-cms/)

Converta certificados/LCRs DER para PEM com ferramentas de confiança, quando
necessário. Para uma LCR: `openssl crl -inform DER -in lista.crl -out lista.pem`.
Atualize as LCRs conforme a publicação dos emissores e antes de `nextUpdate`.
O código não consulta URLs arbitrárias presentes nos certificados enviados.

Sem raízes, sem LCRs para a cadeia, com LCR vencida ou com falha criptográfica,
**a empresa permanece bloqueada**. Não existe opção de ignorar revogação para
facilitar a apresentação. As raízes e LCRs reais não foram incluídas nesta entrega;
precisam ser preparadas e mantidas para a cadeia do certificado utilizado.

Depois de copiar os arquivos alterados para o projeto, faça backup do banco e execute:

```powershell
npm --prefix backend ci --include=dev
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:deploy
npm --prefix backend run ecnpj:check
npm test
npm start
```

A migration nova é `20261019190000_autorizacao_ecnpj`. Ela preserva os dados,
cria o registro de autorizações, revoga sessões e retorna empresas previamente
ativadas ao estado pendente para exigir a nova prova. Administradores antigos
entram com senha e confirmam o código para abrir a etapa e-CNPJ.
**Não use `prisma migrate reset`.**

No mobile, aplique o projeto atualizado, execute `flutter pub get` para instalar
`file_picker` 8.3.7 e rode `flutter analyze`, `flutter test` e a compilação.

## Assinatura local — exemplo para quem já possui os arquivos apropriados

A interface principal é o assinador de confiança do responsável. Como referência
técnica, um ambiente local com certificado público, chave privada protegida e
intermediárias pode produzir a assinatura assim:

```powershell
openssl cms -sign -binary -in autorizacao.txt -signer certificado-publico.pem -inkey chave-local-protegida.pem -certfile intermediarias.pem -outform DER -out autorizacao.p7s -md sha256
```

O comando roda no dispositivo do titular. Ele não deve executar comandos enviados
por terceiros sem conferir o arquivo e a conta autorizada. A chave privada não
vai para o SteelControl. Para tokens A3/nuvem, utilize a ferramenta compatível do
emissor; esta entrega não inclui integração proprietária com todos os assinadores.

## Verificação e limites desta entrega

Foram executados testes com assinaturas CMS reais geradas por uma PKI **sintética,
exclusiva dos testes**, além dos testes de autorização da API. As chaves de teste
são temporárias; não são distribuídas como certificados confiáveis do produto.
Não há modo de teste que aprove certificados falsos em produção.

Os testes verificam sucesso criptográfico, CNPJ de outra empresa, certificado
sem campo CNPJ, vencimento, revogação, LCR vencida, raiz não confiável, conteúdo
alterado, formato anexado e SHA-1. Também cobrem conta errada, mudança de sessão,
reenvio/reutilização e impossibilidade de usar o token restrito nas máquinas.

Foi aplicada a atualização de segurança de `proxy-addr` para 2.0.8.
A consulta `npm audit --omit=dev` desta entrega não apontou vulnerabilidades
conhecidas nas dependências de produção após a atualização.

Todas as migrations foram executadas em PostgreSQL embarcado. O servidor passou
pelos **151 testes automatizados** e pelo comando `npm run quality`. Não houve teste com e-CNPJ oficial de uma
empresa real, nem execução/compilação Flutter ou teste visual em navegador neste
ambiente. Faça a homologação com a cadeia real antes de disponibilizar o serviço.

O e-CNPJ e a assinatura explícita comprovam o uso da credencial empresarial para
nomear a conta indicada. Esta versão não consulta contrato social, poderes de
procuração ou situação cadastral em tempo real. Uma credencial empresarial
comprometida continua exigindo revogação pelo titular. Recuperação de conta do
administrador de empresa já ativa exige um processo específico, sem reabrir o
cadastro de funcionários ao público.

A auditoria guarda os hashes da autorização e da assinatura, impressão digital
do certificado, hashes dos arquivos de confiança e a decisão. O arquivo da
assinatura e o certificado extraído são processados em diretório temporário e
apagados ao final. A auditoria não contém chaves privadas.
