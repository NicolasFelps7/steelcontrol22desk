import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { FIELDS,buildReport,validateRecord,sameRecord } from '../src/modules/operations/operation.logic.js';
import { telemetryQuery } from '../src/modules/operations/operation.telemetry.js';

const now=new Date('2026-11-06T12:00:00Z'), start=new Date('2026-11-05T12:00:00Z');
const machine={id:1,nome:'Injetora',tipo:'Injetora',modoSimulacao:false};
function report(options={}){return buildReport({machines:[machine],start,end:now,...options});}
test('sem amostra não inventa zero, desperdício ou meta',()=>{const r=report();assert.equal(r.indicadores.fabricados,null);assert.equal(r.indicadores.desperdicioPct,null);assert.equal(r.indicadores.injetoras.unidadesHora,null);});
test('soma turnos e calcula indicadores sem misturar dados de telemetria',()=>{const records=[{id:'a',maquinaId:1,ativo:true,valores:{fabricados:90,rejeitados:10,producaoSegundos:1800,metaUnidades:100,pedidos:110}}];const r=report({source:'REGISTROS',records,readings:[{id:1,maquinaId:1,producao:999,ciclos:999,criadoEm:now,origem:'EQUIPAMENTO'}]});assert.equal(r.indicadores.fabricados,90);assert.equal(r.indicadores.desperdicioPct,10);assert.equal(r.indicadores.cicloMedioSegundos,20);assert.equal(r.indicadores.injetoras.unidadesHora,180);assert.equal(r.indicadores.injetoras.atingimentoMetaPct,90);assert.equal(r.indicadores.esteira.producaoSegundos,null);assert.equal(r.indicadores.workflow.embalagem,null);});
test('registros removidos não entram nos totais',()=>{assert.equal(report({source:'REGISTROS',records:[{maquinaId:1,ativo:false,valores:{fabricados:999}}]}).indicadores.fabricados,null);});
test('não interpreta PTP do Dobot como produto fabricado',()=>{const r=report({machines:[{...machine,controlador:'DOBOT_MAGICIAN'}],baselines:[{maquinaId:1,producao:4,ciclos:4,origem:'EQUIPAMENTO'}],readings:[{id:1,maquinaId:1,producao:8,ciclos:8,origem:'EQUIPAMENTO',criadoEm:now}]});assert.equal(r.indicadores.fabricados,null);assert.equal(r.indicadores.ciclos,4);});
test('telemetria simulada e payloads não finitos são excluídos',()=>{const r=report({readings:[{id:1,maquinaId:1,producao:400,origem:'SIMULADOR',criadoEm:now}]});assert.equal(r.indicadores.fabricados,null);const base={maquinaId:1,eventoId:'1234567890123456',ocorridoEm:now.toISOString(),observacao:'',valores:{fabricados:1}};for(const value of [-1,1.4,Infinity,NaN,'12',true])assert.throws(()=>validateRecord({...base,valores:{fabricados:value}},now));for(const extra of [{empresaId:2},{origem:'EDGE'},{criadoPorId:2}])assert.throws(()=>validateRecord({...base,...extra},now));assert.throws(()=>validateRecord({...base,ocorridoEm:'2027-01-01'},now));});
test('normalização é estável para retries, mas rejeita alteração do registro',()=>{const base={maquinaId:1,eventoId:'1234567890123456',ocorridoEm:now.toISOString(),observacao:' turno ',valores:{pedidos:2,fabricados:1}};const a=validateRecord(base,now),b=validateRecord({...base,valores:{fabricados:1,pedidos:2}},now);assert(sameRecord({...a,ocorridoEm:a.ocorridoEm.toISOString()},b));assert(!sameRecord({...a,valores:{fabricados:10}},b));});
test('intervalo truncado não publica totais parciais como completos',()=>assert.equal(report({truncated:true,deltas:[{maquinaId:1,key:'fabricados',total:20}]}).indicadores.fabricados,null));

test('PostgreSQL: migration aditiva, isolamento por empresa, janela, baseline e reset',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE TABLE "Empresa" (id INTEGER PRIMARY KEY);CREATE TABLE "Maquina" (id INTEGER PRIMARY KEY,"empresaId" INTEGER,ativo BOOLEAN,"modoSimulacao" BOOLEAN,nome TEXT,tipo TEXT,controlador TEXT);CREATE TABLE "TelemetryReading" (id SERIAL PRIMARY KEY,"maquinaId" INTEGER,"criadoEm" TIMESTAMP,origem TEXT,producao INTEGER,ciclos INTEGER,"dadosExtras" JSONB);INSERT INTO "Empresa" VALUES(1),(2);INSERT INTO "Maquina" VALUES(1,1,true,false,\'Injetora\',\'Injetora\',\'CLP\'),(2,2,true,false,\'Outra\',\'Injetora\',\'CLP\'),(3,1,true,false,\'Dobot\',\'Braco\',\'DOBOT_MAGICIAN\');');
 await db.exec(fs.readFileSync(new URL('../prisma/migrations/20261106120000_industrial_operation_records/migration.sql',import.meta.url),'utf8'));
 for(const [id,when,count] of [[1,'2026-11-05T11:59:00Z',50],[1,'2026-11-05T13:00:00Z',60],[1,'2026-11-05T14:00:00Z',5],[2,'2026-11-05T11:00:00Z',1],[2,'2026-11-05T15:00:00Z',999],[3,'2026-11-05T11:00:00Z',0],[3,'2026-11-05T15:00:00Z',10]])await db.query('INSERT INTO "TelemetryReading"("maquinaId","criadoEm",origem,producao,ciclos,"dadosExtras") VALUES($1,$2,\'EQUIPAMENTO\',$3,$3,\'{}\')',[id,when,count]);
 await db.exec(`ALTER TABLE "Maquina" ADD COLUMN "integracaoMeta" JSONB DEFAULT '{}'; UPDATE "Maquina" SET "integracaoMeta"='{"operacao":{"producaoConfirmada":true}}' WHERE id=1;`);
 const query=telemetryQuery({empresaId:1,ids:[1,2,3],start,end:now});
 assert(query.text.includes('"empresaId"=$1'));assert.equal(query.values[0],1);
 const {rows}=await db.query(query.text,query.values);
 assert.equal(rows.find(r=>r.maquinaId===1&&r.key==='fabricados').total,15);
 assert(!rows.some(r=>r.maquinaId===2));assert(!rows.some(r=>r.maquinaId===3&&r.key==='fabricados'));
 assert.equal(rows.find(r=>r.maquinaId===3&&r.key==='ciclos').total,10);
 await db.query(`UPDATE "TelemetryReading" SET "dadosExtras"=jsonb_build_object('operacao',jsonb_build_object('contadores',jsonb_build_object('fabricados',CASE WHEN "criadoEm"<$1 THEN 0 ELSE 7 END,'producaoSegundos',CASE WHEN "criadoEm"<$1 THEN 0 ELSE 14 END))) WHERE "maquinaId"=3`,[start]);
 const explicit=await db.query(query.text,query.values);assert.equal(explicit.rows.find(r=>r.maquinaId===3&&r.key==='fabricados').total,7);assert.equal(explicit.rows.find(r=>r.maquinaId===3&&r.key==='producaoSegundos').total,14);
 await db.query('INSERT INTO "IndustrialRecord" (id,"empresaId","maquinaId","eventoId","ocorridoEm",valores) VALUES(\'r1\',1,1,\'evt\',$1,\'{"fabricados":2}\')',[now]);
 await assert.rejects(db.query('INSERT INTO "IndustrialRecord" (id,"empresaId","maquinaId","eventoId","ocorridoEm",valores) VALUES(\'r2\',1,1,\'evt\',$1,\'{}\')',[now]),/duplicate key/);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM "Maquina"')).rows[0].n,3);
 }finally{await db.close();}
});

Object.assign(process.env,{NODE_ENV:'development',SECURITY_PROFILE:'development',DATABASE_URL:'postgresql://test:test@127.0.0.1:5432/steeltest',JWT_SECRET:'s'.repeat(64),BREVO_API_KEY:'test-no-real-provider',BREVO_FROM_EMAIL:'sender@example.com',REDIS_URL:''});
const {createOperationController}=await import('../src/modules/operations/operation.controller.js');
const {prisma}=await import('../src/lib/prisma.js');after(()=>prisma.$disconnect());
const response=()=>({statusCode:200,status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;},setHeader(){}});
const auth={empresaId:7,usuarioId:1,cargo:'ADMINISTRADOR'};
const input=()=>({maquinaId:11,eventoId:'1234567890123456',ocorridoEm:new Date().toISOString(),observacao:'Turno A',valores:{fabricados:12,pedidos:14}});
async function invoke(fn,req={}){const res=response();await fn({auth,query:{},params:{},...req},res,e=>{throw e;});return res;}
function fixture(){let stored=null;let writes=0;const db={maquina:{findMany:async args=>{assert.equal(args.where.empresaId,7);return [{id:11,nome:'Real',modoSimulacao:false}];},findFirst:async args=>{assert.equal(args.where.empresaId,7);return args.where.id===11?{id:11,modoSimulacao:false}:null;}},industrialRecord:{findUnique:async args=>{assert.equal(args.where.empresaId_eventoId.empresaId,7);return stored;},create:async({data})=>{writes++;stored={...data,id:'12345678-1234-1234-1234-123456789012',ativo:true};return stored;},findMany:async args=>{assert.equal(args.where.empresaId,7);return [];},updateMany:async args=>{assert.equal(args.where.empresaId,7);return {count:0};}},$queryRaw:async()=>[],$transaction:async callback=>callback({$executeRaw:async()=>0,$queryRaw:db.$queryRaw})};return {db,controller:createOperationController(db,{state:()=>({codigo:'OFFLINE'}),publish(){},audit:async()=>{}}),get writes(){return writes;},get stored(){return stored;}};}
test('GET nega filtro de máquina de outra empresa antes de ler telemetria',async()=>{const f=fixture();const r=await invoke(f.controller.report,{query:{maquinaId:'999'}});assert.equal(r.statusCode,404);});
test('POST nega máquina de outra empresa e cargo visitante',async()=>{const f=fixture();assert.equal((await invoke(f.controller.create,{body:{...input(),maquinaId:999}})).statusCode,404);assert.equal((await invoke(f.controller.create,{body:input(),auth:{...auth,cargo:'VISITANTE'}})).statusCode,403);assert.equal(f.writes,0);});
test('reenvio retorna o mesmo registro sem duplicar, JSONB pode reordenar as chaves',async()=>{const f=fixture();const body=input();assert.equal((await invoke(f.controller.create,{body})).statusCode,201);f.stored.valores={pedidos:14,fabricados:12};assert.equal((await invoke(f.controller.create,{body})).data.repetido,true);assert.equal(f.writes,1);assert.equal((await invoke(f.controller.create,{body:{...body,valores:{fabricados:99}}})).statusCode,409);});
test('identificador removido nunca recria produção',async()=>{const f=fixture();const body=input();await invoke(f.controller.create,{body});f.stored.ativo=false;assert.equal((await invoke(f.controller.create,{body})).statusCode,409);assert.equal(f.writes,1);});
test('DELETE exige cargo e filtra empresa no banco',async()=>{const f=fixture();const params={id:'12345678-1234-1234-1234-123456789012'};assert.equal((await invoke(f.controller.remove,{params,auth:{...auth,cargo:'OPERADOR'}})).statusCode,403);assert.equal((await invoke(f.controller.remove,{params})).statusCode,404);});
test('cache não ressuscita máquina excluída nem retorna dados entre empresas',async()=>{const f=fixture();await invoke(f.controller.report);f.db.maquina.findMany=async()=>[];const r=await invoke(f.controller.report);assert.equal(r.data.maquinas.length,0);assert.equal(r.data.indicadores.fabricados,null);});
test('não calcula percentual cruzando turnos com campos incompletos',()=>{const r=report({source:'REGISTROS',records:[{maquinaId:1,valores:{fabricados:100}},{maquinaId:1,valores:{rejeitados:10,metaUnidades:100}}]});assert.equal(r.indicadores.desperdicioPct,null);assert.equal(r.indicadores.atingimentoMetaPct,null);});

test('campos padrão do banco não viram produção confirmada sem mapeamento',()=>{const r=report({baselines:[{maquinaId:1,producao:0,ciclos:0,origem:'EQUIPAMENTO'}],readings:[{id:1,maquinaId:1,producao:0,ciclos:0,origem:'EQUIPAMENTO',criadoEm:now}]});assert.equal(r.indicadores.fabricados,null);assert.equal(r.indicadores.ciclos,null);});
test('rotas reais: dashboard industrial, painel técnico e API sem sessão',async()=>{
 const originalAudit=prisma.auditLog.create;prisma.auditLog.create=async()=>({});
 const {app}=await import('../src/app.js');const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const base=`http://127.0.0.1:${server.address().port}`;
 const dashboard=await fetch(base+'/app/dashboard');assert.equal(dashboard.status,200);assert.match(await dashboard.text(),/id="op3DScene"/);
 const technical=await fetch(base+'/app/dashboard?view=controller');assert.equal(technical.status,200);assert.match(await technical.text(),/id="op3DScene"/);
 const api=await fetch(base+'/empresa/operacao');assert.equal(api.status,401);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));prisma.auditLog.create=originalAudit;}
});

test('consulta demorada informa indisponibilidade sem sugerir migration incorreta',async()=>{const f=fixture();f.db.$transaction=async()=>{throw {code:'P2028'};};const r=await invoke(f.controller.report);assert.equal(r.statusCode,503);assert.equal(r.data.codigo,'OPERATION_QUERY_TIMEOUT');});

test('cena expõe somente juntas finitas; credenciais e telemetria arbitrária não vazam',async()=>{
 const f=fixture();f.db.maquina.findMany=async()=>[{id:11,nome:'Dobot',tipo:'Braço',modoSimulacao:false,telemetria:[{origem:'EQUIPAMENTO',dadosExtras:{deviceKey:'segredo',dobot:{joints:{j1:30,j2:Infinity,j3:999,j4:'12',token:'segredo'}}}}]}];
 const r=await invoke(f.controller.report);assert.deepEqual(r.data.maquinas[0].joints,{j1:30});assert(!JSON.stringify(r.data).includes('segredo'));assert.equal(r.data.podeParar,true);
 const other=fixture();other.db.maquina.findMany=async()=>[{id:11,modoSimulacao:true,telemetria:[{origem:'EQUIPAMENTO',dadosExtras:{dobot:{joints:{j1:90}}}}]}];assert.equal((await invoke(other.controller.report)).data.maquinas[0].joints,null);
});
