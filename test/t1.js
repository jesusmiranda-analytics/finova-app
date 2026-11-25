const {chromium}=require('playwright');const entrar=require('./entrar');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));await p.waitForTimeout(1500);await entrar(p,'Rodrigo Demo');
 console.log('root children',await p.evaluate(()=>document.getElementById('root').children.length));
 console.log(await p.evaluate(()=>document.body.innerText.slice(0,300)));
 await p.screenshot({path:__dirname+'/s1.png'});
 console.log('ERRS',errs.slice(0,8));
 await b.close();
})();
