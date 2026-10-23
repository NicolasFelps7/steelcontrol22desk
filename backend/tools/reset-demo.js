import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import { writeFile, mkdir, rename, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function limparDemo(db, { confirmar, destino, salvarBackup, tabelas }) {
  if (confirmar !== 'APAGAR_TUDO_STEELCONTROL') throw new Error('Use --confirmar=APAGAR_TUDO_STEELCONTROL. Todos os dados de negócio serão apagados após o backup.');
  if (!destino || typeof salvarBackup !== 'function' || !tabelas?.length || tabelas.some(t => !/^[A-Za-z][A-Za-z0-9_]*$/.test(t))) throw new Error('Backup ou lista de tabelas inválida.');
  const nomes = tabelas.map(t => `"${t}"`).join(', ');
  await db.$transaction(async tx => {
    await tx.$executeRawUnsafe(`LOCK TABLE ${nomes} IN ACCESS EXCLUSIVE MODE`);
    const backup = { formato: 'steelcontrol-demo-v1', criadoEm: new Date().toISOString(), tabelas: {} };
    for (const tabela of tabelas) {
      const rows = await tx.$queryRawUnsafe(`SELECT to_jsonb(t) AS registro FROM "${tabela}" t`);
      backup.tabelas[tabela] = rows.map(r => r.registro);
    }
    // Se o backup falhar, a exclusão não é executada.
    await salvarBackup(destino, JSON.stringify(backup));
    await tx.$executeRawUnsafe(`TRUNCATE TABLE ${nomes} RESTART IDENTITY CASCADE`);
  }, { timeout: 120000, maxWait: 5000 });
  return { backup: destino };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const confirmar = process.argv.find(a => a.startsWith('--confirmar='))?.split('=')[1];
    const pasta = path.join(homedir(), 'SteelControl-backups');
    await mkdir(pasta, { recursive: true, mode: 0o700 });
    const destino = path.join(pasta, `antes-limpeza-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    const result = await limparDemo(prisma, { confirmar, destino,
      tabelas: Prisma.dmmf.datamodel.models.map(m => m.dbName || m.name),
      salvarBackup: async (file, raw) => {
        const temp = `${file}.tmp`;
        try { await writeFile(temp, raw, { flag: 'wx', mode: 0o600 }); await rename(temp, file); }
        catch (error) { await unlink(temp).catch(() => {}); throw error; }
      }
    });
    console.log('Banco limpo. Cadastre novamente sua empresa e os funcionários.');
    console.log(`Backup privado: ${result.backup}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
}
