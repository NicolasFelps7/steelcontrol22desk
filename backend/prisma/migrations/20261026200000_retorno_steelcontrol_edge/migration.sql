-- Desativa apenas a ponte Web Serial retirada do produto. Preserva cadastros e histórico.
UPDATE "Maquina" m SET "deviceKeyHash"=NULL,"deviceKeyHint"=NULL
FROM "MachineConnection" c JOIN "ConnectionHost" h ON h.id=c."hostId"
WHERE h.tipo='NAVEGADOR' AND m.id=c."maquinaId" AND m."empresaId"=c."empresaId";
UPDATE "MachineConnection" c SET ativa=FALSE,comandos=FALSE,segredo=NULL,estado='STOPPED',versao=versao+1,"atualizadoEm"=CURRENT_TIMESTAMP
FROM "ConnectionHost" h WHERE h.id=c."hostId" AND h.tipo='NAVEGADOR';
UPDATE "ConnectionHost" SET "revogadoEm"=COALESCE("revogadoEm",CURRENT_TIMESTAMP) WHERE tipo='NAVEGADOR';
