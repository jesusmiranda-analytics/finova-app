// Prueba M3: ahorro por plazos con CETES y tasas oficiales del Diagnóstico.
// Uso: node test/t6.js [url]
const {chromium}=require('playwright');const entrar=require('./entrar');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'..','index.html');
const ok=(c,m)=>{if(!c)throw new Error('FALLA: '+m);console.log('ok -',m)};
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 const card=k=>p.innerText(`.plazo.${k}`);
 await p.goto(URL);await entrar(p,'Familia Rivera','2026');
 await p.click('.side >> text=Mis finanzas');await p.click('.tabs >> text=Metas');await p.waitForTimeout(600);
 ok((await p.innerText('body')).includes('Ahorro por plazos'),'Metas muestra «Ahorro por plazos»');
 let t=await card('corto');
 ok(t.includes('Mes 5')&&t.includes('abril 2027')&&t.includes('$33,355'),'corto: tarjeta mes 5 (abril 2027) y fondo $33,355 al mes 12');
 ok(/\+\$[1-9]/.test(t),'corto: los CETES suman intereses');
 t=await card('mediano');
 ok(t.includes('Mes 16')&&t.includes('marzo 2028')&&t.includes('$47,673'),'mediano: meta de 3 meses ($47,673) en el mes 16, marzo 2028');
 ok(t.includes('Mes 21')&&t.includes('$76,146'),'mediano: cero deudas en el mes 21 y fondo $76,146');
 ok(/\+\$[1-9]/.test(t),'mediano: los CETES suman intereses');
 t=await card('largo');
 ok(t.includes('$4,500')&&t.includes('$15,953')&&t.includes('61 %')&&t.includes('$13,571'),'largo: PPR $4,500, $13,571 al mes 24 y retiro $15,953 (61 %)');
 t=await p.innerText('body');
 ok(t.includes('Mediano plazo')&&t.includes('Fondo de emergencia (CETES)'),'la meta del fondo de los Rivera cae en mediano plazo');
 ok(t.includes('Dónde ahorrarlo: CETES 28 días')&&!t.includes('Dónde ahorrarlo: CETES 364'),'el fondo de emergencia se recomienda en CETES 28 días, igual que el plan');
 await p.screenshot({path:__dirname+'/../plazos_rivera.png',fullPage:true});

 // Tasas oficiales
 await p.click('.side >> text=México hoy');await p.waitForTimeout(600);
 const c28=await p.evaluate(()=>{const c=[...document.querySelectorAll('.card')].find(x=>x.querySelector('b')&&x.querySelector('b').innerText==='CETES 28 días');return c&&c.innerText});
 ok(c28&&c28.includes('6.20%')&&c28.includes('Dato oficial')&&c28.includes('10 nov 2026'),'México hoy: CETES 28 días 6.20 % oficial (10 nov 2026)');
 await p.click('.side >> text=Inversiones');await p.waitForTimeout(500);
 ok((await p.innerText('body')).includes('6.2%'),'catálogo de Inversiones: CETES 6.2 %');
 await p.click('.side >> text=Asistente IA');await p.waitForTimeout(400);
 for(const q of ['¿Cómo afecta la inflación a mi ahorro?','¿Cómo voy con mi meta?']){await p.fill('#ai-q',q);await p.press('#ai-q','Enter');await p.waitForTimeout(1300)}
 const sent=true;
 await p.waitForTimeout(1500);
 const chat=await p.innerText('body');
 if(sent)ok(!chat.includes('7.5%')&&!chat.includes('3.9%'),'el asistente ya no usa 7.5 % ni 3.9 %');
 ok(!(await p.content()).includes('7.5%'),'«7.5%» no aparece en la app');

 // Otras cuentas: metas agrupadas por plazo
 await p.click('.side >> text=Cerrar sesión');await entrar(p,'Rodrigo Demo');await p.click('text=Saltar tutorial');
 await p.click('.side >> text=Mis finanzas');await p.click('.tabs >> text=Metas');await p.waitForTimeout(500);
 t=await p.innerText('body');
 ok(!t.includes('Ahorro por plazos'),'Rodrigo no ve los plazos del caso');
 ok(t.includes('Corto plazo')&&t.includes('Dónde ahorrarlo: CETES 28 días')&&/ganarías \+\$[1-9]/.test(t),'Rodrigo: metas de corto plazo con CETES 28 días y ganancia');
 await p.click('button:has-text("Nueva meta")');
 const d=new Date();d.setMonth(d.getMonth()+24);const iso=d.toISOString().slice(0,10);
 await p.fill('#g-n','Enganche auto');await p.fill('#g-t','60000');await p.fill('#g-d',iso);await p.click('.modal button:has-text("Crear meta")');await p.waitForTimeout(500);
 t=await p.innerText('body');
 ok(t.includes('Mediano plazo')&&t.includes('CETES 364 días'),'una meta a 2 años cae en mediano plazo con CETES 364 días');

 const m=await b.newPage({viewport:{width:390,height:844}});m.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await m.goto(URL);await entrar(m,'Familia Rivera','2026');await m.click('.bottom >> text=Finanzas');await m.click('.tabs >> text=Metas');await m.waitForTimeout(600);
 ok(!(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'sin desborde horizontal en celular');
 await m.screenshot({path:__dirname+'/../plazos_movil.png',fullPage:true});
 ok(errs.length===0,'sin errores en consola '+JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
