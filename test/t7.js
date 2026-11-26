// Prueba M4: «Mi asesor» (seguro, inversión y mejor tarjeta) con cifras del modelo y de Banxico.
// Uso: node test/t7.js [url]
const {chromium}=require('playwright');const entrar=require('./entrar');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'..','index.html');
const ok=(c,m)=>{if(!c)throw new Error('FALLA: '+m);console.log('ok -',m)};
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 const txt=sel=>p.innerText(sel);
 await p.goto(URL);await entrar(p,'Familia Rivera','2026');
 await p.click('text=Ver recomendaciones');await p.waitForTimeout(600);
 ok((await txt('.ph h1')).includes('Mi asesor'),'Inicio lleva a «Mi asesor»');

 // 1. Seguro
 let t=await txt('#as-seguro');
 ok(t.includes('$2,331 al mes')&&t.includes('$1,833 al mes')&&t.includes('$5,974'),'seguro: prima $2,331, neto $1,833 y devolución de ISR $5,974 (hoja SGMM)');
 ok(t.includes('La mitad')&&t.includes('$56,504')&&t.includes('$27,966'),'seguro: colectiva $27,966 contra dos individuales $56,504');
 ok(await txt('#ev-sin')==='$100,852'&&await txt('#ev-con')==='$19,085','evento promedio: $100,852 sin seguro, $19,085 con seguro');
 await p.click('#as-seguro .seg >> text=Cáncer');await p.waitForTimeout(150);
 ok(await txt('#ev-sin')==='$297,000'&&await txt('#ev-con')==='$38,700','cáncer: $297,000 sin seguro, $38,700 con seguro');
 ok(t.includes('Supuesto'),'seguro: la prima estimada lleva «Supuesto»');

 // 2. Inversión
 t=await txt('#as-inversion');
 ok(/Proteger la salud\s*Ahora/.test(t)&&/Pagar la deuda más cara\s*Ahora/.test(t),'escalera: hoy toca proteger la salud y pagar la deuda más cara');
 ok(/Invertir para el retiro\s*Después/.test(t),'escalera: el retiro va después');
 ok(t.includes('Este mes (mes 1, diciembre 2026)')&&t.includes('$3,169'),'qué hacer este mes: seguro y $3,169 a la Azul');

 // 3. Tarjeta (desde el mes 5: paga el total)
 t=await txt('#as-tarjeta');
 ok(await txt('#tc-top')==='Walmart INVEX','tarjeta recomendada: Walmart INVEX');
 ok(t.includes('$748')&&t.includes('90.1%')&&t.includes('31.2%'),'porqué: ahorra $748 de anualidad y CAT 31.2 % contra 90.1 % de la Azul (Banxico)');
 ok(t.includes('Volaris INVEX 0 (28.7%)'),'explica por qué no la de menor CAT (Volaris, viajes)');
 ok(await p.$('#as-tarjeta tr.act')&&await p.$('#as-tarjeta tr.rec'),'tabla resalta la recomendada y la tarjeta actual');
 ok(t.includes('Supuesto'),'tarjeta: supuestos visibles');
 await p.click('#as-tarjeta .seg >> text=No (hoy)');await p.waitForTimeout(200);
 t=await txt('#as-tarjeta');
 ok(t.includes('no baja tu deuda')&&(await txt('#tc-top')).includes('No abras otra tarjeta'),'hoy (cargan saldo): no abrir otra tarjeta, primero liquidar');
 await p.click('#as-tarjeta .seg >> text=Sí (desde el mes 5)');await p.selectOption('#tc-uso','viajes');await p.waitForTimeout(150);
 ok(await txt('#tc-top')==='Volaris INVEX 0','con uso «viajes» recomienda Volaris INVEX 0');
 await p.selectOption('#tc-uso','super');
 await p.screenshot({path:__dirname+'/../asesor_rivera.png',fullPage:true});

 // Otra cuenta
 await p.click('.side >> text=Cerrar sesión');await entrar(p,'Rodrigo Demo');await p.click('text=Saltar tutorial');
 await p.click('.side >> text=Mi asesor');await p.waitForTimeout(500);
 t=await txt('#as-seguro');ok(t.includes('¿Tienes seguro')&&t.includes('meses de tu ingreso'),'Rodrigo: pregunta por su seguro y muestra el evento en meses de ingreso');
 await p.click('#as-seguro .seg >> text=No');await p.waitForTimeout(150);
 ok((await txt('#as-seguro')).includes('Consigue un seguro'),'Rodrigo sin seguro: recomienda conseguirlo');
 ok(/Proteger la salud\s*Ahora/.test(await txt('#as-inversion')),'Rodrigo: su escalera empieza por el seguro');
 ok((await txt('#tc-top')).length>3,'Rodrigo: recibe una recomendación de tarjeta');

 // Celular: barra inferior sin desborde y con «Asesor»
 const m=await b.newPage({viewport:{width:390,height:844}});m.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await m.goto(URL);await entrar(m,'Familia Rivera','2026');await m.click('.bottom >> text=Asesor');await m.waitForTimeout(600);
 ok(!(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'celular: sin desborde horizontal');
 await m.screenshot({path:__dirname+'/../asesor_movil.png',fullPage:true});
 ok(errs.length===0,'sin errores en consola '+JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
