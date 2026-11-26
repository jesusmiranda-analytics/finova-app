
/* ================= MIS IMPUESTOS =================
   Lo fiscal integrado al plan: conexión con el SAT (simulada, sin contraseñas), radar de deducciones,
   devolución estimada que entra al plan y trazabilidad de devoluciones y pagos (simulados). */
const PERMISOS_SAT=['Facturas (CFDI) que recibes y emites','Retenciones de ISR de tu nómina','Declaraciones que ya presentaste'];
const NO_HACE=['Presentar declaraciones por ti','Pagar sin tu confirmación','Compartir tus datos con terceros'];
const ESTADO_FISCAL={deducible:['g','Deducible'],factura:['y','Pide factura'],efectivo:['r','No deducible: efectivo']};

function Impuestos(){
  const {s}=useApp(),M=s.plan&&s.plan.modelo;
  return html`<div className="page">
    <${Head} title=${html`Mis impuestos <${Demo}/>`} sub="Tus deducciones se vuelven devolución, y tu devolución se vuelve parte de tu plan."/>
    <${Banner} k="y" ic="warn"><b>Demo: FINOVA no se conecta al SAT real ni paga impuestos en este prototipo.</b> Información educativa; no es asesoría fiscal.<//>
    <div className="split"><${ConexionSAT}/><${DevolucionCard} M=${M}/></div>
    <${RadarCard} M=${M}/>
    ${M?html`<div className="card sm muted">${RIVERA.fiscal.mama}</div>`:html`<${ApartadoCard}/>`}
    <${HistorialFiscal}/>
  </div>`;
}

function ConexionSAT(){
  const {s,upd,toast,ask}=useApp(),F=s.fiscal,M=s.plan&&s.plan.modelo;
  const conectar=()=>{upd(d=>{d.fiscal={conectado:true,rfc:M?RIVERA.fiscal.rfc:'XAXX010101000',fecha:todayS(),permisos:[...PERMISOS_SAT],historial:[{tipo:'Conexión',fecha:todayS(),monto:null,folio:folioDemo('SAT'),nota:'Permiso de solo lectura (simulado)'}]}});toast('SAT conectado (demo)','ok')};
  const borrar=()=>ask({title:'Desconectar y borrar mis datos fiscales',text:'FINOVA dejará de leer tu información del SAT y borrará de este dispositivo tu RFC, permisos e historial fiscal. Tus movimientos no se borran.',yes:'Desconectar y borrar',onYes:()=>{upd(d=>{delete d.fiscal});toast('Datos fiscales borrados','ok')}});
  return html`<div className="card col" id="sat-card" style=${{gap:12}}>
    <div className="ch" style=${{marginBottom:0}}><h2>Conexión con el SAT</h2><span className=${'pill '+(F&&F.conectado?'g':'')}>${F&&F.conectado?'Conectado (demo)':'Sin conectar'}</span></div>
    ${F&&F.conectado?html`<div className="sm">RFC <b className="num">${F.rfc}</b> <span className="muted">(RFC genérico de demostración)</span> · desde ${fdate(F.fecha)}</div>
      <div className="sm"><b>FINOVA puede leer:</b><ul className="porque">${F.permisos.map(p=>html`<li key=${p}>${p}</li>`)}</ul></div>
      <button className="btn dng sm" style=${{alignSelf:'flex-start'}} onClick=${borrar}><${Ic} n="trash" s=${15}/>Desconectar y borrar mis datos fiscales</button>`
    :html`<div className="sm">Con tu permiso, FINOVA leería tu información fiscal para encontrar deducciones y estimar tu devolución.</div>
      <div className="grid" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',gap:10}}>
        <div className="card flat sm"><b className="up">Solo leería</b><ul className="porque">${PERMISOS_SAT.map(p=>html`<li key=${p}>${p}</li>`)}</ul></div>
        <div className="card flat sm"><b className="down">Nunca haría</b><ul className="porque">${NO_HACE.map(p=>html`<li key=${p}>${p}</li>`)}</ul></div></div>
      <div className="supuesto xs"><b>Sin contraseñas:</b> en este prototipo no te pedimos tu contraseña del SAT (CIEC) ni tu e.firma. En la versión real la autorización se daría en el sitio del SAT o de un proveedor autorizado.</div>
      <button className="btn pri" style=${{alignSelf:'flex-start'}} onClick=${conectar}><${Ic} n="lock" s=${16}/>Autorizar en el SAT (simulado)</button>`}
  </div>`;
}

function DevolucionCard({M}){
  const {s,upd,toast,go}=useApp(),D=devolucionEstimada(s),F=s.fiscal,[comp,setComp]=useState(null);
  const monto=Math.round(D.modelo?D.anio1:D.monto),recibida=F&&F.historial&&F.historial.some(h=>h.tipo==='Devolución');
  const recibir=()=>{const folio=folioDemo('DEV'),h={tipo:'Devolución',fecha:todayS(),monto,folio,nota:'Devolución de ISR (simulada)'};
    upd(d=>{d.tx.push({id:uid(),type:'ingreso',amount:monto,cat:'Devolución de impuestos',date:todayS(),method:'Transferencia',note:`Devolución de ISR (SAT) · folio ${folio}`,demo:true});d.fiscal.historial.push(h)});
    setComp({...h,titulo:'Comprobante de devolución (demo)'});toast('Devolución registrada en tus movimientos','ok')};
  const fondo=s.goals.find(g=>/emergencia/i.test(g.name));
  const abonar=()=>{upd(d=>{const g=d.goals.find(x=>x.id===fondo.id);g.saved=Math.min(g.target,g.saved+monto);d.fiscal.historial.push({tipo:'Abono al fondo',fecha:todayS(),monto,folio:'—',nota:`A «${fondo.name}»`})});toast('Devolución abonada a tu fondo de emergencia','ok');setComp(null)};
  return html`<div className="card col" id="dev-card" style=${{gap:12}}>
    <div className="ch" style=${{marginBottom:0}}><h2>Tu devolución estimada</h2><span className="pill b">Tasa marginal ${pc(D.tasa*100,2)}</span></div>
    ${D.modelo?html`<div className="num up" style=${{fontSize:34,fontWeight:700,lineHeight:1}} id="dev-monto">${fmt(D.anio1)}</div>
      <div className="sm">Por deducir la prima del seguro de gastos médicos. Llega en el <b>mes ${D.mes} (${mesTxt(M,D.mes)})</b> y lleva al fondo de emergencia a su meta de 3 meses.</div>
      <div className="card flat sm">Desde que inicia el PPR (mes ${RIVERA.fiscal.deducciones[1].desde}), la devolución sube a <b className="num" id="dev-ppr">${fmt(D.anioPPR)}</b> al año: seguro ${fmt(D.anioPPR-D.devolucionPPR)} + PPR ${fmt(D.devolucionPPR)}.</div>
      <button className="btn gh sm" style=${{alignSelf:'flex-start',padding:0,height:24}} onClick=${()=>go('finanzas','hogar')}>Ver el mes ${D.mes} en el plan del hogar →</button>`
    :html`<div className="num up" style=${{fontSize:34,fontWeight:700,lineHeight:1}} id="dev-monto">${fmt(D.monto)}</div>
      <div className="sm">Con tus gastos deducibles con factura de los últimos 12 meses (${fmt(D.base)}). Si pides factura de lo pendiente, podría llegar a <b className="num">${fmt(D.posible)}</b>.</div>
      ${D.perdido>0?html`<div className="supuesto xs">Pagar en efectivo te costó ≈ <b>${fmt(D.perdido)}</b> de devolución.</div>`:null}
      <div className="muted xs">Tope global: ${fmt(D.tope)} (lo menor entre 5 UMA anuales y 15 % de tu ingreso). Tasa según la ${FISCAL.fuenteTarifa}, con tu ingreso de Perfil.</div>`}
    ${F&&F.conectado&&monto>0?recibida?html`<div className="cuadre ok"><${Ic} n="check" s=${16}/>Devolución recibida y registrada en Movimientos.</div>`
      :html`<button className="btn pri" style=${{alignSelf:'flex-start'}} onClick=${recibir}>Recibir devolución (demo)</button>`
     :html`<div className="muted xs">${F&&F.conectado?'Aún no hay devolución que recibir.':'Conecta el SAT (demo) para simular la devolución.'}</div>`}
    ${comp?html`<${Comprobante} c=${comp} onClose=${()=>setComp(null)} extra=${fondo&&fondo.saved<fondo.target?html`<button className="btn pri" onClick=${abonar}>Abonar ${fmt(comp.monto)} a «${fondo.name}»</button>`:null}/>`:null}
  </div>`;
}

function RadarCard({M}){
  const {s,upd}=useApp(),R=radarDeducciones(s),[todo,setTodo]=useState(false);
  const plan=M?RIVERA.fiscal.deducciones.map(d=>({...d,C:FISCAL.conceptos[d.k],fecha:mesTxt(M,d.desde)})):[];
  const lista=todo?R.items:R.items.slice(0,8);
  return html`<div className="card col" id="radar-card" style=${{gap:12}}>
    <div className="ch" style=${{marginBottom:0}}><div><h2>Radar de deducciones</h2><div className="muted sm">FINOVA revisa tus gastos de los últimos 12 meses y te dice cuáles puedes deducir.</div></div></div>
    <div className="grid g3">
      <${Kpi} ic="check" l="Deducible (con factura)" v=${fmt(R.deducible)} s="Listo para tu declaración" cls="up"/>
      <${Kpi} ic="copy2" l="Pide factura" v=${fmt(R.factura)} s="Deducible si tienes el CFDI a tu nombre"/>
      <${Kpi} ic="warn" l="Perdido por pagar en efectivo" v=${fmt(R.efectivo)} s="Los gastos médicos en efectivo no se deducen" cls=${R.efectivo>0?'down':''}/>
    </div>
    ${plan.length?html`<div className="col" style=${{gap:6}}><b className="sm">Deducciones del plan</b>${plan.map(d=>html`<div key=${d.k} className="row sp sm" style=${{flexWrap:'nowrap'}}><span><b>${d.C.n}</b> <span className="muted">· ${d.nota} · desde ${d.fecha} · CFDI ${d.C.cfdi}</span></span><b className="num">${fmt(d.anual)} al año</b></div>`)}</div>`:null}
    ${R.items.length?html`<div className="tw"><table className="plan-t dest"><thead><tr><th>Fecha</th><th>Gasto</th><th>Pago</th><th>Monto</th><th>Estado</th><th></th></tr></thead><tbody>
      ${lista.map(({t,c})=>html`<tr key=${t.id}><td>${fshort(t.date)}</td><td>${t.note||t.cat}<br/><span className="muted xs">${c.concepto} · CFDI ${c.cfdi}</span></td><td>${t.method}</td><td className="num">${fmt(t.amount)}</td>
        <td><span className=${'pill '+ESTADO_FISCAL[c.estado][0]}>${ESTADO_FISCAL[c.estado][1]}</span></td>
        <td>${c.estado==='factura'?html`<button className="btn sm" onClick=${()=>upd(d=>{d.tx.find(x=>x.id===t.id).cfdi=true})}>Ya tengo factura</button>`:c.estado==='efectivo'?html`<span className="xs muted">La próxima vez paga con tarjeta o transferencia</span>`:null}</td></tr>`)}
    </tbody></table></div>${R.items.length>8?html`<button className="btn sm" style=${{alignSelf:'flex-start'}} onClick=${()=>setTodo(!todo)}>${todo?'Ver menos':`Ver los ${R.items.length}`}</button>`:null}`
    :html`<${Empty} title="Sin gastos deducibles detectados" text="Registra tus consultas médicas, dentista u hospital (categoría Salud) o colegiaturas (Educación)."/>`}
    <div className="muted xs">Requisitos: factura (CFDI) a tu nombre con el uso correcto y pago con ${FISCAL.medios}. Colegiaturas con tope anual por nivel (primaria ${fmt(FISCAL.colegiaturas.Primaria)}, secundaria ${fmt(FISCAL.colegiaturas.Secundaria)}). Fuente: ${FISCAL.fuenteDeducciones}.</div>
  </div>`;
}

function ApartadoCard(){
  const {s,upd,toast}=useApp(),[pct,setPct]=useState(''),[comp,setComp]=useState(null);
  const p=num(pct),A=apartadoFiscal(s,Number.isFinite(p)?p:0),F=s.fiscal;
  if(A.ing<=0)return null;
  const pagar=()=>{const folio=folioDemo('PAGO'),linea='DEMO'+String(Date.now()).slice(-12).padStart(16,'0'),monto=Math.round(A.pendiente*100)/100;
    const h={tipo:'Pago',fecha:todayS(),monto,folio,nota:`Línea de captura ${linea}`};
    upd(d=>{d.tx.push({id:uid(),type:'gasto',amount:monto,cat:'Impuestos',date:todayS(),method:'Transferencia',note:`Pago SAT · línea de captura ${linea}`,demo:true});d.fiscal.historial.push(h)});
    setComp({...h,titulo:'Comprobante de pago (demo)',linea});toast('Pago registrado en tus movimientos','ok')};
  return html`<div className="card col" id="apartado-card" style=${{gap:12}}>
    <div className="ch" style=${{marginBottom:0}}><div><h2>Apartado fiscal</h2><div className="muted sm">Tienes ingresos por tu cuenta (${fmt(A.ing)} en 12 meses). Aparta una parte para que el pago de impuestos no te tome por sorpresa.</div></div></div>
    <div className="row" style=${{gap:12,alignItems:'flex-end'}}>
      <${Field} label="¿Qué % quieres apartar?" id="ap-pct" hint="Depende de tu régimen fiscal; consúltalo con tu contador."><input id="ap-pct" type="number" min="0" max="35" step="0.5" placeholder="Ej. 10" value=${pct} onChange=${e=>setPct(e.target.value)} style=${{maxWidth:140}}/><//>
      ${Number.isFinite(p)&&p>0?html`<div className="sm">Deberías tener apartado <b className="num">${fmt(A.debe)}</b> · ya pagaste <b className="num">${fmt(A.pagado)}</b> · pendiente <b className="num" id="ap-pend">${fmt(A.pendiente)}</b></div>`:null}</div>
    ${Number.isFinite(p)&&p>0&&A.pendiente>0?F&&F.conectado?html`<button className="btn pri" style=${{alignSelf:'flex-start'}} onClick=${pagar}>Pagar ${fmt(A.pendiente)} con línea de captura (demo)</button>`:html`<div className="muted xs">Conecta el SAT (demo) para simular el pago.</div>`:null}
    ${comp?html`<${Comprobante} c=${comp} onClose=${()=>setComp(null)}/>`:null}
  </div>`;
}

function HistorialFiscal(){
  const {s}=useApp(),H=s.fiscal&&s.fiscal.historial||[];
  return html`<div className="card col" id="hist-card" style=${{gap:10}}><h2>Historial fiscal</h2>
    ${H.length?html`<div className="tw"><table className="plan-t dest"><thead><tr><th>Fecha</th><th>Qué pasó</th><th>Monto</th><th>Folio</th><th>Detalle</th></tr></thead><tbody>
      ${[...H].reverse().map((h,i)=>html`<tr key=${i}><td>${fdate(h.fecha)}</td><td><b>${h.tipo}</b></td><td className="num">${h.monto!=null?fmt(h.monto):'—'}</td><td className="num xs">${h.folio}</td><td className="sm">${h.nota}</td></tr>`)}
    </tbody></table></div><div className="muted xs">Cada devolución y pago también queda en Mis finanzas → Movimientos, así sabes de dónde salió y a dónde fue tu dinero.</div>`
    :html`<${Empty} title="Sin movimientos fiscales" text="Aquí verás conexiones, devoluciones y pagos con su folio."/>`}</div>`;
}

function Comprobante({c,onClose,extra}){
  return html`<${Modal} title=${c.titulo} onClose=${onClose}>
    <div className="card flat col" style=${{gap:6}}>
      <div className="row sp"><span className="muted sm">Monto</span><b className="num" style=${{fontSize:22}}>${fmt(c.monto)}</b></div>
      <div className="row sp sm"><span className="muted">Fecha</span><span>${fdate(c.fecha)}</span></div>
      <div className="row sp sm"><span className="muted">Folio</span><span className="num">${c.folio}</span></div>
      ${c.linea?html`<div className="row sp sm"><span className="muted">Línea de captura</span><span className="num">${c.linea}</span></div>`:null}
      <div className="row sp sm"><span className="muted">Cuenta</span><span>FINOVA (demo)</span></div></div>
    <div className="supuesto xs">Comprobante de demostración: no tiene validez ante el SAT.</div>
    <div className="mf"><button className="btn" onClick=${onClose}>Cerrar</button>${extra||null}</div><//>`;
}

/* Tarjeta 4 de «Mi asesor». */
function AsesorImpuestos({M}){
  const {s,go}=useApp(),D=devolucionEstimada(s);
  return html`<div className="card col asesor" id="as-impuestos" style=${{gap:12}}>
    <${Paso} n="4" t="Impuestos: tu devolución"/>
    <div className="reco"><div className="muted xs">Recomendación</div><div className="reco-t">${M?`Deduce el seguro y recupera ${fmt(D.anio1)} en ${mesTxt(M,D.mes)}`:D.monto>0?`Presenta tu declaración: podrías recuperar ${fmt(D.monto)}`:'Pide factura y paga con tarjeta tus gastos médicos'}</div>
      <div className="muted sm">${M?`Con el PPR, la devolución sube a ${fmt(D.anioPPR)} al año. Esa devolución lleva al fondo de emergencia a su meta.`:'Los gastos médicos pagados en efectivo no se pueden deducir.'}</div></div>
    <button className="btn sm" style=${{alignSelf:'flex-start'}} onClick=${()=>go('impuestos')}>Ver Mis impuestos →</button></div>`;
}
