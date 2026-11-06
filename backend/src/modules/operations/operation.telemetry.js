import { Prisma } from '@prisma/client';
import { FIELDS } from './operation.logic.js';
// Identificadores são fixos; todos os filtros externos permanecem parametrizados.
export function telemetryQuery({empresaId,ids,start,end}) {
  const pairs=FIELDS.map(key=>`('${key}', ${key==='fabricados'?`COALESCE(t."dadosExtras"->'operacao'->'contadores'->'fabricados', CASE WHEN m."integracaoMeta"->'operacao'->>'producaoConfirmada'='true' AND lower(concat(m.controlador,' ',m.tipo,' ',m.nome)) NOT LIKE '%dobot%' THEN to_jsonb(t.producao) END)`:`t."dadosExtras"->'operacao'->'contadores'->'${key}'`})`);
  pairs.push(`('ciclos',COALESCE(t."dadosExtras"->'operacao'->'contadores'->'ciclos',CASE WHEN lower(concat(m.controlador,' ',m.tipo,' ',m.nome)) LIKE '%dobot%' OR m."integracaoMeta"->'operacao'->>'ciclosConfirmados'='true' THEN to_jsonb(t.ciclos) END))`);
  return Prisma.sql`WITH scoped AS (
    SELECT id,nome,tipo,controlador,"integracaoMeta" FROM "Maquina" WHERE "empresaId"=${empresaId} AND ativo=true AND "modoSimulacao"=false AND id IN (${Prisma.join(ids)})
  ), samples AS (
    SELECT t.* FROM "TelemetryReading" t JOIN scoped m ON m.id=t."maquinaId" WHERE t."criadoEm">=${start} AND t."criadoEm"<=${end} AND upper(t.origem) NOT LIKE '%SIMUL%'
    UNION ALL
    SELECT p.* FROM scoped m CROSS JOIN LATERAL (SELECT t.* FROM "TelemetryReading" t WHERE t."maquinaId"=m.id AND t."criadoEm"<${start} AND upper(t.origem) NOT LIKE '%SIMUL%' ORDER BY t."criadoEm" DESC,t.id DESC LIMIT 1) p
  ), expanded AS (
    SELECT t.id,t."maquinaId",t."criadoEm",v.key,
      CASE WHEN jsonb_typeof(v.value)='number' THEN CASE WHEN (v.value::text)::numeric BETWEEN 0 AND 1000000000 AND (v.key LIKE '%Segundos' OR trunc((v.value::text)::numeric)=(v.value::text)::numeric) THEN (v.value::text)::numeric END END AS value
    FROM samples t JOIN scoped m ON m.id=t."maquinaId" CROSS JOIN LATERAL (VALUES ${Prisma.raw(pairs.join(','))}) v(key,value)
  ), observed AS (
    SELECT *,lag(value) OVER(PARTITION BY "maquinaId",key ORDER BY "criadoEm",id) AS previous FROM expanded WHERE value IS NOT NULL
  ) SELECT "maquinaId",key,
    sum(CASE WHEN previous IS NULL THEN NULL WHEN value>=previous THEN value-previous ELSE value END)::double precision AS total,
    count(*)::integer AS samples,
    count(*) FILTER(WHERE previous IS NULL)::integer AS missing
    FROM observed WHERE "criadoEm">=${start} GROUP BY "maquinaId",key`;
}
