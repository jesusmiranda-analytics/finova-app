/* ================= DATOS SEMILLA ================= */
function seed(){
  const now=new Date(),tx=[];let k=0;
  const F=[1,1.04,0.95,1.1,0.97,1.02];
  const plan=[['Alimentación',500,3,'Súper semanal'],['Alimentación',500,10,'Comida fuera'],['Alimentación',500,17,'Súper semanal'],['Alimentación',500,24,'Comida fuera'],
   ['Transporte',500,6,'Metro y camión'],['Transporte',600,14,'Gasolina'],['Transporte',400,22,'Uber'],
   ['Educación',1500,5,'Colegiatura'],['Educación',500,12,'Libros y materiales'],
   ['Entretenimiento',300,4,'Streaming'],['Entretenimiento',700,12,'Salida con amigos'],['Entretenimiento',500,20,'Cine y snacks'],
   ['Servicios',600,2,'Internet y celular'],['Servicios',400,15,'Luz'],
   ['Otros',500,9,'Regalo'],['Otros',500,21,'Imprevistos']];
  const MM=['Débito','Efectivo','Crédito','Transferencia'];
  for(let m=0;m<=5;m++){
    const first=new Date(now.getFullYear(),now.getMonth()-m,1);
    const last=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
    const cap=m===0?now.getDate():last;
    const mk=d=>iso(new Date(first.getFullYear(),first.getMonth(),Math.min(d,cap)));
    tx.push({id:'d'+(k++),type:'ingreso',amount:15000,cat:'Nómina',date:mk(1),method:'Transferencia',note:'Ingreso mensual',demo:true});
    if(m===2||m===4)tx.push({id:'d'+(k++),type:'ingreso',amount:1800,cat:'Freelance',date:mk(18),method:'Transferencia',note:'Proyecto de diseño',demo:true});
    plan.forEach((p,i)=>tx.push({id:'d'+(k++),type:'gasto',amount:Math.round(p[1]*F[m]/10)*10,cat:p[0],date:mk(p[2]),method:MM[(i+m)%4],note:p[3],demo:true}));
  }
  const inMonths=n=>iso(new Date(now.getFullYear(),now.getMonth()+n,Math.min(now.getDate(),28)));
  const done=ALL_LESSONS.filter(l=>l.id==='1a'||l.id==='1b');
  return {v:1,
    user:{name:'Rodrigo Demo',income:15000,theme:'auto',notifs:{budget:true,goals:true,streak:true},tutorialDone:false},
    tx,
    budgets:{rule:{needs:50,wants:30,save:20},cats:{'Alimentación':3000,'Transporte':2000,'Educación':2000,'Entretenimiento':1200,'Servicios':1100,'Otros':1500}},
    goals:[{id:'g1',name:'Fondo de emergencia',target:20000,saved:6500,deadline:inMonths(8),demo:true},{id:'g2',name:'Laptop para la universidad',target:12000,saved:3000,deadline:inMonths(10),demo:true}],
    debts:[{id:'b1',name:'Tarjeta de crédito',balance:8500,rate:42,min:600,demo:true},{id:'b2',name:'Crédito del celular',balance:4200,rate:24,min:350,demo:true},{id:'b3',name:'Préstamo personal',balance:12000,rate:28,min:900,demo:true}],
    portfolios:[{id:'p1',name:'Portafolio virtual',demo:true,capital:5000,monthly:1000,years:10,alloc:{CETES:40,Bonos:10,Fondos:10,ETFs:25,Acciones:5,FIBRAs:5,SOFIPOs:5},rets:{...DEF_RETS}}],
    scenarios:{conservador:-3,moderado:0,optimista:3},
    chats:[],activeChat:null,ai:{level:'principiante'},
    academy:{xp:120,correct:done.flatMap(l=>l.ex.map(e=>e.id)),
      log:[{lesson:'1a',date:iso(addD(now,-4)),score:100},{lesson:'1b',date:iso(addD(now,-2)),score:100}],
      days:[5,4,3,2,1].map(n=>iso(addD(now,-n))),badges:['ahorro'],daily:{},weekly:{claimed:''}},
    notifRead:[]};
}
/* Cuenta del caso Familia Rivera: datos del modelo final (ver 12_rivera.js). */
function seedRivera(){
  const base=seed(),now=new Date(),tx=[];let k=0;
  const MM=['Transferencia','Débito','Efectivo','Débito'];
  for(let m=0;m<=5;m++){
    const first=new Date(now.getFullYear(),now.getMonth()-m,1);
    const last=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
    const cap=m===0?now.getDate():last;
    const mk=d=>iso(new Date(first.getFullYear(),first.getMonth(),Math.min(d,cap)));
    tx.push({id:'r'+(k++),type:'ingreso',amount:RIVERA.members[0].ingreso,cat:'Nómina',date:mk(1),method:'Transferencia',note:'Sueldo del papá',demo:true});
    tx.push({id:'r'+(k++),type:'ingreso',amount:RIVERA.members[1].ingreso,cat:'Negocio propio',date:mk(15),method:'Efectivo',note:'Ventas de repostería (mamá)',demo:true});
    RIVERA.gastos.forEach((g,i)=>tx.push({id:'r'+(k++),type:'gasto',amount:g[1],cat:g[0],date:mk(g[2]),method:g[0]==='Deudas'?'Transferencia':MM[(i+m)%4],note:g[3],demo:true}));
  }
  const inMonths=n=>iso(new Date(now.getFullYear(),now.getMonth()+n,Math.min(now.getDate(),28)));
  return {...base,
    user:{...base.user,name:'Familia Rivera',income:RIVERA.ingreso,members:RIVERA.members.map(x=>({...x})),tutorialDone:true},
    tx,
    budgets:{rule:{...base.budgets.rule},cats:{...RIVERA.presupuesto}},
    goals:[{id:'rv-fe',name:'Fondo de emergencia (CETES)',target:RIVERA.fondo.meta,saved:0,deadline:inMonths(RIVERA.fondo.mesMeta),demo:true}],
    debts:RIVERA.deudas.map(d=>({...d,demo:true})),
    academy:{xp:0,correct:[],log:[],days:[],badges:[],daily:{},weekly:{claimed:''}},
    plan:{fuente:RIVERA.fuente,resumen:RIVERA.resumen,hitos:RIVERA.hitos,retiro:RIVERA.retiro}};
}
/* Cuenta nueva: sin movimientos; presupuesto 50/30/20 sobre el ingreso declarado. */
function seedEmpty(name,income){
  const base=seed(),inc=Number.isFinite(income)&&income>0?income:0,b=x=>Math.round(inc*x/10)*10;
  return {...base,
    user:{...base.user,name,income:inc,tutorialDone:false},
    tx:[],
    budgets:{rule:{needs:50,wants:30,save:20},cats:{'Alimentación':b(.2),'Transporte':b(.1),'Servicios':b(.1),'Salud':b(.05),'Educación':b(.05),'Entretenimiento':b(.15),'Otros':b(.15),'Deudas':0}},
    goals:[],debts:[],chats:[],activeChat:null,
    academy:{xp:0,correct:[],log:[],days:[],badges:[],daily:{},weekly:{claimed:''}}};
}
function loadState(){
  try{const raw=localStorage.getItem(KEY);if(raw){const o=JSON.parse(raw);if(o&&o.v===1&&Array.isArray(o.tx))return {...seed(),...o}}}catch(e){}
  return seed();
}

/* ================= PERIODOS Y TOTALES ================= */
function rangeOf(p){
  const n=new Date(),to=new Date(n.getFullYear(),n.getMonth(),n.getDate());let from;
  if(p==='semana')from=addD(to,-6);
  else{const back={mes:0,'3m':2,'6m':5,'año':11}[p]||0;from=new Date(n.getFullYear(),n.getMonth()-back,1)}
  return {from:iso(from),to:iso(to)};
}
const inRange=(t,r)=>t.date>=r.from&&t.date<=r.to;
function buckets(p){
  const r=rangeOf(p),out=[];
  if(p==='semana'||p==='mes'){
    for(let d=pd(r.from);iso(d)<=r.to;d=addD(d,1))out.push({k:iso(d),label:p==='semana'?['dom','lun','mar','mié','jue','vie','sáb'][d.getDay()]+' '+d.getDate():String(d.getDate()),from:iso(d),to:iso(d)});
  }else{
    let d=pd(r.from);
    while(iso(d)<=r.to){const e=new Date(d.getFullYear(),d.getMonth()+1,0);out.push({k:iso(d),label:MES[d.getMonth()],from:iso(d),to:iso(e)});d=new Date(d.getFullYear(),d.getMonth()+1,1)}
  }
  return out;
}
const PERIODS=[['semana','Semana'],['mes','Mes'],['3m','3 meses'],['6m','6 meses'],['año','Año']];
function tot(list){
  const inc=sum(list.filter(t=>t.type==='ingreso'),t=>t.amount),exp=sum(list.filter(t=>t.type==='gasto'),t=>t.amount);
  return {inc,exp,net:inc-exp};
}
function byCat(list){const o={};list.filter(t=>t.type==='gasto').forEach(t=>{o[t.cat]=(o[t.cat]||0)+t.amount});return o}
function monthList(s,off=0){const n=new Date();const a=new Date(n.getFullYear(),n.getMonth()+off,1),b=new Date(n.getFullYear(),n.getMonth()+off+1,0);const r={from:iso(a),to:iso(b)};return s.tx.filter(t=>inRange(t,r))}
const monthKey=()=>{const n=new Date();return n.getFullYear()+'-'+pad(n.getMonth()+1)};
const savedTotal=s=>sum(s.goals,g=>g.saved);

/* ================= PRESUPUESTO ================= */
function budgetRows(s){
  const sp=byCat(monthList(s));
  return EXP_NAMES.filter(c=>c in s.budgets.cats||sp[c]).map(c=>{const limit=s.budgets.cats[c]||0,spent=sp[c]||0;return {cat:c,limit,spent,pct:limit>0?spent/limit*100:(spent>0?999:0)}});
}
const tone=p=>p>100?'r':p>=80?'y':'';

/* ================= HÁBITOS ================= */
function insights(list,s){
  const out=[],ex=list.filter(t=>t.type==='gasto'),T=tot(list);
  if(!ex.length)return out;
  const bc=byCat(list),top=Object.entries(bc).sort((a,b)=>b[1]-a[1])[0];
  out.push({k:'b',t:`Tu mayor gasto es ${top[0]}: ${fmt(top[1])}, el ${pc(top[1]/T.exp*100,0)} de lo que gastaste en este periodo.`});
  if(T.inc>0){const r=T.net/T.inc*100;out.push({k:r>=20?'g':r>=0?'y':'r',t:r>=20?`Ahorraste el ${pc(r,0)} de tus ingresos. Superas la meta del 20% de la regla 50/30/20.`:r>=0?`Ahorraste el ${pc(r,0)} de tus ingresos. La regla 50/30/20 sugiere llegar al 20%.`:`Gastaste ${fmt(-T.net)} más de lo que ingresaste. Revisa tus gastos variables.`})}
  const ent=bc['Entretenimiento']||0,prev=[1,2,3].map(o=>byCat(monthList(s,-o))['Entretenimiento']||0).filter(x=>x>0);
  if(ent>0&&prev.length){const avg=sum(prev)/prev.length;const d=(ent-avg)/avg*100;if(Math.abs(d)>=5)out.push({k:d>0?'y':'g',t:`En entretenimiento gastaste ${fmt(ent)}, ${pc(Math.abs(d),0)} ${d>0?'más':'menos'} que tu promedio de los meses anteriores (${fmt(avg)}).`})}
  const we=sum(ex.filter(t=>[0,6].includes(pd(t.date).getDay())),t=>t.amount);
  if(T.exp>0)out.push({k:'b',t:`${pc(we/T.exp*100,0)} de tu gasto ocurre en fin de semana.`});
  const cr=sum(ex.filter(t=>t.method==='Crédito'),t=>t.amount);
  if(cr>0)out.push({k:cr/T.exp>.3?'y':'b',t:`Pagaste ${fmt(cr)} con tarjeta de crédito (${pc(cr/T.exp*100,0)} del gasto). ${cr/T.exp>.3?'Procura pagar el total para no generar intereses.':'Mantenerlo bajo ayuda a evitar intereses.'}`});
  const small=ex.filter(t=>t.amount<=300);
  if(small.length>=3)out.push({k:'b',t:`Tienes ${small.length} gastos de ${fmt(300)} o menos que suman ${fmt(sum(small,t=>t.amount))}. Los gastos pequeños también cuentan.`});
  const big=[...ex].sort((a,b)=>b.amount-a.amount)[0];
  out.push({k:'b',t:`Tu gasto individual más grande fue ${fmt(big.amount)} en ${big.cat}${big.note?' ('+big.note+')':''}, el ${fshort(big.date)}.`});
  const fx=sum(ex.filter(t=>(EXP_CATS.find(c=>c.n===t.cat)||{}).fixed),t=>t.amount);
  out.push({k:'b',t:`Tus gastos fijos son ${pc(fx/T.exp*100,0)} del total y los variables ${pc(100-fx/T.exp*100,0)}. Los variables son los que más puedes ajustar.`});
  return out;
}

/* ================= DEUDAS ================= */
function payoff(debts,extra,method){
  const ds=debts.map(d=>({...d,bal:d.balance}));
  const budget=sum(debts,d=>d.min)+extra;let month=0,interest=0;const series=[sum(ds,d=>d.bal)],order=[];
  while(ds.some(d=>d.bal>0.01)&&month<600){
    month++;
    ds.forEach(d=>{if(d.bal>0.01){const i=d.bal*d.rate/100/12;d.bal+=i;interest+=i}});
    let avail=budget;
    ds.forEach(d=>{if(d.bal>0.01){const p=Math.min(d.min,d.bal,avail);d.bal-=p;avail-=p}});
    const tg=ds.filter(d=>d.bal>0.01).sort(method==='avalancha'?(a,b)=>b.rate-a.rate:(a,b)=>a.bal-b.bal);
    for(const d of tg){if(avail<=0.001)break;const p=Math.min(avail,d.bal);d.bal-=p;avail-=p}
    ds.forEach(d=>{if(d.bal<=0.01&&!order.includes(d.name)){order.push(d.name);d.bal=0}});
    series.push(sum(ds,d=>d.bal));
  }
  return {months:month,interest,series,order,ok:!ds.some(d=>d.bal>0.01)};
}
const fmtMonths=m=>{const y=Math.floor(m/12),r=m%12;return (y?`${y} ${y===1?'año':'años'}`:'')+(y&&r?' y ':'')+(r||!y?`${r} ${r===1?'mes':'meses'}`:'')};

/* ================= INVERSIONES ================= */
function simPortfolio(p,delta=0){
  const months=Math.round(p.years*12),tw=sum(ASSET_IDS,i=>p.alloc[i]||0)/100,scale=tw>1?1/tw:1,cash=Math.max(0,1-tw);
  const w={},rm={},bal={};
  ASSET_IDS.forEach(id=>{w[id]=(p.alloc[id]||0)/100*scale;rm[id]=Math.pow(1+Math.max(-99,(p.rets[id]||0)+delta)/100,1/12)-1;bal[id]=p.capital*w[id]});
  let cb=p.capital*cash;const step=months<=24?1:months<=120?3:12;
  const pt=m=>({m,label:(m/12).toFixed(m%12?1:0),v:sum(ASSET_IDS,i=>bal[i])+cb,c:p.capital+p.monthly*m});
  const series=[pt(0)];
  for(let m=1;m<=months;m++){ASSET_IDS.forEach(id=>{bal[id]=bal[id]*(1+rm[id])+p.monthly*w[id]});cb+=p.monthly*cash;if(m%step===0||m===months)series.push(pt(m))}
  const final=sum(ASSET_IDS,i=>bal[i])+cb,contrib=p.capital+p.monthly*months;
  return {series,final,contrib,gain:final-contrib,per:ASSET_IDS.map(id=>({id,amt:p.capital*w[id],final:bal[id]})).filter(x=>x.amt>0||(p.alloc[x.id]||0)>0)};
}
function pmtNeeded(target,years,annual,initial=0){
  const n=Math.round(years*12),r=Math.pow(1+annual/100,1/12)-1,need=target-initial*Math.pow(1+r,n);
  if(need<=0)return 0;return r===0?need/n:need*r/(Math.pow(1+r,n)-1);
}
function divers(alloc){
  const t=sum(ASSET_IDS,i=>alloc[i]||0)||1,p=ASSET_IDS.map(i=>(alloc[i]||0)/t);
  const hhi=sum(p,x=>x*x),eff=1/hhi,max=Math.max(...p)*100,n=p.filter(x=>x>0.0001).length;
  const risk=sum(ASSET_IDS,(id)=>0)+ASSET_IDS.reduce((a,id,i)=>a+p[i]*ASSETS[i].risk,0);
  return {hhi,eff,max,n,risk,score:clamp((eff-1)/5*100,0,100),conc:max>60?['Alta','r']:max>40?['Media','y']:['Baja','g']};
}

/* ================= INDICADORES (DEMO) ================= */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hashS=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const _hist={};
function history(ind){
  if(_hist[ind.id])return _hist[ind.id];
  const r=mulberry(hashS(ind.id)),N=1825,a=new Array(N);a[N-1]=ind.val;
  for(let i=N-1;i>0;i--)a[i-1]=Math.max(ind.val*.25,a[i]+(ind.val-a[i])*.004+(r()-.5)*2*ind.vol);
  return _hist[ind.id]=a;
}
function chartData(ind,rk){
  const a=history(ind),n=RANGES[rk],step=Math.ceil(n/60),out=[],now=new Date();
  for(let j=0;j<n;j+=step){const idx=a.length-n+j,d=addD(now,-(n-1-j));out.push({d:rk==='1A'||rk==='5A'?`${MES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`:`${d.getDate()} ${MES[d.getMonth()]}`,v:+a[idx].toFixed(4)})}
  const last=out[out.length-1];if(last.v!==a[a.length-1])out.push({d:'hoy',v:a[a.length-1]});
  return out;
}
function fv(ind,v){
  if(ind.unit==='%')return nf(v,2)+'%';
  if(ind.id==='ipc')return nf(v,0);
  return (ind.id==='udi'?nf(v,4):nf(v,2));
}
function change(ind){
  const a=history(ind),now=a[a.length-1],prev=a[a.length-31];
  if(ind.unit==='%'){const d=now-prev;return {txt:`${d>=0?'+':''}${nf(d,2)} pts`,up:d>=0}}
  const d=(now-prev)/prev*100;return {txt:`${d>=0?'+':''}${nf(d,2)}%`,up:d>=0};
}

/* ================= ACADEMIA ================= */
const streakOf=days=>{const set=new Set(days);let d=new Date();if(!set.has(iso(d)))d=addD(d,-1);let n=0;while(set.has(iso(d))){n++;d=addD(d,-1)}return n};
const lessonDone=(s,id)=>s.academy.log.some(l=>l.lesson===id);
const levelUnlocked=(s,n)=>n===1||LEVELS[n-2].lessons.some(l=>lessonDone(s,l.id));
function finLevel(xp){return xp<150?{name:'Principiante',lo:0,hi:150}:xp<400?{name:'Intermedio',lo:150,hi:400}:{name:'Avanzado',lo:400,hi:Math.max(800,xp+1)}}
function earnedBadges(s){
  const e=[];
  if(s.goals.some(g=>g.saved>0))e.push('ahorro');
  if(lessonDone(s,'2a'))e.push('presupuesto');
  if(s.portfolios.some(p=>!p.demo))e.push('inversionista');
  if(s.academy.log.some(l=>l.lesson==='4a'&&l.score>=75))e.push('cetes');
  return e;
}
const weekStart=()=>{const n=new Date(),d=(n.getDay()+6)%7;return iso(addD(new Date(n.getFullYear(),n.getMonth(),n.getDate()),-d))};
const weeklyCount=s=>new Set(s.academy.log.filter(l=>l.date>=weekStart()).map(l=>l.lesson+l.date)).size;
const dayOfYear=()=>{const n=new Date();return Math.floor((n-new Date(n.getFullYear(),0,0))/864e5)};

/* ================= RECOMENDACIONES Y NOTIFICACIONES ================= */
function goalInfo(g){
  const now=new Date(),dl=pd(g.deadline),left=Math.max(1,monthsBetween(now,dl)+(dl.getDate()>=now.getDate()?0:-0)),remain=Math.max(0,g.target-g.saved);
  return {pct:clamp(g.saved/g.target*100,0,100),monthsLeft:left,remain,rec:remain/left,late:dl<new Date(now.getFullYear(),now.getMonth(),now.getDate())&&remain>0};
}
function nextSteps(s){
  const out=[],rows=budgetRows(s),over=rows.filter(r=>r.pct>100).sort((a,b)=>b.pct-a.pct),near=rows.filter(r=>r.pct>=80&&r.pct<100);
  if(over[0])out.push({ic:'wallet',t:`Reduce ${over[0].cat}`,x:`Superaste tu presupuesto por ${fmt(over[0].spent-over[0].limit)}. Revisa los movimientos de esa categoría.`,a:{label:'Ver presupuestos',route:'finanzas',tab:'presupuestos'}});
  else if(near[0])out.push({ic:'wallet',t:`Cuida ${near[0].cat}`,x:`Llevas ${pc(near[0].pct,0)} de tu límite. Te quedan ${fmt(near[0].limit-near[0].spent)}.`,a:{label:'Ver presupuestos',route:'finanzas',tab:'presupuestos'}});
  if(!s.tx.some(t=>t.date===todayS()))out.push({ic:'plus',t:'Registra tus movimientos de hoy',x:'Mantener tu registro al día hace que tus gráficas y hábitos sean más exactos.',a:{label:'Registrar movimiento',tx:true}});
  const g=s.goals.map(x=>({g:x,i:goalInfo(x)})).filter(x=>x.i.remain>0).sort((a,b)=>b.i.rec-a.i.rec)[0];
  if(g)out.push({ic:'flag',t:`Abona a "${g.g.name}"`,x:`Para llegar a tiempo necesitas ${fmt(g.i.rec)} al mes. Llevas ${pc(g.i.pct,0)}.`,a:{label:'Abonar',route:'finanzas',tab:'metas'}});
  if(streakOf(s.academy.days)>0&&!s.academy.days.includes(todayS()))out.push({ic:'fire',t:'Protege tu racha',x:`Llevas ${streakOf(s.academy.days)} días seguidos. Una lección corta la mantiene.`,a:{label:'Ir a Academia',route:'academia'}});
  const hd=[...s.debts].sort((a,b)=>b.rate-a.rate)[0];
  if(hd&&hd.rate>=30)out.push({ic:'trend',t:`Ataca "${hd.name}"`,x:`Tiene la tasa más alta (${pc(hd.rate,0)}). Compara avalancha y bola de nieve.`,a:{label:'Comparar métodos',route:'finanzas',tab:'deudas'}});
  if(!s.portfolios.some(p=>!p.demo))out.push({ic:'chart',t:'Crea tu primer portafolio',x:'Prueba un reparto y mira cómo crecería con interés compuesto (simulación educativa).',a:{label:'Ir al simulador',route:'inversiones',tab:'simulador'}});
  const nl=ALL_LESSONS.find(l=>levelUnlocked(s,l.level)&&!lessonDone(s,l.id));
  if(nl)out.push({ic:'book',t:`Siguiente lección: ${nl.title}`,x:'Gana XP y sube de nivel financiero.',a:{label:'Continuar',route:'academia'}});
  return out.slice(0,4);
}
function notifications(s){
  const out=[],n=s.user.notifs,mk=monthKey();
  if(n.budget)budgetRows(s).forEach(r=>{
    if(r.pct>100)out.push({id:`b-${r.cat}-${mk}-r`,k:'r',ic:'wallet',t:`Superaste ${r.cat}`,x:`Gastaste ${fmt(r.spent)} de ${fmt(r.limit)} (${pc(r.pct,0)}).`,go:['finanzas','presupuestos']});
    else if(r.pct>=80&&r.pct<100)out.push({id:`b-${r.cat}-${mk}-y`,k:'y',ic:'wallet',t:`${r.cat} cerca del límite`,x:`Llevas ${pc(r.pct,0)}: te quedan ${fmt(r.limit-r.spent)}.`,go:['finanzas','presupuestos']});
  });
  if(n.goals)s.goals.forEach(g=>{const i=goalInfo(g);
    if(g.saved>=g.target)out.push({id:`g-${g.id}-ok`,k:'g',ic:'flag',t:`Meta lograda: ${g.name}`,x:'Completaste tu objetivo de ahorro.',go:['finanzas','metas']});
    else if(i.late)out.push({id:`g-${g.id}-late`,k:'r',ic:'flag',t:`Meta vencida: ${g.name}`,x:`Faltan ${fmt(i.remain)}. Ajusta la fecha o tu aportación.`,go:['finanzas','metas']});
    else out.push({id:`g-${g.id}-${mk}`,k:'b',ic:'flag',t:`Aportación sugerida: ${g.name}`,x:`${fmt(i.rec)} este mes para llegar a tiempo.`,go:['finanzas','metas']});});
  if(n.streak){const st=streakOf(s.academy.days);
    if(!s.academy.days.includes(todayS()))out.push({id:`s-${todayS()}`,k:'y',ic:'fire',t:st?`Tu racha de ${st} días está en juego`:'Empieza una racha de aprendizaje',x:'Completa una lección o el reto diario.',go:['academia']});
    else out.push({id:`s-${todayS()}-ok`,k:'g',ic:'fire',t:`Racha de ${st} días`,x:'Ya practicaste hoy. Vuelve mañana.',go:['academia']});}
  out.push({id:'demo',k:'b',ic:'help',t:'Estás en modo demostración',x:'Todo es simulado. Puedes restaurar los datos en Perfil.',go:['perfil']});
  return out;
}
