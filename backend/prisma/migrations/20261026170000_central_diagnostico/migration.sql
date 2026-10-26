CREATE TABLE "DiagnosticEvent" (
 "id" TEXT PRIMARY KEY,
 "empresaId" INTEGER NOT NULL REFERENCES "Empresa"("id") ON DELETE CASCADE,
 "maquinaId" INTEGER REFERENCES "Maquina"("id") ON DELETE SET NULL,
 "usuarioId" INTEGER REFERENCES "Usuario"("id") ON DELETE SET NULL,
 "codigo" TEXT NOT NULL, "nivel" TEXT NOT NULL, "origem" TEXT NOT NULL,
 "eventoCliente" TEXT, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "DiagnosticEvent_empresaId_criadoEm_idx" ON "DiagnosticEvent"("empresaId", "criadoEm");
CREATE INDEX "DiagnosticEvent_maquinaId_criadoEm_idx" ON "DiagnosticEvent"("maquinaId", "criadoEm");
CREATE UNIQUE INDEX "DiagnosticEvent_empresaId_eventoCliente_key" ON "DiagnosticEvent"("empresaId", "eventoCliente");
ALTER TABLE "ComandoMaquina" ADD COLUMN "solicitanteId" INTEGER REFERENCES "Usuario"("id") ON DELETE SET NULL;
CREATE INDEX "ComandoMaquina_solicitanteId_idx" ON "ComandoMaquina"("solicitanteId");
