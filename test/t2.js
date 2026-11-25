const {chromium}=require('playwright');const entrar=require('./entrar');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));await p.waitForTimeout(1200);
 await entrar(p,'Rodrigo Demo');
 await p.click('text=Saltar tutorial');
 const kp=async(l)=>p.evaluate(l=>{const k=[...document.querySelectorAll('.kpi')].find(x=>x.innerText.includes(l));return k&&k.querySelector('.v').innerText},l);
 console.log('gastos mes before',await kp('Gastos del mes'));
 // add expense
 await p.click('text=Nuevo movimiento');
 await p.click('.modal button:has-text("Registrar")');
 console.log('errors empty:',await p.$$eval('.err',e=>e.map(x=>x.innerText)));
 await p.fill('#tx-amt','-50');await p.selectOption('#tx-cat','Alimentación');await p.click('.modal button:has-text("Registrar")');
 console.log('errors neg:',await p.$$eval('.err',e=>e.map(x=>x.innerText)));
 await p.fill('#tx-amt','350');await p.fill('#tx-note','Tacos test');await p.click('.modal button:has-text("Registrar")');await p.waitForTimeout(400);
 console.log('gastos mes after add',await kp('Gastos del mes'));
 // finanzas movimientos edit/delete
 await p.click('.side >> text=Mis finanzas');await p.waitForTimeout(500);
 await p.fill('#f-q','Tacos');await p.waitForTimeout(200);
 console.log('rows',await p.$$eval('tbody tr',r=>r.length));
 await p.click('[aria-label="Editar movimiento"]');await p.fill('#tx-amt','400');await p.click('button:has-text("Guardar cambios")');await p.waitForTimeout(300);
 console.log('row text',await p.$$eval('tbody tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' '))));
 await p.click('[aria-label="Eliminar movimiento"]');await p.click('.modal button:has-text("Eliminar")');await p.waitForTimeout(300);
 console.log('rows after delete',await p.$$eval('tbody tr',r=>r.length));
 await p.fill('#f-q','');
 for(const t of ['Análisis','Presupuestos','Metas','Deudas']){await p.click(`.tabs >> text=${t}`);await p.waitForTimeout(700);await p.screenshot({path:`f_${t}.png`,fullPage:true});}
 // abonar
 await p.click('.tabs >> text=Metas');await p.click('button:has-text("Abonar") >> nth=0');await p.fill('#ab-v','0');await p.click('.modal button:has-text("Abonar")');
 console.log('abono err',await p.$$eval('.err',e=>e.map(x=>x.innerText)));
 await p.fill('#ab-v','1000');await p.click('.modal button:has-text("Abonar")');await p.waitForTimeout(300);
 console.log('meta text',await p.$eval('.card.col',e=>e.innerText.slice(0,120)));
 // inversiones
 await p.click('.side >> text=Inversiones');await p.click('.tabs >> text=Simulador');await p.waitForTimeout(800);
 await p.fill('#s-n','Mi plan test');await p.click('button:has-text("Guardar portafolio")');await p.waitForTimeout(300);
 console.log('portfolios',await p.$$eval('.card.flat b',e=>e.map(x=>x.innerText)).then(a=>a.filter(x=>/plan|virtual/i.test(x))));
 await p.screenshot({path:'inv.png',fullPage:true});
 // academia
 await p.click('.side >> text=Academia');await p.waitForTimeout(500);
 const xp0=await p.$eval('.ph .pill',e=>e.innerText);
 await p.click('.lesson:has-text("Presupuesto 50/30/20")');await p.click('.modal button:has-text("Empezar")');
 await p.click('.opt:has-text("Gustos y deseos")');await p.click('button:has-text("Comprobar")');await p.waitForTimeout(200);
 console.log('feedback',await p.$eval('.fb',e=>e.innerText));
 await p.screenshot({path:'lesson.png'});
 await p.click('button:has-text("Continuar")');await p.fill('#ans','3000');await p.click('button:has-text("Comprobar")');await p.click('button:has-text("Continuar")');
 await p.fill('#ans','necesidades');await p.click('button:has-text("Comprobar")');await p.click('button:has-text("Continuar")');
 await p.click('.opt:has-text("Verdadero")');await p.click('button:has-text("Comprobar")');await p.click('button:has-text("Ver resultado")');await p.waitForTimeout(300);
 console.log('end',await p.$eval('.modal',e=>e.innerText.replace(/\s+/g,' ')));
 await p.click('.modal >> text=Crear un presupuesto');await p.waitForTimeout(500);
 console.log('after rel link tab on:',await p.$eval('.tabs button.on',e=>e.innerText));
 await p.click('.side >> text=Academia');await p.waitForTimeout(500);
 console.log('xp',xp0,'->',await p.$eval('.ph .pill',e=>e.innerText));
 // persistence
 await p.reload();await p.waitForTimeout(1200);
 console.log('after reload: xp',await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rodrigo')).academy.xp),'tx count',await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rodrigo')).tx.length),'portfolios',await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rodrigo')).portfolios.length), 'tutorial?',await p.$$('.modal'));
 // mexico
 await p.click('.side >> text=México hoy');await p.waitForTimeout(800);await p.screenshot({path:'mx.png',fullPage:true});
 await p.click('button:has-text("¿Qué significa esto?") >> nth=0');await p.waitForTimeout(500);
 const pts=async()=>p.$$eval('.recharts-area-curve',e=>e[0]&&e[0].getAttribute('d').length);
 const d1=await pts();await p.click('.modal .seg >> text=5 años');await p.waitForTimeout(600);console.log('range changed',d1!==await pts());
 await p.screenshot({path:'mxm.png'});await p.keyboard.press('Escape');
 await p.click('button:has-text("Resumir con IA") >> nth=0');await p.waitForTimeout(1000);console.log('sum',await p.$eval('.card.flat ul',e=>e.innerText.slice(0,60)));
 // asistente
 await p.click('.side >> text=Asistente IA');await p.click('.chip:has-text("¿Cuánto gasté este mes?")');await p.waitForTimeout(1200);
 console.log('chat',await p.$$eval('.msg',e=>e.map(x=>x.innerText.slice(0,110))));
 await p.screenshot({path:'ai.png'});
 console.log('ERRS',errs);
 await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
