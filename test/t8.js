// Prueba «Mis impuestos»: conexión SAT simulada sin contraseñas, radar, devolución integrada al plan y trazabilidad.
// Uso: node test/t8.js [url]
const {chromium}=require('playwright');const entrar=require('./entrar');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'..','index.html');
const ok=(c,m)=>{if(!c)throw new Error('FALLA: '+m);console.log('ok -',m)};
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 const txt=sel=>p.innerText(sel);
 const kpi=l=>p.evaluate(l=>{const k=[...document.querySelectorAll('.kpi')].find(x=>x.querySelector('.l').innerText.includes(l));return k&&k.querySelector('.v').innerText},l);
 await p.goto(URL);await entrar(p,'Familia Rivera','2026');
 await p.click('.side >> text=Mi asesor');await p.waitForTimeout(400);
 ok((await txt('#as-impuestos')).includes('$5,974'),'Mi asesor: tarjeta 4 con la devolución de $5,974');
 await p.click('#as-impuestos >> text=Ver Mis impuestos');await p.waitForTimeout(500);
 ok((await txt('.ph h1')).includes('Mis impuestos'),'Mi asesor lleva a Mis impuestos');

 // Conexión sin contraseñas
 ok((await p.$$('input[type=password], input[name*=ciec i], input[name*=firma i]')).length===0,'no hay ningún campo de contraseña, CIEC ni e.firma');
 ok((await txt('#sat-card')).includes('Sin contraseñas'),'aviso explícito: sin contraseñas');

 // Devolución del modelo
 ok(await txt('#dev-monto')==='$5,974'&&(await txt('#dev-card')).includes('mes 16 (marzo 2028)'),'devolución $5,974 en el mes 16 (marzo 2028), como el Excel');
 ok(await txt('#dev-ppr')==='$12,975','con PPR: $12,975 al año (seguro $6,690 + PPR $6,285)');

 const autorizar=async()=>{await p.getByRole('button',{name:'Revisar permiso fiscal'}).click();await p.getByRole('button',{name:'Autorizar simulación'}).click()};
 ok(!(await p.$('#radar-card')),'el radar requiere autorización');
 await autorizar();
 // Radar
 ok(await kpi('Perdido por pagar en efectivo')==='$3,600','radar: $3,600 en consultas pagadas en efectivo no deducibles');
 const r=await txt('#radar-card');
 ok(r.includes('Primas de seguro de gastos médicos')&&r.includes('D07')&&r.includes('No deducible: efectivo'),'radar: prima del SGMM del plan (CFDI D07) y consultas en efectivo');

 // Conectar, recibir devolución, abonar al fondo
 await p.waitForTimeout(300);
 ok((await txt('#sat-card')).includes('Conectado (demo)')&&(await txt('#sat-card')).includes('XAXX010101000'),'conectado con RFC genérico de demostración');
 await p.click('text=Recibir devolución (demo)');await p.waitForTimeout(300);
 ok((await txt('.modal')).includes('Comprobante de devolución')&&(await txt('.modal')).includes('$5,974'),'comprobante de devolución con folio');
 await p.click('.modal >> text=Abonar $5,974');await p.waitForTimeout(300);
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rivera')));
 ok(st.tx.some(t=>t.cat==='Devolución de impuestos'&&t.amount===5974),'la devolución quedó en Movimientos');
 ok(st.goals.find(g=>/emergencia/i.test(g.name)).saved===5974,'y se abonó al fondo de emergencia');
 const h=await txt('#hist-card');ok(h.includes('Conexión')&&h.includes('Devolución')&&h.includes('Abono al fondo'),'historial fiscal: conexión, devolución y abono');
 await p.screenshot({path:__dirname+'/../impuestos_rivera.png',fullPage:true});
 await p.click('text=Desconectar y borrar mis datos fiscales');await p.click('.modal button:has-text("Desconectar y borrar")');await p.waitForTimeout(300);
 ok(!(await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rivera')).fiscal)),'desconectar borra los datos fiscales');

 await autorizar();
 ok(!(await p.getByText('Recibir devolución (demo)',{exact:true}).count()),'reconectar no ofrece duplicar la devolución');
 // Rodrigo: gasto médico en efectivo y apartado fiscal con pago
 await p.click('.side >> text=Cerrar sesión');await entrar(p,'Rodrigo Demo');await p.click('text=Saltar tutorial');
 await p.click('text=Nuevo movimiento');await p.fill('#tx-amt','800');await p.selectOption('#tx-cat','Salud');await p.selectOption('#tx-met','Efectivo');await p.fill('#tx-note','Consulta dentista');
 await p.click('.modal button:has-text("Registrar")');await p.waitForTimeout(300);
 await p.click('.side >> text=Mis impuestos');await p.waitForTimeout(500);
 await autorizar();
 ok(await kpi('Perdido por pagar en efectivo')==='$800','Rodrigo: el dentista en efectivo sale como no deducible');
 ok(await p.$('#apartado-card'),'Rodrigo: aparece el apartado fiscal por su ingreso freelance');
 await p.fill('#ap-pct','10');await p.waitForTimeout(200);
 const pend=await txt('#ap-pend');ok(pend==='$360','apartado del 10 % sobre $3,600 de freelance: $360 pendientes');
 const saldo0=await kpi('Saldo disponible').catch(()=>null);
 await p.click('text=Pagar $360 con línea de captura (demo)');await p.waitForTimeout(300);
 ok((await txt('.modal')).includes('Línea de captura'),'comprobante de pago con línea de captura');
 await p.click('.modal >> text=Cerrar');
 const st2=await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rodrigo')));
 ok(st2.tx.some(t=>t.cat==='Impuestos'&&t.amount===360&&/línea de captura/.test(t.note)),'el pago quedó como gasto «Impuestos» en Movimientos');
 ok((await txt('#hist-card')).includes('Pago'),'historial fiscal registra el pago');

 const m=await b.newPage({viewport:{width:390,height:844}});m.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await m.goto(URL);await entrar(m,'Familia Rivera','2026');await m.click('.bottom >> text=Asesor');await m.click('#as-impuestos >> text=Ver Mis impuestos');await m.waitForTimeout(600);
 ok(!(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'celular: sin desborde horizontal');
 await m.screenshot({path:__dirname+'/../impuestos_movil.png',fullPage:true});
 ok(errs.length===0,'sin errores en consola '+JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
