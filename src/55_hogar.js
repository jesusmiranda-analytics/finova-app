
/* ================= PLAN DEL HOGAR (M2) =================
   Presupuesto familiar (ingreso = egresos + ahorro) y fondo de emergencia en meses.
   Con modelo de la consultora (caso Rivera) usa planHogar(); cualquier otra cuenta usa fondoBasico(). */
function PlanHogar(){
  const {s}=useApp();
  return s.plan&&s.plan.modelo?html`<${PlanModelo} M=${s.plan.modelo} fuente=${s.plan.fuente}/>`:html`<${PlanBasico}/>`;
}
const PH_CONC=[['gastoCorriente','Gasto corriente'],['deudas','Pago de deudas'],['sgmm','Seguro de gastos médicos'],['tanda','Tanda'],['noPlaneados','Gastos no planeados'],['ppr','Retiro (PPR)'],['ahorro','Ahorro al fondo (CETES)']];
const PH_VISTAS=[['hoy','Hoy'],['1','Mes 1'],['6','Mes 6'],['13','Mes 13'],['22','Mes 22']];
const setRange=(f,max)=>e=>f(clamp(Number(e.target.value)||0,0,max));

/* Medidor de meses que cubre el fondo: escala 0-6, marca en la meta de 3. */
function MesesGauge({v,meta=3,max=6}){
  return html`<div className="gauge" role="meter" aria-valuenow=${nf(v,1)} aria-valuemin="0" aria-valuemax=${max} aria-label="Meses de gasto que cubre el fondo">
    <i style=${{width:clamp(v/max*100,0,100)+'%',background:v>=meta?'var(--green)':'var(--yellow)'}}></i><span className="mk" style=${{left:meta/max*100+'%'}}></span></div>
    <div className="row sp muted xs" style=${{marginTop:4}}><span>0</span><span>Meta: ${meta} meses</span><span>${max} meses</span></div>`;
}
/* Barra apilada: a dónde va cada peso del ingreso. */
function Desglose({ingreso,items,colors}){
  const egresos=sum(PH_CONC.filter(([k])=>k!=='ahorro'),([k])=>items[k]),ahorro=items.ahorro,cuadra=Math.abs(ingreso-(egresos+ahorro))<1;
  const pos=PH_CONC.filter(([k])=>items[k]>0.5),tot=sum(pos,([k])=>items[k])||1;
  return html`<div className="col" style=${{gap:12}}>
    <div className="stack" role="img" aria-label="Reparto del ingreso">${pos.map(([k,l])=>html`<i key=${k} title=${`${l}: ${fmt(items[k])}`} style=${{width:items[k]/tot*100+'%',background:colors[k]}}></i>`)}</div>
    <div className="grid" style=${{gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,230px),1fr))',gap:'6px 18px'}}>${PH_CONC.map(([k,l])=>html`<div key=${k} className="row sp sm" style=${{flexWrap:'nowrap'}}>
      <span className="row" style=${{gap:8,flexWrap:'nowrap'}}><i className="sw-dot" style=${{background:colors[k]}}></i>${l}</span><b className=${'num '+(k==='ahorro'?(ahorro<0?'down':'up'):'')}>${fmt(items[k])}</b></div>`)}</div>
    <div className=${'cuadre '+(cuadra?'ok':'bad')}><${Ic} n=${cuadra?'check':'warn'} s=${16}/><span>Ingreso <b className="num">${fmt(ingreso)}</b> = egresos <b className="num">${fmt(egresos)}</b> + ahorro <b className="num">${fmt(ahorro)}</b></span>${ahorro<0?html`<span className="pill r">Falta dinero: se toma del fondo</span>`:null}</div>
  </div>`;
}
function PlanModelo({M,fuente}){
  const c=col(),cc=catColors(c);
  const colors={gastoCorriente:cc[0],deudas:cc[3],sgmm:cc[5],tanda:cc[4],noPlaneados:cc[2],ppr:cc[6],ahorro:cc[1]};
  const [rc,setRc]=useState(M.recortePlan),[vista,setVista]=useState('1'),[tabla,setTabla]=useState(false);
  const P=useMemo(()=>planHogar(M,rc),[rc]),minR=useMemo(()=>recorteMinimo(M),[]);
  const m24=P.meses[23];
  const des=k=>{if(k==='hoy'){const h=M.hoy;return {ingreso:M.ingreso,items:{gastoCorriente:h.gastoCorriente,deudas:h.deudas,sgmm:0,tanda:h.tanda,noPlaneados:h.noPlaneados,ppr:0,ahorro:0}}}
    const x=P.meses[+k-1];return {ingreso:x.ingreso,items:{gastoCorriente:x.gastoCorriente,deudas:x.prestamo+x.tarjeta,sgmm:x.sgmm,tanda:x.tanda,noPlaneados:x.noPlaneados,ppr:x.ppr,ahorro:x.ahorro}}};
  const D=des(vista),mesesSel=vista==='hoy'?0:P.meses[+vista-1].mesesCubre;
  const serie=P.meses.map(x=>({mes:'M'+x.m,'Con CETES':Math.round(x.fondo),'Sin rendimiento':Math.round(x.sinRend)}));
  const nota={hoy:'Así gastan hoy: entra todo y no sobra nada.','1':'Meses 1 a 4: el recorte y lo que sobra van a liquidar la Tarjeta Azul BBVA.','6':'La tarjeta ya está pagada: ese dinero ahora se ahorra en CETES.','13':'Año 2: el ingreso y el gasto suben 3.75 %, y el seguro sube 12 %.','22':'Ya sin deudas: arrancan los PPR de papá y mamá para el retiro.'}[vista];
  return html`<div className="col" style=${{gap:16}}>
    <div className="card col" style=${{gap:14}}>
      <div className="ch" style=${{marginBottom:0}}><div><h2>Simulador del plan</h2><div className="muted sm">Mueve el recorte mensual a los gastos no planeados y mira qué pasa con las deudas y el fondo.</div></div><span className="pill g">Plan de la consultora</span></div>
      <${Field} label=${html`Recorte mensual a gastos no planeados: <b className="num" style=${{color:'var(--fg)',fontSize:16}}>${fmt(rc)}</b> <span className="muted">(de ${fmt(M.noPlaneados)} a ${fmt(M.noPlaneados-rc)} al mes)</span>`} id="ph-r">
        <input id="ph-r" type="range" min="0" max=${M.noPlaneados} step="100" value=${rc} onChange=${setRange(setRc,M.noPlaneados)}/><//>
      <div className="row sp"><span className="muted xs">$0 = no cambian nada · ${fmt(M.noPlaneados)} = eliminan todos los gastos no planeados</span>
        <button className="btn sm" disabled=${rc===M.recortePlan} onClick=${()=>setRc(M.recortePlan)}><${Ic} n="refresh" s=${15}/>Volver al plan (${fmt(M.recortePlan)})</button></div>
      ${P.deficit?html`<${Banner} k="r" ic="warn"><b>Con este recorte el plan no alcanza.</b> En el mes ${P.deficit.mes} faltan ${fmt(P.deficit.monto)}. El recorte mínimo para que funcione es ${fmt(minR)} al mes.<//>`:null}
      <div className="grid g4">
        <${Kpi} ic="trend" l="Tarjeta liquidada" v=${P.mesTarjeta?`Mes ${P.mesTarjeta}`:'No se liquida'} s=${`Intereses pagados: ${fmt(P.interesesTarjeta)}`} cls=${P.mesTarjeta?'up':'down'}/>
        <${Kpi} ic="flag" l="Fondo en la meta (3 meses)" v=${P.mesMeta?`Mes ${P.mesMeta}`:'Después del mes 24'} s=${`Meta: ${fmt(M.metaFondo)}`} cls=${P.mesMeta?'up':'down'}/>
        <${Kpi} ic="wallet" l="Fondo al mes 24" v=${fmt(m24.fondo)} s="Ahorrado en CETES"/>
        <${Kpi} ic="star" l="Meses que cubre (mes 24)" v=${`${nf(m24.mesesCubre,1)} meses`} s="De gasto corriente del hogar" cls=${m24.mesesCubre>=3?'up':'down'}/>
      </div>
    </div>
    <div className="card col" style=${{gap:14}}>
      <div className="ch" style=${{marginBottom:0}}><div><h2>¿A dónde va cada peso?</h2><div className="muted sm">${nota}</div></div><${Seg} opts=${PH_VISTAS} val=${vista} on=${setVista} label="Mes"/></div>
      <${Desglose} ingreso=${D.ingreso} items=${D.items} colors=${colors}/>
    </div>
    <div className="split">
      <div className="card col" style=${{gap:12}}><div className="ch" style=${{marginBottom:0}}><h2>Fondo de emergencia</h2><span className="muted sm">24 meses</span></div>
        <${Chart} h=${240}><${RC.AreaChart} data=${serie}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="mes" interval=${3} ...${axis(c)}/><${RC.YAxis} width=${48} domain=${[0,dm=>Math.max(dm,M.metaFondo*1.15)]} tickFormatter=${v=>v>=1000?Math.round(v/1000)+'k':v} ...${axis(c)}/>
          <${RC.Tooltip} formatter=${v=>fmt(v)} ...${tipStyle(c)}/><${RC.ReferenceLine} y=${M.metaFondo} stroke=${c.green} strokeDasharray="5 4" label=${{value:'Meta 3 meses',fill:c.muted,fontSize:11,position:'insideTopLeft'}}/>
          <${RC.Area} type="monotone" dataKey="Sin rendimiento" stroke=${c.muted} fill="transparent" strokeDasharray="4 3" strokeWidth=${1.5} isAnimationActive=${false}/><${RC.Area} type="monotone" dataKey="Con CETES" stroke=${c.green} fill=${c.green} fillOpacity=${.15} strokeWidth=${2.5} isAnimationActive=${false}/><//><//>
        <div className="muted xs">Los CETES suman ${fmt(m24.fondo-m24.sinRend)} al mes 24 frente a guardar el dinero sin rendimiento (CETES 28 días ${pc(M.cetes.tasa*100,1)} menos ISR).</div></div>
      <div className="card col" style=${{gap:12}}><div className="ch" style=${{marginBottom:0}}><h2>Meses que cubre</h2><span className="pill">${PH_VISTAS.find(v=>v[0]===vista)[1]}</span></div>
        <div className="num" style=${{fontSize:36,fontWeight:700,lineHeight:1}}>${nf(mesesSel,1)} <span className="muted" style=${{fontSize:16,fontWeight:500}}>meses</span></div>
        <${MesesGauge} v=${mesesSel}/>
        <div className="sm">Si mañana se quedaran sin ingreso, el fondo pagaría ${nf(mesesSel,1)} meses del gasto corriente del hogar (${fmt(vista==='hoy'?M.gastoCorriente:P.meses[+vista-1].gastoCorriente)} al mes).</div>
        <div className="muted xs">Cambia el mes arriba, en «¿A dónde va cada peso?».</div></div>
    </div>
    <div className="card col" style=${{gap:10}}><div className="row sp"><h2>Mes a mes</h2><button className="btn sm" aria-expanded=${tabla} onClick=${()=>setTabla(!tabla)}>${tabla?'Ocultar tabla':'Ver los 24 meses'}</button></div>
      ${tabla?html`<div className="tw"><table className="plan-t"><thead><tr><th>Mes</th><th>Ingreso</th><th>Egresos</th><th>Pago a tarjeta</th><th>Ahorro</th><th>Fondo</th><th>Meses</th></tr></thead><tbody>
        ${P.meses.map(x=>html`<tr key=${x.m}><td>Mes ${x.m}</td><td className="num">${fmt(x.ingreso)}</td><td className="num">${fmt(x.ingreso-x.ahorro)}</td><td className="num">${fmt(x.tarjeta)}</td><td className=${'num '+(x.ahorro<0?'down':'')}>${fmt(x.ahorro)}</td><td className="num">${fmt(x.fondo)}</td><td className="num">${nf(x.mesesCubre,1)}</td></tr>`)}
      </tbody></table></div>`:null}
      <div className="muted xs">Fuente: ${fuente}; hojas Flujo de efectivo y Ahorro. Con el recorte de ${fmt(M.recortePlan)} las cifras coinciden con el modelo. Proyección, no garantía. El detalle del seguro de gastos médicos está en su propia sección.</div></div>
  </div>`;
}
function PlanBasico(){
  const {s,upd,toast,go}=useApp(),c=col(),cc=catColors(c);
  const [am,setAm]=useState(()=>Math.round((s.user.income||0)*.1/100)*100);
  const F=fondoBasico(s,am),T=F.T,max=Math.max(1000,Math.round((s.user.income||0)/100)*100);
  const items={gastoCorriente:T.exp,deudas:0,sgmm:0,tanda:0,noPlaneados:0,ppr:0,ahorro:T.inc-T.exp};
  const crear=()=>{const n=F.mesMeta||12,d=new Date();upd(x=>{x.goals.push({id:uid(),name:'Fondo de emergencia',target:F.meta,saved:0,deadline:iso(new Date(d.getFullYear(),d.getMonth()+n,Math.min(d.getDate(),28))),demo:false})});toast('Meta «Fondo de emergencia» creada','ok')};
  return html`<div className="col" style=${{gap:16}}>
    <div className="card col" style=${{gap:12}}><div className="ch" style=${{marginBottom:0}}><div><h2>Tu presupuesto del mes</h2><div className="muted sm">Lo que entra se reparte entre lo que gastas y lo que ahorras.</div></div></div>
      ${T.inc===0&&T.exp===0?html`<${Empty} title="Aún no hay movimientos este mes" text="Registra tus ingresos y gastos para ver tu presupuesto."/>`:html`<div className="cuadre ok"><${Ic} n="check" s=${16}/><span>Ingreso <b className="num">${fmt(T.inc)}</b> = gastos <b className="num">${fmt(T.exp)}</b> + ahorro <b className=${'num '+(T.inc-T.exp<0?'down':'up')}>${fmt(T.inc-T.exp)}</b></span></div>`}</div>
    <div className="split">
      <div className="card col" style=${{gap:12}}><div className="ch" style=${{marginBottom:0}}><h2>Fondo de emergencia</h2><span className="pill">Meta: 3 meses</span></div>
        <div className="num" style=${{fontSize:36,fontWeight:700,lineHeight:1}}>${nf(F.mesesCubre,1)} <span className="muted" style=${{fontSize:16,fontWeight:500}}>meses cubiertos</span></div>
        <${MesesGauge} v=${F.mesesCubre}/>
        <div className="sm">Tienes ${fmt(F.actual)} de una meta de <b>${fmt(F.meta)}</b> (3 meses de tus gastos básicos: ${fmt(F.needs)} al mes).</div>
        ${F.goal?html`<button className="btn sm" style=${{alignSelf:'flex-start'}} onClick=${()=>go('finanzas','metas')}>Abonar a mi fondo →</button>`:html`<button className="btn pri sm" style=${{alignSelf:'flex-start'}} onClick=${crear}><${Ic} n="flag" s=${15}/>Crear meta «Fondo de emergencia»</button>`}</div>
      <div className="card col" style=${{gap:12}}><h2>¿Cuánto tardas en llegar?</h2>
        <${Field} label=${html`Si ahorras <b className="num" style=${{color:'var(--fg)',fontSize:16}}>${fmt(am)}</b> al mes en CETES`} id="pb-a"><input id="pb-a" type="range" min="0" max=${max} step="100" value=${am} onChange=${setRange(setAm,max)}/><//>
        <div className="num" style=${{fontSize:28,fontWeight:700}}>${F.mesMeta===0?'¡Ya llegaste!':F.mesMeta?`${F.mesMeta} ${F.mesMeta===1?'mes':'meses'}`:'Más de 10 años'}</div>
        <div className="muted xs">Simulación con CETES 28 días ${pc(RIVERA.modelo.cetes.tasa*100,1)} menos ISR (supuesto de noviembre 2026). No es garantía.</div></div>
    </div></div>`;
}
