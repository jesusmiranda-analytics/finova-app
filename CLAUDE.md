# CLAUDE.md — FINOVA (código)

Vault: Proyectos/economia-finanzas-proyecto-final-finova (SecondBrain). Lee ahí `STATE.md`, `BITACORA.md`, `PROJECT.md` y `CLAUDE.md` (rol y tareas) antes de empezar.

## Comandos
- Compilar: `bash build.sh` → genera `index.html` desde `src/` en el orden de `build.sh`. No edites `index.html` a mano.
- Probar: `npm test` (t1–t8, Playwright 1.65.0 fijo porque coincide con el Chromium 1254 instalado). Cualquier prueba acepta una URL: `node test/t8.js https://finova-amazing-app.netlify.app/`.
- Publicar: `git push` a `main` → Netlify (`netlify.toml`) recompila y publica solo en https://finova-amazing-app.netlify.app.

## Mapa de `src/` (orden de compilación)
| Archivo | Qué tiene |
|---|---|
| `00_head.html` | HTML, CDNs (React, Recharts, htm), fuentes y **todo el CSS** (variables de color en `:root`) |
| `10_data.js` | Utilidades, categorías, `TASAS` (tasas oficiales del Diagnóstico), activos, indicadores, lecciones, FAQ |
| `12_rivera.js` | `RIVERA`: caso de la consultora (Excel final y Diagnóstico): gastos, deudas, modelo del plan, plazos, SGMM, tarjeta, fiscal |
| `14_mercado.js` | Fuentes externas: `TARJETAS` (Banxico jun 2026), `TEPP_NT`, `PRIORIDADES`, `SGMM_REF`, `FISCAL` (tarifa ISR 2026, deducciones) |
| `20_calc.js` | Seeds (`seed`, `seedRivera`, `seedEmpty`), `planHogar`, `fondoBasico`, plazos y CETES, recomendador de tarjeta, escalera, impuestos |
| `25_cuentas.js` | Cuentas, sesión y PIN (SHA-256 con sal) en localStorage |
| `30_ui.js` | Componentes base (Modal, Field, Kpi, Banner, Seg…) |
| `35_login.js` | Pantalla de entrada, PIN y crear cuenta |
| `40_pages1.js` | Inicio (con `PlanCard`) y México hoy |
| `50_finanzas.js` | Mis finanzas: movimientos, análisis, presupuestos, metas por plazo, deudas |
| `55_hogar.js` | Plan del hogar (M2) y Ahorro por plazos (M3) |
| `58_asesor.js` | Mi asesor (M4): seguro, inversión, tarjeta |
| `59_impuestos.js` | Mis impuestos: conexión SAT simulada, radar, devolución, apartado, historial |
| `60`–`90` | Asistente, Inversiones, Academia, Perfil y calculadoras |
| `95_app.js` | Navegación, rutas, `Root` (sesión) y `App` |

## Pruebas
t1 render · t2 flujo general (Rodrigo) · t3 celular · t4 login y caso Rivera · t5 Plan del hogar vs Excel · t6 plazos y tasas · t7 Mi asesor · t8 Mis impuestos. Helper `test/entrar.js`.

## Invariantes
- Sin backend ni datos reales. Nunca pedir contraseñas reales, CIEC, e.firma ni datos bancarios.
- Cifras del caso Rivera solo desde el Excel final y el Diagnóstico; lo no sustentado dice «Supuesto»; lo simulado dice «Demo».
- Tasas solo desde `TASAS`; tarjetas solo desde `TARJETAS` (con fuente y fecha).
- `assets/logo/`: logo aprobado (pendiente de insertar con el rediseño Mercury).
