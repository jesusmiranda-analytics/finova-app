
/* ================= DATOS DE MERCADO (FUENTES OFICIALES) ================= */
/* Banco de México, «Comparativo de tarjetas Clásicas y Básicas», datos a junio de 2026.
   https://www.banxico.org.mx/tarjetascat/TarjetasEntrada.jsp
   Fila: [nombre, comisión anual del titular ($), CAT de publicidad (%), sitio, uso].
   «uso» lo asigna FINOVA según el tipo de tarjeta (viajes, súper, club de precios que pide membresía, o general); no viene de Banxico. */
const TARJETAS_FUENTE='Banco de México, Comparativo de tarjetas Clásicas y Básicas (datos a junio de 2026)';
const TARJETAS={
  '4501_8000':{n:'De $4,501 a $8,000',url:'https://www.banxico.org.mx/tarjetascat/TarjetasCl%C3%A1sicas4501_8000.pdf',filas:[
    ['Walmart INVEX',0,31.2,'invextarjetas.com.mx','super'],['Volaris INVEX 0',0,50.9,'invextarjetas.com.mx','viajes'],['HSBC Air',915,52.1,'hsbc.com.mx/air','viajes'],
    ['Now (INVEX)',0,74.7,'now.bank','general'],['Joy Banamex',0,82.1,'banamex.com/joy','general'],['Visa Clásica Garantizada Internacional (Bajío)',700,83.8,'bb.com.mx','general'],
    ['Tarjeta de Crédito BanCoppel',0,88.4,'bancoppel.com/tdc','general'],['HSBC Zero',0,93.3,'hsbc.com.mx/zero','general'],['Costco Banamex',650,93.7,'banamex.com/costco','club'],
    ['Vive BBVA',748,110.3,'bbva.mx/vive.html','general'],['Clásica Banamex',815,110.6,'banamex.com/clasica','general'],['The Home Depot Banamex',774,111.2,'banamex.com/homedepot','general'],
    ['Rayados BBVA',748,111.7,'bbva.mx/rayados.html','general'],['Clásica (Banorte)',720,120.4,'banorte.com/clasica','general'],['Azul BBVA',748,126.3,'bbva.mx/azul.html','general'],
    ['Tarjeta de Crédito Ualá',0,215.2,'uala.mx/tarjeta-credito','general'],['Plata (Banco Plata)',0,217.1,'bancoplata.mx','general']]},
  '8001_15000':{n:'De $8,001 a $15,000',url:'https://www.banxico.org.mx/tarjetascat/TarjetasCl%C3%A1sicas8001_15000.pdf',filas:[
    ['Walmart INVEX',0,31.2,'invextarjetas.com.mx','super'],['HSBC Air',915,49.2,'hsbc.com.mx/air','viajes'],['Volaris INVEX 0',0,49.6,'invextarjetas.com.mx','viajes'],
    ['Now (INVEX)',0,59.5,'now.bank','general'],['Joy Banamex',0,82.2,'banamex.com/joy','general'],['Visa Clásica Internacional (Bajío)',700,83.1,'bb.com.mx','general'],
    ['Inbursa Clásica',390,83.5,'inbursa.com','general'],['Costco Banamex',650,86.1,'banamex.com/costco','club'],['Tarjeta de Crédito BanCoppel',0,88.4,'bancoppel.com/tdc','general'],
    ['Vive BBVA',748,92.9,'bbva.mx/vive.html','general'],['Teletón Banamex',540,93.0,'banamex.com/teleton','general'],['HSBC Zero',0,93.2,'hsbc.com.mx/zero','general'],
    ['The Home Depot Banamex',774,97.7,'banamex.com/homedepot','general'],['Clásica Banamex',815,98.6,'banamex.com/clasica','general'],['Azul BBVA',748,98.6,'bbva.mx/azul.html','general'],
    ['Affinity Card Banamex',815,98.9,'banamex.com/affinitycard','general'],['Rayados BBVA',748,100.2,'bbva.mx/rayados.html','general'],['Inbursa Sam\'s Club',750,103.5,'inbursa.com','club'],
    ['IDEAL Scotiabank',0,105.4,'scotiabank.com.mx/ideal','general'],['Selección Nacional (Banorte)',1150,107.5,'banorte.com/seleccionnacional','general'],['Inbursa Walmart',750,107.6,'inbursa.com','super'],
    ['Clásica (Banorte)',720,108.0,'banorte.com/clasica','general'],['Clásica (Afirme)',750,110.5,'afirme.com','general'],['Tarjeta de Crédito Ualá',0,179.0,'uala.mx/tarjeta-credito','general'],
    ['Plata (Banco Plata)',0,217.1,'bancoplata.mx','general']]},
  '15000':{n:'Más de $15,000',url:'https://www.banxico.org.mx/tarjetascat/TarjetasCl%C3%A1sicas15000.pdf',filas:[
    ['Volaris INVEX 0',0,28.7,'invextarjetas.com.mx','viajes'],['Sam\'s Club INVEX',0,31.2,'invextarjetas.com.mx','club'],['Walmart INVEX',0,31.2,'invextarjetas.com.mx','super'],
    ['Más (Banregio)',0,32.6,'banregio.com/tdcmas.php','general'],['HSBC Air',915,48.0,'hsbc.com.mx/air','viajes'],['Hey (Banregio)',600,64.7,'banco.hey.inc','general'],
    ['IDEAL Scotiabank',0,70.7,'scotiabank.com.mx/ideal','general'],['Costco Banamex',650,78.0,'banamex.com/costco','club'],['Joy Banamex',0,79.9,'banamex.com/joy','general'],
    ['Visa Clásica Internacional (Bajío)',700,83.4,'bb.com.mx','general'],['Teletón Banamex',540,84.2,'banamex.com/teleton','general'],['Vive BBVA',748,85.2,'bbva.mx/vive.html','general'],
    ['Clásica Banamex',815,85.5,'banamex.com/clasica','general'],['The Home Depot Banamex',774,85.7,'banamex.com/homedepot','general'],['Affinity Card Banamex',815,85.9,'banamex.com/affinitycard','general'],
    ['Rayados BBVA',748,89.1,'bbva.mx/rayados.html','general'],['Inbursa Sam\'s Club',750,89.5,'inbursa.com','club'],['Tarjeta de Crédito BanCoppel',0,89.9,'bancoppel.com/tdc','general'],
    ['Azul BBVA',748,90.1,'bbva.mx/azul.html','general'],['Selección Nacional (Banorte)',1150,91.5,'banorte.com/seleccionnacional','general'],['Clásica (Banorte)',720,92.7,'banorte.com/clasica','general'],
    ['HSBC Zero',0,93.6,'hsbc.com.mx/zero','general'],['HSBC Viva',0,98.4,'hsbc.com.mx/viva','general'],['Tigres Afirme',850,100.7,'afirme.com','general'],
    ['Tarjeta de Crédito Ualá',0,143.4,'uala.mx/tarjeta-credito','general'],['Plata (Banco Plata)',0,217.1,'bancoplata.mx','general']]}
};
/* Banxico, «Indicadores básicos de tarjetas de crédito», datos a diciembre de 2025 (Cuadro 5):
   tasa efectiva promedio ponderada por saldo de la clientela que NO paga el total (%). */
const TEPP_NT={fuente:'Banco de México, Indicadores básicos de tarjetas de crédito, datos a diciembre de 2025 (Cuadro 5)',
  sistema:36.7,'BBVA':37.2,'INVEX':30.7,'Banregio':30.1,'Banamex':33.2,'HSBC':36.1,'Santander':37.9,'Banorte':38.0,'BanCoppel':45.9,'Inbursa':46.9,'Scotiabank':43.3,'Bajío':34.5,'Ualá':60.0};
const institucionDe=n=>/INVEX|Now/.test(n)?'INVEX':/Banregio/.test(n)?'Banregio':/BBVA/.test(n)?'BBVA':/Banamex/.test(n)?'Banamex':/HSBC/.test(n)?'HSBC':/Banorte/.test(n)?'Banorte':/BanCoppel/.test(n)?'BanCoppel':/Inbursa/.test(n)?'Inbursa':/Scotiabank/.test(n)?'Scotiabank':/Bajío/.test(n)?'Bajío':/Ualá/.test(n)?'Ualá':null;
const USOS=[['super','Súper y compras del hogar'],['general','De todo un poco'],['viajes','Viajes'],['club','Club de precios (Sam\'s, Costco)']];

/* Diagnóstico final, «Orden de prioridades y justificaciones». */
const PRIORIDADES=[
  {k:'seguro',t:'Proteger la salud',x:'Un evento médico sin seguro termina en la tarjeta más cara. Primero, un seguro de gastos médicos mayores.'},
  {k:'deuda',t:'Pagar la deuda más cara',x:'Método avalancha: cada peso abonado a una deuda al 59.52 % «rinde» más que cualquier inversión.'},
  {k:'fondo',t:'Fondo de emergencia en CETES 28 días',x:'Primero 3 meses de gasto y después avanzar hacia 6 (CONDUSEF), con dinero disponible cada mes.'},
  {k:'cero',t:'Cero deudas',x:'Terminar los créditos restantes en su calendario, sin volver a usar crédito caro.'},
  {k:'retiro',t:'Invertir para el retiro',x:'PPR deducible y Afore; ya sin deudas y con fondo, para no cancelar antes de tiempo.'}];

/* Referencias de gastos médicos (AMIS, citadas en el Diagnóstico final y hoja SGMM del modelo). */
const SGMM_REF={eventoPromedio:100852,cancer:297000,individual:28252,fuente:'AMIS (2025, 2026), vía Diagnóstico final de la consultora'};

/* ================= DATOS FISCALES (personas físicas) =================
   Tarifa mensual de ISR 2026: art. 96 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025); coincide en siemprecontable.net, heru.app y sdv.com.mx.
   Deducciones personales: minisitio del SAT «Deducciones personales» (sat.gob.mx/minisitio/DeduccionesPersonales). */
const FISCAL={
  fuenteTarifa:'Tarifa mensual de ISR 2026, art. 96 LISR (Anexo 8 RMF 2026, DOF 28-dic-2025)',
  fuenteDeducciones:'SAT, minisitio «Deducciones personales» (art. 151 LISR)',
  uma:{diaria:117.31,anual:42794.64},
  // [límite inferior, cuota fija, % sobre el excedente]
  tarifaMensual:[[0.01,0,1.92],[844.60,16.22,6.40],[7168.52,420.95,10.88],[12598.03,1011.68,16.00],[14644.65,1339.14,17.92],[17533.65,1856.84,21.36],
    [35362.84,5665.16,23.52],[55736.69,10457.09,30.00],[106410.51,25659.23,32.00],[141880.67,37009.69,34.00],[425642.00,133488.54,35.00]],
  medios:'transferencia electrónica, tarjeta de crédito, débito o de servicios, o cheque nominativo',
  conceptos:{
    medicos:{n:'Honorarios médicos, dentales y hospitalarios',cfdi:'D01',electronico:true},
    sgmm:{n:'Primas de seguro de gastos médicos',cfdi:'D07',electronico:true},
    colegiatura:{n:'Colegiaturas (con RVOE; con tope por nivel)',cfdi:'D10',electronico:false},
    retiro:{n:'Aportaciones complementarias de retiro (PPR)',cfdi:'D06',electronico:true}},
  colegiaturas:{Preescolar:14200,Primaria:12900,Secundaria:19900,'Profesional técnico':17100,Bachillerato:24500}
};
