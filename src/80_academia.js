/* ================= ACADEMIA ================= */
function Player({lesson,daily,onClose}){
  const {s,upd,toast,go}=useApp();
  const n=lesson.ex.length;
  const [i,setI]=useState(daily?0:-1),[pick,setPick]=useState(null),[txt,setTxt]=useState(''),[res,setRes]=useState(null),[right,setRight]=useState(0),[gain,setGain]=useState(0),[er,setEr]=useState(''),done=useRef(false);
  const ex=lesson.ex[i],xk=e=>daily?e.id+'@'+todayS():e.id;
  const answered=ex&&(ex.t==='mc'||ex.t==='tf'?pick!==null:txt.trim()!=='');
  const check=()=>{
    if(!answered){setEr('Elige o escribe una respuesta.');return}
    let ok=false;
    if(ex.t==='mc'||ex.t==='tf')ok=pick===ex.a;
    else if(ex.t==='fill')ok=ex.a.some(a=>norm(a)===norm(txt));
    else{const v=num(txt);if(!Number.isFinite(v)){setEr('Escribe un número válido.');return}ok=Math.abs(v-ex.a)<=(ex.tol||0)+1e-9}
    setEr('');
    let g=0;
    upd(d=>{const A=d.academy;if(!A.days.includes(todayS()))A.days.push(todayS());if(ok&&!A.correct.includes(xk(ex))){A.correct.push(xk(ex));A.xp+=10;g=10}});
    if(ok&&!s.academy.correct.includes(xk(ex)))setGain(x=>x+10);
    if(ok)setRight(r=>r+1);
    setRes({ok});
  };
  const next=()=>{setRes(null);setPick(null);setTxt('');setEr('');setI(i+1)};
  const finished=i>=n;
  useEffect(()=>{
    if(!finished||done.current)return;done.current=true;
    const score=Math.round(right/n*100);
    upd(d=>{const A=d.academy;
      if(daily){A.daily[todayS()]=true;if(right>0)A.xp+=5}
      else{const first=!A.log.some(l=>l.lesson===lesson.id);A.log.push({lesson:lesson.id,date:todayS(),score});if(first){A.xp+=20;}}
      if(!A.days.includes(todayS()))A.days.push(todayS())});
    if(!daily&&!s.academy.log.some(l=>l.lesson===lesson.id))setGain(x=>x+20);
    if(daily&&right>0)setGain(x=>x+5);
  },[finished]);
  const correctText=!ex?'':ex.t==='mc'?ex.o[ex.a]:ex.t==='tf'?(ex.a?'Verdadero':'Falso'):ex.t==='fill'?ex.a[0]:String(ex.a);
  if(i===-1)return html`<${Modal} title=${lesson.title} onClose=${onClose}><p>${lesson.intro}</p><div className="muted sm">${n} ejercicios · +10 XP por cada acierto nuevo</div><div className="mf"><button className="btn" onClick=${onClose}>Cerrar</button><button className="btn pri" onClick=${()=>setI(0)}>Empezar</button></div><//>`;
  if(finished){const score=Math.round(right/n*100);return html`<${Modal} title=${daily?'Reto diario completado':'Lección completada'} onClose=${onClose}>
    <div style=${{textAlign:'center'}} className="col"><div style=${{color:'var(--yellow)'}}><${Ic} n="trophy" s=${54}/></div><div className="num" style=${{fontSize:34,fontWeight:700}}>${score}%</div><div className="muted">${right} de ${n} respuestas correctas</div>
      <div className="row" style=${{justifyContent:'center'}}><span className="pill y">+${gain} XP</span><span className="pill g">Racha: ${streakOf([...s.academy.days,todayS()])} días</span></div></div>
    ${!daily&&lesson.rel?html`<${Banner} k="b" ic="spark">Siguiente paso: pon en práctica lo aprendido.<//><button className="btn pri" onClick=${()=>{onClose();go(lesson.rel.route,lesson.rel.tab)}}>${lesson.rel.label}</button>`:null}
    <div className="mf"><button className="btn" onClick=${onClose}>Cerrar</button></div><//>`}
  return html`<${Modal} title=${lesson.title} onClose=${onClose}>
    <${Bar} v=${(i+(res?1:0))/n*100}/><div className="muted xs">Ejercicio ${i+1} de ${n}</div>
    <h3 style=${{fontSize:17,lineHeight:1.4}}>${ex.t==='fill'?ex.q.split('___').map((p,k,a)=>k<a.length-1?html`<span key=${k}>${p}<span style=${{borderBottom:'2px solid var(--blue)',padding:'0 18px'}}> </span></span>`:p):ex.q}</h3>
    <div>${ex.t==='mc'?ex.o.map((o,k)=>html`<button key=${k} className=${'opt '+(res?(k===ex.a?'ok':pick===k?'no':''):pick===k?'sel':'')} disabled=${!!res} onClick=${()=>{setPick(k);setEr('')}}>${o}</button>`)
      :ex.t==='tf'?[[true,'Verdadero'],[false,'Falso']].map(([v,l])=>html`<button key=${l} className=${'opt '+(res?(v===ex.a?'ok':pick===v?'no':''):pick===v?'sel':'')} disabled=${!!res} onClick=${()=>{setPick(v);setEr('')}}>${l}</button>`)
      :html`<div className="fld"><label htmlFor="ans">${ex.t==='num'?'Tu respuesta (número)':'Tu respuesta'}</label><input id="ans" type=${ex.t==='num'?'number':'text'} step="any" inputMode=${ex.t==='num'?'decimal':'text'} autoComplete="off" disabled=${!!res} value=${txt} onChange=${e=>{setTxt(e.target.value);setEr('')}} onKeyDown=${e=>{if(e.key==='Enter'&&!res)check()}} autoFocus/></div>`}</div>
    ${er?html`<div className="err" role="alert">${er}</div>`:null}
    ${res?html`<div className=${'fb '+(res.ok?'ok':'no')} role="status"><b>${res.ok?'¡Correcto!':'Casi.'}</b>${res.ok?'':` La respuesta es: ${correctText}.`}<div style=${{marginTop:4}}>${ex.why}</div></div>`:null}
    <div className="mf">${res?html`<button className="btn pri" onClick=${next}>${i+1<n?'Continuar':'Ver resultado'}</button>`:html`<button className="btn pri" onClick=${check}>Comprobar</button>`}</div><//>`;
}

function Academia(){
  const {s,upd,toast}=useApp(),c=col();
  const [play,setPlay]=useState(null);
  const A=s.academy,fl=finLevel(A.xp),st=streakOf(A.days),wk=weeklyCount(s),bd=earnedBadges(s);
  const dq=DAILY[dayOfYear()%DAILY.length],dDone=!!A.daily[todayS()],wDone=A.weekly.claimed===weekStart();
  const now=new Date(),first=new Date(now.getFullYear(),now.getMonth(),1),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),off=(first.getDay()+6)%7;
  const cells=[...Array(off).fill(null),...Array.from({length:dim},(_,k)=>k+1)];
  const rank=[...RANK.map(([n,x])=>({n,x,me:false})),{n:s.user.name,x:A.xp,me:true}].sort((a,b)=>b.x-a.x);
  const claim=()=>{upd(d=>{d.academy.xp+=60;d.academy.weekly.claimed=weekStart()});toast('+60 XP por el reto semanal','ok')};
  return html`<div className="page"><${Head} title="Academia" sub="Aprende finanzas en lecciones cortas. Gana XP, mantén tu racha y desbloquea insignias." right=${html`<span className="pill y" style=${{fontSize:14,padding:'6px 14px'}}><${Ic} n="star" s=${16}/>${A.xp} XP</span>`}/>
    <div className="grid g3">
      <div className="card col"><div className="row sp"><div><div className="muted xs">Nivel financiero</div><h2>${fl.name}</h2></div><${Ic} n="trophy" s=${30}/></div><${Bar} v=${(A.xp-fl.lo)/(fl.hi-fl.lo)*100} t="b"/><div className="muted xs">${A.xp} / ${fl.hi} XP para el siguiente nivel</div>
        <div className="row sp"><span className="sm">Racha</span><b className="num"><${Ic} n="fire" s=${16}/> ${st} ${st===1?'día':'días'}</b></div></div>
      <div className="card"><div className="ch"><h2>${MESL[now.getMonth()][0].toUpperCase()+MESL[now.getMonth()].slice(1)}</h2><span className="muted xs">Días con actividad</span></div>
        <div className="cal" style=${{marginBottom:6}}>${['L','M','M','J','V','S','D'].map((d,k)=>html`<span key=${k} className="muted xs">${d}</span>`)}</div>
        <div className="cal">${cells.map((d,k)=>d?html`<div key=${k} className=${(A.days.includes(iso(new Date(now.getFullYear(),now.getMonth(),d)))?'on ':'')+(d===now.getDate()?'now':'')}>${d}</div>`:html`<span key=${k}></span>`)}</div></div>
      <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Retos</h2></div>
        <div className="card flat col" style=${{gap:6}}><div className="row sp"><b>Reto diario</b><span className="pill y">+15 XP</span></div><div className="sm muted">Una pregunta rápida cada día.</div>
          <button className="btn pri sm" disabled=${dDone} onClick=${()=>setPlay({lesson:{id:'daily',title:'Reto diario',ex:[dq]},daily:true})}>${dDone?'Completado hoy ✓':'Resolver'}</button></div>
        <div className="card flat col" style=${{gap:6}}><div className="row sp"><b>Reto semanal</b><span className="pill y">+60 XP</span></div><div className="sm muted">Completa 3 lecciones esta semana: ${Math.min(wk,3)}/3</div><${Bar} v=${Math.min(wk,3)/3*100}/>
          <button className="btn pri sm" disabled=${wk<3||wDone} onClick=${claim}>${wDone?'Reclamado ✓':'Reclamar recompensa'}</button></div></div>
    </div>
    <div className="card"><div className="ch"><h2>Tu mapa de aprendizaje</h2><span className="muted sm">Completa una lección para desbloquear el siguiente nivel</span></div>
      <div className="path">${LEVELS.map(L=>{const un=levelUnlocked(s,L.id),dn=L.lessons.every(l=>lessonDone(s,l.id)),cur=un&&!dn;return html`<div key=${L.id} className="lvl">
        <div className=${'node '+(dn?'done':cur?'cur':'')}>${dn?html`<${Ic} n="check" s=${24}/>`:un?L.id:html`<${Ic} n="lock" s=${20}/>`}</div>
        <div style=${{flex:1,minWidth:0}} className="col"><div><h3>Nivel ${L.id}: ${L.name}</h3><div className="muted sm">${L.desc}</div></div>
          <div className="lessons">${L.lessons.map(l=>{const lg=A.log.filter(x=>x.lesson===l.id),best=lg.length?Math.max(...lg.map(x=>x.score)):null;return html`<button key=${l.id} className="lesson" disabled=${!un} onClick=${()=>setPlay({lesson:l})}>
            <div className="row sp"><b>${l.title}</b>${best!==null?html`<span className="pill g">${best}%</span>`:!un?html`<${Ic} n="lock" s=${16}/>`:html`<span className="pill b">Nueva</span>`}</div><div className="muted xs">${l.ex.length} ejercicios · ${best!==null?'Repetir':'Empezar'}</div></button>`})}</div></div></div>`})}</div></div>
    <div className="card"><div className="ch"><h2>Insignias</h2><span className="muted sm">${bd.length} de ${BADGES.length}</span></div><div className="row" style=${{alignItems:'stretch'}}>${BADGES.map(b=>{const e=bd.includes(b.id);return html`<div key=${b.id} className=${'badge '+(e?'':'lock')}><div className="ic"><${Ic} n=${e?'trophy':'lock'} s=${22}/></div><b>${b.name}</b><span className="muted xs">${e?'¡Conseguida!':b.how}</span></div>`})}</div></div>
    <div className="card"><div className="ch"><h2>Ranking semanal</h2><${Demo} t="Usuarios ficticios"/></div>${rank.map((r,k)=>html`<div key=${r.n} className=${'rank '+(r.me?'me':'')}><b className="num" style=${{width:22}}>${k+1}</b><div className="avatar">${r.n.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div style=${{flex:1}}><b>${r.n}</b>${r.me?' (tú)':''}</div><span className="num b">${r.x} XP</span></div>`)}</div>
    ${play?html`<${Player} lesson=${play.lesson} daily=${play.daily} onClose=${()=>setPlay(null)}/>`:null}</div>`;
}
