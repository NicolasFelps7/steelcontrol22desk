import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { lockMachine } from '../src/lib/machineLock.js';

const db = new PGlite();
after(() => db.close());
// Reproduz o parâmetro INT8 do Prisma sem acessar um banco externo.
const transaction = {
  async $executeRaw(parts, ...values) {
    const sql = parts.reduce((text, part, index) =>
      text + (index ? `$${index}::bigint` : '') + part, '');
    await db.query(sql, values);
  }
};
test('consulta antiga falha com o tipo enviado pelo Prisma', async () => {
  await assert.rejects(
    db.query('SELECT pg_advisory_xact_lock(20261026, $1::bigint)', [7]),
    error => error.code === '42883'
  );
});
test('lock corrigido aceita INT8 na transação de configuração', async () => {
  await db.exec('BEGIN');
  try {
    await lockMachine(transaction, 7);
    await lockMachine(transaction, 2147483647);
    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
});
test('ID inválido nunca é enviado ao PostgreSQL', async () => {
  for (const value of [0, -1, NaN, 1.5, 2147483648, '7']) {
    await assert.rejects(lockMachine({$executeRaw: () => assert.fail('SQL inesperado')}, value),
      error => error.status === 400);
  }
});
