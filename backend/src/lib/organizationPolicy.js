// Identity (email/face) never grants authority over an organization.
export function organizationAccessError(usuario) {
  if (!usuario?.ativo) return { codigo: "ACCOUNT_DISABLED", mensagem: "Conta inexistente ou desativada." };
  if (usuario.empresa?.status !== "ATIVA") return {
    codigo: "COMPANY_VALIDATION_PENDING",
    mensagem: "Empresa aguardando validação independente do responsável. E-mail, CNPJ e rosto não comprovam autorização empresarial."
  };
  if (usuario.statusVinculo !== "APROVADO") return {
    codigo: "MEMBERSHIP_PENDING",
    mensagem: "Acesso aguardando aprovação do administrador da empresa."
  };
  return null;
}
