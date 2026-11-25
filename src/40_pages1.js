/* ================= INICIO ================= */
function Inicio(){
  const {s,go,openTx}=useApp(),c=col();
  const ml=monthList(s),T=tot(ml),all=tot(s.tx),bal=all.net-savedTotal(s);
  const hr=new Date().getHours(),greet=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  const six=buckets('6m').map(b=>{const t=tot(s.tx.filter(x=>x.date>=b.from&&x.date<=b.to));return {label:b.label,Ingresos:t.inc,Gastos:t.exp}});
  const st=streakOf(s.academy.days),steps=nextSteps(s),rate=T.inc>0?T.net/T.inc*100:0;
  const last7=[6,5,4,3,2,1,0].map(n=>{const d=addD(new Date(),-n);return {d,on:s.academy.days.includes(iso(d))}});
  const quick=[['plus','Registrar movimiento',()=>openTx()],['flag','Abonar a una meta',()=>go('finanzas','metas')],['book','Hacer una lección',()=>go('academia')],['chart','Simular portafolio',()=>go('inversiones','simulador')],['calc','Calculadoras',()=>go('calculadoras')],['globe','México hoy',()=>go('mexico')]];
  return html`<div className="page">
    <${Head} title=${html`${greet}, ${shortName(s.user)} <${Demo}/>`} sub="Tu dinero. Tus decisiones. Tu futuro." right=${html`<button className="btn pri" onClick=${()=>openTx()}><${Ic} n="plus" s=${18}/>Nuevo movimiento</button>`}/>
    <div className="grid g4">
      <${Kpi} ic="wallet" l="Saldo disponible" v=${fmt(bal)} s=${`Después de apartar ${fmt(savedTotal(s))} en metas`}/>
      <${Kpi} ic="up" l="Ingresos del mes" v=${fmt(T.inc)} s=${`${ml.filter(t=>t.type==='ingreso').length} ${ml.filter(t=>t.type==='ingreso').length===1?'movimiento':'movimientos'}`} cls="up"/>
      <${Kpi} ic="down" l="Gastos del mes" v=${fmt(T.exp)} s=${`${ml.filter(t=>t.type==='gasto').length} movimientos`} cls="down"/>
      <${Kpi} ic="star" l="Ahorro del mes" v=${fmt(T.net)} s=${`${pc(rate,0)} de tus ingresos · meta 20%`} cls=${T.net>=0?'up':'down'}/>
    </div>
    ${s.plan?html`<${PlanCard} plan=${s.plan}/>`:null}
    <div className="split">
      <div className="card"><div className="ch"><h2>Ingresos vs gastos</h2><span className="muted sm">Últimos 6 meses</span></div>
        <${Chart} h=${250}><${RC.BarChart} data=${six} barGap=${4}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="label" ...${axis(c)}/><${RC.YAxis} width=${48} tickFormatter=${v=>v>=1000?(v/1000)+'k':v} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} ...${tipStyle(c)} cursor=${{fill:c.line,opacity:.3}}/>
          <${RC.Bar} dataKey="Ingresos" fill=${c.green} radius=${[6,6,0,0]}/><${RC.Bar} dataKey="Gastos" fill=${c.red} radius=${[6,6,0,0]}/><//><//>
        <div className="legend"><span><i style=${{background:c.green}}></i>Ingresos</span><span><i style=${{background:c.red}}></i>Gastos</span></div></div>
      <div className="card"><div className="ch"><h2>Tu siguiente paso</h2><span className="pill b">Según tus acciones</span></div>
        <div className="col">${steps.length?steps.map((x,i)=>html`<div key=${i} className="row" style=${{alignItems:'flex-start',flexWrap:'nowrap'}}>
          <div className="avatar" style=${{background:'var(--green-soft)',color:'var(--green-ink)'}}><${Ic} n=${x.ic} s=${16}/></div>
          <div style=${{flex:1,minWidth:0}}><div className="b">${x.t}</div><div className="muted sm">${x.x}</div>
          <button className="btn gh sm" style=${{padding:0,height:28}} onClick=${()=>x.a.tx?openTx():go(x.a.route,x.a.tab)}>${x.a.label} →</button></div></div>`):html`<${Empty} title="Todo al día" text="No tienes pendientes por ahora."/>`}</div></div>
    </div>
    <div className="grid g3">
      <div className="card"><div className="ch"><h2>Progreso de metas</h2><button className="btn gh sm" onClick=${()=>go('finanzas','metas')}>Ver todas</button></div>
        <div className="col">${s.goals.length?s.goals.map(g=>{const i=goalInfo(g);return html`<div key=${g.id}><div className="row sp"><span className="b">${g.name}</span><span className="num sm">${pc(i.pct,0)}</span></div><${Bar} v=${i.pct}/><div className="muted xs" style=${{marginTop:4}}>${fmt(g.saved)} de ${fmt(g.target)}</div></div>`}):html`<${Empty} title="Sin metas" text="Crea tu primera meta de ahorro." action=${html`<button className="btn pri sm" onClick=${()=>go('finanzas','metas')}>Crear meta</button>`}/>`}</div></div>
      <div className="card navy"><div className="ch"><h2>Racha de aprendizaje</h2></div>
        <div className="row" style=${{gap:14,flexWrap:'nowrap'}}><div style=${{color:'var(--yellow)'}}><${Ic} n="fire" s=${44}/></div><div><div className="num" style=${{fontSize:34,fontWeight:700,lineHeight:1}}>${st}</div><div style=${{color:'#B7C4DB'}}>${st===1?'día seguido':'días seguidos'}</div></div></div>
        <div className="row" style=${{marginTop:16,gap:6,flexWrap:'nowrap'}}>${last7.map((x,i)=>html`<div key=${i} title=${fdate(iso(x.d))} style=${{flex:1,textAlign:'center',fontSize:11,color:'#B7C4DB'}}><div style=${{height:26,borderRadius:8,background:x.on?'var(--green)':'rgba(255,255,255,.1)',marginBottom:4}}></div>${['D','L','M','M','J','V','S'][x.d.getDay()]}</div>`)}</div>
        <button className="btn sm" style=${{marginTop:14}} onClick=${()=>go('academia')}>Practicar hoy</button></div>
      <div className="card"><div className="ch"><h2>Accesos rápidos</h2></div>
        <div className="grid" style=${{gridTemplateColumns:'1fr 1fr',gap:10}}>${quick.map(([ic,l,fn])=>html`<button key=${l} className="btn" style=${{flexDirection:'column',height:'auto',padding:'14px 8px',whiteSpace:'normal',textAlign:'center',gap:6}} onClick=${fn}><${Ic} n=${ic}/><span className="sm">${l}</span></button>`)}</div></div>
    </div></div>`;
}

/* Plan de 24 meses del caso de la consultora (hoja Resumen del modelo final). */
function PlanCard({plan}){
  const {go}=useApp();
  const fv=(r,v)=>r.f==='mxn'?fmt(v):r.f==='meses'?`${nf(v,1)} meses`:v;
  return html`<div className="card col" style=${{gap:14}}>
    <div className="ch" style=${{marginBottom:0}}><div><h2>Tu plan en 24 meses</h2><div className="muted sm">De no sobrar nada a fin de mes, a cero deudas y un fondo para emergencias.</div></div><span className="pill g">Plan de la consultora</span></div>
    <div className="tw"><table className="plan-t"><thead><tr><th>Indicador</th><th>Hoy</th><th>Mes 12</th><th>Mes 24</th></tr></thead><tbody>
      ${plan.resumen.map(r=>html`<tr key=${r.k}><td>${r.k}</td>${r.v.map((v,i)=>html`<td key=${i} className=${'num '+(i===2?'best':'')}>${fv(r,v)}</td>`)}</tr>`)}
    </tbody></table></div>
    <div className="hitos">${plan.hitos.map(h=>html`<div key=${h.mes} className="hito"><b className="m">Mes ${h.mes}</b><span>${h.t}</span></div>`)}</div>
    <div className="row sp"><span className="muted xs">Fuente: ${plan.fuente}. Proyección del plan, no es garantía.</span><button className="btn gh sm" onClick=${()=>go('finanzas','deudas')}>Ver deudas →</button></div>
  </div>`;
}

/* ================= MÉXICO HOY ================= */
function IndModal({ind,onClose}){
  const [rk,setRk]=useState('6M'),c=col();
  const data=useMemo(()=>chartData(ind,rk),[ind.id,rk]);
  const vs=data.map(d=>d.v),mn=Math.min(...vs),mx=Math.max(...vs),av=sum(vs)/vs.length;
  const chg=change(ind);
  const fmtv=v=>ind.unit==='%'?nf(v,ind.id==='inf_m'||ind.id==='udi'?3:2)+'%':ind.id==='ipc'?nf(v,0):ind.id==='udi'?nf(v,4):nf(v,2);
  return html`<${Modal} title=${ind.name} onClose=${onClose} wide>
    <${Banner} k="y" ic="warn">Datos de demostración, no son cifras actuales.<//>
    <div className="row sp"><div><span className="num" style=${{fontSize:32,fontWeight:700}}>${fv(ind,ind.val)}</span> <span className=${'pill '+(chg.up?'g':'r')}>${chg.txt} vs. hace 1 mes</span></div><${Seg} opts=${Object.keys(RANGES).map(k=>[k,RANGE_NAMES[k]])} val=${rk} on=${setRk} label="Periodo"/></div>
    <${Chart} h=${250}><${RC.AreaChart} data=${data}><defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor=${c.green} stopOpacity=${.35}/><stop offset="100%" stopColor=${c.green} stopOpacity=${0}/></linearGradient></defs>
      <${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="d" minTickGap=${28} ...${axis(c)}/><${RC.YAxis} width=${54} domain=${['auto','auto']} tickFormatter=${v=>ind.id==='ipc'?nf(v,0):nf(v,ind.id==='udi'?2:1)} ...${axis(c)}/>
      <${RC.Tooltip} formatter=${v=>[fmtv(v),ind.name]} ...${tipStyle(c)}/><${RC.Area} type="monotone" dataKey="v" stroke=${c.green} strokeWidth=${2.5} fill="url(#ig)"/><//><//>
    <div className="row" style=${{gap:18}}><span className="sm"><span className="muted">Mínimo </span><b className="num">${fmtv(mn)}</b></span><span className="sm"><span className="muted">Promedio </span><b className="num">${fmtv(av)}</b></span><span className="sm"><span className="muted">Máximo </span><b className="num">${fmtv(mx)}</b></span></div>
    <div className="grid g2" style=${{gap:10}}>
      ${[['Qué mide',ind.mide,'info'],['Si sube',ind.sube,'up'],['Si baja',ind.baja,'down'],['Cómo te afecta',ind.persona,'user']].map(([t,x,ic])=>html`<div key=${t} className="card flat"><div className="row" style=${{gap:6,marginBottom:4}}><${Ic} n=${ic} s=${16}/><b>${t}</b></div><div className="sm">${x}</div></div>`)}</div>
    <div className="muted xs">Fuente: ${ind.src}. Serie histórica generada para la demostración.</div><//>`;
}
function Mexico(){
  const {s}=useApp(),c=col();
  const [sel,setSel]=useState(null),[sm,setSm]=useState({});
  const groups=[['Precios y tasas',['inf_a','inf_m','banxico','usd','udi']],['CETES',['cetes28','cetes91','cetes182','cetes364']],['Economía y mercado',['ipc','pib','desempleo']]];
  const summarize=id=>{if(sm[id]==='load')return;if(sm[id]){setSm(p=>({...p,[id]:null}));return}setSm(p=>({...p,[id]:'load'}));setTimeout(()=>setSm(p=>({...p,[id]:'ok'})),700)};
  const now=todayS();
  return html`<div className="page">
    <${Head} title="México hoy" sub="Los indicadores clave de la economía mexicana, explicados sin tecnicismos."/>
    <${Banner} k="y" ic="warn"><b>Datos de demostración, no son cifras actuales.</b> Los valores, gráficas, noticias y fechas de esta sección son de ejemplo para el prototipo.<//>
    ${groups.map(([g,ids])=>html`<div key=${g} className="col"><h2>${g}</h2><div className="grid g3" style=${{gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,250px),1fr))'}}>
      ${ids.map(id=>{const ind=IND.find(x=>x.id===id),ch=change(ind),sp=chartData(ind,'1M');return html`<div key=${id} className="card col" style=${{gap:8}}>
        <div className="row sp"><b>${ind.name}</b><${Demo}/></div>
        <div className="row sp" style=${{alignItems:'flex-end'}}><div className="num" style=${{fontSize:28,fontWeight:700,lineHeight:1.1}}>${fv(ind,ind.val)}</div><span className=${'pill '+(ch.up?'g':'r')}>${ch.up?'▲':'▼'} ${ch.txt}</span></div>
        <div style=${{height:44}}><${RC.ResponsiveContainer} width="100%" height="100%"><${RC.LineChart} data=${sp}><${RC.YAxis} hide domain=${['auto','auto']}/><${RC.Line} type="monotone" dataKey="v" stroke=${ch.up?c.green:c.red} strokeWidth=${2} dot=${false} isAnimationActive=${false}/><//><//></div>
        <div className="muted xs">Fecha: ${fdate(now)} (ejemplo) · Fuente: ${ind.src}</div>
        <div className="xs" style=${{color:'var(--yellow-ink)'}}>Datos de demostración, no son cifras actuales</div>
        <button className="btn sm" onClick=${()=>setSel(ind)}><${Ic} n="help" s=${15}/>¿Qué significa esto?</button></div>`})}</div></div>`)}
    <div className="split">
      <div className="card"><div className="ch"><h2>Noticias</h2><${Demo} t="Ejemplo"/></div><div className="col">${NEWS.map(n=>html`<div key=${n.id} style=${{borderTop:'1px solid var(--line)',paddingTop:12}}>
        <div className="b">${n.t}</div><div className="muted xs">${n.src}</div>
        <button className="btn sm" style=${{marginTop:8}} onClick=${()=>summarize(n.id)}><${Ic} n="spark" s=${15}/>${sm[n.id]==='load'?'Resumiendo…':sm[n.id]==='ok'?'Ocultar resumen':'Resumir con IA'}</button>
        ${sm[n.id]==='ok'?html`<div className="card flat" style=${{marginTop:8}}><ul style=${{margin:'0 0 8px',paddingLeft:18}}>${n.sum.map((x,i)=>html`<li key=${i}>${x}</li>`)}</ul><div className="muted xs">Resumen predefinido de demostración; no se usó IA real.</div></div>`:null}</div>`)}</div></div>
      <div className="card"><div className="ch"><h2>Calendario económico</h2><${Demo} t="Ejemplo"/></div><div className="col">${CAL_EV.map(([off,t,src])=>{const d=addD(new Date(),off);return html`<div key=${t} className="row" style=${{flexWrap:'nowrap'}}><div style=${{textAlign:'center',background:'var(--card2)',borderRadius:12,padding:'6px 10px',minWidth:54}}><div className="num b" style=${{fontSize:18}}>${d.getDate()}</div><div className="muted xs">${MES[d.getMonth()]}</div></div><div><div className="b">${t}</div><div className="muted xs">${src} · fecha de ejemplo</div></div></div>`})}</div></div>
    </div>
    ${sel?html`<${IndModal} ind=${sel} onClose=${()=>setSel(null)}/>`:null}</div>`;
}
