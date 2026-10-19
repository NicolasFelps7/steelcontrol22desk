# Cadastro e autorização empresarial — versão atual

A aprovação manual da entrega inicial foi substituída pela autorização assinada
com e-CNPJ. O comando `empresa:validar -- APROVAR` está desativado.

Leia **[AUTORIZACAO_ECNPJ.md](AUTORIZACAO_ECNPJ.md)** para preparar o servidor,
aplicar a migration e usar a tela de validação. Não basta enviar um arquivo:
assinatura, CNPJ, conta, cadeia, validade e revogação precisam ser confirmados.

CNPJ, e-mail e biometria identificam o pedido, mas não liberam a empresa.
A empresa continua pendente até a autorização criptográfica. Não há acesso às
máquinas com o token restrito da etapa de validação.

Após a ativação, somente o administrador cadastra funcionários pela Gestão
Industrial. O login interno com sufixo fixo e o e-mail real separado permanecem.
Veja [LOGIN_INTERNO_FUNCIONARIOS.md](LOGIN_INTERNO_FUNCIONARIOS.md).

Solicitações de outro candidato a administrador só são aceitas enquanto a
empresa estiver pendente, sem liberar acesso ou duplicar a organização. Isso
impede que um pedido não autorizado reserve o CNPJ contra seu responsável legítimo.

Faça backup antes das migrations. As alterações preservam os registros e
revogam sessões antigas; empresas já ativadas precisam passar pela prova e-CNPJ.
Não use `prisma migrate reset`.
