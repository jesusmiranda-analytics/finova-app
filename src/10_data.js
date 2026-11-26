/* ================= UTILIDADES ================= */
const {useState,useEffect,useMemo,useRef,useContext,createContext}=React;
const html=htm.bind(React.createElement);
const RC=window.Recharts;
const KEY='finova_demo_v1';
const MXN=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const MXN2=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:2,maximumFractionDigits:2});
const fin=n=>Number.isFinite(n)?n:0;
const fmt=n=>MXN.format(Math.round(fin(n)));
const fmt2=n=>MXN2.format(fin(n));
const pc=(n,d=1)=>fin(n).toFixed(d)+'%';
const nf=(n,d=2)=>new Intl.NumberFormat('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d}).format(fin(n));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const todayS=()=>iso(new Date());
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fdate=s=>{const d=pd(s);return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`};
const fshort=s=>{const d=pd(s);return `${d.getDate()} ${MES[d.getMonth()]}`};
const uid=()=>Math.random().toString(36).slice(2,9);
const num=v=>{if(v===''||v==null)return NaN;return Number(String(v).replace(/,/g,''))};
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&iso(pd(s))===s;
const sum=(a,f=x=>x)=>a.reduce((t,x)=>t+f(x),0);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9. ]/g,'').trim();
const monthsBetween=(a,b)=>(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();

/* Tasas oficiales del Diagnóstico final de la consultora (sección Supuestos, noviembre 2026).
   Única fuente de tasas para CETES, inflación y Banxico en toda la app. */
const TASAS={cetes28:6.20,cetes364:6.95,isr:0.90,inflacion:3.75,banxico:6.25,
  fuente:{cetes:'Banco de México, subasta del 10 nov 2026',isr:'LIF 2026, art. 24',inflacion:'INEGI, INPC octubre 2026',banxico:'Banco de México, decisión del 5 nov 2026'}};
const netoCetes=t=>t-TASAS.isr;                                     // % anual después de la retención de ISR
const realCetes=t=>((1+netoCetes(t)/100)/(1+TASAS.inflacion/100)-1)*100; // % anual real (descontando inflación)

const EXP_CATS=[
  {n:'Alimentación',fixed:false,grp:'needs'},{n:'Transporte',fixed:false,grp:'needs'},{n:'Educación',fixed:true,grp:'needs'},
  {n:'Entretenimiento',fixed:false,grp:'wants'},{n:'Servicios',fixed:true,grp:'needs'},{n:'Otros',fixed:false,grp:'wants'},
  {n:'Salud',fixed:false,grp:'needs'},{n:'Deudas',fixed:true,grp:'needs'},{n:'Impuestos',fixed:true,grp:'needs'}];
const EXP_NAMES=EXP_CATS.map(c=>c.n);
const INC_CATS=['Nómina','Negocio propio','Freelance','Devolución de impuestos','Regalo','Otros ingresos'];
const METHODS=['Efectivo','Débito','Crédito','Transferencia'];

/* ================= INSTRUMENTOS ================= */
const ASSETS=[
 {id:'CETES',name:'CETES',ret:TASAS.cetes28,risk:1,plazo:'28, 91, 182 o 364 días',liq:'Alta al vencimiento; venta anticipada posible',min:'Desde $100 (dato de ejemplo)',
  desc:'Títulos del gobierno federal. Le prestas dinero al gobierno y te paga intereses.',
  yes:'Estás empezando, quieres certeza o ahorras para una meta a menos de un año.',no:'Buscas crecer tu dinero por encima de la inflación a muchos años.',pros:'Muy bajo riesgo de incumplimiento y rendimiento conocido al comprar.',cons:'Rendimiento limitado; cambia con las tasas del momento.'},
 {id:'Bonos',name:'Bonos',ret:8.5,risk:2,plazo:'3 a 30 años',liq:'Media; su precio cambia si suben o bajan las tasas',min:'Desde ~$10,000 (dato de ejemplo)',
  desc:'Deuda a largo plazo emitida por el gobierno o por empresas, con pagos periódicos de interés.',
  yes:'Puedes dejar el dinero varios años y quieres ingresos periódicos.',no:'Podrías necesitar el dinero pronto.',pros:'Pagos de interés predecibles y rendimiento mayor al de plazos cortos.',cons:'Su precio puede bajar antes del vencimiento.'},
 {id:'Fondos',name:'Fondos de inversión',ret:8,risk:3,plazo:'1 año o más recomendado',liq:'Media; se vende en 1 a 3 días hábiles',min:'Desde ~$100 (dato de ejemplo)',
  desc:'Un grupo de inversionistas junta dinero y un gestor lo reparte en varios instrumentos.',
  yes:'Quieres diversificar sin escoger cada activo por tu cuenta.',no:'No quieres pagar comisiones o prefieres controlar cada decisión.',pros:'Diversificación y administración profesional.',cons:'Comisiones que reducen tu rendimiento.'},
 {id:'ETFs',name:'ETFs',ret:10,risk:4,plazo:'3 años o más recomendado',liq:'Alta; se compran y venden en bolsa',min:'El precio de una unidad (dato de ejemplo)',
  desc:'Fondos que copian un índice, como el IPC o el S&P 500, y se compran como una acción.',
  yes:'Piensas a largo plazo y quieres diversificación con costos bajos.',no:'No toleras ver caídas temporales en tu saldo.',pros:'Costos bajos y diversificación amplia.',cons:'Suben y bajan con el mercado; sin garantía de rendimiento.'},
 {id:'Acciones',name:'Acciones',ret:12,risk:5,plazo:'5 años o más recomendado',liq:'Alta; se venden en bolsa',min:'El precio de una acción (dato de ejemplo)',
  desc:'Pequeñas partes de una empresa. Ganas si la empresa crece o reparte utilidades.',
  yes:'Tienes horizonte largo, ya diversificas y aceptas caídas fuertes.',no:'Necesitas el dinero en menos de 3 años.',pros:'Mayor potencial de crecimiento a largo plazo.',cons:'Es el activo con más variación; puedes perder parte del capital.'},
 {id:'FIBRAs',name:'FIBRAs',ret:9,risk:4,plazo:'3 años o más recomendado',liq:'Alta; se negocian en bolsa',min:'El precio de un certificado (dato de ejemplo)',
  desc:'Fideicomisos que poseen inmuebles (oficinas, bodegas, plazas) y reparten rentas.',
  yes:'Quieres exposición a bienes raíces sin comprar una propiedad.',no:'Prefieres que tu inversión no cambie de precio.',pros:'Reparten rentas y dan acceso a inmuebles.',cons:'Su precio varía con el mercado y las tasas.'},
 {id:'SOFIPOs',name:'SOFIPOs',ret:9,risk:2,plazo:'Flexible o a plazo fijo',liq:'Alta a media según el producto',min:'Desde $1 o $100 (dato de ejemplo)',
  desc:'Entidades financieras digitales que ofrecen cuentas con rendimiento más alto que un banco tradicional.',
  yes:'Quieres rendimiento sobre tu ahorro con acceso rápido al dinero.',no:'Pasarías el límite de protección por institución; verifícalo antes.',pros:'Rendimiento atractivo y apertura digital sencilla.',cons:'Protección limitada; revisa la solidez de cada institución.'}];
const ASSET_IDS=ASSETS.map(a=>a.id);
const DEF_RETS=Object.fromEntries(ASSETS.map(a=>[a.id,a.ret]));

/* ================= MÉXICO HOY (DATOS DE DEMOSTRACIÓN) ================= */
const IND=[
 {id:'inf_a',name:'Inflación anual',unit:'%',val:TASAS.inflacion,vol:.011,src:TASAS.fuente.inflacion,oficial:true,fecha:'oct 2026',mide:'Cuánto subieron en promedio los precios de una canasta de bienes y servicios en los últimos 12 meses.',sube:'Tu dinero compra menos y Banxico suele subir su tasa para frenar los precios.',baja:'Los precios suben más despacio y hay espacio para bajar tasas.',persona:'Si tu sueldo sube menos que la inflación, en la práctica ganas menos.'},
 {id:'inf_m',name:'Inflación mensual',unit:'%',val:0.27,vol:.012,src:'INEGI (ejemplo)',mide:'El cambio de los precios respecto al mes anterior.',sube:'Señal de presión de precios a corto plazo; a veces es pasajera, por ejemplo por frutas y verduras.',baja:'Los precios se enfrían o incluso bajan en el mes.',persona:'Te ayuda a ver si el súper o el transporte están subiendo ahora mismo.'},
 {id:'banxico',name:'Tasa de Banxico',unit:'%',val:TASAS.banxico,vol:.004,src:TASAS.fuente.banxico,oficial:true,fecha:'5 nov 2026',mide:'La tasa de referencia que fija el Banco de México y que guía el costo del dinero en el país.',sube:'Créditos y tarjetas se encarecen, y ahorrar o invertir en CETES paga más.',baja:'Endeudarte sale más barato, pero lo que te pagan por ahorrar baja.',persona:'Cambia lo que pagas por un crédito y lo que ganas en CETES o SOFIPOs.'},
 {id:'cetes28',name:'CETES 28 días',unit:'%',val:TASAS.cetes28,vol:.01,src:TASAS.fuente.cetes,oficial:true,fecha:'10 nov 2026',mide:'La tasa que paga el gobierno federal por pedirte prestado a 28 días.',sube:'Invertir en CETES paga más; suele pasar cuando Banxico sube su tasa.',baja:'Pagan menos; conviene compararlos contra la inflación.',persona:'Sirve para saber cuánto ganarías con tu ahorro a muy corto plazo y sin riesgo de crédito.'},
 {id:'cetes91',name:'CETES 91 días',unit:'%',val:6.45,vol:.01,src:'Banxico (ejemplo)',mide:'La tasa que paga el gobierno federal por pedirte prestado a 91 días.',sube:'Tu dinero a tres meses rinde más.',baja:'Rinde menos; quizá convenga alargar el plazo si lo necesitas.',persona:'Útil para metas de 3 a 6 meses, como un viaje o una colegiatura.'},
 {id:'cetes182',name:'CETES 182 días',unit:'%',val:6.70,vol:.01,src:'Banxico (ejemplo)',mide:'La tasa que paga el gobierno federal por pedirte prestado a 182 días.',sube:'Tu dinero a seis meses rinde más.',baja:'Rinde menos; compara contra otros instrumentos.',persona:'Buena referencia para un fondo de metas a medio año.'},
 {id:'cetes364',name:'CETES 364 días',unit:'%',val:TASAS.cetes364,vol:.01,src:TASAS.fuente.cetes,oficial:true,fecha:'10 nov 2026',mide:'La tasa que paga el gobierno federal por pedirte prestado a un año.',sube:'Un año de espera paga más; el mercado espera tasas altas por más tiempo.',baja:'Rinde menos; el mercado espera que las tasas bajen.',persona:'Referencia para ahorrar a un año sin riesgo de que el emisor no pague.'},
 {id:'usd',name:'USD/MXN',unit:'MXN',val:18.42,vol:.035,src:'Banxico (ejemplo)',mide:'Cuántos pesos cuesta un dólar.',sube:'El peso se debilita: viajes, compras en dólares y productos importados salen más caros.',baja:'El peso se fortalece; lo importado y viajar se abaratan, pero tus dólares valen menos en pesos.',persona:'Importa si compras en línea en el extranjero, viajas o tienes ahorros en dólares.'},
 {id:'ipc',name:'IPC (Bolsa)',unit:'pts',val:57840,vol:140,src:'BMV (ejemplo)',mide:'Cómo les va, en conjunto, a las empresas más grandes que cotizan en la Bolsa Mexicana de Valores.',sube:'Las empresas valen más; quienes invierten en fondos o ETFs ligados al índice ganan.',baja:'Las empresas valen menos; esas inversiones caen a corto plazo.',persona:'Es la referencia para saber cómo van los ETFs y fondos de renta variable.'},
 {id:'pib',name:'PIB (crecimiento anual)',unit:'%',val:1.3,vol:.014,src:'INEGI (ejemplo)',mide:'El crecimiento de todo lo que produce el país en un año.',sube:'Hay más empleo y actividad; suele ser buena señal.',baja:'La economía se frena, hay menos empleo y menos aumentos de sueldo.',persona:'Afecta qué tan fácil es encontrar trabajo y negociar un aumento.'},
 {id:'desempleo',name:'Desempleo',unit:'%',val:2.6,vol:.01,src:'INEGI (ejemplo)',mide:'El porcentaje de personas que buscan trabajo y no lo encuentran.',sube:'Hay menos empleos; menos gente gasta y las empresas contratan menos.',baja:'Más empleos disponibles y mejores sueldos para negociar.',persona:'Te dice qué tan competitivo está el mercado laboral cuando buscas tu primer empleo o prácticas.'},
 {id:'udi',name:'UDI',unit:'MXN',val:8.4521,vol:.0012,src:'Banxico (ejemplo)',mide:'Una unidad de valor que se ajusta con la inflación para conservar el poder de compra.',sube:'Sube junto con los precios: lo que está en UDIs conserva su valor.',baja:'Casi nunca baja, porque se ajusta con la inflación.',persona:'Algunos créditos hipotecarios e inversiones se calculan en UDIs.'}];
const RANGES={'1M':30,'3M':91,'6M':182,'1A':365,'5A':1825};
const RANGE_NAMES={'1M':'1 mes','3M':'3 meses','6M':'6 meses','1A':'1 año','5A':'5 años'};

const NEWS=[
 {id:'n1',t:'Banxico mantiene su tasa sin cambios en la reunión de ejemplo',src:'Noticia de ejemplo',sum:['La junta de gobierno dejó la tasa igual y dijo que vigilará los precios.','Los CETES casi no se movieron tras el anuncio.','Para ti: si tienes un crédito con tasa variable, tu pago no cambia por ahora.']},
 {id:'n2',t:'El peso cierra la semana estable frente al dólar',src:'Noticia de ejemplo',sum:['El tipo de cambio se movió poco durante la semana.','La estabilidad ayuda a quienes compran en dólares o viajan.','Para ti: no hay que apurarse a comprar dólares por un movimiento de un día.']},
 {id:'n3',t:'La inflación de la primera quincena muestra una ligera baja',src:'Noticia de ejemplo',sum:['Los precios subieron menos que en la quincena anterior.','Alimentos y transporte fueron los rubros que más influyeron.','Para ti: tu presupuesto de súper y transporte podría necesitar menos ajustes.']},
 {id:'n4',t:'Más jóvenes abren cuentas de ahorro e inversión digitales',src:'Noticia de ejemplo',sum:['Cada vez más personas de 18 a 29 años usan apps financieras.','Los expertos recomiendan comparar comisiones y revisar la protección de cada institución.','Para ti: antes de abrir una cuenta, compara rendimiento, comisiones y liquidez.']}];
const CAL_EV=[[2,'Publicación de inflación quincenal','INEGI (ejemplo)'],[5,'Subasta semanal de CETES','Banxico (ejemplo)'],[9,'Decisión de política monetaria','Banxico (ejemplo)'],[14,'Indicador de empleo','INEGI (ejemplo)'],[20,'PIB trimestral estimado','INEGI (ejemplo)']];

/* ================= ACADEMIA ================= */
const LEVELS=[
{id:1,name:'Primeros pasos',desc:'Qué es ahorrar y cómo fluye tu dinero.',lessons:[
 {id:'1a',title:'Ahorrar es una decisión',intro:'Ahorrar es separar una parte de tu ingreso antes de gastarlo. Una regla simple: págate primero a ti y luego distribuye el resto.',rel:{label:'Crear una meta de ahorro',route:'finanzas',tab:'metas'},ex:[
  {t:'mc',q:'¿Cuál describe mejor el ahorro?',o:['Lo que sobra al final del mes','La parte de tu ingreso que separas para después','El dinero que prestas a amigos'],a:1,why:'Ahorrar es una decisión que tomas al inicio, no un sobrante. Si esperas a ver qué sobra, casi siempre sobra poco.'},
  {t:'tf',q:'Ahorrar solo funciona si ganas mucho.',a:false,why:'El hábito pesa más que el monto: $200 cada quincena también construyen un fondo.'},
  {t:'fill',q:'Una buena práctica es pagarte ___ primero.',a:['a ti','a ti mismo','a mi','a uno mismo'],why:'Separa tu ahorro apenas recibes tu ingreso, antes de gastar.'},
  {t:'num',q:'Ganas $12,000 al mes y decides ahorrar 10%. ¿Cuántos pesos ahorras?',a:1200,tol:0,why:'12,000 × 0.10 = 1,200.'}]},
 {id:'1b',title:'Ingresos, gastos y flujo',intro:'Tu flujo mensual es tus ingresos menos tus gastos. Los gastos fijos se repiten igual cada mes (colegiatura); los variables cambian (comida fuera).',rel:{label:'Registrar un movimiento',route:'finanzas',tab:'movimientos'},ex:[
  {t:'mc',q:'¿Cuál es un gasto fijo?',o:['Salidas al cine','Renta o colegiatura','Ropa nueva'],a:1,why:'Los gastos fijos son los que pagas casi igual cada mes.'},
  {t:'tf',q:'Los gastos hormiga son pequeños, pero sumados pueden pesar mucho.',a:true,why:'Un café diario de $50 son unos $1,500 al mes.'},
  {t:'num',q:'Ingresas $15,000 y gastas $9,800. ¿Cuánto es tu flujo del mes?',a:5200,tol:0,why:'15,000 − 9,800 = 5,200.'},
  {t:'mc',q:'Si tus gastos superan tus ingresos, ¿qué ocurre?',o:['Tu flujo es negativo y usas ahorro o deuda','Ganas intereses','Nada cambia'],a:0,why:'Un flujo negativo se cubre con ahorro previo o con deuda, y esa última cuesta intereses.'}]}]},
{id:2,name:'Controla tu dinero',desc:'Presupuesto, deudas y tarjetas.',lessons:[
 {id:'2a',title:'Presupuesto 50/30/20',intro:'La regla 50/30/20 reparte tu ingreso: 50% necesidades, 30% gustos y 20% ahorro o pago de deudas.',rel:{label:'Crear un presupuesto',route:'finanzas',tab:'presupuestos'},ex:[
  {t:'mc',q:'En la regla 50/30/20, ¿qué va en el 30%?',o:['Necesidades','Gustos y deseos','Ahorro'],a:1,why:'El 30% es para gustos: salidas, streaming, antojos.'},
  {t:'num',q:'Con un ingreso de $15,000, ¿cuánto sería el 20% de ahorro?',a:3000,tol:0,why:'15,000 × 0.20 = 3,000.'},
  {t:'fill',q:'La renta y el transporte son gastos de ___.',a:['necesidad','necesidades','primera necesidad'],why:'Son necesidades: sin ellos no puedes vivir o trabajar con normalidad.'},
  {t:'tf',q:'Una regla de presupuesto debe adaptarse a tu situación.',a:true,why:'Es una guía. Si tu renta pesa más, ajusta los porcentajes y mantén el ahorro.'}]},
 {id:'2b',title:'Deudas y tarjetas',intro:'El método avalancha paga primero la deuda con la tasa más alta; la bola de nieve, la de menor saldo. Pagar solo el mínimo alarga la deuda y multiplica los intereses.',rel:{label:'Ver tus deudas',route:'finanzas',tab:'deudas'},ex:[
  {t:'mc',q:'¿Qué deuda atacas primero con el método avalancha?',o:['La de mayor tasa de interés','La de menor saldo','La más antigua'],a:0,why:'La tasa más alta es la que más te cuesta, así que eliminarla primero ahorra más intereses.'},
  {t:'tf',q:'Pagar solo el mínimo de la tarjeta es la forma más barata de salir de deudas.',a:false,why:'El mínimo cubre sobre todo intereses; la deuda tarda años en bajar.'},
  {t:'num',q:'Debes $3,000 con interés simple de 36% anual. ¿Cuánto interés se genera en un mes?',a:90,tol:1,why:'3,000 × 0.36 ÷ 12 = 90.'},
  {t:'fill',q:'El método de la bola de ___ empieza por el saldo más pequeño.',a:['nieve'],why:'Se llama bola de nieve porque cada deuda pagada libera dinero para la siguiente.'}]}]},
{id:3,name:'Entiende la economía',desc:'Inflación, Banxico y tipo de cambio.',lessons:[
 {id:'3a',title:'¿Qué es la inflación?',intro:'La inflación es el aumento general de los precios. Si tu dinero rinde menos que la inflación, pierdes poder adquisitivo.',rel:{label:'Ver la inflación en México hoy',route:'mexico'},ex:[
  {t:'mc',q:'Con inflación anual de 5%, un producto de $100 costará aproximadamente...',o:['$95','$105','$100'],a:1,why:'100 × 1.05 = 105.'},
  {t:'num',q:'Un producto cuesta $200 y la inflación es 4%. ¿Cuánto cuesta un año después?',a:208,tol:0,why:'200 × 1.04 = 208.'},
  {t:'tf',q:'Si tu inversión rinde 3% y la inflación es 5%, ganas poder adquisitivo.',a:false,why:'Tu rendimiento real es aproximadamente 3 − 5 = −2%.'},
  {t:'fill',q:'La inflación reduce tu poder ___.',a:['adquisitivo','de compra'],why:'Con el mismo dinero compras menos cosas.'}]},
 {id:'3b',title:'Banxico y tipo de cambio',intro:'Banxico fija una tasa de referencia para controlar la inflación. El tipo de cambio dice cuántos pesos cuesta un dólar.',rel:{label:'Ver Banxico y USD/MXN',route:'mexico'},ex:[
  {t:'mc',q:'Si Banxico sube su tasa de referencia, normalmente...',o:['Los créditos se encarecen y ahorrar paga más','Todo se abarata','Cambia el nombre de la moneda'],a:0,why:'Una tasa más alta encarece pedir prestado y mejora lo que pagan CETES y cuentas.'},
  {t:'tf',q:'Si el dólar sube de $18 a $20, el peso se debilita.',a:true,why:'Necesitas más pesos para comprar un dólar.'},
  {t:'num',q:'¿Cuántos pesos cuestan 100 dólares a $18.50 por dólar?',a:1850,tol:0,why:'100 × 18.50 = 1,850.'},
  {t:'mc',q:'¿Cuál es la meta de inflación de Banxico?',o:['Alrededor de 3%','10%','0%'],a:0,why:'El objetivo es 3%, con un margen de ±1 punto.'}]}]},
{id:4,name:'Conviértete en inversionista',desc:'CETES, riesgo y diversificación.',lessons:[
 {id:'4a',title:'CETES paso a paso',intro:'Los CETES son títulos del gobierno federal. Se compran con descuento y al vencimiento recibes su valor nominal; la diferencia es tu ganancia.',rel:{label:'Ver CETES en el catálogo',route:'inversiones',tab:'catalogo'},ex:[
  {t:'mc',q:'¿Quién emite los CETES?',o:['El gobierno federal','Un banco privado','La Bolsa de valores'],a:0,why:'Son deuda del gobierno federal.'},
  {t:'tf',q:'Si mantienes un CETE hasta el vencimiento, conoces tu rendimiento desde la compra.',a:true,why:'La tasa se fija en la subasta, por eso sabes cuánto recibirás.'},
  {t:'num',q:'Inviertes $10,000 a 28 días con tasa de 7.2% anual. ¿Cuánto interés ganas? (tasa × días ÷ 360)',a:56,tol:1,why:'10,000 × 0.072 × 28 ÷ 360 = 56.'},
  {t:'fill',q:'Los CETES se venden a ___ y vencen a su valor nominal.',a:['descuento'],why:'Pagas menos que el valor nominal y recibes el valor completo al vencer.'}]},
 {id:'4b',title:'Diversificación y riesgo',intro:'Diversificar es repartir tu dinero en distintos activos para que una mala noticia no te afecte por completo. Más rendimiento esperado suele significar más riesgo.',rel:{label:'Simular un portafolio',route:'inversiones',tab:'simulador'},ex:[
  {t:'mc',q:'¿Qué significa diversificar?',o:['Repartir tu dinero en distintos activos','Elegir el activo más caro','Invertir solo en lo que subió'],a:0,why:'Repartir reduce el efecto de que un solo activo caiga.'},
  {t:'tf',q:'Normalmente, a mayor rendimiento esperado, mayor riesgo.',a:true,why:'Nadie ofrece más rendimiento sin que haya más variación o más riesgo.'},
  {t:'num',q:'60% de tu dinero rinde 8% y 40% rinde 6%. ¿Cuál es el rendimiento ponderado anual (en %)?',a:7.2,tol:.05,why:'0.6 × 8 + 0.4 × 6 = 7.2.'},
  {t:'fill',q:'No pongas todos los huevos en una misma ___.',a:['canasta'],why:'Es la idea clásica de diversificar.'}]}]},
{id:5,name:'Planeación avanzada',desc:'Interés compuesto, metas y retiro.',lessons:[
 {id:'5a',title:'Interés compuesto y metas',intro:'El interés compuesto genera intereses sobre intereses. La regla del 72 dice que 72 ÷ tasa te da los años aproximados para duplicar tu dinero.',rel:{label:'Calcular tu meta',route:'inversiones',tab:'meta'},ex:[
  {t:'num',q:'Inviertes $1,000 al 10% anual por 2 años con interés compuesto. ¿Cuánto tienes al final?',a:1210,tol:0,why:'1,000 × 1.10² = 1,210.'},
  {t:'mc',q:'Con la regla del 72 y un rendimiento de 8% anual, ¿en cuántos años se duplica tu dinero?',o:['9 años','8 años','12 años'],a:0,why:'72 ÷ 8 = 9.'},
  {t:'tf',q:'Empezar a invertir antes ayuda a que el interés compuesto trabaje más tiempo.',a:true,why:'El tiempo es el ingrediente que más pesa en el interés compuesto.'},
  {t:'mc',q:'Para llegar a una meta a 10 años, ¿qué ayuda más?',o:['Aportar de forma constante y empezar pronto','Esperar a ganar más','Apostar todo a una acción'],a:0,why:'La constancia y el tiempo superan a la intuición de mercado.'}]},
 {id:'5b',title:'Fondo de emergencia y retiro',intro:'Un fondo de emergencia cubre de 3 a 6 meses de gastos. Para el retiro, empezar pronto y aportar constante pesa más que el monto inicial.',rel:{label:'Ir a tus metas',route:'finanzas',tab:'metas'},ex:[
  {t:'mc',q:'¿Cuánto debería cubrir un fondo de emergencia?',o:['De 3 a 6 meses de gastos','1 semana de gastos','5 años de gastos'],a:0,why:'Te da tiempo para reaccionar ante un imprevisto.'},
  {t:'num',q:'Gastas $9,000 al mes. ¿Cuánto es un fondo de emergencia de 3 meses?',a:27000,tol:0,why:'9,000 × 3 = 27,000.'},
  {t:'fill',q:'Un fondo de ___ cubre imprevistos como una reparación o perder el empleo.',a:['emergencia','emergencias'],why:'Es dinero reservado para lo que no esperabas.'},
  {t:'tf',q:'El fondo de emergencia debe estar en inversiones de alto riesgo.',a:false,why:'Debe estar disponible y estable: cuentas líquidas o CETES a plazo corto.'}]}]}];
LEVELS.forEach(l=>l.lessons.forEach(ls=>ls.ex.forEach((e,i)=>{e.id=ls.id+'-'+i;ls.level=l.id})));
const ALL_LESSONS=LEVELS.flatMap(l=>l.lessons);
const DAILY=[
 {id:'dq0',t:'mc',q:'¿Qué parte de tu ingreso sugiere la regla 50/30/20 para ahorro?',o:['10%','20%','50%'],a:1,why:'Ahorro o pago de deudas: 20%.'},
 {id:'dq1',t:'tf',q:'Un CETE a 28 días puede rendir más que la inflación del mes.',a:true,why:'Depende de la tasa y de la inflación del momento; compáralas siempre.'},
 {id:'dq2',t:'num',q:'Si ahorras $500 al mes durante 12 meses sin intereses, ¿cuánto juntas?',a:6000,tol:0,why:'500 × 12 = 6,000.'},
 {id:'dq3',t:'mc',q:'¿Cuál es un gasto hormiga?',o:['La colegiatura','Un café diario','El seguro del auto'],a:1,why:'Son gastos pequeños y frecuentes que pasan desapercibidos.'},
 {id:'dq4',t:'tf',q:'Diversificar elimina por completo el riesgo.',a:false,why:'Lo reduce, pero no lo elimina.'},
 {id:'dq5',t:'num',q:'Una deuda de $2,000 con 24% anual (interés simple). ¿Cuánto interés genera en un mes?',a:40,tol:.5,why:'2,000 × 0.24 ÷ 12 = 40.'},
 {id:'dq6',t:'mc',q:'Si la inflación sube y tu sueldo no, tu poder adquisitivo...',o:['Sube','Baja','Se queda igual'],a:1,why:'Los mismos pesos compran menos.'}];
const RANK=[['Camila R.',1280],['Diego H.',960],['Ana P.',730],['Luis G.',515],['Sofía T.',340],['Mateo V.',95]];
const BADGES=[
 {id:'ahorro',name:'Mi primer ahorro',how:'Tener una meta con dinero ahorrado.'},
 {id:'presupuesto',name:'Experto en presupuestos',how:'Completar la lección de presupuesto 50/30/20.'},
 {id:'inversionista',name:'Primer inversionista',how:'Guardar tu propio portafolio en el simulador.'},
 {id:'cetes',name:'Maestro de CETES',how:'Completar la lección de CETES con al menos 75% de aciertos.'}];

const FAQ=[
 ['¿FINOVA usa mis datos bancarios?','No. Es un prototipo de demostración: no pide contraseñas ni datos de bancos, y no se conecta a ninguna cuenta real.'],
 ['¿Dónde se guardan mis datos?','Solo en este dispositivo (localStorage), separados por cuenta. No hay servidor: tus datos nunca salen de tu navegador. Si borras los datos del sitio, se pierden; en Perfil puedes exportarlos o eliminar tu cuenta.'],
 ['¿Para qué sirve el PIN?','Protege tu perfil en este dispositivo. FINOVA verifica el PIN sin guardar el número original. Los movimientos se conservan en el navegador. FINOVA no pide contraseñas reales ni datos bancarios.'],
 ['¿Las cifras de México hoy son reales?','No. Todas son datos de demostración con etiqueta visible y no representan cifras actuales.'],
 ['¿El Asistente IA es una inteligencia artificial real?','No. Responde con una biblioteca de respuestas predefinidas y con los datos de la cuenta con la que entraste. No sustituye asesoría financiera.'],
 ['¿Los rendimientos del simulador están garantizados?','No. Son supuestos que puedes editar. Es una simulación educativa con rendimientos hipotéticos.'],
 ['¿Cómo funciona la racha de aprendizaje?','Suma un día cada vez que completas una lección, el reto diario o el semanal. Si pasas un día sin actividad, se reinicia.'],
 ['¿Cómo restauro los datos originales?','En Perfil, usa "Restaurar datos de demostración". Se borran tus cambios y la cuenta vuelve a sus datos iniciales.'],
 ['¿Qué diferencia hay entre avalancha y bola de nieve?','Avalancha paga primero la deuda con mayor tasa (ahorra más intereses). Bola de nieve empieza por el saldo menor (motiva al liquidar deudas pronto).']];
