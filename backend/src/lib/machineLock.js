// Prisma envia números JS como INT8; esta assinatura exige INTEGER/INTEGER.
// Mantém o mesmo namespace em configuração, revogação, desconexão e exclusão.
export async function lockMachine(tx, machineId) {
  if (!Number.isInteger(machineId) || machineId <= 0 || machineId > 2147483647) {
    throw Object.assign(new Error('Identificador de máquina inválido.'), { status: 400 });
  }
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261026, CAST(${machineId} AS INTEGER))`;
}
