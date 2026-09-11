# Argumentación Científica · 2° Medio

App React para argumentación científica basada en el modelo de Toulmin.  
Adaptado de Merino, Izquierdo & Arellano (2006).

## Estructura

```
/
├── index.html
├── package.json
├── vite.config.js
├── worker.js          ← deploy en Cloudflare Workers (por separado)
└── src/
    ├── main.jsx       ← punto de entrada
    └── index.jsx      ← app principal (agregar manualmente)
```

## Configuración

Antes de usar, edita el bloque `cfg` en `src/index.jsx`:

```js
const cfg = {
  workerUrl: "https://TU_WORKER.TU_USUARIO.workers.dev",
  fbProject: "TU_FIREBASE_PROJECT_ID",
  fbKey:     "TU_FIREBASE_WEB_API_KEY",
};
```

## Correr localmente

```bash
npm install
npm run dev
```

## Deploy

- **App**: Vercel → importar repo → deploy automático
- **Worker**: Cloudflare Workers → pegar `worker.js` → agregar secret `OPENROUTER_KEY`
