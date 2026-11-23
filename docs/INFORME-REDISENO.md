# Informe — Rediseño, SEO y rendimiento del portfolio

Fecha: 23/11/2026 · Rama de trabajo: `main` (cambios **sin commit y sin publicar**).

## 0. Nota sobre las skills pedidas

No están instaladas en este entorno: `emil-design-eng`, `animate`, `review-animations` (Emil Kowalski), Impeccable, `design-taste-frontend`, `redesign-skill` e `image-to-code-skill`. No he simulado su uso. La auditoría de diseño, animación y accesibilidad la he hecho directamente sobre el código y con un navegador real (Playwright + Chromium).

## A. Cambios realizados (archivos)

| Archivo | Por qué |
|---|---|
| `content/projects.json` | Nuevo esquema de caso de estudio: necesidad, solución, participación, herramientas, resultado y enlace. Mori Sushi pasa a ser una **propuesta**, no un encargo. "Este portfolio" ya no menciona three.js ni shaders: la animación real es metraje en canvas. |
| `content/websites.json`, `components/sections/Websites.tsx` | **Eliminados**: duplicaban los proyectos. Cada proyecto tiene ahora una sola ficha. |
| `content/ai.json`, `components/sections/AI.tsx` | Nueva sección de IA con **flujos reales** (qué herramienta hace qué y en qué proyecto). |
| `content/videos.json`, `components/sections/Videos.tsx` | "Qué hice" en cada vídeo, enlace a su proyecto y `preload="metadata"`. Nada se reproduce solo. |
| `content/photos.json`, `components/sections/Photos.tsx` | Sección "Imagen personal": se indica que apareces como **modelo** y que las fotos no son tuyas. |
| `content/profile.json` | Titular y subtítulo nuevos, descripción SEO, LinkedIn marcado como perfil propio (sameAs). |
| `content/skills.json` | Sección "Habilidades". La IA sale de aquí porque ya tiene su propia sección. Los enlaces van a los casos de estudio. |
| `app/proyectos/[slug]/page.tsx` | **4 páginas indexables** de caso de estudio, con title, description, canonical, OG y JSON-LD propios. |
| `app/layout.tsx` | `metadataBase`, plantilla de títulos, canonical, Open Graph, Twitter, robots y un respaldo `<noscript>`. |
| `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | Generan `sitemap.xml`, `robots.txt` y `manifest.webmanifest` en cada build. |
| `lib/seo.ts` | JSON-LD: Person, WebSite, ProfilePage, ItemList, CreativeWork y BreadcrumbList. |
| `components/ui/Media.tsx`, `scripts/optimize-images.mjs`, `lib/images.json` | Imágenes WebP con nombre descriptivo, `srcset` 640/1440, `width`/`height` (sin saltos de layout), lazy loading y recortes JPEG 1200×630 para redes. |
| `components/stage/FootageStage.tsx` | **Carga progresiva** de los 234 fotogramas: solo carga unos 70 por delante del lector, y menos con Save-Data o 2G. |
| `components/sections/Hero.tsx` | Titular y subtítulo nuevos, botones Ver proyectos / Contactar / CV y "Salta la intro" con fondo legible. |
| `components/sections/Contact.tsx` | "¿Tienes un proyecto en mente?" + "Hablemos". El footer ya está fuera de `<main>` y la barra lateral no se solapa. |
| `components/ui/SmartLink.tsx` | Enlaces internos rastreables (`<a href>` real) que respetan el base path. Los externos llevan aviso accesible. |
| `app/globals.css`, `tailwind.config.ts` | Contraste del texto tenue: de #7a746e (4,4:1) a #8c867f (~5,5:1). Estilos de flujos IA, fichas y titular. Los anclajes en móvil caen en el título. |
| `public/og.png`, `public/icon-*.png`, `app/apple-icon.png` | Imagen social 1200×630 e iconos, generados a partir de la propia web. |
| `README.md`, `package.json` | Documentación y scripts nuevos `npm run images` y `npm run preview`. |

## B. Mejoras visuales

- Hero con titular editorial en serif y jerarquía clara: nombre → propuesta de valor → subtítulo → botones.
- Proyectos: tarjeta destacada en panorámico, filtro por área (Diseño web, Diseño gráfico y marca, Producción audiovisual, IA) y la tarjeta entera clicable con foco visible.
- IA: los flujos se muestran como pasos unidos por una línea, en lugar de una lista de logotipos.
- Fichas de proyecto con fondo ambiental propio, migas de pan, "Más proyectos" y llamada a la acción.
- Móvil: sin desbordamientos de 320 a 1440 px, pestañas de habilidades en varias líneas y zonas táctiles de al menos 32–40 px.
- **La copa no se ha tocado** en su concepto ni en su timing: misma narrativa, mismos `END_FRAME` y mismo suavizado.

## C. SEO implementado

- **Titles**: inicio "Darío Borbón | Marketing, Diseño Web e IA en Zaragoza" y uno propio por proyecto ("Mori Sushi: Propuesta de diseño web | Darío Borbón", etc.).
- **Meta descriptions** únicas por página.
- **Canonical** absoluto con barra final en las 5 URLs.
- **sitemap.xml**: solo las 5 URLs reales, sin `lastmod` porque no hay fechas reales de modificación.
- **robots.txt**: `Allow: /` y referencia al sitemap. Ninguna página tiene `noindex`.
- **JSON-LD**: validado como JSON en todas las páginas. `sameAs` solo incluye tu LinkedIn: las cuentas de Instagram son del local y del equipo, no perfiles personales.
- **Open Graph / Twitter**: `summary_large_image`, imagen 1200×630 en inicio y una por proyecto.
- **HTML semántico**: un H1 por página, H2 por sección, H3 por tarjeta, `header`/`nav`/`main`/`article`/`aside`/`footer`, todas las imágenes con `alt` y todo el contenido en el HTML inicial (no depende del canvas).
- **Enlazado interno**: inicio → casos, IA → casos, vídeo → caso, caso → otros casos y contacto.
- **VideoObject: no añadido**. Google exige `uploadDate` y no hay fechas de publicación reales.

## D. Rendimiento (laboratorio)

Medido en local (`out/` servido sin compresión), con Chromium headless vía Playwright. Móvil: 390×844, CPU ×4 y red de unos 1,6 Mbps con 150 ms de latencia. **No son datos de usuarios reales** (CrUX / Search Console).

| Métrica | Antes | Después |
|---|---|---|
| LCP escritorio | 624 ms | 316 ms |
| LCP móvil limitado | 1304 ms | 1088 ms |
| CLS | 0,007 | 0,002–0,003 |
| Imágenes descargadas en los primeros 6 s | 5089 KB | 1873 KB |
| Peticiones | 248 | 103 |
| JS (sin comprimir) | 415 KB | 414 KB |
| Clic en filtro → pintado (aprox. de INP, móvil limitado) | — | 136 ms |
| Ficha de proyecto, LCP móvil limitado | — | 744 ms |

## E. Errores corregidos

1. No había robots.txt, sitemap, canonical ni imagen social (todos daban 404 o no existían).
2. "localhost · este sitio", "Captura en preparación" y una portada vacía visibles en la web.
3. Mori Sushi aparecía como "encargo de cliente" sin pruebas. Las herramientas que figuraban ("HTML/CSS") no eran las reales: la demo está hecha con Astro.
4. Proyectos duplicados entre Proyectos y Webs.
5. El texto decía "three.js y shaders propios" y "WebGL 2", cuando la animación real es metraje en canvas 2D.
6. La fotografía no aclaraba la autoría.
7. Al entrar se descargaban los 234 fotogramas (unos 5 MB) aunque no hicieras scroll.
8. Texto tenue con contraste por debajo de 4,5:1.
9. En el hero, el bloque "¿Con prisa?" quedaba encima de la copa y no se leía.
10. La barra lateral se solapaba con los enlaces de contacto a 1440 px.
11. El título de Habilidades desbordaba en móviles de 320–390 px.
12. El H1 se leía como "DaríoBorbón" (sin espacio) para lectores de pantalla y buscadores.
13. Sin JavaScript, el contenido quedaba oculto por las animaciones de entrada (ahora hay respaldo `<noscript>`).

## F. Pendiente de tu parte

- **Diseño gráfico**: no hay carteles, logotipos ni equipaciones en el repositorio. Para crear la galería, añade los archivos originales (con permiso de uso) y lo monto. Mientras tanto no se muestra nada inventado.
- **Fechas**: año o fechas de Mori Sushi y de La Encantadora FC (ahora se omiten) y fecha de publicación de los vídeos (necesaria para VideoObject).
- **Autoría de los retratos**: si sabes quién hizo las fotos, añádelo en `credit`.
- **CV (PDF)**: le falta la URL del portfolio, el email, LinkedIn, el centro de estudios del Grado Superior (Izquierdo FP), las herramientas de vídeo, web e IA y los proyectos web. No lo he modificado.
- **Mori Sushi**: confirma que el enfoque "propuesta" es correcto. Si hubo un encargo real, se puede cambiar el texto.
- **GA4**: no instalado. Necesita tu Measurement ID y un banner de consentimiento (RGPD/LSSI). Mientras no se instale, la web no usa cookies.

## G. Google Search Console (pasos)

1. Entra en https://search.google.com/search-console y añade una propiedad de tipo **Prefijo de URL** con `https://darioborbon.github.io/`.
2. Verifica con **Etiqueta HTML**: copia el valor de `content` y pásamelo. Lo añadiré en `metadata.verification.google` en `app/layout.tsx` y lo publicaremos. No hay que inventar tokens.
3. Ve a **Sitemaps** y envía `sitemap.xml`.
4. Usa **Inspección de URLs** con `https://darioborbon.github.io/` y pulsa **Solicitar indexación**. Repite con cada `/proyectos/<slug>/`.
5. En unos días, revisa **Páginas** (indexadas o no y por qué) y **Rendimiento** (consultas, impresiones y clics).
6. Hasta que Search Console lo confirme, no se puede afirmar que Google ha indexado la web.

## H. Estado

- **Implementado**: todo lo anterior.
- **Probado** (navegador real, build de producción): build y tipos sin errores; 5 páginas sin errores de consola; 31 URLs internas con respuesta 200; sitemap, robots, manifest, OG e iconos con 200; JSON-LD válido; canonical y OG absolutos; sin textos provisionales; sin desbordamiento horizontal en 320, 390, 768, 1024 y 1440 px; contenido visible sin JavaScript; movimiento reducido respetado; orden de tabulación y foco visible; la copa cambia de fotograma al hacer scroll; el CV responde 200.
- **No probado**: Lighthouse oficial, datos reales de campo, Safari/iOS y Firefox, lector de pantalla real, validador oficial de resultados enriquecidos de Google (solo he comprobado que el JSON es válido), vista previa real en LinkedIn/WhatsApp y enlaces externos más allá de su código HTTP (LinkedIn bloquea bots con un 999).
- **Pendiente de publicar**: los cambios están en tu carpeta, sin commit. Para publicarlos hay que hacer `git add`, `git commit` y `git push`.

## Dominio propio (Fase 10)

`darioborbon.es` (unos 10 €/año) daría una marca más profesional y un dominio fácil de recordar en el CV. A corto plazo no mejora el posicionamiento por sí solo. Si migras: configura el dominio personalizado en GitHub Pages (CNAME + DNS A/AAAA y "Enforce HTTPS"), cambia `SITE_URL` en `lib/content.ts` (canonical, sitemap y OG se actualizan solos), añade la nueva propiedad en Search Console y usa "Cambio de dirección". GitHub redirige automáticamente `darioborbon.github.io` al dominio propio, así que los enlaces antiguos siguen funcionando. No he hecho nada de esto.
