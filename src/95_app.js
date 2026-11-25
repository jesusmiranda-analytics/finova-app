/* ================= APP ================= */
const NAV=[['inicio','Inicio','Inicio','home'],['mexico','México hoy','México','globe'],['finanzas','Mis finanzas','Finanzas','wallet'],['asistente','Asistente IA','IA','chat'],['inversiones','Inversiones','Invertir','chart'],['academia','Academia','Academia','book'],['perfil','Perfil','Perfil','user']];
const ROUTES={inicio:Inicio,mexico:Mexico,finanzas:Finanzas,asistente:Asistente,inversiones:Inversiones,academia:Academia,perfil:Perfil,calculadoras:Calculadoras,ayuda:Ayuda};
const ROUTE_NAMES={inicio:'Inicio',mexico:'México hoy',finanzas:'Mis finanzas',asistente:'Asistente IA',inversiones:'Inversiones',academia:'Academia',perfil:'Perfil',calculadoras:'Calculadoras',ayuda:'Centro de ayuda'};
function applyTheme(t){const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme')}

const TUT=[['wallet','Bienvenido a FINOVA','Tu dinero. Tus decisiones. Tu futuro. Este es un prototipo de demostración con el usuario Rodrigo Demo y datos de ejemplo.'],
 ['plus','Registra y entiende tu dinero','En Mis finanzas registras ingresos y gastos, ves tus hábitos, defines presupuestos, metas y comparas formas de pagar deudas.'],
 ['globe','Conoce México hoy','Cada indicador trae una explicación sencilla y una gráfica histórica. Recuerda: son datos de demostración.'],
 ['chart','Simula inversiones','Arma un portafolio, cambia los rendimientos supuestos y mira el interés compuesto. Es una simulación educativa.'],
 ['book','Aprende y gana XP','Completa lecciones, mantén tu racha y consigue insignias. Todo se guarda en este navegador y puedes restaurar la demo en Perfil.']];
function Tutorial({onClose}){
  const [i,setI]=useState(0),t=TUT[i];
  return html`<${Modal} title=${t[1]} onClose=${onClose}><div style=${{color:'var(--green-ink)'}}><${Ic} n=${t[0]} s=${40}/></div><p>${t[2]}</p>
    <div className="step">${TUT.map((_,k)=>html`<i key=${k} className=${k===i?'on':''}></i>`)}</div>
    <div className="mf"><button className="btn gh" onClick=${onClose}>Saltar tutorial</button>${i>0?html`<button className="btn" onClick=${()=>setI(i-1)}>Atrás</button>`:null}<button className="btn pri" onClick=${()=>i<TUT.length-1?setI(i+1):onClose()}>${i<TUT.length-1?'Siguiente':'Empezar'}</button></div><//>`;
}

function App(){
  const [s,setS]=useState(loadState),[route,setRoute]=useState(()=>{const h=(location.hash||'').slice(1);return ROUTES[h]?h:'inicio'});
  const [hint,setHint]=useState(null),[toasts,setToasts]=useState([]),[txm,setTxm]=useState(null),[conf,setConf]=useState(null),[tut,setTut]=useState(false),[nOpen,setNOpen]=useState(false),[q,setQ]=useState(''),[,setTick]=useState(0);
  const first=useRef(true);
  const upd=f=>setS(p=>{const n=JSON.parse(JSON.stringify(p));f(n);return n});
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}},[s]);
  useEffect(()=>{if(first.current){first.current=false;applyTheme(s.user.theme);if(!s.user.tutorialDone)setTut(true)}},[]);
  useEffect(()=>{const mq=window.matchMedia('(prefers-color-scheme: dark)');const h=()=>setTick(t=>t+1);mq.addEventListener?mq.addEventListener('change',h):mq.addListener(h);
    const hc=()=>{const r=location.hash.slice(1);if(ROUTES[r])setRoute(r)};window.addEventListener('hashchange',hc);return()=>{window.removeEventListener('hashchange',hc)}},[]);
  const toast=(msg,kind)=>{const id=uid();setToasts(t=>[...t,{id,msg,kind}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2800)};
  const go=(r,tab)=>{if(!ROUTES[r])return;setRoute(r);setHint({route:r,tab,n:Date.now()});setNOpen(false);setQ('');try{history.replaceState(null,'','#'+r)}catch(e){}window.scrollTo(0,0)};
  const setTheme=t=>{applyTheme(t);upd(d=>{d.user.theme=t})};
  const reset=()=>{try{localStorage.removeItem(KEY)}catch(e){}const n=seed();applyTheme('auto');setS({...n,user:{...n.user,tutorialDone:true}});toast('Datos de demostración restaurados','ok');go('inicio')};
  // insignias nuevas
  const eb=earnedBadges(s).join(',');
  useEffect(()=>{const have=s.academy.badges,neu=earnedBadges(s).filter(b=>!have.includes(b));
    if(neu.length){upd(d=>{neu.forEach(b=>{d.academy.badges.push(b);d.academy.xp+=25})});neu.forEach(b=>toast(`Insignia: ${BADGES.find(x=>x.id===b).name} (+25 XP)`,'ok'))}},[eb]);
  const ctx={s,upd,toast,go,hint,openTx:(d)=>setTxm({defType:typeof d==='string'?d:undefined}),ask:setConf,reset,setTheme,replayTutorial:()=>setTut(true)};
  const Page=ROUTES[route];
  const notifs=notifications(s),unread=notifs.filter(n=>!s.notifRead.includes(n.id));
  const results=useMemo(()=>{
    const k=norm(q);if(k.length<2)return [];const out=[];const add=(ic,t,sub,fn)=>out.push({ic,t,sub,fn});
    Object.entries(ROUTE_NAMES).forEach(([r,n])=>{if(norm(n).includes(k))add('home',n,'Sección',()=>go(r))});
    s.tx.filter(t=>norm(t.cat+' '+(t.note||'')).includes(k)).slice(0,4).forEach(t=>add('wallet',`${t.cat}: ${fmt(t.amount)}`,`${t.type==='gasto'?'Gasto':'Ingreso'} · ${fdate(t.date)}`,()=>go('finanzas','movimientos')));
    s.goals.filter(g=>norm(g.name).includes(k)).forEach(g=>add('flag',g.name,'Meta',()=>go('finanzas','metas')));
    s.debts.filter(g=>norm(g.name).includes(k)).forEach(g=>add('trend',g.name,'Deuda',()=>go('finanzas','deudas')));
    IND.filter(i=>norm(i.name).includes(k)).forEach(i=>add('globe',i.name,'Indicador (demo)',()=>go('mexico')));
    ASSETS.filter(a=>norm(a.name+' '+a.desc).includes(k)).forEach(a=>add('chart',a.name,'Instrumento',()=>go('inversiones','catalogo')));
    ALL_LESSONS.filter(l=>norm(l.title).includes(k)).forEach(l=>add('book',l.title,'Lección',()=>go('academia')));
    FAQ.filter(([a,b])=>norm(a+b).includes(k)).slice(0,3).forEach(([a])=>add('help',a,'Ayuda',()=>go('ayuda')));
    return out.slice(0,10);
  },[q,s.tx,s.goals,s.debts]);
  const readAll=()=>upd(d=>{d.notifRead=[...new Set([...d.notifRead,...notifs.map(n=>n.id)])]});
  const dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  return html`<${Ctx.Provider} value=${ctx}>
    <div className="app">
      <aside className="side"><div className="brand"><div className="logo">F</div>FINOVA</div><div className="slogan">Tu dinero. Tus decisiones. Tu futuro.</div>
        ${NAV.map(([r,l,,ic])=>html`<button key=${r} className=${'nav '+(route===r?'on':'')} aria-current=${route===r?'page':undefined} onClick=${()=>go(r)}><${Ic} n=${ic}/>${l}</button>`)}
        <hr/><button className=${'nav '+(route==='calculadoras'?'on':'')} onClick=${()=>go('calculadoras')}><${Ic} n="calc"/>Calculadoras</button><button className=${'nav '+(route==='ayuda'?'on':'')} onClick=${()=>go('ayuda')}><${Ic} n="help"/>Centro de ayuda</button>
        <div className="demo-note"><b style=${{color:'#fff'}}>Modo demostración</b><br/>Usuario: ${s.user.name}. Todo es simulado y se guarda solo en este navegador.</div></aside>
      <div className="main">
        <header className="top"><div className="wrap">
          <div className="searchbox"><span className="ico"><${Ic} n="search" s=${18}/></span><input aria-label="Buscar en FINOVA" placeholder="Buscar movimientos, metas, lecciones…" value=${q} onChange=${e=>setQ(e.target.value)} onKeyDown=${e=>{if(e.key==='Escape')setQ('')}}/>
            ${q.trim().length>=2?html`<div className="results" role="listbox">${results.length?results.map((r,i)=>html`<button key=${i} onClick=${r.fn}><${Ic} n=${r.ic} s=${18}/><span><b>${r.t}</b><br/><span className="muted xs">${r.sub}</span></span></button>`):html`<div className="muted sm" style=${{padding:12}}>Sin resultados para "${q}".</div>`}</div>`:null}</div>
          <div className="rel"><button className="ib" aria-label=${`Notificaciones (${unread.length} sin leer)`} aria-expanded=${nOpen} onClick=${()=>setNOpen(!nOpen)}><${Ic} n="bell"/>${unread.length?html`<span className="dot">${unread.length}</span>`:null}</button>
            ${nOpen?html`<div className="notif"><div className="row sp" style=${{padding:'6px 8px'}}><b>Notificaciones</b><button className="btn gh sm" onClick=${readAll}>Marcar leídas</button></div>${notifs.map(n=>html`<button key=${n.id} className=${'ni '+(s.notifRead.includes(n.id)?'':'unread')} onClick=${()=>{upd(d=>{if(!d.notifRead.includes(n.id))d.notifRead.push(n.id)});go(n.go[0],n.go[1])}}>
              <span className=${'pill '+(n.k==='b'?'b':n.k)} style=${{padding:6}}><${Ic} n=${n.ic} s=${16}/></span><span><b>${n.t}</b><br/><span className="muted sm">${n.x}</span></span></button>`)}</div>`:null}</div>
          <button className="ib hide-m" aria-label="Calculadoras" onClick=${()=>go('calculadoras')}><${Ic} n="calc"/></button>
          <button className="ib hide-m" aria-label="Centro de ayuda" onClick=${()=>go('ayuda')}><${Ic} n="help"/></button>
          <button className="ib" aria-label=${dark?'Cambiar a tema claro':'Cambiar a tema oscuro'} onClick=${()=>setTheme(dark?'light':'dark')}><${Ic} n=${dark?'sun':'moon'}/></button>
        </div></header>
        <div className="wrap"><${Page} key=${route}/></div>
      </div>
    </div>
    <nav className="bottom" aria-label="Navegación principal">${NAV.map(([r,,l,ic])=>html`<button key=${r} className=${route===r?'on':''} aria-current=${route===r?'page':undefined} onClick=${()=>go(r)}><${Ic} n=${ic} s=${22}/>${l}</button>`)}</nav>
    <div className="toasts" aria-live="polite">${toasts.map(t=>html`<div key=${t.id} className=${'toast '+(t.kind||'')}>${t.msg}</div>`)}</div>
    ${txm?html`<${TxForm} defType=${txm.defType} onClose=${()=>setTxm(null)}/>`:null}
    ${conf?html`<${Confirm} c=${conf} onClose=${()=>setConf(null)}/>`:null}
    ${tut?html`<${Tutorial} onClose=${()=>{setTut(false);upd(d=>{d.user.tutorialDone=true})}}/>`:null}
  <//>`;
}
if(!window.React||!window.ReactDOM||!window.Recharts||!window.htm){document.getElementById('root').textContent='No se pudieron cargar las bibliotecas de la demostración. Recarga la página.'}
else ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
})();
</script>
