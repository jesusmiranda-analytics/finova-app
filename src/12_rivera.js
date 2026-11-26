
/* ================= CASO FAMILIA RIVERA =================
   Caso ficticio de la consultora (Equipo 6). Fuente única de cifras:
   "Equipo6_Rivera_final_Modelo_3.xlsx" (modelo financiero final, noviembre 2026).
   No editar cifras aquí sin cambiarlas primero en el modelo. */
const RIVERA={
  fuente:'Modelo financiero final de la consultora, Equipo 6 (noviembre 2026)',
  // Hoja Supuestos, secciones 1, 11 y 12
  members:[
    {rol:'Papá',edad:44,ingreso:20500,nota:'Empleo formal (IMSS, Afore, Infonavit)'},
    {rol:'Mamá',edad:42,ingreso:5455,nota:'Repostería por su cuenta, sin prestaciones'},
    {rol:'Hijo',edad:null,ingreso:0,nota:'Estudiante'}],
  ingreso:25955,
  // Hoja Presupuesto: gasto mensual actual (total egresos = 25,955; balance = 0).
  // Cada fila: [categoría FINOVA, monto, día del mes, nota (rubro del modelo)]
  gastos:[
    ['Deudas',2150,2,'Préstamo de Nómina BBVA'],
    ['Servicios',1449,3,'Vivienda y servicios'],
    ['Otros',500,4,'Tanda'],
    ['Alimentación',1500,5,'Súper y mercado'],
    ['Educación',1031,6,'Escuela del hijo'],
    ['Transporte',1800,7,'Gasolina'],
    ['Otros',540,8,'Gastos hormiga'],
    ['Deudas',1500,10,'Tarjeta Azul BBVA (pago)'],
    ['Entretenimiento',900,11,'Comida fuera de casa'],
    ['Alimentación',1500,12,'Súper y mercado'],
    ['Salud',2000,13,'Salud y cuidado personal'],
    ['Transporte',806,14,'Transporte público'],
    ['Otros',540,15,'Gastos hormiga'],
    ['Entretenimiento',850,16,'Suscripciones'],
    ['Alimentación',1500,19,'Súper y mercado'],
    ['Educación',500,20,'Esparcimiento familiar'],
    ['Transporte',500,21,'Celular e internet'],
    ['Otros',535,22,'Gastos hormiga'],
    ['Salud',1811,23,'Calzado, ropa y otros'],
    ['Entretenimiento',900,25,'Comida fuera de casa'],
    ['Alimentación',1494,26,'Súper y mercado'],
    ['Otros',1114,27,'Imprevistos'],
    ['Otros',535,28,'Gastos hormiga']],
  // Presupuesto del plan (hojas Supuestos sección 6 y Flujo de efectivo, meses 1-4):
  // gasto corriente igual, + SGMM 2,330.52 en Salud, deuda = nómina 2,150 + 3,169.48 a la tarjeta,
  // no planeados recortados 4,000 (5,914 → 1,914) + tanda 500.
  // Supuesto: el reparto de los 1,914 no planeados entre Entretenimiento (900) y Otros (1,014 + tanda 500) no viene del modelo.
  presupuesto:{'Alimentación':5994,'Transporte':3106,'Educación':1531,'Servicios':1449,'Salud':6142,'Deudas':5319,'Entretenimiento':900,'Otros':1514},
  // Hoja Supuestos, sección 3 (tasa anual en %, pago mensual)
  deudas:[
    {id:'rv-tc',name:'Tarjeta Azul BBVA',balance:18000,rate:59.52,min:1500},
    {id:'rv-pn',name:'Préstamo de Nómina BBVA',balance:36000,rate:24.1,min:2150}],
  // Hoja Supuestos, sección 7
  fondo:{meta:47673,meses:3,mesMeta:16},
  // Hoja Resumen: indicadores principales (hoy, mes 12, mes 24)
  resumen:[
    {k:'Deuda total',v:[54000,16851.98,0],f:'mxn',bueno:'baja'},
    {k:'Fondo de emergencia (CETES)',v:[0,33354.56,81429.80],f:'mxn',bueno:'sube'},
    {k:'Meses de gasto que cubre el fondo',v:[0,2.1,4.94],f:'meses',bueno:'sube'},
    {k:'PPR acumulado (papá + mamá)',v:[0,0,13571.49],f:'mxn',bueno:'sube'},
    {k:'Posición neta (fondo + PPR − deuda)',v:[-54000,16502.59,95001.29],f:'mxn',bueno:'sube'},
    {k:'Mamá e hijo con seguro médico',v:['No','Sí','Sí'],f:'txt',bueno:'sube'}],
  // Hoja Resumen: hitos del plan
  hitos:[
    {mes:1,t:'Contratan la extensión del seguro de gastos médicos para mamá e hijo',dato:'$2,331 al mes'},
    {mes:5,t:'Reciben la tanda y liquidan la Tarjeta Azul BBVA',dato:'$15,000 de tanda'},
    {mes:16,t:'El fondo de emergencia llega a la meta de 3 meses',dato:'$47,673'},
    {mes:21,t:'Liquidan el Préstamo de Nómina: cero deudas',dato:'$0 de deuda'},
    {mes:22,t:'Inician los PPR de papá y mamá',dato:'$4,500 al mes'}],
  // Hoja Supuestos (secciones 1-9): parámetros del plan de 24 meses.
  // planHogar() en 20_calc.js reproduce con ellos las hojas Flujo de efectivo y Ahorro.
  modelo:{
    ingreso:25955,crecimiento:.0375,mesAjuste:13,          // ingreso e inflación del gasto suben 3.75 % desde el mes 13
    gastoCorriente:15891,noPlaneados:5914,recortePlan:4000,
    tanda:{pago:500,hasta:10,recibe:15000,mesRecibe:5},
    isr:{monto:5973.5921,mes:16},                          // devolución de ISR por deducir el SGMM
    sgmm:{anual:27966.2552,alza:.12},                       // extensión del seguro para mamá e hijo
    tarjeta:{saldo:18000,tasa:.5952},
    prestamo:{saldo:36000,tasa:.241,pago:2150},
    ppr:{mensual:4500,desde:22},                            // papá 3,000 + mamá 1,500
    cetes:{tasa:TASAS.cetes28/100,isr:TASAS.isr/100},       // CETES 28 días; retención de ISR anual (10_data.js)
    inicio:'2026-12',                                       // mes 1 del plan = diciembre 2026 (fecha fija)
    metaFondo:47673,mesesMeta:3,
    // Presupuesto actual (hoja Presupuesto) para la barra «Hoy»
    hoy:{gastoCorriente:15891,deudas:3650,tanda:500,noPlaneados:5914}
  },
  // Diagnóstico final, sección «Plan financiero»: horizontes del plan y por qué de cada instrumento.
  plazos:[
    {k:'corto',nombre:'Corto plazo',titulo:'Protección y tarjeta liquidada',desde:1,hasta:12,instrumento:'CETES 28 días',
     porque:'El fondo de emergencia tiene que poder sacarse rápido: los CETES a 28 días vencen cada mes y rinden más que dejar el dinero en la cuenta.'},
    {k:'mediano',nombre:'Mediano plazo',titulo:'Cero deudas y fondo de 3 meses',desde:13,hasta:21,instrumento:'CETES 28 días',
     porque:'La meta mínima es de 3 meses de gasto y luego avanzar hacia 6, como recomienda la CONDUSEF, porque 79 % del ingreso depende de un solo empleo.'},
    {k:'largo',nombre:'Largo plazo',titulo:'Retiro',desde:22,hasta:null,instrumento:'PPR + Afore',
     porque:'El PPR es deducible y le da a la mamá un ahorro propio para el retiro. Sin él, la familia dependería solo de la pensión del papá, cerca de 45 % de su salario.'}],
  // Hoja Resumen: retiro a los 65 años en pesos de hoy (para el módulo de retiro)
  retiro:{conservador:{total:14593.57,pct:56.23},base:{total:15952.69,pct:61.46},pensionAfore:11675.40}
};
