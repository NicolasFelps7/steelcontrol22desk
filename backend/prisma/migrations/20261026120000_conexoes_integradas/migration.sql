CREATE TABLE "ConnectionHost" (
 "id" TEXT PRIMARY KEY, "empresaId" INTEGER REFERENCES "Empresa"("id") ON DELETE CASCADE,
 "nome" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE, "pairingHash" TEXT UNIQUE,
 "pairingAte" TIMESTAMP(3) NOT NULL, "revogadoEm" TIMESTAMP(3),
 "vistoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "portas" JSONB NOT NULL DEFAULT '[]', "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ConnectionHost_empresaId_idx" ON "ConnectionHost"("empresaId");
CREATE TABLE "MachineConnection" (
 "id" TEXT PRIMARY KEY, "maquinaId" INTEGER NOT NULL UNIQUE REFERENCES "Maquina"("id") ON DELETE CASCADE,
 "empresaId" INTEGER NOT NULL REFERENCES "Empresa"("id") ON DELETE CASCADE,
 "hostId" TEXT NOT NULL REFERENCES "ConnectionHost"("id") ON DELETE CASCADE,
 "driver" TEXT NOT NULL, "parametros" JSONB NOT NULL DEFAULT '{}',
 "ativa" BOOLEAN NOT NULL DEFAULT TRUE, "comandos" BOOLEAN NOT NULL DEFAULT FALSE,
 "versao" INTEGER NOT NULL DEFAULT 1, "segredo" TEXT, "estado" TEXT NOT NULL DEFAULT 'CONNECTING',
 "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MachineConnection_empresaId_hostId_idx" ON "MachineConnection"("empresaId", "hostId");
