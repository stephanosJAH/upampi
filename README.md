# UPAMPI — Smart Software

Sitio de upampi.com. Astro 7 (estático + endpoint Node para el formulario), GSAP, Lenis y Three.js.

```bash
npm install
npm run dev          # http://localhost:5179
npm run build        # genera OG/íconos, revisa tipos y compila a dist/
npm run start        # sirve dist/ con Node en http://127.0.0.1:4321 (HOST/PORT configurables)
```

- Contenido editable: `src/config/site.ts` (correo, agenda, redes, tiempo de respuesta) y `src/data/*.ts`.
- Formulario: `src/pages/api/contact.ts` + variables en `.env.example`.
- Despliegue en VPS: ver [DEPLOY.md](DEPLOY.md) y la carpeta `deploy/`.
