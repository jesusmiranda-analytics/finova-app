#!/bin/bash
# Une los archivos de src/ en un solo index.html
cd "$(dirname "$0")"
{ printf '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'; cat src/00_head.html src/10_data.js src/20_calc.js src/30_ui.js src/40_pages1.js src/50_finanzas.js src/60_asistente.js src/70_inversiones.js src/80_academia.js src/90_extras.js src/95_app.js; printf '</body></html>'; } > index.html
echo "index.html generado"
