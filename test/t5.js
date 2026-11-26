// Prueba M2: «Plan del hogar». Las cifras con recorte de $4,000 deben coincidir con el modelo final (Excel).
// Uso: node test/t5.js [url]
const {chromium}=require('playwright');const entrar=require('./entrar');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'..','index.html');
const ok=(c,m)=>{if(!c)throw new Error('FALLA: '+m);console.log('ok -',m)};
const kpi=(p,l)=>p.evaluate(l=>{const k=[...document.querySelectorAll('.kpi')].find(x=>x.querySelector('.l').innerText.includes(l));return k&&k.querySelector('.v').innerText},l);
const slide=(p,sel,v)=>p.$eval(sel,(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))},v);
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto(URL);await entrar(p,'Familia Rivera','2026');
 await p.click('text=Ver plan del hogar');await p.waitForTimeout(700);
 ok(await p.$eval('.tabs button.on',e=>e.innerText)==='Plan del hogar','Inicio lleva a la pestaña Plan del hogar');

 // Recorte del plan ($4,000) = modelo final
 ok(await kpi(p,'Tarjeta liquidada')==='Mes 5','tarjeta liquidada en el mes 5 (Excel: 5)');
 ok(await kpi(p,'Fondo en la meta')==='Mes 16','fondo en la meta en el mes 16 (Excel: 16)');
 ok(await kpi(p,'Fondo al mes 24')==='$81,430','fondo al mes 24 = $81,430 (Excel: 81,429.80)');
 ok(await kpi(p,'Meses que cubre')==='4.9 meses','cubre 4.9 meses al mes 24 (Excel: 4.94)');
 ok((await p.innerText('body')).includes('Intereses pagados: $3,277'),'intereses de la tarjeta $3,277 (Excel: 3,277.35)');
 ok(!(await p.$('.banner.r')),'sin déficit con el recorte del plan');

 // Cuadre ingreso = egresos + ahorro en cada vista
 for(const v of ['Hoy','Mes 1','Mes 6','Mes 13','Mes 22']){await p.click(`.seg >> text="${v}"`);await p.waitForTimeout(150);
   ok(await p.$('.cuadre.ok'),`${v}: ingreso = egresos + ahorro`)}
 await p.click('.seg >> text="Hoy"');ok((await p.innerText('.cuadre')).includes('ahorro $0'),'Hoy: ahorro $0');

 // Tabla mes a mes contra hoja Ahorro
 await p.click('text=Ver los 24 meses');await p.waitForTimeout(200);
 const fila=async m=>p.$eval(`table.plan-t tbody tr:nth-child(${m})`,e=>[...e.children].map(x=>x.innerText));
 ok((await fila(5))[4]==='$9,570','mes 5: ahorro $9,570 (Excel: 9,570.04)');
 ok((await fila(13))[4]==='$3,767','mes 13: ahorro $3,767 (Excel: 3,767.22)');
 ok((await fila(12))[5]==='$33,355','mes 12: fondo $33,355 (Excel: 33,354.56)');
 ok((await fila(22))[4]==='$1,417','mes 22: ahorro $1,417 con PPR (Excel: 1,417.22)');
 await p.screenshot({path:__dirname+'/../hogar_rivera.png',fullPage:true});

 // Simulador
 await slide(p,'#ph-r',3000);await p.waitForTimeout(300);
 ok(await kpi(p,'Fondo en la meta')==='Mes 20','recorte $3,000: fondo en la meta en el mes 20');
 await slide(p,'#ph-r',0);await p.waitForTimeout(300);
 const ban=await p.$('.banner.r');ok(ban&&(await ban.innerText()).includes('no alcanza'),'recorte $0: aviso de que el plan no alcanza');
 await p.screenshot({path:__dirname+'/../hogar_deficit.png'});
 await p.click('text=Volver al plan');await p.waitForTimeout(300);
 ok(await kpi(p,'Fondo al mes 24')==='$81,430','«Volver al plan» regresa a $4,000');

 // Otra cuenta: fondo básico
 await p.click('.side >> text=Cerrar sesión');await entrar(p,'Rodrigo Demo');await p.click('text=Saltar tutorial');
 await p.click('.side >> text=Mis finanzas');await p.click('.tabs >> text=Plan del hogar');await p.waitForTimeout(500);
 const t=await p.innerText('body');
 ok(t.includes('meses cubiertos')&&t.includes('¿Cuánto tardas en llegar?'),'Rodrigo ve su fondo de emergencia básico');
 ok(await p.$('.cuadre.ok'),'Rodrigo: cuadre del mes');

 // Celular
 const m=await b.newPage({viewport:{width:390,height:844}});m.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await m.goto(URL);await entrar(m,'Familia Rivera','2026');await m.click('text=Ver plan del hogar');await m.waitForTimeout(700);
 ok(!(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'sin desborde horizontal en celular');
 await m.screenshot({path:__dirname+'/../hogar_movil.png',fullPage:true});
 ok(errs.length===0,'sin errores en consola '+JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
