
/* ================= CUENTAS Y SESIÓN =================
   Sin servidor: cada cuenta vive solo en el localStorage de este dispositivo.
   El PIN (4 dígitos) se guarda como SHA-256 con sal; nunca se guarda ni se envía en claro. */
const ACC_KEY='finova_cuentas_v1',SES_KEY='finova_sesion',UKEY=id=>'finova_u_'+id;
const DEFAULT_ACCOUNTS=[
  {id:'rivera',name:'Familia Rivera',kind:'caso',demoPin:'2026'},
  {id:'rodrigo',name:'Rodrigo Demo',kind:'demo',demoPin:null}];
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};

function listAccounts(){try{const a=JSON.parse(lsGet(ACC_KEY));return Array.isArray(a)?a:[]}catch(e){return []}}
function saveAccounts(a){lsSet(ACC_KEY,JSON.stringify(a))}
function getSession(){try{return sessionStorage.getItem(SES_KEY)}catch(e){return null}}
function setSession(id){try{id?sessionStorage.setItem(SES_KEY,id):sessionStorage.removeItem(SES_KEY)}catch(e){}}

const toHex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function hashPin(pin,salt){
  const txt=salt+':'+pin;
  if(window.crypto&&crypto.subtle){return toHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)))}
  // Respaldo solo para navegadores sin crypto.subtle (demo): hash no criptográfico.
  let h=5381;for(const ch of txt)h=((h<<5)+h+ch.charCodeAt(0))>>>0;return 'djb2-'+h.toString(16);
}
const newSalt=()=>{const a=new Uint8Array(16);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256|0)}).getRandomValues(a);return toHex(a)};
async function makePin(pin){if(!pin)return null;const salt=newSalt();return {salt,hash:await hashPin(pin,salt)}}
async function verifyPin(acc,pin){if(!acc.pin)return true;return (await hashPin(pin,acc.pin.salt))===acc.pin.hash}
const validPin=p=>/^\d{4}$/.test(p||'');

function seedFor(acc){return acc.kind==='caso'?seedRivera():acc.kind==='demo'?seed():seedEmpty(acc.name,acc.income)}
function loadUserState(acc){
  try{const raw=lsGet(UKEY(acc.id));if(raw){const o=JSON.parse(raw);if(o&&o.v===1&&Array.isArray(o.tx)){const b=seedFor(acc),r={...b,...o};if(b.plan)r.plan=b.plan;return r}}}catch(e){}
  return seedFor(acc);
}
function saveUserState(id,s){lsSet(UKEY(id),JSON.stringify(s))}

/* Crea las cuentas de la demo y migra los datos de la versión anterior (una sola cuenta). */
async function ensureDefaults(){
  const a=listAccounts();let changed=false;
  for(const d of DEFAULT_ACCOUNTS){
    if(!a.some(x=>x.id===d.id)){a.push({id:d.id,name:d.name,kind:d.kind,pin:await makePin(d.demoPin),created:todayS()});changed=true}
  }
  const legacy=lsGet(KEY);
  if(legacy&&!lsGet(UKEY('rodrigo'))){lsSet(UKEY('rodrigo'),legacy);lsDel(KEY)}
  if(changed)saveAccounts(a);
  return a;
}
async function createAccount({name,income,pin}){
  const id='u'+uid();
  const acc={id,name,kind:'propia',income,pin:await makePin(pin),created:todayS()};
  acc.notice=newAcceptance();
  // El estado inicial se obtiene con seedFor al abrir el perfil por primera vez.
  const latest=listAccounts();latest.push(acc);localStorage.setItem(ACC_KEY,JSON.stringify(latest));return acc;
}
function deleteAccount(id){saveAccounts(listAccounts().filter(x=>x.id!==id));lsDel(UKEY(id));if(getSession()===id)setSession(null)}
async function setAccountPin(id,pin){const a=listAccounts(),i=a.findIndex(x=>x.id===id);if(i<0)return;a[i]={...a[i],pin:await makePin(pin)};saveAccounts(a)}
function renameAccount(id,name){const a=listAccounts(),i=a.findIndex(x=>x.id===id);if(i<0)return;a[i]={...a[i],name};saveAccounts(a)}
const initials=n=>String(n||'?').split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();
