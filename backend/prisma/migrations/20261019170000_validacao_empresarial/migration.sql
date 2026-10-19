BEGIN;
-- Fail closed: existing organizations also require independent review.
CREATE TYPE "StatusEmpresa" AS ENUM ('PENDENTE', 'ATIVA', 'REJEITADA');
CREATE TYPE "StatusVinculo" AS ENUM ('ADMIN_PENDENTE', 'SOLICITADO', 'APROVADO', 'REJEITADO');
ALTER TABLE "Empresa" ADD COLUMN "status" "StatusEmpresa" NOT NULL DEFAULT 'PENDENTE',
  ADD COLUMN "validadaEm" TIMESTAMP(3);
ALTER TABLE "Usuario" ADD COLUMN "statusVinculo" "StatusVinculo" NOT NULL DEFAULT 'SOLICITADO',
  ADD COLUMN "emailVerificadoEm" TIMESTAMP(3);
UPDATE "Usuario" SET "statusVinculo" = 'ADMIN_PENDENTE' WHERE "cargo" = 'ADMINISTRADOR';
-- Revoke all pre-migration sessions. No grandfathering of unverified companies.
UPDATE "Usuario" SET "tokenVersion" = "tokenVersion" + 1;
ALTER TABLE "AuditLog" ALTER COLUMN "empresaId" DROP NOT NULL;
-- Uniqueness independent of punctuation, also for direct SQL / legacy clients.
-- If duplicates already exist, deployment fails rather than merging tenants.
CREATE UNIQUE INDEX "Empresa_cnpj_normalizado_key"
  ON "Empresa" (regexp_replace("cnpj", '[^0-9]', '', 'g')) WHERE "cnpj" IS NOT NULL;
UPDATE "Empresa" SET "cnpj" = substr(regexp_replace("cnpj", '[^0-9]', '', 'g'),1,2)||'.'||
  substr(regexp_replace("cnpj", '[^0-9]', '', 'g'),3,3)||'.'||
  substr(regexp_replace("cnpj", '[^0-9]', '', 'g'),6,3)||'/'||
  substr(regexp_replace("cnpj", '[^0-9]', '', 'g'),9,4)||'-'||
  substr(regexp_replace("cnpj", '[^0-9]', '', 'g'),13,2)
WHERE length(regexp_replace("cnpj", '[^0-9]', '', 'g')) = 14;
COMMIT;
