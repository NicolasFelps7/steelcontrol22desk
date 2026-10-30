# Confirmação de cadastro e acesso — 30/10/2026

Atualização solicitada pelo responsável do projeto:

- Código por e-mail apenas no fluxo de cadastro/confirmação inicial da conta.
- Após concluir o cadastro, login por senha ou identificação facial inequívoca não inicia códigos recorrentes, independentemente do cargo.
- A configuração antiga ADMIN_MFA_REQUIRED não exige novo código no login. O middleware continua verificando assinatura/expiração/revogação de sessão, e-mail confirmado, usuário ativo, vínculo e empresa autorizados.
- Contas com cadastro ainda incompleto concluem a confirmação inicial por código, uma única vez. Após o e-mail ser confirmado, nenhum login seguinte exige novo código. Isso preserva a ativação de funcionários cadastrados por um administrador.
- Reconhecimento facial ambíguo não autentica nem escolhe uma conta: orienta acesso por senha. Endpoints de código para face ambígua retornam 410. A rota de confirmação inicial permanece para terminar cadastros pendentes.
- Verificação do cadastro, códigos aleatórios, prazo de validade, limitação de tentativas e prevenção de reuso no cadastro permanecem ativos. Fluxos de confirmação de alteração de endereço de e-mail na gestão da empresa não foram alterados.

Esta política substitui as instruções anteriores sobre MFA obrigatório por login em SEGURANCA_COMANDOS.md e VALIDACAO_SEGURANCA.md. O login com segundo fator recorrente foi removido expressamente; não deve ser descrito como uma proteção ativa do projeto. Permissões e proteções dos comandos de máquinas permanecem.

Fundo do login: imagem de linha automotiva enviada pelo usuário, convertida para WebP, com camada preta CSS (opacidade de 56% a 78%) para reduzir destaque e preservar a leitura. Versões de URL atualizadas para evitar cache da imagem anterior.
