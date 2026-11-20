# Darío Borbón — Portfolio «La copa»

Un portfolio como experiencia cinematográfica: una copa 3D hiperrealista que se prepara ingrediente a ingrediente mientras haces scroll. Cada ingrediente es una sección.

| # | Sección | Ingrediente | Qué pasa en el vídeo real |
|---|---------|-------------|--------------------------|
| 00 | Inicio | La copa | Vaso de tubo vacío sobre negro |
| 01 | Quién soy | Hielo | Cae el hielo |
| 02 | Proyectos | Cítrico | Entran las rodajas |
| 03–06 | Webs · Arsenal · Experiencia · Formación | El chorro | La bebida se vierte y sube hasta arriba |
| 07–09 | Vídeos · Fotos · Contacto | Burbujas / Servida | La copa terminada |

La animación es **metraje real** (un plano continuo, Mixkit Free License, en `media-src/`) exportado a 234 fotogramas con `node scripts/prepare-stage.mjs` y reproducido con el scroll en `components/stage/FootageStage.tsx`. Para usar tu propio vídeo grabado en La Encantadora: sustituye el archivo de `media-src/`, ajusta recorte/tiempos en el script y los `END_FRAME` del componente.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Editar contenido (sin tocar código)

Todo el texto vive en `/content/*.json`:

- `profile.json` — nombre, intro, email (**TODO: pon tu email real**), redes, CV. `showPhone: true` muestra el teléfono.
- `projects.json`, `websites.json`, `experience.json`, `education.json`, `videos.json`, `photos.json`
- `skills.json` — «Mi arsenal creativo». Cada herramienta tiene `status: "uso"` o `"aprendiendo"`. Sin porcentajes ni certificaciones.

Los campos `_TODO` son notas para ti (no se muestran). Las entradas con `"sample": true` muestran la etiqueta «Ejemplo · reemplazar» solo en `npm run dev`.
Si una imagen tiene `src: ""` se pinta un placeholder diseñado; en cuanto pongas la ruta, aparece la foto.

## Añadir media

```
public/assets/profile/   retrato
public/assets/projects/  portadas de proyectos
public/assets/websites/  capturas de webs (16:9)
public/assets/videos/    .mp4 + póster .jpg
public/assets/photos/    fotos de sesiones
public/assets/cv/        CV en PDF
```

Vídeos: deja el archivo original en `/Vídeos` y ejecuta `npm run media`; lo comprime a H.264 para web y genera el póster.

## Arquitectura

```
app/                 layout, página (orden de secciones = receta), estilos
lib/story.ts         ★ fuente única: secciones ↔ ingredientes ↔ lado de la copa
lib/content.ts       carga tipada de /content
components/sections/ una sección por ingrediente
components/ui/       navegación, preloader, reveals, lightbox…
components/three/
  CocktailScene.ts   renderer, bucle, calidad adaptativa
  director.ts        ★ planos de cámara + ventanas de cada ingrediente
  parts/             stage (estudio/HDR/suelo), glass, liquid, ice, bubbles, details, post
```

- **Un solo canvas fijo**, three.js imperativo, cargado después del texto.
- **Posición de la historia** `s = índice de sección + progreso`; la escena la suaviza (damping) y el director interpola planos con *smootherstep* para que cada plano «se sostenga».
- **Escena de producto (actual)**: fotos reales en `content/stage.json` + `components/stage/ProductStage.tsx`, una por ingrediente, con fundido y acercamiento al hacer scroll. Si falta alguna foto, se vuelve a la escena 3D (`components/three/`).
- **Accesibilidad / rendimiento**: modo de movimiento reducido, interruptor 3D (y fallback estático si no hay WebGL 2), calidad que baja sola si caen los FPS, pixel ratio limitado en móvil, vídeos que solo cargan al pulsar play, skip link y navegación por teclado.

Para retocar un plano de cámara edita `SHOTS` en `components/three/director.ts`; para cambiar cuándo entra un ingrediente, `ingredientsAt()`.
