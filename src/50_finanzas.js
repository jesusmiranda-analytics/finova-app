/* ================= MIS FINANZAS ================= */
function useTab(route,def){
  const {hint}=useApp();
  const [t,setT]=useState(hint&&hint.route===route&&hint.tab?hint.tab:def);
  useEffect(()=>{if(hint&&hint.route===route&&hint.tab)setT(hint.tab)},[hint]);
  return [t,setT];
}
function PeriodBar({p,setP}){return html`<${Seg} opts=${PERIODS} val=${p} on=${setP} label="Periodo"/>`}

function Movimientos({p}){
  const {s,upd,toast,openTx,ask}=useApp();
  const [f,setF]=useState({q:'',cat:'',type:'',from:'',to:'',sort:'fecha-desc'}),[shown,setShown]=useState(25);
  const r=rangeOf(p);
  const list=useMemo(()=>{
    const q=norm(f.q);
    let l=s.tx.filter(t=>inRange(t,r)&&(!f.cat||t.cat===f.cat)&&(!f.type||t.type===f.type)&&(!f.from||t.date>=f.from)&&(!f.to||t.date<=f.to)&&(!q||norm(t.cat+' '+(t.note||'')+' '+t.method).includes(q)));
    const k=f.sort;l=[...l].sort((a,b)=>k==='fecha-desc'?b.date.localeCompare(a.date):k==='fecha-asc'?a.date.localeCompare(b.date):k==='monto-desc'?b.amount-a.amount:a.amount-b.amount);
    return l;
  },[s.tx,p,f]);
  const T=tot(list),badRange=f.from&&f.to&&f.from>f.to;
  const set=(k,v)=>{setF(x=>({...x,[k]:v}));setShown(25)};
  const clear=()=>{setF({q:'',cat:'',type:'',from:'',to:'',sort:'fecha-desc'});setShown(25)};
  const del=t=>ask({title:'Eliminar movimiento',text:`Se eliminará ${t.type==='gasto'?'el gasto':'el ingreso'} de ${fmt2(t.amount)} en ${t.cat} (${fdate(t.date)}). Esta acción no se puede deshacer.`,onYes:()=>{upd(d=>{d.tx=d.tx.filter(x=>x.id!==t.id)});toast('Movimiento eliminado','ok')}});
  const [ed,setEd]=useState(null);
  return html`<div className="col" style=${{gap:16}}>
    <div className="grid g3" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,180px),1fr))'}}>
      <${Kpi} l="Ingresos" v=${fmt(T.inc)} s=${`${fdate(r.from)} – ${fdate(r.to)}`} cls="up"/><${Kpi} l="Gastos" v=${fmt(T.exp)} s=${`${list.filter(t=>t.type==='gasto').length} movimientos`} cls="down"/><${Kpi} l="Balance" v=${fmt(T.net)} s=${T.net>=0?'Positivo':'Gastaste más de lo que ingresaste'} cls=${T.net>=0?'up':'down'}/></div>
    <div className="card col">
      <div className="form" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,160px),1fr))'}}>
        <${Field} label="Buscar" id="f-q"><input id="f-q" placeholder="Nota, categoría…" value=${f.q} onChange=${e=>set('q',e.target.value)}/><//>
        <${Field} label="Categoría" id="f-cat"><select id="f-cat" value=${f.cat} onChange=${e=>set('cat',e.target.value)}><option value="">Todas</option>${[...EXP_NAMES,...INC_CATS].map(c=>html`<option key=${c}>${c}</option>`)}</select><//>
        <${Field} label="Tipo" id="f-type"><select id="f-type" value=${f.type} onChange=${e=>set('type',e.target.value)}><option value="">Todos</option><option value="gasto">Gastos</option><option value="ingreso">Ingresos</option></select><//>
        <${Field} label="Desde" id="f-from" err=${badRange?'La fecha inicial es posterior a la final.':''}><input id="f-from" type="date" value=${f.from} onChange=${e=>set('from',e.target.value)}/><//>
        <${Field} label="Hasta" id="f-to"><input id="f-to" type="date" value=${f.to} onChange=${e=>set('to',e.target.value)}/><//>
        <${Field} label="Ordenar por" id="f-sort"><select id="f-sort" value=${f.sort} onChange=${e=>set('sort',e.target.value)}><option value="fecha-desc">Fecha: reciente primero</option><option value="fecha-asc">Fecha: antigua primero</option><option value="monto-desc">Monto: mayor primero</option><option value="monto-asc">Monto: menor primero</option></select><//></div>
      <div className="row sp"><span className="muted sm">${list.length} ${list.length===1?'movimiento':'movimientos'}</span><div className="row"><button className="btn sm" onClick=${clear}>Limpiar filtros</button><button className="btn pri sm" onClick=${()=>openTx()}><${Ic} n="plus" s=${16}/>Agregar</button></div></div>
      ${list.length?html`<div className="tw"><table><thead><tr><th>Fecha</th><th>Detalle</th><th>Método</th><th>Tipo</th><th style=${{textAlign:'right'}}>Monto</th><th></th></tr></thead><tbody>
        ${list.slice(0,shown).map(t=>html`<tr key=${t.id}><td className="num" style=${{whiteSpace:'nowrap'}}>${fshort(t.date)}</td><td><div className="b">${t.cat} ${t.demo?html`<${Demo}/>`:null}</div><div className="muted xs">${t.note||'—'}</div></td><td>${t.method}</td>
          <td><span className=${'pill '+(t.type==='gasto'?'r':'g')}>${t.type==='gasto'?'Gasto':'Ingreso'}</span></td>
          <td className=${'num b '+(t.type==='gasto'?'down':'up')} style=${{textAlign:'right',whiteSpace:'nowrap'}}>${t.type==='gasto'?'−':'+'}${fmt2(t.amount)}</td>
          <td style=${{whiteSpace:'nowrap',textAlign:'right'}}><button className="ib" style=${{width:34,height:34,display:'inline-grid'}} aria-label="Editar movimiento" onClick=${()=>setEd(t)}><${Ic} n="edit" s=${16}/></button> <button className="ib" style=${{width:34,height:34,display:'inline-grid'}} aria-label="Eliminar movimiento" onClick=${()=>del(t)}><${Ic} n="trash" s=${16}/></button></td></tr>`)}</tbody></table></div>
        ${list.length>shown?html`<button className="btn" onClick=${()=>setShown(n=>n+25)}>Mostrar más (${list.length-shown})</button>`:null}`
        :html`<${Empty} title="Sin movimientos" text="No hay movimientos con estos filtros o en este periodo." action=${html`<button className="btn pri sm" onClick=${()=>openTx()}>Registrar movimiento</button>`}/>`}</div>
    ${ed?html`<${TxForm} edit=${ed} onClose=${()=>setEd(null)}/>`:null}</div>`;
}

function Analisis({p}){
  const {s}=useApp(),c=col(),r=rangeOf(p);
  const list=s.tx.filter(t=>inRange(t,r)),T=tot(list),bc=byCat(list);
  const pie=Object.entries(bc).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const bars=buckets(p).map(b=>{const t=tot(list.filter(x=>x.date>=b.from&&x.date<=b.to));return {label:b.label,Ingresos:t.inc,Gastos:t.exp}});
  const fx=sum(list.filter(t=>t.type==='gasto'&&(EXP_CATS.find(x=>x.n===t.cat)||{}).fixed),t=>t.amount),vr=T.exp-fx,cc=catColors(c);
  const ins=insights(list,s);
  if(!list.some(t=>t.type==='gasto'))return html`<div className="card"><${Empty} title="Sin gastos en este periodo" text="Registra gastos para ver tu análisis."/></div>`;
  return html`<div className="col" style=${{gap:16}}>
    <div className="grid g2">
      <div className="card"><div className="ch"><h2>Gasto por categoría</h2><span className="num b">${fmt(T.exp)}</span></div>
        <${Chart} h=${230}><${RC.PieChart}><${RC.Pie} data=${pie} dataKey="value" nameKey="name" innerRadius=${58} outerRadius=${92} paddingAngle=${2} stroke="none">${pie.map(d=>html`<${RC.Cell} key=${d.name} fill=${cc[EXP_NAMES.indexOf(d.name)%6]}/>`)}<//><${RC.Tooltip} formatter=${(v,n)=>[`${fmt(v)} (${pc(v/T.exp*100,0)})`,n]} ...${tipStyle(c)}/><//><//>
        <div className="legend">${pie.map(d=>html`<span key=${d.name}><i style=${{background:cc[EXP_NAMES.indexOf(d.name)%6]}}></i>${d.name} ${pc(d.value/T.exp*100,0)}</span>`)}</div></div>
      <div className="card"><div className="ch"><h2>Ingresos vs gastos</h2></div>
        <${Chart} h=${230}><${RC.BarChart} data=${bars}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="label" interval="preserveStartEnd" ...${axis(c)}/><${RC.YAxis} width=${46} tickFormatter=${v=>v>=1000?(v/1000)+'k':v} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} ...${tipStyle(c)} cursor=${{fill:c.line,opacity:.3}}/>
          <${RC.Bar} dataKey="Ingresos" fill=${c.green} radius=${[4,4,0,0]}/><${RC.Bar} dataKey="Gastos" fill=${c.red} radius=${[4,4,0,0]}/><//><//>
        <div className="legend"><span><i style=${{background:c.green}}></i>Ingresos</span><span><i style=${{background:c.red}}></i>Gastos</span></div></div>
    </div>
    <div className="grid g2">
      <div className="card"><div className="ch"><h2>Gastos fijos vs variables</h2></div>
        <div style=${{display:'flex',height:22,borderRadius:8,overflow:'hidden',background:'var(--card2)'}}><div style=${{width:pc(fx/T.exp*100,2),background:c.blue,transition:'width .5s'}}></div><div style=${{flex:1,background:c.yellow}}></div></div>
        <div className="row sp" style=${{marginTop:12}}><div><div className="legend"><span><i style=${{background:c.blue}}></i>Fijos</span></div><div className="num b" style=${{fontSize:20}}>${fmt(fx)}</div><div className="muted xs">${pc(fx/T.exp*100,0)} · Educación y servicios</div></div>
        <div style=${{textAlign:'right'}}><div className="legend" style=${{justifyContent:'flex-end'}}><span><i style=${{background:c.yellow}}></i>Variables</span></div><div className="num b" style=${{fontSize:20}}>${fmt(vr)}</div><div className="muted xs">${pc(vr/T.exp*100,0)} · lo que más puedes ajustar</div></div></div></div>
      <div className="card"><div className="ch"><h2>Descubre tus hábitos</h2><span className="pill b">Calculado con tus datos</span></div>
        <div className="col" style=${{gap:8}}>${ins.map((x,i)=>html`<${Banner} key=${i} k=${x.k==='b'?'b':x.k} ic=${x.k==='g'?'check':x.k==='r'?'warn':'spark'}>${x.t}<//>`)}</div></div>
    </div></div>`;
}

function Presupuestos(){
  const {s,upd,toast}=useApp(),c=col();
  const rows=budgetRows(s),T=tot(monthList(s)),rule=s.budgets.rule;
  const [inc,setInc]=useState(String(s.user.income)),[rl,setRl]=useState({needs:String(rule.needs),wants:String(rule.wants),save:String(rule.save)}),[er,setEr]=useState('');
  const [edc,setEdc]=useState(null),[val,setVal]=useState(''),[ve,setVe]=useState('');
  const incN=num(inc),pn=[num(rl.needs),num(rl.wants),num(rl.save)],total=sum(pn);
  const saveRule=()=>{
    if(!Number.isFinite(incN)||incN<=0)return setEr('El ingreso mensual debe ser mayor que cero.');
    if(pn.some(x=>!Number.isFinite(x)||x<0))return setEr('Los porcentajes deben ser números de 0 o más.');
    if(Math.round(total*100)!==10000)return setEr(`Los porcentajes suman ${nf(total,0)}%. Deben sumar 100%.`);
    setEr('');upd(d=>{d.user.income=incN;d.budgets.rule={needs:pn[0],wants:pn[1],save:pn[2]}});toast('Regla de presupuesto guardada','ok');
  };
  const base=Number.isFinite(incN)&&incN>0?incN:s.user.income;
  const needs=sum(rows.filter(r=>EXP_CATS.find(x=>x.n===r.cat).grp==='needs'),r=>r.spent),wants=sum(rows.filter(r=>EXP_CATS.find(x=>x.n===r.cat).grp==='wants'),r=>r.spent),saved=Math.max(0,(T.inc||base)-T.exp);
  const groups=[['Necesidades',pn[0],needs,'needs'],['Gustos',pn[1],wants,'wants'],['Ahorro y deudas',pn[2],saved,'save']];
  const saveLim=cat=>{const v=num(val);if(!Number.isFinite(v)||v<0)return setVe('Escribe un monto de 0 o más.');if(v>1e7)return setVe('Monto demasiado grande.');upd(d=>{d.budgets.cats[cat]=v});setEdc(null);setVe('');toast(`Presupuesto de ${cat} actualizado`,'ok')};
  const alerts=rows.filter(r=>r.pct>100||(r.pct>=80&&r.pct<100)).sort((a,b)=>b.pct-a.pct);
  return html`<div className="col" style=${{gap:16}}>
    ${alerts.map(r=>html`<${Banner} key=${r.cat} k=${r.pct>100?'r':'y'} ic="warn"><b>${r.cat}:</b> ${r.pct>100?`superaste tu presupuesto por ${fmt(r.spent-r.limit)} (${pc(r.pct,0)}).`:`llevas ${pc(r.pct,0)} de tu límite. Te quedan ${fmt(r.limit-r.spent)}.`}<//>`)}
    <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Regla 50/30/20 editable</h2><span className="muted sm">Mes actual</span></div>
      <div className="form" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,140px),1fr))'}}>
        <${Field} label="Ingreso mensual" id="r-inc"><input id="r-inc" type="number" inputMode="decimal" min="0" value=${inc} onChange=${e=>setInc(e.target.value)}/><//>
        <${Field} label="Necesidades %" id="r-n"><input id="r-n" type="number" min="0" max="100" value=${rl.needs} onChange=${e=>setRl({...rl,needs:e.target.value})}/><//>
        <${Field} label="Gustos %" id="r-w"><input id="r-w" type="number" min="0" max="100" value=${rl.wants} onChange=${e=>setRl({...rl,wants:e.target.value})}/><//>
        <${Field} label="Ahorro %" id="r-s"><input id="r-s" type="number" min="0" max="100" value=${rl.save} onChange=${e=>setRl({...rl,save:e.target.value})}/><//></div>
      <div className="row sp"><span className=${'sm '+(Math.round(total*100)===10000?'up':'down')}>Suma: ${nf(Number.isFinite(total)?total:0,0)}%</span><button className="btn pri sm" onClick=${saveRule}>Guardar regla</button></div>
      ${er?html`<div className="err" role="alert">${er}</div>`:null}
      <div className="grid g3">${groups.map(([n,pct,act,k])=>{const target=base*(pct||0)/100,ratio=target>0?act/target*100:0,t=k==='save'?(ratio>=100?'':'y'):tone(ratio);return html`<div key=${n} className="card flat col" style=${{gap:6}}>
        <div className="row sp"><b>${n}</b><span className="pill">${nf(pct||0,0)}%</span></div><div className="num" style=${{fontSize:22,fontWeight:700}}>${fmt(act)}</div><${Bar} v=${ratio} t=${t}/>
        <div className="muted xs">${k==='save'?'Meta':'Límite'}: ${fmt(target)} · ${pc(base>0?act/base*100:0,0)} de tu ingreso</div></div>`})}</div></div>
    <div className="card"><div className="ch"><h2>Presupuesto por categoría</h2><span className="muted sm">Aviso al 80% · alerta al superar 100%</span></div>
      <div className="col" style=${{gap:14}}>${rows.map(r=>html`<div key=${r.cat}>
        <div className="row sp"><b>${r.cat}</b><div className="row" style=${{gap:8}}><span className="num sm">${fmt(r.spent)} / ${fmt(r.limit)}</span>
          <span className=${'pill '+(r.pct>100?'r':r.pct===100?'b':r.pct>=80?'y':'g')}>${r.pct>100?'Excedido':r.pct===100?'Justo en el límite':r.pct>=80?'Cerca del límite':'Bien'} · ${pc(r.pct,0)}</span>
          ${edc===r.cat?null:html`<button className="ib" style=${{width:32,height:32}} aria-label=${'Editar límite de '+r.cat} onClick=${()=>{setEdc(r.cat);setVal(String(r.limit));setVe('')}}><${Ic} n="edit" s=${15}/></button>`}</div></div>
        <${Bar} v=${r.pct} t=${tone(r.pct)}/>
        ${edc===r.cat?html`<div className="row" style=${{marginTop:8}}><input className="in" style=${{maxWidth:160}} aria-label=${'Límite de '+r.cat} type="number" min="0" value=${val} onChange=${e=>setVal(e.target.value)}/><button className="btn pri sm" onClick=${()=>saveLim(r.cat)}>Guardar</button><button className="btn sm" onClick=${()=>setEdc(null)}>Cancelar</button>${ve?html`<span className="err">${ve}</span>`:null}</div>`:null}</div>`)}</div></div></div>`;
}

function GoalForm({edit,onClose}){
  const {upd,toast}=useApp();
  const [f,setF]=useState(edit?{name:edit.name,target:String(edit.target),saved:String(edit.saved),deadline:edit.deadline}:{name:'',target:'',saved:'0',deadline:''});
  const [er,setEr]=useState({});
  const submit=e=>{
    e.preventDefault();const x={},t=num(f.target),sv=num(f.saved);
    if(!f.name.trim())x.name='Ponle un nombre a tu meta.';
    if(!Number.isFinite(t)||t<=0)x.target='El objetivo debe ser mayor que cero.';
    if(!Number.isFinite(sv)||sv<0)x.saved='Lo ahorrado no puede ser negativo.';else if(Number.isFinite(t)&&sv>t)x.saved='Lo ahorrado no puede superar el objetivo.';
    if(!validDate(f.deadline))x.deadline='Elige una fecha válida.';else if(f.deadline<=todayS())x.deadline='La fecha límite debe ser futura.';
    setEr(x);if(Object.keys(x).length)return;
    upd(d=>{const r={name:f.name.trim(),target:t,saved:sv,deadline:f.deadline};if(edit){const i=d.goals.findIndex(g=>g.id===edit.id);d.goals[i]={...d.goals[i],...r}}else d.goals.push({id:uid(),...r,demo:false})});
    toast(edit?'Meta actualizada':'Meta creada','ok');onClose();
  };
  return html`<${Modal} title=${edit?'Editar meta':'Nueva meta de ahorro'} onClose=${onClose}><form className="form" onSubmit=${submit} noValidate>
    <${Field} label="Nombre" id="g-n" err=${er.name} cls="full"><input id="g-n" maxLength="50" className=${er.name?'bad':''} value=${f.name} onChange=${e=>setF({...f,name:e.target.value})} autoFocus/><//>
    <${Field} label="Objetivo (MXN)" id="g-t" err=${er.target}><input id="g-t" type="number" min="0" className=${er.target?'bad':''} value=${f.target} onChange=${e=>setF({...f,target:e.target.value})}/><//>
    <${Field} label="Ahorrado hasta hoy" id="g-s" err=${er.saved}><input id="g-s" type="number" min="0" className=${er.saved?'bad':''} value=${f.saved} onChange=${e=>setF({...f,saved:e.target.value})}/><//>
    <${Field} label="Fecha límite" id="g-d" err=${er.deadline} cls="full"><input id="g-d" type="date" min=${iso(addD(new Date(),1))} className=${er.deadline?'bad':''} value=${f.deadline} onChange=${e=>setF({...f,deadline:e.target.value})}/><//>
    <div className="mf full"><button type="button" className="btn" onClick=${onClose}>Cancelar</button><button className="btn pri">${edit?'Guardar':'Crear meta'}</button></div></form><//>`;
}
function Abono({g,onClose}){
  const {s,upd,toast}=useApp();const [v,setV]=useState(''),[er,setEr]=useState('');
  const bal=tot(s.tx).net-savedTotal(s),rem=g.target-g.saved,rec=goalInfo(g).rec;
  const go=e=>{e.preventDefault();const a=num(v);
    if(!Number.isFinite(a)||a<=0)return setEr('Escribe un monto mayor que cero.');
    if(a>rem+0.001)return setEr(`Solo faltan ${fmt(rem)} para completar la meta.`);
    if(a>bal+0.001)return setEr(`Tu saldo disponible es ${fmt(bal)}.`);
    upd(d=>{d.goals.find(x=>x.id===g.id).saved+=a});toast(`Abonaste ${fmt(a)} a "${g.name}"`,'ok');onClose()};
  return html`<${Modal} title=${'Abonar a '+g.name} onClose=${onClose}><form className="col" onSubmit=${go} noValidate>
    <div className="muted sm">Faltan ${fmt(rem)} · Aportación recomendada: ${fmt(rec)} al mes · Saldo disponible: ${fmt(bal)}</div>
    <${Field} label="Monto a abonar" id="ab-v" err=${er}><input id="ab-v" type="number" min="0" className=${er?'bad':''} placeholder=${String(Math.round(rec))} value=${v} onChange=${e=>setV(e.target.value)} autoFocus/><//>
    <div className="row">${[Math.round(rec),500,1000].filter((x,i,a)=>x>0&&a.indexOf(x)===i).map(x=>html`<button type="button" key=${x} className="chip" onClick=${()=>setV(String(x))}>${fmt(x)}</button>`)}</div>
    <div className="mf"><button type="button" className="btn" onClick=${onClose}>Cancelar</button><button className="btn pri">Abonar</button></div></form><//>`;
}
function Metas(){
  const {s,upd,toast,ask}=useApp();const [m,setM]=useState(null);
  const grupos=PLAZOS.map(p=>({p,gs:s.goals.filter(g=>plazoDe(g).k===p.k)})).filter(x=>x.gs.length);
  return html`<div className="col" style=${{gap:16}}>
    ${s.plan&&s.plan.modelo?html`<${PlazosModelo} M=${s.plan.modelo}/>`:null}
    <div className="row sp"><div className="muted sm">Total apartado en metas: <b className="num">${fmt(savedTotal(s))}</b></div><button className="btn pri" onClick=${()=>setM({k:'form'})}><${Ic} n="plus" s=${18}/>Nueva meta</button></div>
    ${s.goals.length?grupos.map(({p,gs})=>html`<div key=${p.k} className="col" style=${{gap:10}}><div className="row" style=${{gap:8,alignItems:'baseline'}}><h2>${p.n}</h2><span className="muted sm">${p.sub}</span></div><div className="grid g3">${gs.map(g=>{const i=goalInfo(g),done=g.saved>=g.target;return html`<div key=${g.id} className="card col">
      <div className="row sp"><b style=${{fontSize:16}}>${g.name}</b>${g.demo?html`<${Demo}/>`:null}</div>
      <div className="row sp" style=${{alignItems:'flex-end'}}><span className="num" style=${{fontSize:26,fontWeight:700}}>${fmt(g.saved)}</span><span className="muted sm">de ${fmt(g.target)}</span></div>
      <${Bar} v=${i.pct} t=${done?'':i.late?'r':''}/><div className="row sp sm"><span className="b">${pc(i.pct,0)} de avance</span><span className="muted">Límite: ${fdate(g.deadline)}</span></div>
      ${done?html`<${Banner} k="g" ic="check">¡Meta lograda!<//>`:i.late?html`<${Banner} k="r" ic="warn">La fecha límite ya pasó. Faltan ${fmt(i.remain)}.<//>`:html`<div className="card flat sm">Aportación recomendada: <b className="num">${fmt(i.rec)}</b> al mes durante ${i.monthsLeft} ${i.monthsLeft===1?'mes':'meses'}.</div>`}
      ${(()=>{const d=instDe(g,p);return html`<div className="sm donde"><b>Dónde ahorrarlo:</b> ${d.inst}. <span className="muted">${d.por}</span>${done?null:html`<div className="up" style=${{marginTop:4}}>En ${d.cetes} ganarías <b className="num">+${fmt(cetesGanancia(g,d.tasa))}</b> de intereses hasta tu fecha.</div>`}</div>`})()}
      <div className="row"><button className="btn pri sm" disabled=${done} onClick=${()=>setM({k:'ab',g})}>Abonar</button><button className="btn sm" onClick=${()=>setM({k:'form',g})}>Editar</button><button className="btn sm" onClick=${()=>ask({title:'Eliminar meta',text:`Se eliminará "${g.name}" y se liberarán ${fmt(g.saved)} a tu saldo disponible.`,onYes:()=>{upd(d=>{d.goals=d.goals.filter(x=>x.id!==g.id)});toast('Meta eliminada','ok')}})}>Eliminar</button></div></div>`})}</div></div>`)
      :html`<div className="card"><${Empty} title="Aún no tienes metas" text="Define cuánto quieres ahorrar y para cuándo." action=${html`<button className="btn pri sm" onClick=${()=>setM({k:'form'})}>Crear meta</button>`}/></div>`}
    ${m&&m.k==='form'?html`<${GoalForm} edit=${m.g} onClose=${()=>setM(null)}/>`:null}${m&&m.k==='ab'?html`<${Abono} g=${m.g} onClose=${()=>setM(null)}/>`:null}</div>`;
}

function DebtForm({edit,onClose}){
  const {upd,toast}=useApp();
  const [f,setF]=useState(edit?{name:edit.name,balance:String(edit.balance),rate:String(edit.rate),min:String(edit.min)}:{name:'',balance:'',rate:'',min:''}),[er,setEr]=useState({});
  const submit=e=>{e.preventDefault();const x={},b=num(f.balance),r=num(f.rate),m=num(f.min);
    if(!f.name.trim())x.name='Escribe el nombre de la deuda.';
    if(!Number.isFinite(b)||b<=0)x.balance='El saldo debe ser mayor que cero.';
    if(!Number.isFinite(r)||r<0||r>300)x.rate='Escribe una tasa anual entre 0 y 300.';
    if(!Number.isFinite(m)||m<=0)x.min='El pago mínimo debe ser mayor que cero.';else if(Number.isFinite(b)&&m>b)x.min='El pago mínimo no puede superar el saldo.';
    setEr(x);if(Object.keys(x).length)return;
    upd(d=>{const r2={name:f.name.trim(),balance:b,rate:r,min:m};if(edit){const i=d.debts.findIndex(z=>z.id===edit.id);d.debts[i]={...d.debts[i],...r2}}else d.debts.push({id:uid(),...r2,demo:false})});
    toast(edit?'Deuda actualizada':'Deuda agregada','ok');onClose()};
  return html`<${Modal} title=${edit?'Editar deuda':'Nueva deuda'} onClose=${onClose}><form className="form" onSubmit=${submit} noValidate>
    <${Field} label="Nombre" id="d-n" err=${er.name} cls="full"><input id="d-n" maxLength="50" className=${er.name?'bad':''} value=${f.name} onChange=${e=>setF({...f,name:e.target.value})} autoFocus/><//>
    <${Field} label="Saldo (MXN)" id="d-b" err=${er.balance}><input id="d-b" type="number" min="0" className=${er.balance?'bad':''} value=${f.balance} onChange=${e=>setF({...f,balance:e.target.value})}/><//>
    <${Field} label="Tasa anual %" id="d-r" err=${er.rate}><input id="d-r" type="number" min="0" step="any" className=${er.rate?'bad':''} value=${f.rate} onChange=${e=>setF({...f,rate:e.target.value})}/><//>
    <${Field} label="Pago mínimo mensual" id="d-m" err=${er.min} cls="full"><input id="d-m" type="number" min="0" className=${er.min?'bad':''} value=${f.min} onChange=${e=>setF({...f,min:e.target.value})}/><//>
    <div className="mf full"><button type="button" className="btn" onClick=${onClose}>Cancelar</button><button className="btn pri">${edit?'Guardar':'Agregar'}</button></div></form><//>`;
}
function PayDebt({d,onClose}){
  const {upd,toast}=useApp();const [v,setV]=useState(''),[er,setEr]=useState('');
  const go=e=>{e.preventDefault();const a=num(v);if(!Number.isFinite(a)||a<=0)return setEr('Escribe un monto mayor que cero.');if(a>d.balance+.001)return setEr(`El saldo es ${fmt2(d.balance)}.`);
    upd(x=>{const z=x.debts.find(q=>q.id===d.id);z.balance=Math.max(0,Math.round((z.balance-a)*100)/100);if(z.balance===0)x.debts=x.debts.filter(q=>q.id!==d.id)});toast(a>=d.balance?`¡Liquidaste "${d.name}"!`:`Pago de ${fmt(a)} registrado`,'ok');onClose()};
  return html`<${Modal} title=${'Registrar pago: '+d.name} onClose=${onClose}><form className="col" onSubmit=${go} noValidate><div className="muted sm">Saldo actual: ${fmt2(d.balance)} · Pago mínimo: ${fmt(d.min)}</div>
    <${Field} label="Monto del pago" id="py-v" err=${er}><input id="py-v" type="number" min="0" className=${er?'bad':''} placeholder=${String(d.min)} value=${v} onChange=${e=>setV(e.target.value)} autoFocus/><//>
    <div className="mf"><button type="button" className="btn" onClick=${onClose}>Cancelar</button><button className="btn pri">Registrar pago</button></div></form><//>`;
}
function Deudas(){
  const {s,upd,toast,ask}=useApp(),c=col();const [m,setM]=useState(null),[ex,setEx]=useState('1000');
  const e=num(ex),exOk=Number.isFinite(e)&&e>=0;
  const A=useMemo(()=>exOk&&s.debts.length?payoff(s.debts,e,'avalancha'):null,[s.debts,ex]);
  const B=useMemo(()=>exOk&&s.debts.length?payoff(s.debts,e,'bola'):null,[s.debts,ex]);
  const len=A&&B?Math.min(Math.max(A.series.length,B.series.length),121):0;
  const data=A&&B?Array.from({length:len},(_,i)=>({m:i,Avalancha:Math.round(A.series[Math.min(i,A.series.length-1)]),'Bola de nieve':Math.round(B.series[Math.min(i,B.series.length-1)])})):[];
  return html`<div className="col" style=${{gap:16}}>
    <div className="row sp"><div className="muted sm">Deuda total: <b className="num">${fmt(sum(s.debts,d=>d.balance))}</b> · Pagos mínimos: <b className="num">${fmt(sum(s.debts,d=>d.min))}</b>/mes</div><button className="btn pri" onClick=${()=>setM({k:'form'})}><${Ic} n="plus" s=${18}/>Nueva deuda</button></div>
    ${s.debts.length?html`<div className="card tw"><table><thead><tr><th>Deuda</th><th>Saldo</th><th>Tasa anual</th><th>Pago mínimo</th><th></th></tr></thead><tbody>${s.debts.map(d=>html`<tr key=${d.id}><td className="b">${d.name} ${d.demo?html`<${Demo}/>`:null}</td><td className="num">${fmt(d.balance)}</td><td className="num">${pc(d.rate,1)}</td><td className="num">${fmt(d.min)}</td>
      <td style=${{whiteSpace:'nowrap',textAlign:'right'}}><button className="btn sm" onClick=${()=>setM({k:'pay',d})}>Registrar pago</button> <button className="ib" style=${{width:34,height:34,display:'inline-grid'}} aria-label="Editar deuda" onClick=${()=>setM({k:'form',d})}><${Ic} n="edit" s=${16}/></button> <button className="ib" style=${{width:34,height:34,display:'inline-grid'}} aria-label="Eliminar deuda" onClick=${()=>ask({title:'Eliminar deuda',text:`Se eliminará "${d.name}" de tu lista.`,onYes:()=>{upd(x=>{x.debts=x.debts.filter(q=>q.id!==d.id)});toast('Deuda eliminada','ok')}})}><${Ic} n="trash" s=${16}/></button></td></tr>`)}</tbody></table></div>
    <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Avalancha vs bola de nieve</h2><${Demo} t="Simulación"/></div>
      <${Field} label="Pago extra mensual sobre los mínimos (MXN)" id="dx" err=${exOk?'':'Escribe un monto de 0 o más.'} cls=""><input id="dx" type="number" min="0" style=${{maxWidth:220}} className=${exOk?'':'bad'} value=${ex} onChange=${ev=>setEx(ev.target.value)}/><//>
      ${A&&B?html`<div className="grid g2">${[['Avalancha','Paga primero la tasa más alta',A,c.blue],['Bola de nieve','Paga primero el saldo menor',B,c.yellow]].map(([n,sub,r,cl])=>html`<div key=${n} className="card flat col" style=${{gap:6}}><div className="row sp"><b>${n}</b>${A.ok&&B.ok&&r.interest===Math.min(A.interest,B.interest)?html`<span className="pill g">Menos intereses</span>`:null}</div><div className="muted xs">${sub}</div>
        ${r.ok?html`<div className="num" style=${{fontSize:24,fontWeight:700}}>${fmtMonths(r.months)}</div><div className="sm">Intereses totales: <b className="num">${fmt(r.interest)}</b></div><div className="muted xs">Orden de liquidación: ${r.order.join(' → ')}</div>`:html`<${Banner} k="r" ic="warn">Con este pago no se liquida en 50 años. Sube el pago extra.<//>`}</div>`)}</div>
        ${A.ok&&B.ok?html`<${Banner} k="g" ic="spark">${A.interest<B.interest-1?`La avalancha te ahorra ${fmt(B.interest-A.interest)} en intereses`+(A.months<B.months?` y ${B.months-A.months} ${B.months-A.months===1?'mes':'meses'}`:''):'Con estos datos ambos métodos cuestan casi lo mismo'}. La bola de nieve da victorias rápidas: liquida primero "${B.order[0]}".<//>`:null}
        <${Chart} h=${240}><${RC.LineChart} data=${data}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="m" tickFormatter=${v=>v+'m'} ...${axis(c)} minTickGap=${24}/><${RC.YAxis} width=${50} tickFormatter=${v=>v>=1000?(v/1000)+'k':v} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} labelFormatter=${l=>'Mes '+l} ...${tipStyle(c)}/>
          <${RC.Line} type="monotone" dataKey="Avalancha" stroke=${c.blue} strokeWidth=${2.5} dot=${false}/><${RC.Line} type="monotone" dataKey="Bola de nieve" stroke=${c.yellow} strokeWidth=${2.5} dot=${false}/><//><//>
        <div className="legend"><span><i style=${{background:c.blue}}></i>Avalancha</span><span><i style=${{background:c.yellow}}></i>Bola de nieve</span><span>Saldo total de deudas por mes</span></div>`:null}</div>`
      :html`<div className="card"><${Empty} title="Sin deudas registradas" text="Agrega una deuda para comparar métodos de pago." action=${html`<button className="btn pri sm" onClick=${()=>setM({k:'form'})}>Agregar deuda</button>`}/></div>`}
    ${m&&m.k==='form'?html`<${DebtForm} edit=${m.d} onClose=${()=>setM(null)}/>`:null}${m&&m.k==='pay'?html`<${PayDebt} d=${m.d} onClose=${()=>setM(null)}/>`:null}</div>`;
}

function Finanzas(){
  const [tab,setTab]=useTab('finanzas','movimientos'),[p,setP]=useState('mes');
  return html`<div className="page"><${Head} title="Mis finanzas" sub="Registra, analiza y planea tu dinero." right=${tab==='movimientos'||tab==='analisis'?html`<${PeriodBar} p=${p} setP=${setP}/>`:null}/>
    <${Tabs} opts=${[['movimientos','Movimientos'],['analisis','Análisis'],['presupuestos','Presupuestos'],['hogar','Plan del hogar'],['metas','Metas'],['deudas','Deudas']]} val=${tab} on=${setTab}/>
    ${tab==='movimientos'?html`<${Movimientos} p=${p}/>`:tab==='analisis'?html`<${Analisis} p=${p}/>`:tab==='presupuestos'?html`<${Presupuestos}/>`:tab==='hogar'?html`<${PlanHogar}/>`:tab==='metas'?html`<${Metas}/>`:html`<${Deudas}/>`}</div>`;
}
