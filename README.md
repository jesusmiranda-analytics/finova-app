# FINOVA (prototipo de demostración)
Tu dinero. Tus decisiones. Tu futuro.

Demo en línea: https://finova-amazing-app.netlify.app

- `src/`: el código separado por sección. Edita aquí y ejecuta `bash build.sh` (o `npm run build`) para regenerar `index.html`.
- `index.html`: la app completa en un solo archivo.
- Pruebas de humo: `npm install` y luego `npm test`.
- Publicación: cada push a `main` en GitHub se publica solo en Netlify (`netlify.toml`).
- Sin backend: datos de ejemplo en localStorage. Carga React, Recharts y fuentes desde CDN (requiere internet). Todos los datos son ficticios o de demo.
