/* Aviso y permisos del prototipo académico. */
const NOTICE_VERSION='2026-11-26';
const FISCAL_PERMISSION='sat-demo-v1';
const newAcceptance=()=>({version:NOTICE_VERSION,at:new Date().toISOString()});
const acceptedNotice=a=>a?.notice?.version===NOTICE_VERSION&&Boolean(a.notice.at);
const fiscalAllowed=s=>s?.fiscal?.permission===FISCAL_PERMISSION&&s.fiscal.conectado===true;
const privacyDate=iso=>new Date(iso).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'});
function recordPrivacy(s,action){
  s.privacyEvents=[...(s.privacyEvents||[]),{action,at:new Date().toISOString(),scope:FISCAL_PERMISSION}].slice(-30);
}
function NoticeText(){
  return html`<details className="notice-text"><summary>Leer el aviso completo</summary>
    <div className="col sm"><p><b>Responsable del prototipo.</b> Equipo 6 · Proyecto académico FINOVA. Versión ${NOTICE_VERSION}.</p>
    <p><b>Qué usamos y para qué.</b> El nombre del perfil permite identificarlo en este navegador. Ingresos, gastos, deudas, metas y movimientos permiten calcular presupuestos, recomendaciones y escenarios. Se conserva también el progreso de las lecciones y del asistente local.</p>
    <p><b>Dónde se guardan.</b> Los datos del perfil permanecen en el almacenamiento de este navegador hasta que elimines la cuenta o borres los datos del sitio. El PIN opcional controla el acceso desde la interfaz; no cifra los movimientos. En un equipo compartido, cierra tu sesión.</p>
    <p><b>Servicios externos.</b> Netlify sirve el sitio y el navegador solicita fuentes y bibliotecas a proveedores externos. FINOVA no envía tus movimientos a bancos ni al SAT. Usa solo datos de ejemplo.</p>
    <p><b>Permiso fiscal opcional.</b> La simulación usa información ficticia y analiza los movimientos de tu perfil. Puedes retirar el permiso en Perfil. Los movimientos y abonos que hayas confirmado permanecen en tu presupuesto.</p>
    <p><b>Tus controles.</b> En Perfil puedes corregir tus datos, copiar una exportación, consultar la actividad de privacidad o eliminar tu cuenta propia. Los perfiles de ejemplo se pueden restaurar. Una exportación que copies queda bajo tu control.</p></div></details>`;
}
function NoticeChoice({checked,onChange}){
  return html`<div className="col"><p>FINOVA usa los datos de este perfil para calcular tu presupuesto y simular tu plan. Los guarda en este navegador. La simulación fiscal pide un permiso aparte.</p>
    <${NoticeText}/><label className="notice-check"><input id="notice-check" type="checkbox" checked=${checked} onChange=${e=>onChange(e.target.checked)}/>He leído y acepto el aviso de privacidad</label></div>`;
}
function NoticeGate({account,onDone,onExit}){
  const [checked,setChecked]=useState(false),[error,setError]=useState('');
  const accept=()=>{if(!checked)return;try{
    const accounts=listAccounts(),entry=accounts.find(a=>a.id===account.id);
    if(!entry)throw Error();entry.notice=newAcceptance();
    localStorage.setItem(ACC_KEY,JSON.stringify(accounts));onDone(entry);
  }catch{setError('No se pudo guardar tu aceptación. Habilita el almacenamiento de este sitio y vuelve a intentar.')}};
  return html`<main className="login"><section className="card col notice-gate"><h1>Tu privacidad en FINOVA</h1><p className="muted sm">${account.name}</p><${NoticeChoice} checked=${checked} onChange=${setChecked}/>
    ${error&&html`<p className="err" role="alert">${error}</p>`}<div className="row sp"><button className="btn" onClick=${onExit}>Salir</button><button className="btn pri" id="notice-accept" disabled=${!checked} onClick=${accept}>Aceptar y continuar</button></div></section></main>`;
}
function revokeFiscal({ask,changePrivacy}){
  ask({title:'¿Retirar el permiso fiscal?',text:'Se borrarán el RFC de demo, los permisos y el historial fiscal de este perfil. Los movimientos y abonos ya registrados se conservan.',yes:'Desconectar y borrar',onYes:()=>changePrivacy(d=>{delete d.fiscal;recordPrivacy(d,'Permiso fiscal retirado')},'Se retiró el permiso fiscal')});
}
function PrivacySummary({account}){
  const ctx=useApp(),{s,go}=ctx;
  const events=[{action:'Aviso aceptado',scope:account.notice.version,at:account.notice.at},...(s.privacyEvents||[])].sort((a,b)=>b.at.localeCompare(a.at));
  return html`<div className="col"><p className="muted sm">Aviso ${account.notice.version} · Aceptado el ${privacyDate(account.notice.at)}</p><${NoticeText}/>
    <div><b>Simulación fiscal</b><p className="sm">${fiscalAllowed(s)?'Autorizada para analizar deducciones y simular devoluciones.':'Sin autorización vigente.'}</p></div>
    <div>${s.fiscal?html`<button className="btn" onClick=${()=>revokeFiscal(ctx)}>Retirar permiso y borrar datos fiscales</button>`:html`<button className="btn" onClick=${()=>go('impuestos')}>Ver permiso fiscal</button>`}</div>
    <details className="notice-text"><summary>Actividad de privacidad</summary><ul>${events.map((e,i)=>html`<li key=${i}>${e.action} · ${privacyDate(e.at)} <span className="muted xs">${e.scope}</span></li>`)}</ul></details></div>`;
}
function PinChallenge({account,title,onClose,onVerified}){
  const [pin,setPin]=useState(''),[error,setError]=useState('');
  const verify=async e=>{e.preventDefault();const current=listAccounts().find(a=>a.id===account.id);
    if(!current?.pin||!validPin(pin)||!await verifyPin(current,pin)){setError('PIN incorrecto. Intenta de nuevo.');return}
    onVerified()};
  return html`<${Modal} title=${title} onClose=${onClose}><form className="col" onSubmit=${verify}><${Field} label="Confirma tu PIN actual" id="privacy-pin" err=${error}><input id="privacy-pin" type="password" inputMode="numeric" maxLength="4" autoFocus value=${pin} onChange=${e=>setPin(e.target.value)}/><//>
    <div className="mf"><button className="btn" type="button" onClick=${onClose}>Cancelar</button><button className="btn pri" type="submit">Verificar PIN</button></div></form><//>`;
}

