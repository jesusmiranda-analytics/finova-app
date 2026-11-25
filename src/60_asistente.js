/* ================= ASISTENTE IA (DEMO) ================= */
function aiCtx(s){
  const ml=monthList(s),T=tot(ml),bc=byCat(ml),top=Object.entries(bc).sort((a,b)=>b[1]-a[1])[0]||['—',0];
  const g=[...s.goals].sort((a,b)=>goalInfo(b).pct-goalInfo(a).pct)[0],hd=[...s.debts].sort((a,b)=>b.rate-a.rate)[0];
  const over=budgetRows(s).filter(r=>r.pct>100);
  return {name:s.user.name.split(' ')[0],T,bc,top,ent:bc['Entretenimiento']||0,rate:T.inc>0?T.net/T.inc*100:0,g,hd,over,income:s.user.income,debtTotal:sum(s.debts,d=>d.balance)};
}
const TOPICS=[
 [/^(hola|buenas|buenos|hey|que tal)/,c=>`¡Hola, ${c.name}! Soy el asistente de demostración de FINOVA. Puedo explicarte ahorro, presupuesto, inflación, CETES, ETFs y deudas, y también revisar tus datos de ejemplo. ¿Por dónde empezamos?`],
 [/(mis gastos|gaste|gastaste|gastado|en que gasto|entretenimiento|resumen|como voy|mi mes)/,c=>[
  `Este mes gastaste **${fmt(c.T.exp)}** y tu mayor categoría es **${c.top[0]}** con ${fmt(c.top[1])}. En entretenimiento llevas ${fmt(c.ent)}.${c.over.length?` Ojo: superaste tu presupuesto en ${c.over.map(r=>r.cat).join(', ')}.`:''}`,
  `Resumen del mes (datos de ejemplo):\n• Ingresos: ${fmt(c.T.inc)}\n• Gastos: ${fmt(c.T.exp)}\n• Ahorro: ${fmt(c.T.net)} (${pc(c.rate,0)} de tus ingresos)\n• Mayor categoría: ${c.top[0]} (${fmt(c.top[1])})\n• Entretenimiento: ${fmt(c.ent)}${c.over.length?`\n• Excedida: ${c.over.map(r=>r.cat).join(', ')}`:''}`,
  `Tasa de ahorro del mes: **${pc(c.rate,1)}** (${fmt(c.T.net)}). El gasto se concentra en ${c.top[0]} (${pc(c.T.exp>0?c.top[1]/c.T.exp*100:0,0)}). Entretenimiento: ${fmt(c.ent)}, que equivale a ${pc(c.income>0?c.ent/c.income*100:0,1)} de tu ingreso. ${c.over.length?`Categorías sobre presupuesto: ${c.over.map(r=>`${r.cat} (${pc(r.pct,0)})`).join(', ')}.`:'Ninguna categoría excede su presupuesto.'}`]],
 [/(mi meta|mis metas|fondo de emergencia|emergencia)/,c=>c.g?[
  `Tu meta "${c.g.name}" va en **${pc(goalInfo(c.g).pct,0)}**: llevas ${fmt(c.g.saved)} de ${fmt(c.g.target)}. Un fondo de emergencia debe cubrir de 3 a 6 meses de gastos.`,
  `Meta "${c.g.name}": ${fmt(c.g.saved)} de ${fmt(c.g.target)} (${pc(goalInfo(c.g).pct,0)}). Para llegar a tiempo necesitas **${fmt(goalInfo(c.g).rec)} al mes**. Guárdalos en algo líquido y estable, como CETES a plazo corto.`,
  `"${c.g.name}": faltan ${fmt(goalInfo(c.g).remain)} en ${goalInfo(c.g).monthsLeft} meses (${fmt(goalInfo(c.g).rec)}/mes). Con CETES al rendimiento supuesto de 7.5%, la aportación necesaria baja ligeramente a ${fmt(pmtNeeded(c.g.target,goalInfo(c.g).monthsLeft/12,7.5,c.g.saved))}/mes. Es un cálculo hipotético.`]:'Aún no tienes metas. Crea una en Mis finanzas > Metas y te ayudo a planearla.'],
 [/ahorr/,c=>[
  `Ahorrar es separar una parte de tu ingreso **antes** de gastarlo. Empieza con 10% y súbelo poco a poco. Con tu ingreso de ejemplo (${fmt(c.income)}) serían ${fmt(c.income*.1)} al mes.`,
  `Una buena práctica es automatizar: apenas recibes tu ingreso, separas el ahorro. La regla 50/30/20 sugiere 20% (${fmt(c.income*.2)} al mes para ti). Este mes ahorraste ${pc(c.rate,0)}.`,
  `Más allá de la tasa de ahorro, piensa en su destino: fondo de emergencia (3 a 6 meses de gastos), metas a corto plazo en instrumentos líquidos y metas largas en activos diversificados. Tu tasa actual es ${pc(c.rate,1)}.`]],
 [/(presupuesto|50.?30.?20)/,c=>[
  `Un presupuesto es un plan para tu dinero. La regla **50/30/20**: 50% necesidades, 30% gustos y 20% ahorro. Con ${fmt(c.income)} serían ${fmt(c.income*.5)}, ${fmt(c.income*.3)} y ${fmt(c.income*.2)}.`,
  `Define límites por categoría y revisa cada semana. En FINOVA recibes aviso al 80% y alerta al pasar 100%. ${c.over.length?`Hoy superaste: ${c.over.map(r=>r.cat).join(', ')}.`:'Hoy no excedes ninguna categoría.'}`,
  `Ajusta la regla a tu realidad: si la renta pesa más, mueve puntos de "gustos" hacia "necesidades", pero protege el ahorro. Revisa el presupuesto cada mes con datos reales de gasto, no con estimaciones.`]],
 [/inflaci/,c=>[
  `La inflación es el aumento general de precios. Si sube, tu dinero compra menos. Por eso conviene que tus ahorros rindan más que la inflación.`,
  `Rendimiento real ≈ rendimiento nominal − inflación. Con CETES a 7.5% y una inflación de ejemplo de 3.9%, el rendimiento real sería cercano a 3.6% (datos de demostración).`,
  `La inflación erosiona el poder adquisitivo de forma compuesta. Con 4% anual, $10,000 de hoy equivalen a unos $${nf(10000/Math.pow(1.04,10),0)} dentro de 10 años. Instrumentos ligados a UDIs o con tasa real positiva ayudan a protegerte.`]],
 [/(sofipo)/,c=>[`Las SOFIPOs son entidades digitales que ofrecen cuentas con rendimiento. Revisa la protección y la solidez de cada una antes de depositar.`,`Suelen pagar más que un banco tradicional, pero la protección es limitada. Diversifica entre instituciones y confirma las condiciones vigentes.`,`Evalúa rendimiento neto, liquidez, límite de protección por institución y riesgo de contraparte. No concentres más de lo que cubre la protección.`]],
 [/cetes?/,c=>[
  `Los **CETES** son deuda del gobierno federal. Los compras con descuento y al vencer recibes su valor nominal. Es una opción de bajo riesgo para empezar.`,
  `Hay plazos de 28, 91, 182 y 364 días. Sabes tu rendimiento desde la compra si los mantienes a vencimiento. Ejemplo hipotético: $10,000 a 28 días con 7.2% anual darían unos ${fmt(10000*.072*28/360)} de interés.`,
  `Los CETES son referencia de la tasa libre de riesgo en pesos. Compara su rendimiento contra la inflación esperada y contra instrumentos de mayor plazo. Pueden ser buen destino para el fondo de emergencia. Ve el catálogo en Inversiones.`]],
 [/(etf|fondos? cotizado|indice)/,c=>[
  `Un **ETF** es un fondo que copia un índice (como el IPC) y se compra como una acción. Es una forma sencilla de diversificar.`,
  `Ventajas: costos bajos y diversificación. Riesgos: sube y baja con el mercado. Conviene para plazos largos (3 años o más) y aportaciones constantes.`,
  `Revisa el índice que replica, la comisión (TER), la liquidez, el error de seguimiento y si está denominado en dólares (riesgo cambiario). Úsalo como base del portafolio y limita la concentración en un solo índice.`]],
 [/(deuda|tarjeta|avalancha|bola de nieve|credito)/,c=>c.hd?[
  `Una deuda con tasa alta crece rápido. Tu deuda más cara de ejemplo es "${c.hd.name}" con ${pc(c.hd.rate,0)} anual. Evita pagar solo el mínimo.`,
  `**Avalancha**: pagas primero la tasa más alta (ahorra más intereses). **Bola de nieve**: pagas primero el saldo menor (más motivación). Tu deuda total de ejemplo es ${fmt(c.debtTotal)}. Compáralos en Mis finanzas > Deudas.`,
  `Con ${pc(c.hd.rate,0)} anual, "${c.hd.name}" genera cerca de ${fmt(c.hd.balance*c.hd.rate/100/12)} de interés al mes. Priorizarla es el uso más rentable de cualquier pago extra, porque ningún instrumento de bajo riesgo rinde tanto.`]:'No tienes deudas registradas. Si agregas alguna, puedo comparar avalancha y bola de nieve.'],
 [/(interes compuesto|compuesto|regla del 72)/,c=>[`El **interés compuesto** es ganar intereses sobre tus intereses. Mientras más tiempo, más crece.`,`Ejemplo hipotético: $1,000 al 10% anual son $1,210 en 2 años. La regla del 72 dice que 72 ÷ tasa te da los años para duplicar.`,`Con aportaciones mensuales el efecto se acelera. Prueba el simulador en Inversiones: el tiempo pesa más que el monto inicial.`]],
 [/(diversific|riesgo|portafolio)/,c=>[`Diversificar es repartir tu dinero en distintos activos para no depender de uno solo.`,`A mayor rendimiento esperado, mayor riesgo. Mezcla activos estables (CETES, SOFIPOs) con otros de crecimiento (ETFs). En el simulador verás un indicador de concentración.`,`Mide la concentración con el índice HHI y el número efectivo de activos. Busca que ningún activo supere 40% a menos que lo justifique tu objetivo. Recuerda que correlaciones suben en crisis.`]],
 [/(accion|bolsa|ipc)/,c=>[`Una acción es una pequeña parte de una empresa. Puede subir mucho o bajar mucho.`,`Es el activo más variable del catálogo. Conviene para plazos de 5 años o más y con dinero que no necesitarás pronto.`,`En lugar de elegir acciones individuales, muchos inversionistas usan ETFs. Si eliges acciones, limita cada una a un porcentaje pequeño del portafolio.`]],
 [/(dolar|tipo de cambio|usd)/,c=>[`El tipo de cambio dice cuántos pesos cuesta un dólar. Si sube, el peso se debilita.`,`Afecta viajes, compras en línea y productos importados. No conviene comprar dólares por miedo a un movimiento de un día.`,`El tipo de cambio responde a diferenciales de tasas, flujos y aversión al riesgo. Si inviertes en activos en dólares, asumes riesgo cambiario además del riesgo del activo.`]],
 [/(afore|retiro|pension)/,c=>[`El retiro es una meta a muy largo plazo. Entre más pronto empieces a aportar, mejor.`,`Revisa tu Afore, compara comisiones y valora aportaciones voluntarias. Es una simulación educativa: no tomes decisiones solo con esta respuesta.`,`El efecto del tiempo y de las comisiones es grande: una diferencia de 0.5 puntos en comisión puede costar miles de pesos a 30 años. Compara rendimiento neto.`]],
 [/(invert|inversion|donde pongo)/,c=>[`Antes de invertir: ten un fondo de emergencia y evita deudas caras. Luego empieza con instrumentos sencillos como CETES.`,`Define tu plazo y tu tolerancia al riesgo. A menos de un año: CETES o cuentas líquidas. A más de tres: puedes sumar ETFs o fondos. Prueba un reparto en el simulador.`,`Construye un portafolio con objetivo, horizonte y reglas de rebalanceo. Aporta de forma constante y revisa la concentración. Todos los rendimientos de la demo son hipotéticos.`]],
 [/(banxico|tasa de referencia)/,c=>[`Banxico es el banco central. Su tasa de referencia influye en el costo de los créditos y en lo que paga el ahorro.`,`Si la tasa sube, ahorrar en CETES paga más y los créditos cuestan más. Ve México hoy (datos de demostración).`,`Los movimientos de tasa se transmiten a CETES, bonos y crédito. Compara la tasa con la inflación para ver la tasa real.`]]
];
const SUGG=['¿Cuánto gasté este mes?','¿Cómo ahorro más?','Explícame la regla 50/30/20','¿Qué son los CETES?','¿Qué es un ETF?','¿Cómo salgo de deudas?','¿Cómo va mi meta?','¿Qué es la inflación?'];
function aiAnswer(q,s){
  const c=aiCtx(s),n=norm(q),li={principiante:0,intermedio:1,avanzado:2}[s.ai.level]||0;
  for(const [re,f] of TOPICS){if(re.test(n)){const r=f(c);return Array.isArray(r)?r[li]:r}}
  return `Esta es una demostración y aún no tengo una respuesta para eso. Prueba con: ahorro, presupuesto, inflación, CETES, ETFs, deudas o "¿cuánto gasté este mes?".`;
}
function Asistente(){
  const {s,upd,toast,ask}=useApp();
  const [q,setQ]=useState(''),[typing,setTyping]=useState(false),end=useRef(null);
  const chat=s.chats.find(x=>x.id===s.activeChat)||null;
  useEffect(()=>{if(end.current)end.current.scrollTop=end.current.scrollHeight},[chat&&chat.msgs.length,typing]);
  const newChat=()=>{const id=uid();upd(d=>{d.chats.unshift({id,title:'Nuevo chat',ts:Date.now(),msgs:[]});d.activeChat=id});setQ('')};
  const send=text=>{
    const t=text.trim();if(!t||typing)return;
    let id=chat&&chat.id;const a=aiAnswer(t,s);
    upd(d=>{let ch=d.chats.find(x=>x.id===id);if(!ch){id=uid();ch={id,title:'',ts:Date.now(),msgs:[]};d.chats.unshift(ch);d.activeChat=id}
      if(!ch.msgs.length||ch.title==='Nuevo chat')ch.title=t.slice(0,34);ch.msgs.push({r:'u',t})});
    setQ('');setTyping(true);
    setTimeout(()=>{upd(d=>{const ch=d.chats.find(x=>x.id===(id||d.activeChat));if(ch)ch.msgs.push({r:'a',t:a})});setTyping(false)},650);
  };
  return html`<div className="page"><${Head} title=${html`Asistente IA <${Demo} t="Demostración"/>`} sub="Responde con una biblioteca de respuestas predefinidas y con los datos de Rodrigo Demo."/>
    <${Banner} k="y" ic="warn"><b>Modo demostración:</b> no hay inteligencia artificial real conectada. Las respuestas son predefinidas y no sustituyen la asesoría financiera profesional.<//>
    <div className="chat">
      <div className="card col" style=${{alignSelf:'start'}}><button className="btn pri" onClick=${newChat}><${Ic} n="plus" s=${18}/>Nuevo chat</button>
        <div className="muted xs b">HISTORIAL</div>
        ${s.chats.length?s.chats.map(ch=>html`<div key=${ch.id} className="row" style=${{flexWrap:'nowrap',gap:4}}><button className="chip" style=${{flex:1,textAlign:'left',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',background:ch.id===s.activeChat?'var(--green-soft)':'',borderColor:ch.id===s.activeChat?'var(--green)':''}} onClick=${()=>upd(d=>{d.activeChat=ch.id})}>${ch.title||'Chat'}</button>
          <button className="ib" style=${{width:32,height:32}} aria-label="Eliminar chat" onClick=${()=>ask({title:'Eliminar chat',text:`Se eliminará "${ch.title}".`,onYes:()=>upd(d=>{d.chats=d.chats.filter(x=>x.id!==ch.id);if(d.activeChat===ch.id)d.activeChat=null})})}><${Ic} n="trash" s=${14}/></button></div>`):html`<div className="muted sm">Aún no hay conversaciones.</div>`}</div>
      <div className="card col">
        <div className="row sp"><span className="b">Nivel de explicación</span><${Seg} opts=${[['principiante','Principiante'],['intermedio','Intermedio'],['avanzado','Avanzado']]} val=${s.ai.level} on=${v=>upd(d=>{d.ai.level=v})} label="Nivel"/></div>
        <div className="msgs" ref=${end} aria-live="polite">
          ${!chat||!chat.msgs.length?html`<div className="msg a"><p>Hola, ${s.user.name.split(' ')[0]}. Soy una demostración: elige una pregunta sugerida o escribe la tuya.</p></div>`:null}
          ${chat?chat.msgs.map((m,i)=>html`<div key=${i} className=${'msg '+m.r}>${m.r==='a'?rich(m.t):m.t}${m.r==='a'?html`<div className="row" style=${{marginTop:8,gap:8}}><button className="btn sm" onClick=${()=>copyText(m.t.replace(/\*\*/g,''),toast)}><${Ic} n="copy" s=${14}/>Copiar</button><span className="muted xs">Respuesta de demostración</span></div>`:null}</div>`):null}
          ${typing?html`<div className="msg a muted">Escribiendo…</div>`:null}</div>
        <div className="row">${SUGG.map(x=>html`<button key=${x} className="chip" onClick=${()=>send(x)}>${x}</button>`)}</div>
        <form className="row" style=${{flexWrap:'nowrap'}} onSubmit=${e=>{e.preventDefault();send(q)}}><label className="sr" htmlFor="ai-q" style=${{position:'absolute',left:-9999}}>Escribe tu pregunta</label><input id="ai-q" className="in" placeholder="Escribe tu pregunta…" maxLength="200" value=${q} onChange=${e=>setQ(e.target.value)}/><button className="btn pri" disabled=${!q.trim()||typing}>Enviar</button></form>
        <div className="muted xs">Demostración educativa. No es asesoría financiera.</div></div></div></div>`;
}
