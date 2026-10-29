-- Preserva códigos e histórico das máquinas excluídas. A validação continua
-- atômica no PostgreSQL, inclusive para cadastros simultâneos e atualizações.
BEGIN;
CREATE UNIQUE INDEX "Maquina_empresaId_codigo_ativa_key"
  ON "Maquina" ("empresaId", "codigo") WHERE "ativo" = true;
CREATE INDEX "Maquina_empresaId_codigo_idx" ON "Maquina" ("empresaId", "codigo");
DROP INDEX "Maquina_empresaId_codigo_key";
-- Libera também as portas e credenciais de máquinas excluídas em versões antigas.
UPDATE "MachineConnection" AS c
SET "ativa" = false, "comandos" = false, "segredo" = NULL,
    "estado" = 'STOPPED', "versao" = c."versao" + 1
FROM "Maquina" AS m WHERE c."maquinaId" = m."id" AND m."ativo" = false;
UPDATE "Maquina" SET "deviceKeyHash" = NULL, "deviceKeyHint" = NULL WHERE "ativo" = false;
UPDATE "ComandoMaquina" AS c SET "status" = 'CANCELADO', "concluidoEm" = CURRENT_TIMESTAMP
FROM "Maquina" AS m WHERE c."maquinaId" = m."id" AND m."ativo" = false
  AND c."status" IN ('PENDENTE', 'ENTREGUE');
COMMIT;
