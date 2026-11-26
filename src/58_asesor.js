
/* ================= MI ASESOR (M4) =================
   Tres recomendaciones con su porqué: seguro de gastos médicos, plan de inversión y mejor tarjeta.
   Caso Rivera (s.plan.modelo): cifras del modelo final y del Diagnóstico. Otras cuentas: reglas con sus propios datos. */
function Asesor(){
  const {s}=useApp(),M=s.plan&&s.plan.modelo;
  return html`<div className="page">
    <${Head} title=${html`Mi asesor <${Demo} t="Prototipo"/>`} sub="Tres decisiones, cada una con su porqué." right=${M?html`<span className="pill g">Plan de la consultora</span>`:null}/>
    <${Banner} ic="info">Recomendaciones educativas de un prototipo: no son asesoría financiera ni una oferta de los bancos o aseguradoras mencionados. Cada cifra trae su fuente; lo que no tiene cotización dice «Supuesto».<//>
    <${AsesorSeguro} M=${M}/><${AsesorInversion} M=${M}/><${AsesorTarjeta} M=${M}/><${AsesorImpuestos} M=${M}/>
  </div>`;
}
const Paso=({n,t})=>html`<div className="row" style=${{gap:10,flexWrap:'nowrap'}}><span className="num-badge">${n}</span><h2>${t}</h2></div>`;
const Supuesto=({children})=>html`<div className="xs supuesto"><b>Supuesto:</b> ${children}</div>`;

function AsesorSeguro({M}){
  const {s,upd}=useApp(),[ev,setEv]=useState('promedio');
  const costo=ev==='promedio'?SGMM_REF.eventoPromedio:SGMM_REF.cancer;
  if(M){const G=RIVERA.sgmm,con=eventoMedico(costo,G.deducible,G.coaseguro),indiv=SGMM_REF.individual*2,max=Math.max(indiv,G.anual);
    return html`<div className="card col asesor" id="as-seguro" style=${{gap:14}}>
      <${Paso} n="1" t="Seguro de gastos médicos mayores"/>
      <div className="reco"><div className="muted xs">Recomendación</div><div className="reco-t">Contrata la extensión del seguro colectivo del papá para mamá e hijo</div><div className="muted sm">${G.poliza}</div></div>
      <div className="grid g3">
        <${Kpi} ic="wallet" l="Prima de la extensión" v=${`${fmt(G.mensual)} al mes`} s=${`${fmt(G.anual)} al año (mamá ${fmt(G.primaMama)} + hijo ${fmt(G.primaHijo)})`}/>
        <${Kpi} ic="down" l="Costo neto" v=${`${fmt(G.netoMensual)} al mes`} s=${`La prima es deducible: el papá recupera ${fmt(G.devolucionISR)} de ISR al año`} cls="up"/>
        <${Kpi} ic="star" l="Contra un seguro individual" v="La mitad" s=${`Individual: ${fmt(SGMM_REF.individual)} al año por persona`} cls="up"/>
      </div>
      <div className="split">
        <div className="col" style=${{gap:8}}><b className="sm">Costo anual para mamá e hijo</b>
          ${[['Extensión colectiva',G.anual,'var(--green)'],['Dos seguros individuales',indiv,'var(--red)']].map(([l,v,c])=>html`<div key=${l}><div className="row sp sm"><span>${l}</span><b className="num">${fmt(v)}</b></div><div className="hbar"><i style=${{width:v/max*100+'%',background:c}}></i></div></div>`)}</div>
        <div className="col" style=${{gap:8}}><div className="row sp"><b className="sm">Si pasa un evento médico</b><${Seg} opts=${[['promedio','Evento promedio'],['cancer','Cáncer']]} val=${ev} on=${setEv} label="Evento"/></div>
          <div className="grid" style=${{gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div className="card flat"><div className="muted xs">Sin seguro pagan</div><div className="num down" style=${{fontSize:24,fontWeight:700}} id="ev-sin">${fmt(costo)}</div></div>
            <div className="card flat"><div className="muted xs">Con seguro pagan</div><div className="num up" style=${{fontSize:24,fontWeight:700}} id="ev-con">${fmt(con)}</div></div></div>
          <div className="sm">El seguro les ahorra <b className="num">${fmt(costo-con)}</b>: deducible de ${fmt(G.deducible)} + coaseguro de ${pc(G.coaseguro*100,0)}. Sin seguro, ese gasto terminaría en la tarjeta al 59.52 %.</div></div>
      </div>
      <div className="sm donde"><b>Por qué:</b> <span className="muted">${G.porque} Un evento promedio cuesta lo mismo que ${nf(costo===SGMM_REF.eventoPromedio?SGMM_REF.eventoPromedio/(G.netoMensual*12):SGMM_REF.cancer/(G.netoMensual*12),1)} años de prima neta.</span></div>
      <${Supuesto}>la prima es una estimación con datos de AMIS; hay que confirmar la cotización con Seguros Monterrey. Fuente de costos médicos: ${SGMM_REF.fuente}.<//>
    </div>`;}
  const tiene=s.user.sgmm,meses=s.user.income>0?SGMM_REF.eventoPromedio/s.user.income:0;
  return html`<div className="card col asesor" id="as-seguro" style=${{gap:14}}>
    <${Paso} n="1" t="Seguro de gastos médicos mayores"/>
    <div className="row sp"><b className="sm">¿Tienes seguro de gastos médicos mayores?</b><${Seg} opts=${[['si','Sí'],['no','No']]} val=${tiene===true?'si':tiene===false?'no':''} on=${v=>upd(d=>{d.user.sgmm=v==='si'})} label="Seguro"/></div>
    ${tiene===true?html`<div className="reco"><div className="muted xs">Recomendación</div><div className="reco-t">Mantenlo y revisa su deducible y coaseguro</div><div className="muted sm">Es el primer paso de la escalera: ya lo tienes cubierto.</div></div>`
     :html`<div className="reco"><div className="muted xs">Recomendación</div><div className="reco-t">${tiene===false?'Consigue un seguro de gastos médicos mayores':'Primero, revisa si tienes seguro'}</div><div className="muted sm">Pregunta en tu trabajo si la póliza colectiva cubre a tus dependientes: suele costar mucho menos que una individual (${fmt(SGMM_REF.individual)} al año por persona en promedio).</div></div>`}
    <div className="grid g3"><${Kpi} ic="warn" l="Evento médico promedio" v=${fmt(SGMM_REF.eventoPromedio)} s=${meses?`${nf(meses,1)} meses de tu ingreso`:'Agrega tu ingreso en Perfil'} cls="down"/><${Kpi} ic="warn" l="Cáncer (promedio)" v=${fmt(SGMM_REF.cancer)} s="Sin seguro, casi siempre termina en deuda" cls="down"/><${Kpi} ic="wallet" l="Seguro individual" v=${`${fmt(SGMM_REF.individual)} al año`} s="Prima promedio por persona"/></div>
    <div className="muted xs">Fuente: ${SGMM_REF.fuente}.</div></div>`;
}

function AsesorInversion({M}){
  const {s,go}=useApp(),E=M?escaleraModelo(M):escaleraBasica(s);
  const est={hecho:['g','Hecho'],ahora:['b','Ahora'],despues:['','Después']};
  const x=M?E.P.meses[E.m-1]:null;
  return html`<div className="card col asesor" id="as-inversion" style=${{gap:14}}>
    <${Paso} n="2" t="Plan de inversión"/>
    <div className="reco"><div className="muted xs">Recomendación</div><div className="reco-t">Invierte en orden: primero protección y deudas, después el fondo y al final el retiro</div><div className="muted sm">Invertir a largo plazo mientras pagas una tarjeta al 59.52 % es perder dinero: ningún instrumento seguro rinde eso.</div></div>
    <ol className="escalera">${E.pasos.map((p,i)=>html`<li key=${p.k} className=${p.estado}><span className="num-badge">${i+1}</span><div style=${{flex:1}}><div className="row sp"><b>${p.t}</b><span className=${'pill '+est[p.estado][0]}>${est[p.estado][1]}</span></div>
      <div className="muted sm">${p.x}</div>${M?html`<div className="xs muted" style=${{marginTop:2}}>${p.hasta===p.desde?`Mes ${p.desde} · ${mesCorto(M,p.desde)}`:p.hasta?`Meses ${p.desde}–${p.hasta} · ${mesCorto(M,p.desde)} a ${mesCorto(M,p.hasta)}`:`Desde el mes ${p.desde} · ${mesTxt(M,p.desde)}`}</div>`:null}</div></li>`)}</ol>
    ${M?html`<div className="cuadre ok"><${Ic} n="flag" s=${16}/><span><b>Este mes (mes ${E.m}, ${mesTxt(M,E.m)}):</b> ${E.m===1?'contratar la extensión del seguro, abrir la cuenta en CETESdirecto y ':''}${x.tarjeta>0?`abonar ${fmt(x.tarjeta)} a la Azul BBVA`:x.ahorro>0?`ahorrar ${fmt(x.ahorro)} en CETES 28 días`:'seguir el plan'}.</span></div>`:null}
    <div className="tw"><table className="plan-t dest"><thead><tr><th>Para qué</th><th>Dónde</th><th>Por qué</th></tr></thead><tbody>
      <tr><td>Fondo de emergencia</td><td><b>CETES 28 días</b> (CETESdirecto)</td><td>Disponible cada mes; ${pc(TASAS.cetes28,2)} anual (${TASAS.fuente.cetes}).</td></tr>
      <tr><td>Retiro</td><td><b>PPR Imagina Ser Pagos Limitados 10</b> + Afore</td><td>${M?'Deducible: el papá recupera $6,285 de ISR al año; garantía mínima de 1 % real en UDI.':'Deducible y con rendimiento real garantizado mínimo en algunos planes.'}</td></tr>
      <tr><td>Después de 6 meses de fondo</td><td><b>Aportaciones voluntarias a la Afore</b></td><td>También deducibles y con comisión promedio de solo 0.538 % (CONSAR).</td></tr>
    </tbody></table></div>
    <div className="row"><button className="btn sm" onClick=${()=>go('finanzas','hogar')}>Ver el plan del hogar →</button><button className="btn sm" onClick=${()=>go('finanzas','metas')}>Ver metas por plazo →</button></div>
    <div className="muted xs">Fuente: Diagnóstico final de la consultora, «Orden de prioridades»; PPR: condiciones de Seguros Monterrey NYL; comisión de Afore: CONSAR (2026).</div></div>`;
}

function AsesorTarjeta({M}){
  const {s}=useApp();
  const guess=s.debts.map(d=>d.name).map(n=>Object.values(TARJETAS)[2].filas.find(f=>n.toLowerCase().includes(f[0].toLowerCase().split(' (')[0])));
  const [paga,setPaga]=useState(M?'si':s.debts.some(d=>/tarjeta/i.test(d.name))?'no':'si');
  const [rango,setRango]=useState(M?RIVERA.tarjeta.rango:'8001_15000'),[uso,setUso]=useState(M?RIVERA.tarjeta.uso:'general');
  const actual=M?RIVERA.tarjeta.actual:((guess.find(Boolean)||[])[0]||null);
  const R=recomendarTarjeta({paga:paga==='si',rango,uso,actual}),t=R.top,a=R.act;
  const usoL=Object.fromEntries(USOS);
  const tepp=n=>{const i=institucionDe(n);return i&&TEPP_NT[i]!=null?TEPP_NT[i]:null};
  const filas=[t,...R.otras,...(a&&a!==t&&!R.otras.includes(a)?[a]:[])];
  return html`<div className="card col asesor" id="as-tarjeta" style=${{gap:14}}>
    <${Paso} n="3" t="Mejor tarjeta de crédito"/>
    <div className="form" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))'}}>
      <${Field} label="¿Pagas el total cada mes?" id="tc-paga"><${Seg} opts=${[['si',M?'Sí (desde el mes 5)':'Sí, pago el total'],['no',M?'No (hoy)':'No, cargo saldo']]} val=${paga} on=${setPaga} label="Pago"/><//>
      <${Field} label="Límite de crédito" id="tc-rango"><select id="tc-rango" value=${rango} onChange=${e=>setRango(e.target.value)}>${Object.entries(TARJETAS).map(([k,v])=>html`<option key=${k} value=${k}>${v.n}</option>`)}</select><//>
      <${Field} label="¿En qué la usas más?" id="tc-uso"><select id="tc-uso" value=${uso} onChange=${e=>setUso(e.target.value)}>${USOS.map(([k,l])=>html`<option key=${k} value=${k}>${l}</option>`)}</select><//>
    </div>
    ${paga==='no'?html`<${Banner} k="y" ic="warn"><b>Mientras cargues saldo, una tarjeta nueva no baja tu deuda.</b> Primero liquida la más cara (método avalancha). ${M?'Así lo hace el plan: todo el dinero libre va a la Azul hasta el mes 5.':''} Si necesitas una tarjeta, la de menor costo para tu límite es la de abajo.<//>`:null}
    <div className="reco"><div className="muted xs">${M?(paga==='si'?'Recomendación desde el mes 5 ('+mesTxt(M,5)+')':'Recomendación hoy (meses 1 a 4)'):'Recomendación'}</div>
      <div className="reco-t" id="tc-top">${M&&paga==='no'?'No abras otra tarjeta: termina de pagar la Azul BBVA':t.n}</div>
      <div className="muted sm">${M&&paga==='no'?`Si de todos modos necesitaran una, la de menor CAT para su límite es ${t.n} (${pc(t.cat,1)}).`:`Anualidad ${fmt(t.anual)} · CAT de publicidad ${pc(t.cat,1)} · ${t.web}`}</div></div>
    <ul className="porque">
      ${a&&a.anual>t.anual?html`<li>Te ahorras <b className="num">${fmt(a.anual-t.anual)}</b> al año de anualidad frente a tu ${a.n}.</li>`:null}
      ${a?html`<li>Si algún mes no pagas el total, su CAT es de <b>${pc(t.cat,1)}</b> contra <b>${pc(a.cat,1)}</b> de tu ${a.n}: ${t.cat<a.cat?`cuesta ${nf(a.cat/t.cat,1)} veces menos`:'similar'}.</li>`:html`<li>Es de las de menor CAT de publicidad para tu límite (${R.T.n}).</li>`}
      ${paga==='si'?html`<li>Si pagas el total cada mes, la tasa no te cobra nada: lo que más pesa es la anualidad, y esta no tiene.</li>`:null}
      ${t!==R.min?html`<li>La de menor CAT es ${R.min.n} (${pc(R.min.cat,1)}), pero es para ${usoL[R.min.uso].toLowerCase()}; para ${usoL[uso].toLowerCase()}, ${t.n} cuesta casi lo mismo.</li>`:null}
      ${tepp(t.n)!=null?html`<li>A quienes no pagan el total, ${institucionDe(t.n)} les cobró en promedio ${pc(tepp(t.n),1)} efectivo anual${a&&tepp(a.n)!=null?` contra ${pc(tepp(a.n),1)} de ${institucionDe(a.n)}`:''} (diciembre de 2025).</li>`:null}
      ${M&&paga==='si'?html`<li>Con la nueva tarjeta aprobada, cancelen la Azul: el banco devuelve la parte proporcional de la anualidad (Banxico).</li>`:null}
    </ul>
    <div className="tw"><table className="plan-t"><thead><tr><th>Tarjeta</th><th>Anualidad</th><th>CAT de publicidad</th><th>Lugar de ${R.total}</th></tr></thead><tbody>
      ${filas.map(f=>html`<tr key=${f.n} className=${f===t?'rec':f===a?'act':''}><td>${f.n}${f===t?html` <span className="pill g">Recomendada</span>`:f===a?html` <span className="pill r">Tu tarjeta</span>`:null}</td><td className="num">${fmt(f.anual)}</td><td className="num">${pc(f.cat,1)}</td><td className="num">${f.pos}</td></tr>`)}
    </tbody></table></div>
    <div className="muted xs">Fuente: <a href=${R.T.url} target="_blank" rel="noopener">${TARJETAS_FUENTE}, límite ${R.T.n.toLowerCase()}</a>; ${TEPP_NT.fuente}. El CAT de una persona depende de su perfil de riesgo y puede ser distinto al de publicidad.</div>
    <${Supuesto}>${M?'que su límite de crédito es mayor a $15,000 (deben $18,000) y que la usarán sobre todo en el súper; ':''}que se cumplen los requisitos de ingreso del banco, que Banxico no publica.<//>
  </div>`;
}
