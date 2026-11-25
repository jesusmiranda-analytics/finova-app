/* ================= PERFIL ================= */
function Toggle({on,set,label}){return html`<button className=${'sw '+(on?'on':'')} role="switch" aria-checked=${on} aria-label=${label} onClick=${()=>set(!on)}></button>`}
function Perfil(){
  const {s,upd,toast,ask,reset,setTheme,replayTutorial}=useApp();
  const [nm,setNm]=useState(s.user.name),[inc,setInc]=useState(String(s.user.income)),[er,setEr]=useState({}),[ex,setEx]=useState(null);
  const fl=finLevel(s.academy.xp);
  const save=e=>{e.preventDefault();const x={},i=num(inc);
    if(!nm.trim())x.nm='Escribe tu nombre.';else if(nm.trim().length>40)x.nm='Máximo 40 caracteres.';
    if(!Number.isFinite(i)||i<=0)x.inc='El ingreso mensual debe ser mayor que cero.';
    setEr(x);if(Object.keys(x).length)return;
    upd(d=>{d.user.name=nm.trim();d.user.income=i});toast('Perfil actualizado','ok')};
  const csv=()=>['fecha,tipo,categoria,monto,metodo,nota',...s.tx.map(t=>[t.date,t.type,t.cat,t.amount,t.method,`"${(t.note||'').replace(/"/g,'""')}"`].join(','))].join('\n');
  const N=s.user.notifs;
  return html`<div className="page"><${Head} title="Perfil y configuración" sub="Tus datos, apariencia, notificaciones y datos de la demostración."/>
    <div className="grid g2">
      <form className="card col" onSubmit=${save} noValidate><div className="ch" style=${{marginBottom:0}}><h2>Tus datos</h2><${Demo}/></div>
        <${Field} label="Nombre" id="p-n" err=${er.nm}><input id="p-n" maxLength="40" className=${er.nm?'bad':''} value=${nm} onChange=${e=>setNm(e.target.value)}/><//>
        <${Field} label="Ingreso mensual (MXN)" id="p-i" err=${er.inc}><input id="p-i" type="number" min="0" className=${er.inc?'bad':''} value=${inc} onChange=${e=>setInc(e.target.value)}/><//>
        <${Field} label="Moneda" id="p-c"><input id="p-c" value="MXN · Peso mexicano" disabled/><//>
        <div><button className="btn pri">Guardar cambios</button></div></form>
      <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Nivel financiero</h2></div>
        <div className="row" style=${{gap:14,flexWrap:'nowrap'}}><div className="avatar" style=${{width:56,height:56,fontSize:20}}>${s.user.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><div><div style=${{fontSize:22,fontWeight:700}}>${fl.name}</div><div className="muted sm">${s.academy.xp} XP · racha de ${streakOf(s.academy.days)} días</div></div></div>
        <${Bar} v=${(s.academy.xp-fl.lo)/(fl.hi-fl.lo)*100} t="b"/><div className="muted xs">Sube de nivel completando lecciones en Academia.</div>
        <div className="sm">Insignias: <b>${earnedBadges(s).length}</b> de ${BADGES.length} · Lecciones: <b>${new Set(s.academy.log.map(l=>l.lesson)).size}</b> de ${ALL_LESSONS.length}</div></div>
      <div className="card col"><h2>Apariencia</h2><${Seg} opts=${[['auto','Automático'],['light','Claro'],['dark','Oscuro']]} val=${s.user.theme} on=${setTheme} label="Tema"/>
        <h2 style=${{marginTop:6}}>Notificaciones</h2>
        ${[['budget','Presupuestos cerca del límite'],['goals','Metas y aportaciones'],['streak','Rachas de aprendizaje']].map(([k,l])=>html`<div key=${k} className="row sp"><span>${l}</span><${Toggle} on=${N[k]} label=${l} set=${v=>upd(d=>{d.user.notifs[k]=v})}/></div>`)}</div>
      <div className="card col"><h2>Datos de la demostración</h2><p className="muted sm">Se guardan solo en este navegador. No hay servidor ni conexión a bancos.</p>
        <div className="row"><button className="btn" onClick=${()=>setEx('json')}>Exportar datos (JSON)</button><button className="btn" onClick=${()=>setEx('csv')}>Exportar movimientos (CSV)</button></div>
        <div className="row"><button className="btn" onClick=${replayTutorial}>Ver tutorial de nuevo</button><button className="btn dng" onClick=${()=>ask({title:'Restaurar datos de demostración',text:'Se borrarán tus movimientos, metas, deudas, portafolios, chats y avances, y volverá el usuario Rodrigo Demo con los datos originales.',yes:'Restaurar',onYes:reset})}><${Ic} n="refresh" s=${16}/>Restaurar datos de demostración</button></div></div>
    </div>
    <${Banner} k="y" ic="warn">FINOVA es un prototipo de demostración: no se conecta a bancos ni a IA real, no pide datos bancarios ni contraseñas y no sustituye asesoría financiera.<//>
    ${ex?html`<${Modal} title=${ex==='json'?'Exportar datos (JSON)':'Exportar movimientos (CSV)'} onClose=${()=>setEx(null)} wide><p className="muted sm">Copia el contenido y pégalo en un archivo. Las descargas directas no están disponibles dentro de esta vista.</p><textarea className="code" readOnly aria-label="Datos exportados" value=${ex==='json'?JSON.stringify(s,null,2):csv()} onFocus=${e=>e.target.select()}></textarea><div className="mf"><button className="btn" onClick=${()=>setEx(null)}>Cerrar</button><button className="btn pri" onClick=${()=>copyText(ex==='json'?JSON.stringify(s,null,2):csv(),toast)}><${Ic} n="copy" s=${16}/>Copiar</button></div><//>`:null}</div>`;
}

/* ================= CALCULADORAS ================= */
function NumF({k,l,f,setF,id,err,step,suffix}){return html`<${Field} label=${l} id=${id} err=${err}><input id=${id} type="number" step=${step||'any'} className=${err?'bad':''} value=${f[k]} onChange=${e=>setF({...f,[k]:e.target.value})}/><//>`}
const Res=({l,v,big})=>html`<div className="card flat"><div className="muted xs">${l}</div><div className=${'num b'} style=${{fontSize:big?28:20}}>${v}</div></div>`;
function CalcSimple(){const [f,setF]=useState({c:'10000',r:'7',y:'3'});const c=num(f.c),r=num(f.r),y=num(f.y);const e={};
  if(!(c>0))e.c='Escribe un capital mayor que cero.';if(!(r>=0)||!Number.isFinite(r))e.r='Escribe una tasa de 0 o más.';if(!(y>0))e.y='Escribe un plazo mayor que cero.';const ok=!Object.keys(e).length,i=ok?c*r/100*y:0;
  return html`<div className="grid g2"><div className="card col"><${NumF} id="cs-c" k="c" l="Capital" f=${f} setF=${setF} err=${e.c}/><${NumF} id="cs-r" k="r" l="Tasa anual %" f=${f} setF=${setF} err=${e.r}/><${NumF} id="cs-y" k="y" l="Años" f=${f} setF=${setF} err=${e.y}/></div>
  <div className="card col">${ok?html`<${Res} big l="Interés ganado" v=${fmt2(i)}/><${Res} l="Total al final" v=${fmt2(c+i)}/><div className="muted xs">Interés simple = capital × tasa × tiempo.</div>`:html`<${Empty} title="Faltan datos" text="Corrige los campos marcados."/>`}</div></div>`}
function CalcComp(){const [f,setF]=useState({c:'10000',r:'8',y:'5',n:'12',a:'500'});const c=num(f.c),r=num(f.r),y=num(f.y),n=+f.n,a=num(f.a);const e={};
  if(!(c>=0)||!Number.isFinite(c))e.c='Escribe un capital de 0 o más.';if(!(r>=0)||!Number.isFinite(r))e.r='Escribe una tasa de 0 o más.';if(!(y>0))e.y='Escribe un plazo mayor que cero.';if(!(a>=0)||!Number.isFinite(a))e.a='Escribe una aportación de 0 o más.';
  const ok=!Object.keys(e).length;let tf=0,aport=0;if(ok){tf=c*Math.pow(1+r/100/n,n*y);const rm=Math.pow(1+r/100/n,n/12)-1;aport=a>0?(rm===0?a*12*y:a*(Math.pow(1+rm,12*y)-1)/rm):0}
  return html`<div className="grid g2"><div className="card col"><${NumF} id="cc-c" k="c" l="Capital inicial" f=${f} setF=${setF} err=${e.c}/><${NumF} id="cc-r" k="r" l="Tasa anual %" f=${f} setF=${setF} err=${e.r}/><${NumF} id="cc-y" k="y" l="Años" f=${f} setF=${setF} err=${e.y}/>
    <${Field} label="Capitalización" id="cc-n"><select id="cc-n" value=${f.n} onChange=${ev=>setF({...f,n:ev.target.value})}><option value="1">Anual</option><option value="2">Semestral</option><option value="4">Trimestral</option><option value="12">Mensual</option></select><//><${NumF} id="cc-a" k="a" l="Aportación mensual (opcional)" f=${f} setF=${setF} err=${e.a}/></div>
  <div className="card col">${ok?html`<${Res} big l="Valor final" v=${fmt2(tf+aport)}/><${Res} l="Aportaciones totales" v=${fmt2(c+a*12*y)}/><${Res} l="Intereses ganados" v=${fmt2(tf+aport-c-a*12*y)}/>`:html`<${Empty} title="Faltan datos" text="Corrige los campos marcados."/>`}<div className="muted xs">Resultado hipotético. No garantiza rendimientos.</div></div></div>`}
function CalcAhorro(){const [f,setF]=useState({t:'20000',m:'10',r:'7'});const t=num(f.t),m=num(f.m),r=num(f.r);const e={};
  if(!(t>0))e.t='La meta debe ser mayor que cero.';if(!(m>=1)||m>600)e.m='Escribe entre 1 y 600 meses.';if(!Number.isFinite(r)||r<0||r>60)e.r='Escribe una tasa entre 0 y 60.';const ok=!Object.keys(e).length,p=ok?pmtNeeded(t,m/12,r):0;
  return html`<div className="grid g2"><div className="card col"><${NumF} id="ca-t" k="t" l="Meta de ahorro" f=${f} setF=${setF} err=${e.t}/><${NumF} id="ca-m" k="m" l="Meses" f=${f} setF=${setF} err=${e.m}/><${NumF} id="ca-r" k="r" l="Rendimiento anual % (0 si no ganas)" f=${f} setF=${setF} err=${e.r}/></div>
  <div className="card col">${ok?html`<${Res} big l="Ahorro mensual necesario" v=${fmt2(p)}/><${Res} l="Aportarás en total" v=${fmt2(p*m)}/>`:html`<${Empty} title="Faltan datos" text="Corrige los campos marcados."/>`}</div></div>`}
function CalcInfl(){const [f,setF]=useState({a:'10000',i:'4',y:'10'});const a=num(f.a),i=num(f.i),y=num(f.y);const e={};
  if(!(a>0))e.a='Escribe un monto mayor que cero.';if(!Number.isFinite(i)||i<-10||i>100)e.i='Escribe una inflación entre −10 y 100.';if(!(y>0)||y>80)e.y='Escribe entre 1 y 80 años.';const ok=!Object.keys(e).length;
  return html`<div className="grid g2"><div className="card col"><${NumF} id="ci-a" k="a" l="Monto de hoy" f=${f} setF=${setF} err=${e.a}/><${NumF} id="ci-i" k="i" l="Inflación anual %" f=${f} setF=${setF} err=${e.i}/><${NumF} id="ci-y" k="y" l="Años" f=${f} setF=${setF} err=${e.y}/></div>
  <div className="card col">${ok?html`<${Res} big l=${`Lo que costará en ${f.y} años lo que hoy cuesta ${fmt(a)}`} v=${fmt(a*Math.pow(1+i/100,y))}/><${Res} l=${`Lo que valdrán ${fmt(a)} en poder de compra de hoy`} v=${fmt(a/Math.pow(1+i/100,y))}/><${Res} l="Poder adquisitivo perdido" v=${pc((1-1/Math.pow(1+i/100,y))*100)}/>`:html`<${Empty} title="Faltan datos" text="Corrige los campos marcados."/>`}</div></div>`}
function CalcDeuda(){const [f,setF]=useState({b:'8500',r:'42',p:'900'});const b=num(f.b),r=num(f.r),p=num(f.p);const e={};
  if(!(b>0))e.b='Escribe un saldo mayor que cero.';if(!Number.isFinite(r)||r<0||r>300)e.r='Escribe una tasa entre 0 y 300.';if(!(p>0))e.p='Escribe un pago mayor que cero.';const ok=!Object.keys(e).length;
  const rm=r/100/12,never=ok&&p<=b*rm+0.005,n=ok&&!never?(rm===0?b/p:-Math.log(1-rm*b/p)/Math.log(1+rm)):0;
  return html`<div className="grid g2"><div className="card col"><${NumF} id="cd-b" k="b" l="Saldo de la deuda" f=${f} setF=${setF} err=${e.b}/><${NumF} id="cd-r" k="r" l="Tasa anual %" f=${f} setF=${setF} err=${e.r}/><${NumF} id="cd-p" k="p" l="Pago mensual" f=${f} setF=${setF} err=${e.p}/></div>
  <div className="card col">${!ok?html`<${Empty} title="Faltan datos" text="Corrige los campos marcados."/>`:never?html`<${Banner} k="r" ic="warn">Con ${fmt(p)} al mes no alcanzas a cubrir ni los intereses (${fmt(b*rm)} al mes). Sube tu pago.<//>`:html`<${Res} big l="Tiempo para liquidar" v=${fmtMonths(Math.ceil(n))}/><${Res} l="Intereses totales" v=${fmt2(p*n-b)}/><${Res} l="Total pagado" v=${fmt2(p*n)}/>`}</div></div>`}
function Calculadoras(){
  const [t,setT]=useTab('calculadoras','simple');
  return html`<div className="page"><${Head} title="Calculadoras" sub="Herramientas rápidas para entender tus números. Resultados hipotéticos."/>
    <${Tabs} opts=${[['simple','Interés simple'],['comp','Interés compuesto'],['ahorro','Ahorro'],['infl','Inflación'],['deuda','Deuda']]} val=${t} on=${setT}/>
    ${t==='simple'?html`<${CalcSimple}/>`:t==='comp'?html`<${CalcComp}/>`:t==='ahorro'?html`<${CalcAhorro}/>`:t==='infl'?html`<${CalcInfl}/>`:html`<${CalcDeuda}/>`}</div>`;
}

/* ================= AYUDA ================= */
function Ayuda(){
  const {go,replayTutorial}=useApp();const [q,setQ]=useState(''),[op,setOp]=useState(0);
  const list=FAQ.filter(([a,b])=>!q.trim()||norm(a+' '+b).includes(norm(q)));
  return html`<div className="page"><${Head} title="Centro de ayuda" sub="Preguntas frecuentes sobre el prototipo."/>
    <div className="card col"><${Field} label="Buscar en la ayuda" id="h-q"><input id="h-q" placeholder="Ej. datos, racha, IA…" value=${q} onChange=${e=>setQ(e.target.value)}/><//>
      ${list.length?html`<div className="acc">${list.map(([a,b],i)=>html`<div key=${a}><button aria-expanded=${op===i} onClick=${()=>setOp(op===i?-1:i)}>${a}<span style=${{transform:op===i?'rotate(180deg)':'',transition:'transform .2s'}}><${Ic} n="chev" s=${18}/></span></button>${op===i?html`<p>${b}</p>`:null}</div>`)}</div>`:html`<${Empty} title="Sin resultados" text="Prueba con otra palabra."/>`}</div>
    <div className="row"><button className="btn" onClick=${replayTutorial}>Ver tutorial de bienvenida</button><button className="btn" onClick=${()=>go('perfil')}>Ir a Perfil</button></div></div>`;
}
