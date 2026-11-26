
/* ================= ENTRADA: PERFILES Y PIN LOCAL ================= */
const KIND_LABEL={caso:['Caso de la consultora','b'],demo:['Usuario de prueba','b'],propia:['Tu cuenta','']};
function Login({onEnter}){
  const [accs,setAccs]=useState(()=>listAccounts()),[sel,setSel]=useState(null),[mode,setMode]=useState('list');
  const order={caso:0,demo:1,propia:2},list=[...accs].sort((a,b)=>order[a.kind]-order[b.kind]);
  const pick=acc=>{if(!acc.pin){onEnter(acc);return}setSel(acc);setMode('pin')};
  return html`<div className="login"><div className="login-in">
    <div className="login-brand"><img className="day-logo" src="assets/logo/finova-logo-horizontal.svg" alt="FINOVA"/><img className="night-logo" src="assets/logo/finova-logo-horizontal-oscuro.svg" alt="FINOVA"/></div>
    ${mode==='list'?html`<div className="col" style=${{gap:18}}>
      <div><h1>¿Quién va a usar FINOVA?</h1><p className="muted" style=${{marginTop:4}}>Elige tu perfil o crea una cuenta. Cada cuenta tiene sus propios datos y su propio plan.</p></div>
      <div className="acc-grid">${list.map(a=>{const [lbl,k]=KIND_LABEL[a.kind]||KIND_LABEL.propia,dp=(DEFAULT_ACCOUNTS.find(d=>d.id===a.id)||{}).demoPin;
        return html`<button key=${a.id} className=${a.kind==='caso'?'acc case':'acc'} onClick=${()=>pick(a)} aria-label=${'Entrar como '+a.name}>
          <div className="acc-av">${initials(a.name)}</div>
          <div className="acc-n">${a.name}</div>
          <span className=${'pill '+k}>${lbl}</span>
          <div className="muted xs acc-pin">${a.pin?html`<${Ic} n="lock" s=${13}/> Protegido con PIN${dp?` · PIN de demo: ${dp}`:''}`:'Sin PIN'}</div></button>`})}
        <button className="acc acc-new" onClick=${()=>setMode('create')}><div className="acc-av"><${Ic} n="plus" s=${26}/></div><div className="acc-n">Crear cuenta</div></button>
      </div></div>`:null}
    ${mode==='pin'&&sel?html`<${PinEntry} acc=${sel} onOk=${()=>onEnter(sel)} onBack=${()=>{setSel(null);setMode('list')}}/>`:null}
    ${mode==='create'?html`<${CreateAccount} onCancel=${()=>setMode('list')} onDone=${acc=>{setAccs(listAccounts());onEnter(acc)}}/>`:null}
    <div className="login-trust"><${Ic} n="lock" s=${18}/><div><b>Tus datos se guardan solo en este dispositivo.</b> No hay servidor ni conexión a bancos. El PIN se guarda cifrado y FINOVA nunca pide contraseñas reales ni datos bancarios. <${Demo} t="Prototipo"/></div></div>
  </div></div>`;
}
function PinEntry({acc,onOk,onBack}){
  const [pin,setPin]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const submit=async e=>{if(e)e.preventDefault();if(!validPin(pin)){setErr('El PIN tiene 4 dígitos.');return}
    setBusy(true);const ok=await verifyPin(acc,pin);setBusy(false);
    if(ok)onOk();else{setErr('PIN incorrecto. Intenta de nuevo.');setPin('')}};
  const dp=(DEFAULT_ACCOUNTS.find(d=>d.id===acc.id)||{}).demoPin;
  return html`<form className="card col pin-card" onSubmit=${submit} noValidate>
    <div className="row" style=${{gap:12,flexWrap:'nowrap'}}><div className="acc-av" style=${{width:48,height:48,fontSize:17}}>${initials(acc.name)}</div><div><div className="b" style=${{fontSize:18}}>${acc.name}</div><div className="muted sm">Escribe tu PIN de 4 dígitos</div></div></div>
    <${Field} label="PIN" id="pin-in" err=${err} hint=${dp?`PIN de demostración: ${dp}`:null}><input id="pin-in" type="password" inputMode="numeric" autoComplete="off" maxLength="4" placeholder="••••" className=${'pin-in '+(err?'bad':'')} value=${pin} onChange=${e=>{setPin(e.target.value.replace(/\D/g,'').slice(0,4));setErr('')}} autoFocus/><//>
    <div className="row sp"><button type="button" className="btn" onClick=${onBack}>Cambiar de perfil</button><button type="submit" className="btn pri" disabled=${busy}><${Ic} n="lock" s=${16}/>Entrar</button></div>
  </form>`;
}
function CreateAccount({onCancel,onDone}){
  const [f,setF]=useState({name:'',inc:'',pin:'',pin2:''}),[er,setEr]=useState({}),[busy,setBusy]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const submit=async e=>{e.preventDefault();const x={},i=num(f.inc);
    if(!f.name.trim())x.name='Escribe tu nombre.';else if(f.name.trim().length>40)x.name='Máximo 40 caracteres.';
    if(!Number.isFinite(i)||i<=0)x.inc='Escribe tu ingreso mensual (mayor que cero).';else if(i>10000000)x.inc='El monto es demasiado grande.';
    if(f.pin&&!validPin(f.pin))x.pin='El PIN debe tener exactamente 4 dígitos.';
    if(f.pin&&f.pin!==f.pin2)x.pin2='Los PIN no coinciden.';
    setEr(x);if(Object.keys(x).length)return;
    setBusy(true);const acc=await createAccount({name:f.name.trim(),income:i,pin:f.pin||null});setBusy(false);onDone(acc)};
  const dig=k=>e=>set(k,e.target.value.replace(/\D/g,'').slice(0,4));
  return html`<form className="card col pin-card" onSubmit=${submit} noValidate>
    <div><h2>Crea tu cuenta</h2><p className="muted sm" style=${{marginTop:4}}>Solo pedimos lo necesario para armar tu presupuesto. Nada sale de este dispositivo.</p></div>
    <div className="form">
      <${Field} label="Nombre" id="ca-n" err=${er.name} cls="full"><input id="ca-n" maxLength="40" placeholder="Ej. Ana López" className=${er.name?'bad':''} value=${f.name} onChange=${e=>set('name',e.target.value)} autoFocus/><//>
      <${Field} label="Ingreso mensual (MXN)" id="ca-i" err=${er.inc} cls="full"><input id="ca-i" type="number" inputMode="decimal" min="0" placeholder="Ej. 18000" className=${er.inc?'bad':''} value=${f.inc} onChange=${e=>set('inc',e.target.value)}/><//>
      <${Field} label="PIN de 4 dígitos (opcional)" id="ca-p" err=${er.pin} hint="Protege tu perfil en este dispositivo."><input id="ca-p" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" placeholder="••••" className=${er.pin?'bad':''} value=${f.pin} onChange=${dig('pin')}/><//>
      <${Field} label="Confirma tu PIN" id="ca-p2" err=${er.pin2}><input id="ca-p2" type="password" inputMode="numeric" autoComplete="new-password" maxLength="4" placeholder="••••" disabled=${!f.pin} className=${er.pin2?'bad':''} value=${f.pin2} onChange=${dig('pin2')}/><//>
    </div>
    <div className="row sp"><button type="button" className="btn" onClick=${onCancel}>Volver</button><button type="submit" className="btn pri" disabled=${busy}>Crear cuenta y entrar</button></div>
  </form>`;
}
