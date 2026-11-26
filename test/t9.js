// Aviso por perfil, permisos opcionales y protección de exportaciones.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const url = process.argv[2] || pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

(async () => {
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({viewport:{width:390,height:844}});
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    const button = name => p.getByRole('button',{name,exact:true});
    await p.goto(url);
    await button('Entrar como Familia Rivera').waitFor();
    // Una sesión de la versión anterior también debe aceptar antes de ver saldos.
    await p.evaluate(()=>sessionStorage.setItem('finova_sesion','rivera'));
    await p.reload();
    await p.locator('#notice-accept').waitFor();
    assert.equal(await p.locator('.app').count(),0);
    assert.equal(await p.locator('#notice-accept').isEnabled(),false);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
    await button('Salir').click();
    assert.equal(await p.evaluate(()=>sessionStorage.getItem('finova_sesion')),null);
    await button('Entrar como Familia Rivera').click();
    await p.fill('#pin-in','2026');
    await button('Entrar').click();
    await p.check('#notice-check');
    // Un error de escritura no debe abrir la cuenta ni registrar una aceptación ficticia.
    await p.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='finova_cuentas_v1')throw Error('almacenamiento lleno');window.originalSet.call(this,k,v)}});
    await button('Aceptar y continuar').click();
    await p.getByRole('alert').waitFor();
    assert.equal(await p.locator('.app').count(),0);
    await p.evaluate(()=>{Storage.prototype.setItem=window.originalSet;delete window.originalSet});
    await button('Aceptar y continuar').click();
    await p.locator('.app').waitFor();
    await p.reload();
    await p.locator('.app').waitFor();
    const accounts=await p.evaluate(()=>JSON.parse(localStorage.getItem('finova_cuentas_v1')));
    assert.ok(accounts.find(a=>a.id==='rivera').notice.at);
    assert.equal(accounts.find(a=>a.id==='rodrigo').notice,undefined);
    console.log('ok - aviso por perfil, rechazo, sesión anterior y error de escritura');
    await p.setViewportSize({width:1280,height:900});
    await button('Mis impuestos').click();
    assert.equal(await p.locator('#radar-card').count(),0);
    await button('Revisar permiso fiscal').click();await button('Ahora no').click();
    assert.equal(await p.locator('#radar-card').count(),0);
    await button('Revisar permiso fiscal').click();await button('Autorizar simulación').click();
    await p.locator('#radar-card').waitFor();
    await button('Perfil').click();
    await button('Retirar permiso y borrar datos fiscales').click();
    await button('Desconectar y borrar').click();
    await p.getByText('Sin autorización vigente.',{exact:true}).waitFor();
    await p.getByText('Actividad de privacidad',{exact:true}).click();
    assert.ok((await p.locator('.page').innerText()).includes('Permiso fiscal retirado'));
    await button('Exportar movimientos (CSV)').click();
    await p.fill('#privacy-pin','0000');await button('Verificar PIN').click();
    await p.getByRole('alert').waitFor();
    assert.equal(await p.locator('textarea.code').count(),0);
    await p.fill('#privacy-pin','2026');await button('Verificar PIN').click();
    await p.locator('textarea.code').waitFor();
    assert.match(await p.locator('textarea.code').inputValue(),/^fecha,tipo,/);
    await p.locator('.mf').getByText('Cerrar',{exact:true}).click();
    await button('Cambiar o quitar PIN').click();
    await p.locator('#privacy-pin').waitFor();
    assert.equal(await p.locator('#np-1').count(),0);
    await button('Cancelar').click();
    await button('Exportar datos (JSON)').click();
    await p.locator('#privacy-pin').waitFor();await button('Cancelar').click();
    await button('Restaurar datos').click();
    await p.fill('#privacy-pin','2026');await button('Verificar PIN').click();
    await button('Restaurar').click();await p.locator('.plan-overview').waitFor();
    await p.reload();await p.locator('.plan-overview').waitFor();
    await button('Mis impuestos').click();assert.equal(await p.locator('#radar-card').count(),0);
    console.log('ok - revocación desde Perfil, exportación protegida, PIN actual y restauración');
    await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem('finova_cuentas_v1'));a.find(x=>x.id==='rivera').notice.version='anterior';localStorage.setItem('finova_cuentas_v1',JSON.stringify(a))});
    await p.reload();await p.locator('#notice-accept').waitFor();
    assert.equal(await p.locator('.app').count(),0);
    assert.deepEqual(errors,[]);
    console.log('ok - nueva versión requiere nueva aceptación');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

