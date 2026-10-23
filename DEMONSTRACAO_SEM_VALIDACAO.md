# Demonstração do TCC sem validação empresarial

O cadastro não solicita e-CNPJ, assinatura, documentos nem aprovação externa.
Depois de confirmar o e-mail e concluir a etapa facial já existente, a empresa
fica ATIVA e o primeiro usuário é ADMINISTRADOR/APROVADO. O CNPJ permanece
um identificador único; outro cadastro público com o mesmo CNPJ é recusado.
Funcionários são cadastrados pelo administrador na Gestão Industrial e começam
como VISITANTE. Login por senha ou facial continua com código por e-mail.
Permissões, separação dos dados entre empresas, auditoria e chave do Edge continuam.

## Aplicar no desktop e Railway

1. Copie o conteúdo da pasta steelcontrol22desk-main sobre o projeto desktop.
   Preserve seu .env. Os arquivos vazios substituem o recurso antigo sem exigir exclusão manual.
2. Faça backup do banco. Não apague nem edite migrations antigas e não use migrate reset.
3. Na raiz do desktop, execute:

```bash
npm --prefix backend ci --include=dev
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:deploy
```

4. Suba as alterações para o GitHub e aguarde o deploy do Railway. O comando
   padrão `npm start` já executa as migrations antes de iniciar. Caso tenha
   configurado outro comando no Railway, execute `npm --prefix backend run prisma:deploy`
   no ambiente com o DATABASE_URL do Railway, antes de iniciar o servidor.
5. Saia da conta e faça login novamente no site e no tablet.

A nova migration `20261023120000_remover_validacao_empresarial` libera as empresas
PENDENTE já existentes. Ela prioriza um administrador anterior; caso não exista,
usa o primeiro candidato ativo, por data de criação e ID. Outros candidatos
continuam sem acesso, como SOLICITADO/VISITANTE. Empresas REJEITADA não são
reativadas. Dados e auditoria são preservados, provas antigas são revogadas e
sessões das empresas liberadas são invalidadas. `validadaEm` fica vazio: não
houve verificação de representação empresarial.

## Aplicar no mobile

Copie o conteúdo de SteelControlMOBILE-main sobre seu projeto mobile. Depois:

```bash
flutter clean
flutter pub get
flutter build apk --release --dart-define=API_URL=https://web-production-6682df.up.railway.app
```

Transfira `build/app/outputs/flutter-apk/app-release.apk` ao tablet e instale
como atualização. O seletor de arquivos foi removido, pois só servia à assinatura.
Este ambiente não possui Flutter; a compilação e o teste no tablet devem ser
feitos no computador do grupo, depois de publicar o backend atualizado.

## Apresentação

Na versão demonstrativa, não validamos a autorização do primeiro administrador
para representar a empresa. Como melhoria futura, propomos e-CNPJ ou outro
mecanismo independente de validação. Não apresente essa proteção como já ativa.
