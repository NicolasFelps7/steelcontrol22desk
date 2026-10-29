import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
// PostgreSQL compilado para WASM: migrations reais sem tocar no Railway.
const db = new PGlite();
const migrations = path.resolve(import.meta.dirname, '../prisma/migrations');
const latest = '20261029190000_reutilizar_codigo_maquina';
const add = async (company, code) => (await db.query(`INSERT INTO "Maquina"
  ("empresaId","nome","setor","modelo","codigo","atualizadaEm")
  VALUES ($1,'Dobot','Laboratório','Magician',$2,CURRENT_TIMESTAMP) RETURNING "id"`, [company, code])).rows[0].id;
let oldId;
before(async () => {
  for (const dir of fs.readdirSync(migrations).sort()) {
    const sql = path.join(migrations, dir, 'migration.sql');
    if (dir !== latest && fs.existsSync(sql)) await db.exec(fs.readFileSync(sql, 'utf8'));
  }
  await db.exec(`INSERT INTO "Empresa" ("nome") VALUES ('Empresa A'),('Empresa B')`);
  oldId = await add(1, 'DOBOT-01');
  await db.query(`UPDATE "Maquina" SET "ativo"=false,"deviceKeyHash"='old-hash' WHERE "id"=$1`, [oldId]);
  await db.query(`INSERT INTO "Log" ("maquinaId","mensagem") VALUES ($1,'Histórico original')`, [oldId]);
  await db.exec(`INSERT INTO "ConnectionHost" ("id","empresaId","nome","tokenHash","pairingAte") VALUES ('host',1,'PC','hash',CURRENT_TIMESTAMP)`);
  await db.query(`INSERT INTO "MachineConnection" ("id","empresaId","hostId","maquinaId","driver","parametros","segredo","comandos") VALUES ('old-link',1,'host',$1,'DOBOT_MAGICIAN','{"serialPort":"COM3"}','old-secret',true)`, [oldId]);
  await db.query(`INSERT INTO "ComandoMaquina" ("maquinaId","comando") VALUES ($1,'DOBOT_PTP')`, [oldId]);
  await db.exec(fs.readFileSync(path.join(migrations, latest, 'migration.sql'), 'utf8'));
});
after(() => db.close());
test('código excluído é reutilizável e o histórico continua no ID antigo', async () => {
  assert.notEqual(await add(1, 'DOBOT-01'), oldId);
  assert.equal((await db.query(`SELECT "mensagem" FROM "Log" WHERE "maquinaId"=$1`, [oldId])).rows[0].mensagem, 'Histórico original');
  assert.equal((await db.query(`SELECT "codigo" FROM "Maquina" WHERE "id"=$1`, [oldId])).rows[0].codigo, 'DOBOT-01');
});
test('códigos ativos são únicos por empresa', async () => {
  await add(1, 'ATIVO');
  await assert.rejects(add(1, 'ATIVO'), error => error.code === '23505');
  await add(2, 'ATIVO');
});
test('renomear ou reativar não contorna unicidade', async () => {
  const a=await add(1,'EDITAR-A'), b=await add(1,'EDITAR-B');
  await assert.rejects(db.query(`UPDATE "Maquina" SET "codigo"='EDITAR-A' WHERE "id"=$1`,[b]), e=>e.code==='23505');
  await db.query(`UPDATE "Maquina" SET "ativo"=false WHERE "id"=$1`,[a]);
  await db.query(`UPDATE "Maquina" SET "codigo"='EDITAR-A' WHERE "id"=$1`,[b]);
  await assert.rejects(db.query(`UPDATE "Maquina" SET "ativo"=true WHERE "id"=$1`,[a]),e=>e.code==='23505');
});
test('migration libera COM e credenciais de exclusões antigas e cancela comandos', async () => {
  const link=(await db.query(`SELECT * FROM "MachineConnection" WHERE "id"='old-link'`)).rows[0];
  assert.equal(link.ativa,false);assert.equal(link.comandos,false);assert.equal(link.segredo,null);assert.equal(link.versao,2);
  assert.equal((await db.query(`SELECT "deviceKeyHash" FROM "Maquina" WHERE "id"=$1`,[oldId])).rows[0].deviceKeyHash,null);
  assert.equal((await db.query(`SELECT "status" FROM "ComandoMaquina" WHERE "maquinaId"=$1`,[oldId])).rows[0].status,'CANCELADO');
});
