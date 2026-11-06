import test,{after} from 'node:test';
import assert from 'node:assert/strict';
process.env.DATABASE_URL ||= 'postgresql://local:local@localhost:5432/local';
process.env.JWT_SECRET ||= 'test-only-secret-value-for-steelcontrol-123456';
const {prisma}=await import('../src/lib/prisma.js');
const {listarAuditoria}=await import('../src/modules/audit/audit.controller.js');
after(()=>prisma.$disconnect());
const original={find:prisma.maquina.findFirst,audit:prisma.auditLog.findMany};
const run=async(query={},cargo='ADMINISTRADOR')=>{const res={code:200,status(n){this.code=n;return this;},json(body){this.body=body;return this;}};await listarAuditoria({query,auth:{empresaId:7,cargo}},res,e=>{throw e;});return res;};
test('auditoria por máquina exige cargo, propriedade e filtra eventos no banco',async()=>{
 try{
 let queries=0;prisma.maquina.findFirst=async({where})=>{assert.equal(where.empresaId,7);assert.equal(where.ativo,true);return where.id===11?{id:11}:null;};
 prisma.auditLog.findMany=async args=>{queries++;assert.equal(args.where.empresaId,7);assert.deepEqual(args.where.OR,[{entidade:'MAQUINA',entidadeId:11},{detalhes:{path:['maquinaId'],equals:11}}]);assert.equal(args.take,10);return [{id:1,detalhes:{deviceKey:'secret',maquinaId:11}}];};
 assert.equal((await run({maquinaId:11},'OPERADOR')).code,403);assert.equal((await run({maquinaId:12})).code,404);
 for(const maquinaId of ['x','0','1.2','2147483648'])assert.equal((await run({maquinaId})).code,400);
 assert.equal(queries,0);const res=await run({maquinaId:11,limit:'10.8'});assert.equal(res.code,200);assert.equal(res.body[0].detalhes.deviceKey,'[OCULTO]');assert.equal(queries,1);
 }finally{prisma.maquina.findFirst=original.find;prisma.auditLog.findMany=original.audit;}
});
