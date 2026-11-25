// Prueba M1: login con perfiles + PIN local y caso Familia Rivera.
// Uso: node test/t4.js [url]  (por defecto, el index.html local)
const {chromium}=require('playwright');const entrar=require('./entrar');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'..','index.html');
const ok=(c,m)=>{if(!c)throw new Error('FALLA: '+m);console.log('ok -',m)};
(async()=>{
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 const body=()=>p.innerText('body');
 const kp=l=>p.evaluate(l=>{const k=[...document.querySelectorAll('.kpi')].find(x=>x.innerText.includes(l));return k&&k.querySelector('.v').innerText},l);
 await p.goto(URL);await p.waitForSelector('.login',{timeout:10000});
 ok((await body()).includes('¿Quién va a usar FINOVA?'),'se ve la pantalla de entrada');
 await p.screenshot({path:__dirname+'/../login.png'});

 // PIN incorrecto
 await p.click('button[aria-label="Entrar como Familia Rivera"]');
 await p.fill('#pin-in','1111');await p.click('form.pin-card button[type=submit]');await p.waitForTimeout(500);
 ok(((await p.textContent('.pin-card .err'))||'').includes('PIN incorrecto'),'PIN incorrecto rechazado');
 ok(!(await p.$('.app')),'no entra con PIN incorrecto');
 await p.click('text=Cambiar de perfil');

 // Caso Rivera
 await entrar(p,'Familia Rivera','2026');
 let t=await body();
 ok(t.includes('Familia Rivera'),'saluda al hogar por su nombre');
 ok(!(await p.$('.modal')),'el caso entra sin tutorial');
 ok(t.includes('Tu plan en 24 meses'),'tarjeta del plan de 24 meses');
 ok(t.includes('$54,000')&&t.includes('$81,430')&&t.includes('$95,001'),'cifras del resumen (deuda, fondo, posición neta)');
 ok(await kp('Ingresos del mes')==='$25,955','ingresos del mes = $25,955');
 ok(await kp('Saldo disponible')==='$0','saldo disponible = $0 (no sobra nada)');
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_u_rivera')));
 const n=new Date(),pm=new Date(n.getFullYear(),n.getMonth()-1,1),key=`${pm.getFullYear()}-${String(pm.getMonth()+1).padStart(2,'0')}`;
 const mt=st.tx.filter(x=>x.date.startsWith(key)),s=ty=>mt.filter(x=>x.type===ty).reduce((a,x)=>a+x.amount,0);
 ok(s('ingreso')===25955&&s('gasto')===25955,`mes completo ${key}: ingresos y gastos = 25,955`);
 await p.screenshot({path:__dirname+'/../rivera_inicio.png',fullPage:true});

 await p.click('.side >> text=Mis finanzas');await p.click('.tabs >> text=Deudas');await p.waitForTimeout(600);
 t=await body();ok(t.includes('Tarjeta Azul BBVA')&&t.includes('Préstamo de Nómina BBVA'),'deudas BBVA del caso');
 await p.click('.tabs >> text=Presupuestos');await p.waitForTimeout(600);
 t=await body();ok(t.includes('superaste tu presupuesto por $1,750')&&t.includes('superaste tu presupuesto por $2,250'),'presupuesto marca el recorte de $4,000 (1,750 + 2,250)');
 await p.screenshot({path:__dirname+'/../rivera_presupuestos.png',fullPage:true});
 await p.click('.side >> text=Perfil');await p.waitForTimeout(500);
 t=await body();ok(t.includes('Mi hogar')&&t.includes('Papá · 44 años'),'Perfil muestra a los integrantes del hogar');

 // Cerrar sesión
 await p.click('.side >> text=Cerrar sesión');await p.waitForSelector('.login');ok(true,'cerrar sesión regresa a la entrada');

 // Crear cuenta nueva con PIN
 await p.click('button.acc-new');
 await p.fill('#ca-n','Prueba');await p.fill('#ca-i','18000');await p.fill('#ca-p','1234');await p.fill('#ca-p2','1234');
 await p.click('form.pin-card button[type=submit]');await p.waitForSelector('.app');await p.waitForTimeout(600);
 await p.click('text=Saltar tutorial');
 ok((await body()).includes('Prueba'),'la cuenta nueva entra a la app');
 ok(await kp('Ingresos del mes')==='$0','la cuenta nueva empieza sin movimientos');
 for(const r of ['México hoy','Mis finanzas','Asistente IA','Inversiones','Academia','Perfil','Inicio']){await p.click(`.side >> text=${r}`);await p.waitForTimeout(400)}
 await p.click('.side >> text=Mis finanzas');
 for(const tb of ['Análisis','Presupuestos','Metas','Deudas']){await p.click(`.tabs >> text=${tb}`);await p.waitForTimeout(300)}
 ok(true,'todas las secciones abren con una cuenta vacía');
 await p.reload();await p.waitForSelector('.app');ok((await body()).includes('Prueba'),'la sesión sobrevive a recargar');
 const accs=await p.evaluate(()=>localStorage.getItem('finova_cuentas_v1'));
 ok(!accs.includes('"1234"')&&!accs.includes('"2026"'),'los PIN no se guardan en claro');
 ok(JSON.parse(accs).every(a=>!a.pin||/^[0-9a-f]{64}$/.test(a.pin.hash)),'los PIN se guardan como SHA-256');

 // Eliminar cuenta
 await p.click('.side >> text=Perfil');await p.click('button:has-text("Eliminar mi cuenta y mis datos")');await p.click('.modal button:has-text("Eliminar cuenta")');
 await p.waitForSelector('.login');
 ok(!(await p.$('button[aria-label="Entrar como Prueba"]')),'la cuenta eliminada ya no aparece');
 ok(await p.evaluate(()=>!Object.keys(localStorage).filter(k=>k.startsWith('finova_u_')).some(k=>JSON.parse(localStorage.getItem(k)).user.name==='Prueba')),'sus datos se borraron del dispositivo');

 // Entrada en celular
 const m=await b.newPage({viewport:{width:375,height:812}});await m.goto(URL);await m.waitForSelector('.login');
 ok(!(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'la entrada no desborda en celular');
 await m.screenshot({path:__dirname+'/../login_movil.png',fullPage:true});
 ok(errs.length===0,'sin errores en consola '+JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
