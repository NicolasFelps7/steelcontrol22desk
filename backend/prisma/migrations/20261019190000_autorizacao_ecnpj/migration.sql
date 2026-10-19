BEGIN;
CREATE TABLE "CompanyAuthorization" (
  "id" TEXT PRIMARY KEY, "empresaId" INTEGER NOT NULL, "usuarioId" INTEGER NOT NULL,
  "documento" TEXT NOT NULL, "documentoHash" TEXT NOT NULL, "expiraEm" TIMESTAMP(3) NOT NULL,
  "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usadoEm" TIMESTAMP(3), "revogadoEm" TIMESTAMP(3), "tentativas" INTEGER NOT NULL DEFAULT 0,
  "assinaturaHash" TEXT, "certificadoFingerprint" TEXT,
  CONSTRAINT "CompanyAuthorization_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompanyAuthorization_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CompanyAuthorization_usuarioId_criadaEm_idx" ON "CompanyAuthorization"("usuarioId","criadaEm");
CREATE INDEX "CompanyAuthorization_empresaId_expiraEm_idx" ON "CompanyAuthorization"("empresaId","expiraEm");
-- Previous manual activations are not proof of e-CNPJ authorization.
UPDATE "Empresa" SET "status" = 'PENDENTE', "validadaEm" = NULL WHERE "status" = 'ATIVA';
UPDATE "Usuario" SET "statusVinculo" = 'ADMIN_PENDENTE' WHERE "cargo" = 'ADMINISTRADOR' AND "statusVinculo" IN ('APROVADO', 'SOLICITADO');
UPDATE "Usuario" SET "tokenVersion" = "tokenVersion" + 1;
COMMIT;
