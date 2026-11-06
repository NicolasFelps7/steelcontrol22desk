CREATE TABLE "IndustrialRecord" (
 "id" TEXT NOT NULL, "empresaId" INTEGER NOT NULL, "maquinaId" INTEGER NOT NULL,
 "eventoId" TEXT NOT NULL, "ocorridoEm" TIMESTAMP(3) NOT NULL,
 "observacao" TEXT NOT NULL DEFAULT '', "valores" JSONB NOT NULL,
 "ativo" BOOLEAN NOT NULL DEFAULT true, "criadoPorId" INTEGER,
 "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "IndustrialRecord_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "IndustrialRecord_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "IndustrialRecord_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "Maquina"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "IndustrialRecord_empresaId_eventoId_key" ON "IndustrialRecord"("empresaId","eventoId");
CREATE INDEX "IndustrialRecord_empresaId_ocorridoEm_idx" ON "IndustrialRecord"("empresaId","ocorridoEm");
CREATE INDEX "IndustrialRecord_maquinaId_ocorridoEm_idx" ON "IndustrialRecord"("maquinaId","ocorridoEm");
