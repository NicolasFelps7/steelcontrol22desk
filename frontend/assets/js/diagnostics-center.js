/* Central de diagnóstico: consulta autenticada, paginação e relatório da empresa. */
(() => {
 'use strict';
 const staff=()=>['ADMINISTRADOR','SUPERVISOR','TECNICO'].includes(String(localStorage.getItem('cargoUsuario')||'').toUpperCase());
 async function request(path){
  const res=await fetchAutenticado(String(window.STEELCONTROL_API_URL||'').replace(/\/$/,'')+'/diagnostico'+path,{cache:'no-store'});
  const body=await res.json();if(!res.ok)throw new Error(body.mensagem||'Não foi possível consultar o diagnóstico.');return body;
 }
 const localDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 window.abrirCentralDiagnostico=async(maquinaId=null)=>{
  const dialog=document.createElement('dialog');dialog.className='diagnostic-dialog';
  dialog.innerHTML=`<div class="diagnostic-heading"><div><h2>Central de Diagnóstico</h2><p>Histórico da empresa, falhas de comunicação e orientações de resolução.</p></div><button type="button" data-close aria-label="Fechar diagnóstico">×</button></div><form class="diagnostic-filters"><label>Máquina<select name="maquinaId"><option value="">Todas as máquinas</option></select></label><label>Severidade<select name="nivel"><option value="">Todas</option><option value="INFO">Informação</option><option value="WARN">Atenção</option><option value="ERROR">Erro</option></select></label><label>Origem<select name="origem"><option value="">Todas</option>${['CONEXAO','NAVEGADOR','SERVIDOR','SISTEMA','OPERACAO','COMANDO','AUDITORIA'].map(v=>'<option>'+v+'</option>').join('')}</select></label><label>De<input name="de" type="date" required></label><label>Até<input name="ate" type="date" required></label><label>Buscar<input name="q" maxlength="100" placeholder="Código, máquina, usuário ou evento"></label><button type="submit">Aplicar filtros</button><button type="button" data-export>Exportar CSV</button></form><p data-status role="status" aria-live="polite">Carregando…</p><div class="diagnostic-list"></div><div class="diagnostic-pagination"><button type="button" data-prev>Anterior</button><span data-page></span><button type="button" data-next>Próxima</button></div>`;
  document.body.append(dialog);dialog.showModal();
  const form=dialog.querySelector('form'),fields=form.elements,status=dialog.querySelector('[data-status]'),list=dialog.querySelector('.diagnostic-list');
  let offset=0,total=0,busy=false,closed=false,sequence=0;
  fields.de.value=localDate(new Date(Date.now()-30*86400000));fields.ate.value=localDate(new Date());
  const say=text=>{status.textContent=text;};
  function params(){const p=new URLSearchParams();for(const key of ['maquinaId','nivel','origem','q'])if(fields[key].value.trim())p.set(key,fields[key].value.trim());
   for(const [key,end] of [['de',false],['ate',true]])if(fields[key].value){const d=new Date(fields[key].value+(end?'T23:59:59.999':'T00:00:00'));p.set(key,d.toISOString());}return p;}
  function render(data){
   list.replaceChildren();total=data.total;
   for(const item of data.itens){
    const article=document.createElement('article');article.className='diagnostic-event';article.dataset.level=item.nivel;
    const meta=document.createElement('p');meta.className='diagnostic-meta';meta.textContent=new Date(item.data).toLocaleString('pt-BR')+' · '+item.nivel+' · '+item.origem+' · '+item.codigo;
    const title=document.createElement('h3');title.textContent=item.mensagem;
    const actor=document.createElement('p');actor.textContent=item.maquina+' · '+item.usuario;
    const hint=document.createElement('p');hint.className='diagnostic-hint';hint.textContent='Como proceder: '+item.orientacao;
    article.append(meta,title,actor,hint);list.append(article);
   }
   if(!data.itens.length){const p=document.createElement('p');p.textContent='Nenhum evento encontrado para estes filtros.';list.append(p);}
   say(total+' evento(s) encontrado(s). Consulta atualizada às '+new Date(data.geradoEm).toLocaleTimeString('pt-BR')+'.');
   dialog.querySelector('[data-page]').textContent=total?`${offset+1}–${Math.min(offset+50,total)} de ${total}`:'0 eventos';
   dialog.querySelector('[data-prev]').disabled=offset===0;dialog.querySelector('[data-next]').disabled=offset+50>=total;
  }
  async function load(){
   if(busy||closed)return;busy=true;const seq=++sequence;say('Consultando histórico…');
   try{const p=params();p.set('offset',offset);p.set('limit','50');const data=await request('/?'+p);if(!closed&&seq===sequence)render(data);}
   catch(error){if(!closed)say(error.message);}finally{busy=false;}
  }
  form.onsubmit=event=>{event.preventDefault();if(!busy){offset=0;void load();}};
  dialog.querySelector('[data-prev]').onclick=()=>{if(!busy){offset=Math.max(0,offset-50);void load();}};
  dialog.querySelector('[data-next]').onclick=()=>{if(!busy&&offset+50<total){offset+=50;void load();}};
  dialog.querySelector('[data-export]').onclick=async()=>{
   if(busy)return;busy=true;say('Preparando relatório…');
   try{const result=await request('/exportar?'+params());if(closed)return;const url=URL.createObjectURL(new Blob([result.conteudo],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=result.nomeArquivo;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say(result.limitado?`Exportados ${result.exportados} de ${result.total} eventos. Reduza o período para exportar os demais.`:`Relatório com ${result.exportados} eventos exportado.`);}
   catch(error){if(!closed)say(error.message);}finally{busy=false;}
  };
  const close=()=>{closed=true;sequence++;dialog.close();dialog.remove();};dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  try{const machines=await request('/maquinas');if(closed)return;for(const machine of machines){const option=document.createElement('option');option.value=machine.id;option.textContent=machine.nome+(machine.ativo?'':' (arquivada)');fields.maquinaId.append(option);}if(maquinaId)fields.maquinaId.value=String(maquinaId);await load();}catch(error){if(!closed)say(error.message);}
 };
 document.addEventListener('DOMContentLoaded',()=>{
  if(!staff())return;
  const header=document.querySelector('.cadastro-header')||document.querySelector('#logsTela');if(!header)return;
  const button=document.createElement('button');button.type='button';button.className='diagnostic-open';button.textContent='Central de Diagnóstico';button.onclick=()=>window.abrirCentralDiagnostico(header.id==='logsTela'?Number(localStorage.getItem('maquinaId'))||null:null);header.append(button);
 });
})();
