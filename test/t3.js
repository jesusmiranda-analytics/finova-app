const {chromium}=require('playwright');const entrar=require('./entrar');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));await p.waitForTimeout(1200);await entrar(p,'Rodrigo Demo');await p.click('text=Saltar tutorial');
for(const r of ['Inicio','Finanzas','Invertir','Academia']){await p.click(`.bottom >> text=${r}`);await p.waitForTimeout(700);
 console.log(r,'hscroll',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));}
await p.click('.bottom >> text=Inicio');await p.waitForTimeout(600);await p.screenshot({path:'m1.png'});console.log(e);await b.close()})();
