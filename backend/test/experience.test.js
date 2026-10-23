import test from 'node:test';
import assert from 'node:assert/strict';
import { atualizarEmpresaComLogins } from '../src/lib/employeeLogin.js';
Object.assign(process.env,{DATABASE_URL:'postgresql://test:test@127.0.0.1:5432/test',JWT_SECRET:'a'.repeat(64),NODE_ENV:'development',SECURITY_PROFILE:'development'});
const {limparDemo}=await import('../tools/reset-demo.js');

test('renomear empresa atualiza o sufixo e os logins, preservando prefixos e contatos',async()=>{
 const writes=[];
 const tx={$queryRawUnsafe:async()=>[],empresa:{findUnique:async q=>q.where.id?{id:3,nome:'Velha',loginDomain:'velha.com'}:null,update:async q=>{writes.push(q);return{id:3,...q.data};}},usuario:{findMany:async()=>[{id:7,loginInterno:'joao.silva@velha.com'},{id:8,loginInterno:'ana@velha.com'}],findFirst:async()=>null,update:async q=>{writes.push(q);}}};
 const company=await atualizarEmpresaComLogins(tx,3,{nome:'Metalúrgica Nova'});
 assert.equal(company.loginDomain,'metalurgicanova.com');
 assert.deepEqual(writes.slice(1).map(q=>q.data),[{loginInterno:'joao.silva@metalurgicanova.com'},{loginInterno:'ana@metalurgicanova.com'}]);
});
test('nome já usado por outra empresa recebe sufixo único sem misturar funcionários',async()=>{
 const tx={$queryRawUnsafe:async()=>[],empresa:{findUnique:async q=>q.where.id?{id:3}:q.where.loginDomain==='alfa.com'?{id:10}:null,update:async q=>q.data},usuario:{findMany:async()=>[]}};
 assert.equal((await atualizarEmpresaComLogins(tx,3,{nome:'Alfa'})).loginDomain,'alfa-3.com');
});
test('colisão com e-mail real de outra conta escolhe sufixo alternativo',async()=>{
 const tx={$queryRawUnsafe:async()=>[],empresa:{findUnique:async q=>q.where.id?{id:3}:null,update:async q=>q.data},usuario:{findMany:async()=>[{id:7,loginInterno:'joao@velha.com'}],findFirst:async q=>q.where.OR[0].email==='joao@alfa.com'?{id:8}:null,update:async()=>{}}};
 assert.equal((await atualizarEmpresaComLogins(tx,3,{nome:'Alfa'})).loginDomain,'alfa-3.com');
});
function resetDb(events){return {$transaction:async fn=>fn({$executeRawUnsafe:async sql=>events.push(sql),$queryRawUnsafe:async()=>[{registro:{id:1,nome:'empresa'}}]})};}
test('limpeza faz backup antes de apagar e reinicia identificadores',async()=>{
 const events=[]; await limparDemo(resetDb(events),{confirmar:'APAGAR_TUDO_STEELCONTROL',destino:'/backup.json',tabelas:['Empresa','Usuario'],salvarBackup:async(_,raw)=>{assert.equal(JSON.parse(raw).tabelas.Empresa[0].nome,'empresa');events.push('backup');}});
 assert.match(events[0],/^LOCK TABLE/);assert.equal(events[1],'backup');assert.match(events[2],/^TRUNCATE TABLE.*RESTART IDENTITY CASCADE/);
});
test('sem backup a limpeza falha sem apagar dados',async()=>{
 const events=[];await assert.rejects(()=>limparDemo(resetDb(events),{confirmar:'APAGAR_TUDO_STEELCONTROL',destino:'/backup.json',tabelas:['Empresa'],salvarBackup:async()=>{throw Error('disco sem espaço');}}),/disco sem espaço/);
 assert.ok(!events.some(x=>x.startsWith('TRUNCATE')));
});
test('comando de limpeza exige confirmação explícita e bloqueia nomes de tabela adulterados',async()=>{
 await assert.rejects(()=>limparDemo({},{}),/--confirmar/);
 await assert.rejects(()=>limparDemo({},{confirmar:'APAGAR_TUDO_STEELCONTROL',destino:'/backup',tabelas:['Empresa;DROP'],salvarBackup:async()=>{}}),/inválida/);
});
