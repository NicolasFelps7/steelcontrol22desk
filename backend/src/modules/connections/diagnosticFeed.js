import { Prisma } from '@prisma/client';
import { diagnosticCodes } from '../../lib/diagnostics.js';
export function diagnosticFilters(query={},now=new Date()){
 const invalid=()=>{throw Object.assign(new Error('Filtros de diagnóstico inválidos. Use um período de até 366 dias.'),{status:400});};
 const number=(value,fallback,min,max)=>{if(value==null||value==='')return fallback;const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)invalid();return n;};
 const from=query.de?new Date(String(query.de)):new Date(now.getTime()-30*86400000);
 const to=query.ate?new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(query.ate))?String(query.ate)+'T23:59:59.999Z':String(query.ate)):now;
 if(!Number.isFinite(+from)||!Number.isFinite(+to)||from>to||to-from>366*86400000)invalid();
 const nivel=String(query.nivel||''),origem=String(query.origem||'');
 if(nivel&&!['INFO','WARN','ERROR'].includes(nivel))invalid();
 if(origem&&!['CONEXAO','NAVEGADOR','SERVIDOR','SISTEMA','OPERACAO','COMANDO','AUDITORIA'].includes(origem))invalid();
 return {from,to,nivel,origem,maquinaId:number(query.maquinaId,null,1,2147483647),usuarioId:number(query.usuarioId,null,1,2147483647),limit:number(query.limit,50,1,100),offset:number(query.offset,0,0,100000),q:String(query.q||'').trim().slice(0,100)};
}
export function feedQuery(empresaId,admin,filters,{count=false,exporting=false}={}){
 const where=[Prisma.sql`"data" >= ${filters.from}`,Prisma.sql`"data" <= ${filters.to}`];
 if(filters.nivel)where.push(Prisma.sql`"nivel" = ${filters.nivel}`);
 if(filters.origem)where.push(Prisma.sql`"origem" = ${filters.origem}`);
 if(filters.maquinaId)where.push(Prisma.sql`"maquinaId" = ${filters.maquinaId}`);
 if(filters.usuarioId)where.push(Prisma.sql`"usuarioId" = ${filters.usuarioId}`);
 if(filters.q)where.push(Prisma.sql`("mensagem" ILIKE ${'%'+filters.q+'%'} OR "codigo" ILIKE ${'%'+filters.q+'%'} OR "maquina" ILIKE ${'%'+filters.q+'%'} OR "usuario" ILIKE ${'%'+filters.q+'%'})`);
 const audit=admin?Prisma.sql`UNION ALL SELECT 'audit:'||a.id::text,a."criadoEm",CASE WHEN a.entidade='MAQUINA' THEN a."entidadeId" ELSE NULL END,COALESCE(m.nome,'—'),a."usuarioId",COALESCE(u.nome,'Sistema'),'AUDITORIA',CASE WHEN a.acao='FALHA_SERVIDOR' THEN 'ERROR' WHEN a.acao='ACESSO_NEGADO' THEN 'WARN' ELSE 'INFO' END,a.acao,a.acao||' · '||a.entidade FROM "AuditLog" a LEFT JOIN "Maquina" m ON a.entidade='MAQUINA' AND m.id=a."entidadeId" AND m."empresaId"=${empresaId} LEFT JOIN "Usuario" u ON u.id=a."usuarioId" AND u."empresaId"=${empresaId} WHERE a."empresaId"=${empresaId} AND a.acao<>'ACESSO_PROCESSADO'`:Prisma.empty;
 // Não seleciona payloads, biometria, IPs, tokens ou detalhes brutos da auditoria.
 return Prisma.sql`WITH feed("id","data","maquinaId","maquina","usuarioId","usuario","origem","nivel","codigo","mensagem") AS (
 SELECT 'diag:'||e.id,e."criadoEm",e."maquinaId",COALESCE(m.nome,'—'),e."usuarioId",COALESCE(u.nome,'Sistema'),e.origem,e.nivel,e.codigo,e.codigo FROM "DiagnosticEvent" e LEFT JOIN "Maquina" m ON m.id=e."maquinaId" AND m."empresaId"=${empresaId} LEFT JOIN "Usuario" u ON u.id=e."usuarioId" AND u."empresaId"=${empresaId} WHERE e."empresaId"=${empresaId}
 UNION ALL SELECT 'log:'||l.id::text,l."criadoEm",l."maquinaId",m.nome,NULL::integer,'Sistema','OPERACAO','INFO','EVENTO_OPERACIONAL',l.mensagem FROM "Log" l JOIN "Maquina" m ON m.id=l."maquinaId" WHERE m."empresaId"=${empresaId}
 UNION ALL SELECT 'cmd:'||c.id::text||':'||v.status,v.data,c."maquinaId",m.nome,c."solicitanteId",COALESCE(u.nome,'Não registrado / automático'),'COMANDO',CASE WHEN v.status='FALHOU' THEN 'ERROR' WHEN v.status='CANCELADO' THEN 'WARN' ELSE 'INFO' END,'COMANDO_'||v.status,c.comando||' · '||v.status FROM "ComandoMaquina" c JOIN "Maquina" m ON m.id=c."maquinaId" LEFT JOIN "Usuario" u ON u.id=c."solicitanteId" AND u."empresaId"=${empresaId} CROSS JOIN LATERAL (VALUES (c."criadoEm",'SOLICITADO'),(c."entregueEm",'ENTREGUE'),(c."concluidoEm",c.status)) AS v(data,status) WHERE m."empresaId"=${empresaId} AND v.data IS NOT NULL
 ${audit}
 ) SELECT ${count?Prisma.sql`COUNT(*)::integer AS total`:Prisma.sql`*`} FROM feed WHERE ${Prisma.join(where,' AND ')} ${count?Prisma.empty:Prisma.sql`ORDER BY "data" DESC,"id" DESC LIMIT ${exporting?5000:filters.limit} OFFSET ${exporting?0:filters.offset}`}`;
}
export function redactLog(value){
 return String(value??'').replace(/\bscd_[A-Za-z0-9_-]+/g,'[chave removida]').replace(/Bearer\s+[A-Za-z0-9._-]+/gi,'Bearer [removido]').replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi,'$1[credencial removida]@').replace(/((?:senha|password|token|secret|devicekey|x-device-key|api[_-]?key|x-api-key|cookie|authorization|embedding|facevector)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|\[[^\]]*\]|[^\s,;}&]+)/gi,'$1[removido]').slice(0,1200);
}
export function publicDiagnostic(row){
 const spec=diagnosticCodes[row.codigo];
 const hint=spec?.orientacao||(row.codigo==='COMANDO_FALHOU'?'Verifique o estado físico e os eventos de comunicação antes de repetir o comando.':row.codigo==='ACESSO_NEGADO'?'O administrador deve revisar a autorização da conta.':'Consulte os eventos próximos e o manual do equipamento.');
 return {id:row.id,data:row.data,maquinaId:row.maquinaId,usuarioId:row.usuarioId,origem:row.origem,nivel:row.nivel,codigo:row.codigo,maquina:redactLog(row.maquina),usuario:redactLog(row.usuario),mensagem:spec?.mensagem||redactLog(row.mensagem),orientacao:hint};
}
const cell=value=>{
 let text=String(value??'');if(/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
 return '"'+text.replaceAll('"','""')+'"';
};
export function diagnosticCsv(rows){
 const columns=['data','maquina','usuario','origem','nivel','codigo','mensagem','orientacao'];
 return '\uFEFF'+[columns,...rows.map(row=>columns.map(key=>key==='data'?new Date(row[key]).toISOString():row[key]))].map(row=>row.map(cell).join(';')).join('\r\n');
}
