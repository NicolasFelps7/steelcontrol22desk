// Estados administrativos e vínculos continuam sendo verificados em cada chamada.
export function organizationAccessError(usuario) {
  if (!usuario?.ativo) return { codigo: "ACCOUNT_DISABLED", mensagem: "Conta inexistente ou desativada." };
  if (usuario.empresa?.status !== "ATIVA") return {
    codigo: "COMPANY_VALIDATION_PENDING",
    mensagem: "Empresa indisponível para acesso. Entre em contato com o responsável pelo sistema."
  };
  if (usuario.statusVinculo !== "APROVADO") return {
    codigo: "MEMBERSHIP_PENDING",
    mensagem: "Acesso aguardando aprovação do administrador da empresa."
  };
  return null;
}
