/* ================= INVERSIONES ================= */
const RISK_L=['','Muy bajo','Bajo','Medio','Alto','Muy alto'];
const Risk=({n})=>html`<span className=${'risk '+(n>=4?'hi':'')} title=${'Riesgo: '+RISK_L[n]}>${[1,2,3,4,5].map(i=>html`<i key=${i} className=${i<=n?'on':''}></i>`)}</span>`;
const DISC='Simulación educativa con rendimientos hipotéticos. No garantiza resultados futuros.';

function Catalogo({sel,setSel,go}){
  const [open,setOpen]=useState({});
  return html`<div className="col" style=${{gap:16}}>
    <div className="muted sm">Fichas educativas con datos de ejemplo. Marca "Comparar" para verlas lado a lado.</div>
    <div className="grid g3">${ASSETS.map(a=>html`<div key=${a.id} className="card col" style=${{gap:10}}>
      <div className="row sp"><h2>${a.name}</h2><${Demo}/></div><p className="muted sm">${a.desc}</p>
      <div className="row sp sm"><span className="muted">Riesgo</span><span className="row" style=${{gap:6}}><${Risk} n=${a.risk}/><b>${RISK_L[a.risk]}</b></span></div>
      <div className="row sp sm"><span className="muted">Plazo</span><b style=${{textAlign:'right'}}>${a.plazo}</b></div>
      <div className="row sp sm" style=${{alignItems:'flex-start'}}><span className="muted">Liquidez</span><b style=${{textAlign:'right',maxWidth:'60%'}}>${a.liq}</b></div>
      <div className="row sp sm"><span className="muted">Rend. supuesto</span><b className="num">${pc(a.ret)} anual</b></div>
      <button className="btn sm" aria-expanded=${!!open[a.id]} onClick=${()=>setOpen(o=>({...o,[a.id]:!o[a.id]}))}><${Ic} n="help" s=${15}/>¿Es para mí?</button>
      ${open[a.id]?html`<div className="col" style=${{gap:8}}><${Banner} k="g" ic="check"><b>Sí, si:</b> ${a.yes}<//><${Banner} k="r" ic="warn"><b>Quizá no, si:</b> ${a.no}<//><div className="sm"><b>Ventaja:</b> ${a.pros}</div><div className="sm"><b>Límite:</b> ${a.cons}</div><div className="muted xs">Monto mínimo: ${a.min}</div></div>`:null}
      <div className="row sp"><label className="row sm" style=${{gap:6,cursor:'pointer'}}><input type="checkbox" checked=${sel.includes(a.id)} onChange=${()=>setSel(sel.includes(a.id)?sel.filter(x=>x!==a.id):[...sel,a.id])}/>Comparar</label>
        <button className="btn gh sm" onClick=${()=>go('simulador')}>Simular →</button></div></div>`)}</div></div>`;
}
function Comparador({sel,setSel}){
  const c=col(),list=ASSETS.filter(a=>sel.includes(a.id));
  const rows=[['Riesgo',a=>html`<span className="row" style=${{gap:6}}><${Risk} n=${a.risk}/>${RISK_L[a.risk]}</span>`],['Rendimiento supuesto',a=>pc(a.ret)+' anual'],['Plazo',a=>a.plazo],['Liquidez',a=>a.liq],['Monto mínimo',a=>a.min],['Ventaja',a=>a.pros],['Límite',a=>a.cons],['Ideal para',a=>a.yes]];
  return html`<div className="col" style=${{gap:16}}>
    <div className="card"><div className="ch"><h2>Elige instrumentos</h2><span className="muted sm">Mínimo 2</span></div><div className="row">${ASSETS.map(a=>html`<button key=${a.id} className=${'chip '+(sel.includes(a.id)?'on':'')} aria-pressed=${sel.includes(a.id)} onClick=${()=>setSel(sel.includes(a.id)?sel.filter(x=>x!==a.id):[...sel,a.id])}>${a.name}</button>`)}</div></div>
    ${list.length<2?html`<div className="card"><${Empty} title="Selecciona al menos 2 instrumentos" text="Verás riesgo, plazo, liquidez y rendimiento lado a lado." action=${html`<button className="btn sm" onClick=${()=>setSel(['CETES','ETFs'])}>Comparar CETES y ETFs</button>`}/></div>`:html`
      <div className="card tw"><table><thead><tr><th></th>${list.map(a=>html`<th key=${a.id} style=${{color:'var(--fg)',fontSize:14}}>${a.name}</th>`)}</tr></thead><tbody>${rows.map(([l,f])=>html`<tr key=${l}><td className="b muted" style=${{whiteSpace:'nowrap'}}>${l}</td>${list.map(a=>html`<td key=${a.id} style=${{minWidth:150}}>${f(a)}</td>`)}</tr>`)}</tbody></table></div>
      <div className="card"><div className="ch"><h2>Rendimiento supuesto vs. riesgo</h2><${Demo}/></div><${Chart} h=${220}><${RC.BarChart} data=${list.map(a=>({name:a.name,'Rendimiento supuesto (%)':a.ret,'Riesgo (1-5)':a.risk}))}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="name" ...${axis(c)}/><${RC.YAxis} width=${34} ...${axis(c)}/><${RC.Tooltip} ...${tipStyle(c)} cursor=${{fill:c.line,opacity:.3}}/><${RC.Bar} dataKey="Rendimiento supuesto (%)" fill=${c.green} radius=${[6,6,0,0]}/><${RC.Bar} dataKey="Riesgo (1-5)" fill=${c.yellow} radius=${[6,6,0,0]}/><//><//>
        <div className="legend"><span><i style=${{background:c.green}}></i>Rendimiento supuesto (%)</span><span><i style=${{background:c.yellow}}></i>Riesgo (1 a 5)</span></div></div>`}</div>`;
}

function normalizeAlloc(a){
  const t=sum(ASSET_IDS,i=>a[i]||0);if(t<=0)return Object.fromEntries(ASSET_IDS.map((i,k)=>[i,k===0?100:0]));
  const o={};ASSET_IDS.forEach(i=>{o[i]=Math.floor((a[i]||0)/t*100)});
  const rest=100-sum(ASSET_IDS,i=>o[i]);const big=ASSET_IDS.reduce((m,i)=>(a[i]||0)>(a[m]||0)?i:m,ASSET_IDS[0]);o[big]+=rest;return o;
}
function Simulador(){
  const {s,upd,toast,ask}=useApp(),c=col();
  const base=s.portfolios[0];
  const [d,setD]=useState({id:null,name:'',capital:'5000',monthly:'1000',years:'10',alloc:{...(base?base.alloc:{CETES:100})},rets:{...DEF_RETS}});
  const [scn,setScn]=useState('moderado'),[cmp,setCmp]=useState([]),[ne,setNe]=useState('');
  const cap=num(d.capital),mo=num(d.monthly),yr=num(d.years);
  const er={};
  if(!Number.isFinite(cap)||cap<0)er.capital='Escribe un capital de 0 o más.';
  if(!Number.isFinite(mo)||mo<0)er.monthly='Escribe una aportación de 0 o más.';
  if(!Number.isFinite(yr)||yr<1||yr>50)er.years='El horizonte debe estar entre 1 y 50 años.';
  const retBad=ASSET_IDS.filter(i=>!Number.isFinite(d.rets[i])||d.rets[i]<-50||d.rets[i]>100);
  const total=sum(ASSET_IDS,i=>d.alloc[i]||0),ok=!Object.keys(er).length&&!retBad.length;
  const P=ok?{capital:cap,monthly:mo,years:yr,alloc:d.alloc,rets:d.rets}:null;
  const dl=s.scenarios;
  const sims=useMemo(()=>P?{conservador:simPortfolio(P,dl.conservador),moderado:simPortfolio(P,dl.moderado),optimista:simPortfolio(P,dl.optimista)}:null,[d.capital,d.monthly,d.years,d.alloc,d.rets,dl.conservador,dl.moderado,dl.optimista]);
  const R=sims&&sims[scn],dv=divers(d.alloc);
  const wret=sum(ASSET_IDS,i=>(d.alloc[i]||0)/(total||1)*(d.rets[i]||0));
  const data=sims?sims.moderado.series.map((p,i)=>({label:p.label,Aportaciones:Math.round(p.c),Conservador:Math.round(sims.conservador.series[i].v),Moderado:Math.round(p.v),Optimista:Math.round(sims.optimista.series[i].v)})):[];
  const setA=(id,v)=>setD(x=>({...x,alloc:{...x.alloc,[id]:clamp(Math.round(v)||0,0,100)}}));
  const setScD=(k,v)=>{setNe('');const n=num(v);if(v===''||v==='-')return;if(!Number.isFinite(n)||n<-20||n>20)return setNe('El ajuste debe estar entre −20 y +20 puntos.');upd(x=>{x.scenarios[k]=n})};
  const save=asNew=>{
    const nm=d.name.trim();
    if(!nm)return toast('Ponle un nombre al portafolio','err');
    if(!ok)return toast('Corrige los datos marcados','err');
    if(total!==100)return toast(`El reparto suma ${total}%. Debe sumar 100%.`,'err');
    const rec={name:nm.slice(0,40),capital:cap,monthly:mo,years:yr,alloc:{...d.alloc},rets:{...d.rets}};
    if(d.id&&!asNew){upd(x=>{const i=x.portfolios.findIndex(p=>p.id===d.id);x.portfolios[i]={...x.portfolios[i],...rec}});toast('Portafolio actualizado','ok')}
    else{const id=uid();upd(x=>{x.portfolios.push({id,...rec,demo:false})});setD(x=>({...x,id}));toast('Portafolio guardado','ok')}
  };
  const load=p=>{setD({id:p.id,name:p.name,capital:String(p.capital),monthly:String(p.monthly),years:String(p.years),alloc:{...p.alloc},rets:{...DEF_RETS,...p.rets}});window.scrollTo({top:0,behavior:'smooth'});toast(`"${p.name}" cargado para editar`,'ok')};
  const dup=p=>{upd(x=>{x.portfolios.push({...JSON.parse(JSON.stringify(p)),id:uid(),name:(p.name+' (copia)').slice(0,40),demo:false})});toast('Portafolio duplicado','ok')};
  const cmpL=s.portfolios.filter(p=>cmp.includes(p.id));
  const cmpS=cmpL.map(p=>({p,r:{conservador:simPortfolio(p,dl.conservador),moderado:simPortfolio(p,dl.moderado),optimista:simPortfolio(p,dl.optimista)}}));
  const maxY=cmpS.length?Math.max(...cmpS.map(x=>x.p.years)):0;
  const cmpData=Array.from({length:Math.floor(maxY)+1},(_,y)=>{const o={y:`${y}`};cmpS.forEach(x=>{const pt=x.r.moderado.series.find(q=>q.m===y*12);o[x.p.name]=pt?Math.round(pt.v):null});return o});
  const cc=catColors(c);
  return html`<div className="col" style=${{gap:16}}>
    <div className="split" style=${{gridTemplateColumns:'minmax(0,1.05fr) minmax(0,1fr)'}}>
      <div className="col" style=${{gap:16}}>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Tu simulación</h2>${d.id?html`<span className="pill b">Editando guardado</span>`:null}</div>
          <div className="form" style=${{gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,140px),1fr))'}}>
            <${Field} label="Capital inicial" id="s-c" err=${er.capital}><input id="s-c" type="number" min="0" className=${er.capital?'bad':''} value=${d.capital} onChange=${e=>setD({...d,capital:e.target.value})}/><//>
            <${Field} label="Aportación mensual" id="s-m" err=${er.monthly}><input id="s-m" type="number" min="0" className=${er.monthly?'bad':''} value=${d.monthly} onChange=${e=>setD({...d,monthly:e.target.value})}/><//>
            <${Field} label="Horizonte (años)" id="s-y" err=${er.years}><input id="s-y" type="number" min="1" max="50" className=${er.years?'bad':''} value=${d.years} onChange=${e=>setD({...d,years:e.target.value})}/><//></div></div>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Reparto del portafolio</h2><span className=${'pill '+(total===100?'g':'r')}>Total ${total}%</span></div>
          ${total!==100?html`<${Banner} k="r" ic="warn">El reparto suma ${total}%. ${total<100?`Falta asignar ${100-total}% (se tratará como efectivo sin rendimiento).`:`Sobran ${total-100}%.`} Debe sumar 100% para guardar.<//>`:null}
          <div className="col" style=${{gap:14}}>${ASSETS.map((a,k)=>html`<div key=${a.id} style=${{borderTop:k?'1px solid var(--line)':'',paddingTop:k?12:0}}>
            <div className="row sp"><b>${a.name}</b><span className="num sm">${fmt((cap||0)*(d.alloc[a.id]||0)/100)} · ${d.alloc[a.id]||0}%</span></div>
            <div className="row" style=${{flexWrap:'nowrap',gap:12}}><input type="range" min="0" max="100" step="1" aria-label=${'Porcentaje en '+a.name} style=${{flex:1,minWidth:0,accentColor:cc[k%6]}} value=${d.alloc[a.id]||0} onChange=${e=>setA(a.id,+e.target.value)}/>
              <div className="row" style=${{gap:4,flexWrap:'nowrap'}}><label className="muted xs" htmlFor=${'r-'+a.id}>Rend. %</label><input id=${'r-'+a.id} className=${'in '+(retBad.includes(a.id)?'bad':'')} style=${{width:74,height:34}} type="number" step="0.1" value=${d.rets[a.id]} onChange=${e=>setD({...d,rets:{...d.rets,[a.id]:e.target.value===''?NaN:+e.target.value}})}/></div></div></div>`)}</div>
          ${retBad.length?html`<div className="err">Rendimiento fuera de rango (−50 a 100) en: ${retBad.join(', ')}.</div>`:null}
          <div className="row"><button className="btn sm" onClick=${()=>setD({...d,alloc:normalizeAlloc(d.alloc)})}>Ajustar a 100%</button><button className="btn sm" onClick=${()=>setD({...d,alloc:Object.fromEntries(ASSET_IDS.map((i,k)=>[i,Math.floor(100/7)+(k===0?100-Math.floor(100/7)*7:0)]))})}>Repartir parejo</button><button className="btn sm" onClick=${()=>setD({...d,rets:{...DEF_RETS}})}>Restaurar rendimientos</button></div></div>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Guardar portafolio</h2></div>
          <${Field} label="Nombre" id="s-n"><input id="s-n" maxLength="40" placeholder="Ej. Plan a 10 años" value=${d.name} onChange=${e=>setD({...d,name:e.target.value})}/><//>
          <div className="row"><button className="btn pri" onClick=${()=>save(false)}>${d.id?'Actualizar portafolio':'Guardar portafolio'}</button>${d.id?html`<button className="btn" onClick=${()=>save(true)}>Guardar como nuevo</button><button className="btn gh" onClick=${()=>setD({...d,id:null,name:''})}>Salir de edición</button>`:null}</div></div>
      </div>
      <div className="col" style=${{gap:16}}>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Resultado</h2><${Seg} opts=${[['conservador','Conservador'],['moderado','Moderado'],['optimista','Optimista']]} val=${scn} on=${setScn} label="Escenario"/></div>
          ${R?html`<div className="grid" style=${{gridTemplateColumns:'1fr 1fr'}}>
            <div className="card flat"><div className="muted xs">Valor final</div><div className="num b" style=${{fontSize:22}}>${fmt(R.final)}</div></div>
            <div className="card flat"><div className="muted xs">Ganancia</div><div className=${'num b '+(R.gain>=0?'up':'down')} style=${{fontSize:22}}>${fmt(R.gain)}</div></div>
            <div className="card flat"><div className="muted xs">Aportaciones totales</div><div className="num b" style=${{fontSize:18}}>${fmt(R.contrib)}</div></div>
            <div className="card flat"><div className="muted xs">Rend. ponderado + ajuste</div><div className="num b" style=${{fontSize:18}}>${pc(wret+dl[scn])}</div></div></div>
            <${Chart} h=${250}><${RC.LineChart} data=${data}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="label" minTickGap=${22} tickFormatter=${v=>v+'a'} ...${axis(c)}/><${RC.YAxis} width=${52} tickFormatter=${v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?Math.round(v/1000)+'k':v} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} labelFormatter=${l=>'Año '+l} ...${tipStyle(c)}/>
              <${RC.Line} type="monotone" dataKey="Aportaciones" stroke=${c.muted} strokeDasharray="5 4" strokeWidth=${2} dot=${false}/><${RC.Line} type="monotone" dataKey="Conservador" stroke=${c.blue} strokeWidth=${scn==='conservador'?3:1.5} dot=${false}/><${RC.Line} type="monotone" dataKey="Moderado" stroke=${c.green} strokeWidth=${scn==='moderado'?3:1.5} dot=${false}/><${RC.Line} type="monotone" dataKey="Optimista" stroke=${c.yellow} strokeWidth=${scn==='optimista'?3:1.5} dot=${false}/><//><//>
            <div className="legend"><span><i style=${{background:c.muted}}></i>Aportaciones</span><span><i style=${{background:c.blue}}></i>Conservador ${dl.conservador>0?'+':''}${dl.conservador} pts</span><span><i style=${{background:c.green}}></i>Moderado ${dl.moderado>0?'+':''}${dl.moderado} pts</span><span><i style=${{background:c.yellow}}></i>Optimista +${dl.optimista} pts</span></div>
            <div className="tw"><table><thead><tr><th>Activo</th><th>Invertido hoy</th><th>Valor final</th></tr></thead><tbody>${R.per.map(x=>html`<tr key=${x.id}><td>${x.id}</td><td className="num">${fmt(x.amt)}</td><td className="num b">${fmt(x.final)}</td></tr>`)}</tbody></table></div>`
          :html`<${Banner} k="r" ic="warn">Corrige los campos marcados para ver el resultado.<//>`}
          <div className="muted xs">${DISC}</div></div>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Escenarios editables</h2><span className="muted sm">Ajuste anual en puntos</span></div>
          <div className="grid" style=${{gridTemplateColumns:'repeat(3,1fr)'}}>${[['conservador','Conservador'],['moderado','Moderado'],['optimista','Optimista']].map(([k,l])=>html`<${Field} key=${k} label=${l} id=${'sc-'+k}><input id=${'sc-'+k} type="number" step="0.5" min="-20" max="20" defaultValue=${s.scenarios[k]} onChange=${e=>setScD(k,e.target.value)}/><//>`)}</div>${ne?html`<div className="err">${ne}</div>`:null}</div>
        <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Diversificación</h2><span className=${'pill '+dv.conc[1]}>Concentración ${dv.conc[0].toLowerCase()}</span></div>
          <div className="row sp sm"><span>Nivel de diversificación</span><b className="num">${Math.round(dv.score)}/100</b></div><${Bar} v=${dv.score} t=${dv.score<35?'r':dv.score<60?'y':''}/>
          <div className="grid" style=${{gridTemplateColumns:'repeat(3,1fr)',gap:8}}><div className="card flat"><div className="muted xs">Mayor posición</div><div className="num b">${pc(dv.max,0)}</div></div><div className="card flat"><div className="muted xs">Activos</div><div className="num b">${dv.n} de 7</div></div><div className="card flat"><div className="muted xs">Riesgo prom.</div><div className="num b">${nf(dv.risk,1)}/5</div></div></div>
          <div className="sm muted">${dv.max>60?'Más de 60% está en un solo activo: una mala noticia te pegaría fuerte.':dv.max>40?'Hay una posición dominante. Considera repartir un poco más.':'Buen reparto: ningún activo domina el portafolio.'}</div>
          <${Chart} h=${170}><${RC.PieChart}><${RC.Pie} data=${ASSET_IDS.map(i=>({name:i,value:d.alloc[i]||0})).filter(x=>x.value>0)} dataKey="value" nameKey="name" innerRadius=${40} outerRadius=${70} stroke="none" paddingAngle=${2}>${ASSET_IDS.map((i,k)=>html`<${RC.Cell} key=${i} fill=${cc[k%6]}/>`)}<//><${RC.Tooltip} formatter=${v=>v+'%'} ...${tipStyle(c)}/><//><//></div>
      </div></div>
    <div className="card col"><div className="ch" style=${{marginBottom:0}}><h2>Portafolios guardados</h2><span className="muted sm">Marca 2 o más para comparar</span></div>
      ${s.portfolios.length?html`<div className="grid g3">${s.portfolios.map(p=>{const r=simPortfolio(p,dl.moderado),dd=divers(p.alloc);return html`<div key=${p.id} className="card flat col" style=${{gap:8}}>
        <div className="row sp"><b>${p.name}</b>${p.demo?html`<${Demo}/>`:null}</div>
        <div className="muted xs">${fmt(p.capital)} inicial · ${fmt(p.monthly)}/mes · ${p.years} años</div>
        <div className="num b" style=${{fontSize:20}}>${fmt(r.final)}</div><div className="muted xs">Valor final moderado (hipotético) · diversificación ${Math.round(dd.score)}/100</div>
        <div className="row"><button className="btn sm" onClick=${()=>load(p)}>Editar</button><button className="btn sm" onClick=${()=>dup(p)}>Duplicar</button><button className="btn sm" onClick=${()=>ask({title:'Eliminar portafolio',text:`Se eliminará "${p.name}".`,onYes:()=>{upd(x=>{x.portfolios=x.portfolios.filter(q=>q.id!==p.id)});setCmp(z=>z.filter(i=>i!==p.id));if(d.id===p.id)setD(x=>({...x,id:null}));toast('Portafolio eliminado','ok')}})}>Eliminar</button></div>
        <label className="row sm" style=${{gap:6,cursor:'pointer'}}><input type="checkbox" checked=${cmp.includes(p.id)} onChange=${()=>setCmp(cmp.includes(p.id)?cmp.filter(i=>i!==p.id):[...cmp,p.id])}/>Comparar</label></div>`})}</div>`
        :html`<${Empty} title="Sin portafolios guardados" text="Arma un reparto arriba y guárdalo."/>`}
      ${cmpL.length>=2?html`<div className="col"><h3>Comparación (escenarios con tus ajustes)</h3><div className="tw"><table><thead><tr><th>Portafolio</th><th>Aportaciones</th><th>Conservador</th><th>Moderado</th><th>Optimista</th><th>Diversif.</th></tr></thead><tbody>${cmpS.map(({p,r})=>html`<tr key=${p.id}><td className="b">${p.name}</td><td className="num">${fmt(r.moderado.contrib)}</td><td className="num">${fmt(r.conservador.final)}</td><td className="num b">${fmt(r.moderado.final)}</td><td className="num">${fmt(r.optimista.final)}</td><td className="num">${Math.round(divers(p.alloc).score)}/100</td></tr>`)}</tbody></table></div>
        <${Chart} h=${230}><${RC.LineChart} data=${cmpData}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="y" tickFormatter=${v=>v+'a'} ...${axis(c)}/><${RC.YAxis} width=${52} tickFormatter=${v=>v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1000)+'k'} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} labelFormatter=${l=>'Año '+l} ...${tipStyle(c)}/>${cmpS.map((x,i)=>html`<${RC.Line} key=${x.p.id} type="monotone" dataKey=${x.p.name} stroke=${cc[i%6]} strokeWidth=${2.5} dot=${false} connectNulls=${false}/>`)}<//><//>
        <div className="legend">${cmpS.map((x,i)=>html`<span key=${x.p.id}><i style=${{background:cc[i%6]}}></i>${x.p.name}</span>`)}<span>Escenario moderado</span></div></div>`:cmp.length===1?html`<div className="muted sm">Marca otro portafolio para compararlo.</div>`:null}</div>
    <${Banner} k="y" ic="warn">${DISC}<//></div>`;
}

function MetaCalc(){
  const c=col();const [f,setF]=useState({target:'100000',years:'5',rate:'8',init:'0'});
  const t=num(f.target),y=num(f.years),r=num(f.rate),i0=num(f.init);
  const er={};
  if(!Number.isFinite(t)||t<=0)er.target='La meta debe ser mayor que cero.';
  if(!Number.isFinite(y)||y<=0||y>50)er.years='Escribe entre 1 y 50 años.';
  if(!Number.isFinite(r)||r<-20||r>60)er.rate='Escribe un rendimiento entre −20 y 60.';
  if(!Number.isFinite(i0)||i0<0)er.init='El monto inicial no puede ser negativo.';
  const ok=!Object.keys(er).length,pm=ok?pmtNeeded(t,y,r,i0):0,pm0=ok?pmtNeeded(t,y,0,i0):0;
  const sim=ok?simPortfolio({capital:i0,monthly:pm,years:y,alloc:{CETES:100},rets:{CETES:r}}):null;
  return html`<div className="split" style=${{gridTemplateColumns:'minmax(0,1fr) minmax(0,1.2fr)'}}>
    <div className="card col"><h2>Calculadora de meta</h2><p className="muted sm">¿Cuánto invertir al mes para llegar a tu meta?</p>
      <${Field} label="Meta (MXN)" id="m-t" err=${er.target}><input id="m-t" type="number" min="0" value=${f.target} onChange=${e=>setF({...f,target:e.target.value})}/><//>
      <${Field} label="Plazo (años)" id="m-y" err=${er.years}><input id="m-y" type="number" min="0" step="0.5" value=${f.years} onChange=${e=>setF({...f,years:e.target.value})}/><//>
      <${Field} label="Rendimiento anual supuesto (%)" id="m-r" err=${er.rate}><input id="m-r" type="number" step="0.1" value=${f.rate} onChange=${e=>setF({...f,rate:e.target.value})}/><//>
      <${Field} label="Monto que ya tienes" id="m-i" err=${er.init}><input id="m-i" type="number" min="0" value=${f.init} onChange=${e=>setF({...f,init:e.target.value})}/><//></div>
    <div className="card col"><h2>Resultado</h2>
      ${ok?html`<div className="card flat"><div className="muted xs">Debes invertir al mes</div><div className="num" style=${{fontSize:34,fontWeight:700}}>${fmt(pm)}</div></div>
        <div className="grid" style=${{gridTemplateColumns:'1fr 1fr'}}><div className="card flat"><div className="muted xs">Aportarás en total</div><div className="num b">${fmt(i0+pm*Math.round(y*12))}</div></div><div className="card flat"><div className="muted xs">Rendimiento estimado</div><div className="num b up">${fmt(t-i0-pm*Math.round(y*12))}</div></div></div>
        <div className="sm muted">Sin rendimiento (0%) necesitarías ${fmt(pm0)} al mes. El rendimiento hipotético te ahorra ${fmt(pm0-pm)} mensuales.</div>
        <${Chart} h=${200}><${RC.AreaChart} data=${sim.series.map(p=>({label:p.label,Saldo:Math.round(p.v),Aportado:Math.round(p.c)}))}><${RC.CartesianGrid} stroke=${c.line} vertical=${false}/><${RC.XAxis} dataKey="label" minTickGap=${22} tickFormatter=${v=>v+'a'} ...${axis(c)}/><${RC.YAxis} width=${50} tickFormatter=${v=>Math.round(v/1000)+'k'} ...${axis(c)}/><${RC.Tooltip} formatter=${v=>fmt(v)} labelFormatter=${l=>'Año '+l} ...${tipStyle(c)}/><${RC.Area} type="monotone" dataKey="Saldo" stroke=${c.green} fill=${c.green} fillOpacity=${.18} strokeWidth=${2.5}/><${RC.Area} type="monotone" dataKey="Aportado" stroke=${c.muted} fill="none" strokeDasharray="5 4"/><//><//>`
      :html`<${Banner} k="r" ic="warn">Corrige los campos marcados.<//>`}
      <div className="muted xs">${DISC}</div></div></div>`;
}

function Inversiones(){
  const [tab,setTab]=useTab('inversiones','catalogo'),[sel,setSel]=useState(['CETES','ETFs']);
  return html`<div className="page"><${Head} title="Inversiones" sub="Conoce los instrumentos, compáralos y simula tu portafolio."/>
    <${Banner} k="y" ic="warn"><b>${DISC}</b><//>
    <${Tabs} opts=${[['catalogo','Catálogo'],['comparador','Comparador'],['simulador','Simulador'],['meta','Calculadora de meta']]} val=${tab} on=${setTab}/>
    ${tab==='catalogo'?html`<${Catalogo} sel=${sel} setSel=${setSel} go=${setTab}/>`:tab==='comparador'?html`<${Comparador} sel=${sel} setSel=${setSel}/>`:tab==='simulador'?html`<${Simulador}/>`:html`<${MetaCalc}/>`}</div>`;
}
