/* ================= UI BASE ================= */
const Ctx=createContext(null);
const useApp=()=>useContext(Ctx);
const ICON={
 home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',globe:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
 wallet:'M4 7h15a1 1 0 011 1v11a1 1 0 01-1 1H5a2 2 0 01-2-2V6a2 2 0 012-2h11M16 14h2',chat:'M4 5h16v11H9l-5 4z',chart:'M3 17l6-6 4 4 8-8M15 7h6v6',
 book:'M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',bell:'M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4',
 search:'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',plus:'M12 5v14M5 12h14',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
 copy:'M9 9h11v11H9zM5 15V5h10',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18',calc:'M6 3h12v18H6zM9 7h6M9 12h1M14 12h1M9 16h1M14 16h1',
 help:'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17h.01',sun:'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
 moon:'M20 14A8 8 0 019.5 4 8 8 0 1020 14z',fire:'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
 trophy:'M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 21h8',flag:'M5 21V4M5 4h13l-2 4 2 4H5',lock:'M6 11h12v9H6zM9 11V8a3 3 0 016 0v3',
 star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',chev:'M6 9l6 6 6-6',up:'M12 19V5M6 11l6-6 6 6',down:'M12 5v14M6 13l6 6 6-6',
 refresh:'M4 12a8 8 0 0114-5l2 2M20 4v5h-5M20 12a8 8 0 01-14 5l-2-2M4 20v-5h5',news:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
 info:'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5h.01',warn:'M12 3l10 18H2zM12 10v5M12 18h.01',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',copy2:'M5 5h14v14H5z'};
ICON.trend=ICON.chart;
ICON.receipt='M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4';
const Ic=({n,s=20})=>html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d=${ICON[n]||ICON.info}/></svg>`;
const Demo=({t='Demo'})=>html`<span className="demo">${t}</span>`;
function col(){const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  return {green:g('--green'),blue:g('--blue'),yellow:g('--yellow'),red:g('--red'),purple:g('--purple'),teal:g('--teal'),fg:g('--fg'),muted:g('--muted'),line:g('--line'),card:g('--card')}}
/* Hogares (cuenta con integrantes) se saludan con el nombre completo: "Familia Rivera". */
const shortName=u=>u.members&&u.members.length?u.name:u.name.split(' ')[0];
const catColors=c=>[c.blue,c.green,c.yellow,c.red,c.purple,c.teal,'#E8833A','#C2549D','#6B7A90'];

function Modal({title,onClose,children,wide}){
  useEffect(()=>{const h=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
  return html`<div className="ov" onMouseDown=${e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className=${'modal'+(wide?' wide':'')} role="dialog" aria-modal="true" aria-label=${title}>
      <div className="mh"><h2>${title}</h2><button className="ib" aria-label="Cerrar" onClick=${onClose}><${Ic} n="x"/></button></div>
      <div className="mb">${children}</div></div></div>`;
}
const Field=({label,id,err,hint,children,cls})=>html`<div className=${'fld '+(cls||'')}><label htmlFor=${id}>${label}</label>${children}${err?html`<div className="err" role="alert">${err}</div>`:hint?html`<div className="hint">${hint}</div>`:null}</div>`;
const Seg=({opts,val,on,label})=>html`<div className="seg" role="tablist" aria-label=${label||''}>${opts.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${val===k} className=${val===k?'on':''} onClick=${()=>on(k)}>${l}</button>`)}</div>`;
const Tabs=({opts,val,on})=>html`<div className="tabs" role="tablist">${opts.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${val===k} className=${val===k?'on':''} onClick=${()=>on(k)}>${l}</button>`)}</div>`;
const Bar=({v,t})=>html`<div className=${'bar '+(t||'')} role="progressbar" aria-valuenow=${Math.round(v)} aria-valuemin="0" aria-valuemax="100"><i style=${{width:clamp(v,0,100)+'%'}}></i></div>`;
const Empty=({title,text,action})=>html`<div className="empty"><${Ic} n="info" s=${28}/><b>${title}</b><span>${text}</span>${action||null}</div>`;
const Banner=({k,ic,children})=>html`<div className=${'banner '+(k||'')}><${Ic} n=${ic||'info'} s=${18}/><div>${children}</div></div>`;
const Head=({title,sub,right})=>html`<div className="ph"><div><h1>${title}</h1>${sub?html`<p>${sub}</p>`:null}</div>${right||null}</div>`;
const Chart=({h=260,children})=>html`<div style=${{width:'100%',height:h}}><${RC.ResponsiveContainer} width="100%" height="100%">${children}<//></div>`;
const tipStyle=c=>({contentStyle:{background:c.card,border:`1px solid ${c.line}`,borderRadius:10,color:c.fg,fontSize:12.5},itemStyle:{color:c.fg},labelStyle:{color:c.muted}});
const axis=c=>({tick:{fill:c.muted,fontSize:11.5},axisLine:{stroke:c.line},tickLine:false});
const Kpi=({l,v,s,ic,cls})=>html`<div className="card kpi"><div className="l">${ic?html`<${Ic} n=${ic} s=${16}/>`:null}${l}</div><div className=${'v num '+(cls||'')}>${v}</div><div className="s">${s}</div></div>`;
function rich(text){
  const bold=t=>t.split('**').map((p,i)=>i%2?html`<strong key=${i}>${p}</strong>`:p);
  const lines=String(text).split('\n'),out=[];let li=[];
  const flush=()=>{if(li.length){out.push(html`<ul key=${'u'+out.length}>${li.map((x,i)=>html`<li key=${i}>${bold(x)}</li>`)}</ul>`);li=[]}};
  lines.forEach((l,i)=>{if(l.startsWith('• '))li.push(l.slice(2));else{flush();if(l.trim())out.push(html`<p key=${i}>${bold(l)}</p>`)}});
  flush();return out;
}
async function copyText(t,toast){
  try{await navigator.clipboard.writeText(t);toast('Copiado al portapapeles','ok')}
  catch(e){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();toast(ok?'Copiado al portapapeles':'No se pudo copiar; selecciona el texto manualmente',ok?'ok':'err')}
}

/* ================= FORMULARIO DE MOVIMIENTOS ================= */
function TxForm({edit,onClose,defType}){
  const {s,upd,toast}=useApp();
  const [f,setF]=useState(edit?{type:edit.type,amount:String(edit.amount),cat:edit.cat,date:edit.date,method:edit.method,note:edit.note||''}:{type:defType||'gasto',amount:'',cat:'',date:todayS(),method:'Débito',note:''});
  const [er,setEr]=useState({});
  const set=(k,v)=>setF(p=>({...p,[k]:v,...(k==='type'?{cat:''}:{})}));
  const cats=f.type==='gasto'?EXP_NAMES:INC_CATS;
  const submit=e=>{
    e.preventDefault();const x={},a=num(f.amount);
    if(f.amount.trim()==='')x.amount='Escribe un monto.';else if(!Number.isFinite(a))x.amount='Escribe un número válido.';else if(a<=0)x.amount='El monto debe ser mayor que cero.';else if(a>10000000)x.amount='El monto es demasiado grande para esta demo.';
    if(!f.cat)x.cat='Elige una categoría.';
    if(!f.date)x.date='Elige una fecha.';else if(!validDate(f.date))x.date='La fecha no es válida.';else if(f.date>todayS())x.date='La fecha no puede ser futura.';else if(f.date<'2000-01-01')x.date='La fecha es demasiado antigua.';
    setEr(x);if(Object.keys(x).length)return;
    const rec={type:f.type,amount:Math.round(a*100)/100,cat:f.cat,date:f.date,method:f.method,note:f.note.trim()};
    upd(d=>{if(edit){const i=d.tx.findIndex(t=>t.id===edit.id);d.tx[i]={...d.tx[i],...rec}}else d.tx.push({id:uid(),...rec,demo:false})});
    toast(edit?'Movimiento actualizado':'Movimiento registrado','ok');onClose();
  };
  return html`<${Modal} title=${edit?'Editar movimiento':'Nuevo movimiento'} onClose=${onClose}>
    <form className="form" onSubmit=${submit} noValidate>
      <div className="full"><${Seg} opts=${[['gasto','Gasto'],['ingreso','Ingreso']]} val=${f.type} on=${v=>set('type',v)} label="Tipo"/></div>
      <${Field} label="Monto (MXN)" id="tx-amt" err=${er.amount}><input id="tx-amt" type="number" inputMode="decimal" step="any" min="0" placeholder="0.00" className=${er.amount?'bad':''} value=${f.amount} onChange=${e=>set('amount',e.target.value)} autoFocus/><//>
      <${Field} label="Categoría" id="tx-cat" err=${er.cat}><select id="tx-cat" className=${er.cat?'bad':''} value=${f.cat} onChange=${e=>set('cat',e.target.value)}><option value="">Elegir…</option>${cats.map(c=>html`<option key=${c}>${c}</option>`)}</select><//>
      <${Field} label="Fecha" id="tx-date" err=${er.date}><input id="tx-date" type="date" className=${er.date?'bad':''} max=${todayS()} value=${f.date} onChange=${e=>set('date',e.target.value)}/><//>
      <${Field} label="Método de pago" id="tx-met"><select id="tx-met" value=${f.method} onChange=${e=>set('method',e.target.value)}>${METHODS.map(m=>html`<option key=${m}>${m}</option>`)}</select><//>
      <${Field} label="Nota (opcional)" id="tx-note" cls="full"><input id="tx-note" maxLength="80" placeholder="Ej. Súper de la semana" value=${f.note} onChange=${e=>set('note',e.target.value)}/><//>
      <div className="mf full"><button type="button" className="btn" onClick=${onClose}>Cancelar</button><button type="submit" className="btn pri">${edit?'Guardar cambios':'Registrar'}</button></div>
    </form><//>`;
}
function Confirm({c,onClose}){
  return html`<${Modal} title=${c.title} onClose=${onClose}><p>${c.text}</p><div className="mf"><button className="btn" onClick=${onClose}>Cancelar</button><button className=${'btn '+(c.danger===false?'pri':'dng')} onClick=${()=>{c.onYes();onClose()}}>${c.yes||'Eliminar'}</button></div><//>`;
}
