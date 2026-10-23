BEGIN;
-- Demonstração acadêmica: ativação não comprova representação empresarial.
-- Preserve as migrations anteriores, os dados de negócio e o histórico de auditoria.
ALTER TABLE "Empresa" ALTER COLUMN "status" SET DEFAULT 'ATIVA';
CREATE TEMP TABLE empresas_demo ON COMMIT DROP AS
  SELECT "id" FROM "Empresa" WHERE "status" = 'PENDENTE';
CREATE TEMP TABLE administradores_demo ON COMMIT DROP AS
  SELECT DISTINCT ON (u."empresaId") u."id", u."empresaId"
  FROM "Usuario" u JOIN empresas_demo e ON e."id" = u."empresaId"
  WHERE u."ativo" = TRUE AND u."statusVinculo" = 'ADMIN_PENDENTE'
    AND NOT EXISTS (SELECT 1 FROM "Usuario" a WHERE a."empresaId" = u."empresaId"
      AND a."ativo" = TRUE AND a."cargo" = 'ADMINISTRADOR' AND a."statusVinculo" = 'APROVADO')
  ORDER BY u."empresaId", (u."cargo" = 'ADMINISTRADOR') DESC, u."criadaEm", u."id";
UPDATE "Usuario" u SET "cargo" = 'ADMINISTRADOR', "statusVinculo" = 'APROVADO'
  FROM administradores_demo a WHERE u."id" = a."id";
-- Outros candidatos não recebem administração nem acesso automaticamente.
UPDATE "Usuario" u SET "cargo" = 'VISITANTE', "statusVinculo" = 'SOLICITADO'
  FROM empresas_demo e WHERE u."empresaId" = e."id" AND u."statusVinculo" = 'ADMIN_PENDENTE';
UPDATE "Usuario" u SET "tokenVersion" = u."tokenVersion" + 1
  FROM empresas_demo e WHERE u."empresaId" = e."id";
UPDATE "CompanyAuthorization" SET "revogadoEm" = CURRENT_TIMESTAMP
  WHERE "usadoEm" IS NULL AND "revogadoEm" IS NULL;
UPDATE "Empresa" e SET "status" = 'ATIVA', "validadaEm" = NULL, "atualizadaEm" = CURRENT_TIMESTAMP
  FROM empresas_demo d WHERE e."id" = d."id";
INSERT INTO "AuditLog" ("empresaId", "usuarioId", "acao", "entidade", "entidadeId", "detalhes", "criadoEm")
  SELECT e."id", a."id", 'REMOVER_VALIDACAO_EMPRESARIAL_DEMO', 'EMPRESA', e."id",
    '{"modo":"demonstracao_tcc","representacaoEmpresarialVerificada":false}'::jsonb, CURRENT_TIMESTAMP
  FROM empresas_demo e LEFT JOIN administradores_demo a ON a."empresaId" = e."id";
COMMIT;
