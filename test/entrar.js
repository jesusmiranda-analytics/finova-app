// Entra a FINOVA con un perfil de la pantalla de inicio (y su PIN si lo tiene).
module.exports=async function entrar(p,name,pin){
  await p.waitForSelector(`button[aria-label="Entrar como ${name}"]`,{timeout:8000});
  await p.click(`button[aria-label="Entrar como ${name}"]`);
  if(pin){await p.fill('#pin-in',pin);await p.click('form.pin-card button[type=submit]');}
  await p.waitForSelector('.app',{timeout:8000});await p.waitForTimeout(600);
};
