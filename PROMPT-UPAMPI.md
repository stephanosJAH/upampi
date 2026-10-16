Design and build a complete, visually exceptional landing website for **UPAMPI** — tagline **"Smart Software"** — a software development company that helps small and medium-sized businesses, independent businesses, and professionals digitally transform their processes, build the tools they need, and implement practical AI systems.

The ambition is an Awwwards-level experience: distinctive art direction, sophisticated typography, bold composition, purposeful interaction, and polished execution. It must feel like a premium tech studio, while remaining approachable and credible for an SME owner who is not technical. Create a memorable brand experience with ambitious scroll-driven storytelling and **native View Transitions** as a signature navigation language.

You own the creative direction. Choose the typography, palette, copy, layouts, section structure, lighting, and motion language. Preserve the UPAMPI name and the "Smart Software" tagline. Make confident creative decisions and implement them without asking me to choose a visual direction.

## 1. INSPECT THE PROJECT AND APPLY THE AVAILABLE SKILLS

The project folder starts empty (except this prompt). Check whether I have added any assets (logo, video, images, 3D models). If assets exist, inspect and use them; if not, create everything yourself (procedural 3D, SVG, CSS, generated textures) and do not depend on missing files.

Scaffold the project with **Astro** (latest stable version, TypeScript strict). This is a fixed decision; do not switch frameworks. Use `output: 'static'` so every page is prerendered, and add `@astrojs/node` (standalone mode) only for the on-demand contact endpoint (`export const prerender = false`). Astro provides first-class View Transitions via `<ClientRouter />` / `transition:name`. Add **GSAP + ScrollTrigger** (plus SplitText, DrawSVG, Observer, and Flip — all GSAP plugins are free), **Lenis** for smooth scroll, and **Three.js** (custom `ShaderMaterial` where it adds value) for real-time 3D. Use pinned, exact package versions.

Read and apply the available `frontend-design` skill and any relevant GSAP, Three.js, scroll, or design skills. Briefly report unavailable skills and proceed with the capabilities you have.

Establish a coherent design DNA across composition, typography, spacing, materials, imagery, and motion.

**Language:** primary copy in **Spanish** (neutral Latin American), targeted at SME owners, managers, and professionals. Optionally add an EN toggle only if it is fully functional. Express the "smart, clear, human" positioning through execution. Avoid unsupported claims: no invented clients, logos, testimonials, statistics, certifications, years of experience, or awards. Use clearly framed illustrative examples ("Ejemplo: una clínica que…") instead of fake case studies.

## 1B. PRIMARY STYLE REFERENCE: https://trionn.com/

Open https://trionn.com/ in the browser before designing and study it closely (desktop and mobile, scroll the whole page slowly, hover, interact with the hero). It is the main reference for **tone, art direction, pacing, and interaction quality**. Take inspiration from its language, then translate it into UPAMPI's own identity. **Do not copy** its layout one-to-one, its copy, logo, 3D assets, imagery, or code.

### What the reference does (observed in the browser, section by section)

1. **Preloader:** a flat light-grey screen with only a small "+" crosshair in the center. It then hands off directly into the dark hero.
2. **Hero (dark):** a near-black background with a large, glossy, dark **3D extruded version of the logo mark** in the center, lit with subtle rim light. Thin hairlines cross the whole viewport diagonally and react to the cursor. A huge grotesk headline sits top-left in two lines ending with a period ("Designed to / mean depth."). Under it are two CTAs in **monospace uppercase with an underline and an arrow** ("DISCUSS YOUR PROJECT →", "BOOK A 30-MINUTE CALL →"). Top-right: a sound toggle, a white pill "LET'S TALK", and an outlined pill "MENU ≡". Bottom-right: a small bordered info card (globe icon + "EST. 2012" | "14+ years shaping digital direction") and a one-line value proposition. Bottom-center: micro-copy "HOLD TO 💥 BLAST / DARE ⚡ TO TOUCH THE LINES".
3. **Scroll-driven 3D explosion:** on scroll, the 3D logo **shatters into shards** with sparks and **glowing ember-orange light** inside the fragments. It moves through a **wireframe** phase and then **reassembles** into the logo, all scrubbed by scroll.
4. **Intro manifesto:** a very large statement paragraph whose **words light up from dim grey to white as you scroll** (scroll-scrubbed word reveal). It is followed by a hairline divider with a "+" marker, small uppercase micro-copy on the left, a mission paragraph and a "MORE ABOUT US →" link on the right, and the 3D mark in the background.
5. **Giant marquee:** "IMPACT + INSPIRE + INNOVATE" in enormous condensed caps, running horizontally across the screen in front of the 3D mark, with "✦ FROM IDEA TO OUTCOME." below it.
6. **Dark → light transition:** horizontal **light bands ("blinds") wipe** across the screen to switch the whole page from dark to a light-grey theme.
7. **Key facts (light):** the heading assembles from **blurred letters into sharp type**. Below it are three cards with **perspective tilt** (left and right cards rotated in 3D): a photo card, a big number inside a white circle, and a team photo card.
8. **Partners:** a minimal row of monochrome logos with vertical dividers.
9. **Selected work:** a pinned two-column layout. "Selected work & explorations" stays on the left while **project cards scroll horizontally** on the right (large image, title, one-line description, "EXPLORE PROJECT →"). It ends in a "Discover our complete collection… VIEW ALL PROJECTS →" panel.
10. **Services (signature sequence):**
    * The services are stacked in huge centered caps ("A.I. / DESIGN / DEVELOPMENT / BRANDING"). The background then turns dark with **volumetric smoke**.
    * A **3D rock falls in and smashes the words**: the letters fly apart with physics and rotation.
    * The rock settles as a pinned square stone block, and the **logo gets carved/engraved into it stroke by stroke** as you scroll.
    * Meanwhile, **service cards rise past it, alternating left and right** (title, short description, a **line-art icon** made of concentric/parallel strokes).
    * A persistent "✦ DIFFERENT DISCIPLINES. ONE STANDARD OF CRAFT." line and "VIEW SERVICES →" stay at the bottom.
11. **Testimonials (light):** a blur-reveal heading. On the left, a vertical list of client names, where the active one turns dark with an arrow. On the right, a large quote with avatar, name, and role. Square ← → buttons and "BECOME A CLIENT →".
12. **"DESIGN IN MOTION":** two giant words placed asymmetrically, with micro-copy in the center. Then a **curved 3D ribbon/carousel of shots** bends through space on scroll and finally **settles into a clean 2-row grid**.
13. **Light → dark transition:** the same horizontal-bands wipe, back to dark.
14. **Footer / final CTA (dark, smoky):**
    * A big "Ready to build something bold?" with the same two mono CTAs.
    * Live local time ("IST → 09:27"), business enquiry (email/phone), and social links.
    * A **giant wordmark built from horizontal lines** that react to hover, with optional sound ("SOUND ON · HOVER THE LINES").
15. **Menu:** opens as a **white floating panel** on the right with 4 large links (Work, Services, About, Contact) and a small pill link.

### Design language to extract

* **Rhythm:** it alternates **dark ↔ light** chapters with a consistent wipe transition. Each chapter has one dominant idea, plus generous whitespace and very little copy per screen.
* **Palette:** near-black (`#040508`, `#0C0C0C`, `#111214`), graphite (`#2F323B`), light greys (`#D2D2D2`–`#D9D9D9`) as the light-theme background, and **one hot accent** (ember red-orange `#d9432b`) that appears almost only as *light* inside the 3D. For UPAMPI, keep the restraint, but **choose your own signature accent** (e.g. electric lime, acid cyan, or a cool "signal" blue). It must not be red-orange. Use it as emissive light inside the 3D, not as flat fills.
* **Typography with 3 roles:** a neutral, tightly tracked grotesk for giant display and body (they use Neue Haas Display / Familjen Grotesk), **monospace uppercase** for CTAs and labels (Martian Mono), and an editorial serif kept for rare accents (PP Editorial New). Use free equivalents: *Familjen Grotesk*, *Inter Tight*, or *Geist* + *Martian Mono* or *JetBrains Mono* + *Instrument Serif*. Use enormous display sizes, tight leading, and small uppercase micro-copy.
* **UI details:** pill buttons (one filled, one outlined), underlined mono links with "→", hairline dividers with "+" markers, "✦" bullets, small bordered info cards, and a custom cursor.
* **Motion vocabulary:**
  * scroll-scrubbed word highlighting
  * blur-to-sharp letter reveals
  * 3D shatter/reassemble
  * text-physics explosions
  * pinned centerpiece with content flowing around it
  * horizontal pinned scroll
  * curved WebGL carousel that settles into a grid
  * horizontal-bands theme wipe
  * hover-reactive line art
* **Stack (confirmed in its source code):** Next.js, GSAP (ScrollTrigger, SplitText, DrawSVG, Observer, Flip), Lenis, Three.js with custom shaders.

### How to translate it to UPAMPI (mandatory adaptations)

* **Hero 3D object:** instead of a logo shard sculpture, use the UPAMPI "smart core" (section 2), ideally built from the UPAMPI mark or wordmark. On scroll it **breaks into data fragments** (small cubes or panels that read as documents, chats, spreadsheets, invoices — the SME's chaos), glows with UPAMPI's accent, and **reassembles into an ordered, intelligent structure**. Story: *chaos → smart software*.
* **Hold-to-interact:** "MANTÉN PRESIONADO" triggers the transformation as an easter egg, and hairlines react to the cursor ("TOCA LAS LÍNEAS"). It must work with mouse, touch, and keyboard (e.g. holding Space or Enter on a focused button).
* **Manifesto:** a scroll-scrubbed word reveal in Spanish, e.g. "En UPAMPI convertimos procesos manuales en software inteligente que trabaja por tu negocio…" (write a better one).
* **Marquee:** your own triad in Spanish (e.g. "DIGITALIZA + AUTOMATIZA + ESCALA") with "✦ DE LA IDEA AL RESULTADO." or similar.
* **Theme wipe:** reproduce the dark ↔ light chapter rhythm with your own wipe (bands, scanlines, or a grid of cells, which fits "software").
* **Services signature sequence:** reinterpret the rock moment. For example, a raw block of "chaos" (tangled paper and spreadsheets, or a rough monolith) **gets sliced/compiled into a clean UPAMPI chip/monolith**, with the logo **etched into it with circuit-like strokes** as you scroll. Service cards alternate left/right with **DrawSVG line-art icons** (Transformación digital, Software a la medida, Automatización e integraciones, Implementación de IA, Apps web y móviles, Dashboards y datos). The service words exploding with physics before the sequence is encouraged.
* **Key facts:** keep the tilted 3D cards, but follow the "no unsupported claims" rule. Use **verifiable, non-numeric facts** (e.g. "Diagnóstico inicial sin costo", "Entregas por etapas", "El código y los datos son tuyos"). Do not invent numbers. List them in the final report so I can confirm them.
* **Partners logo row → technologies row:** use technology/capability names written as text, not third-party brand logos.
* **Selected work → "Soluciones":** use a pinned horizontal-scroll section with illustrative solution cards per industry. **Each card links to a detail page using a View Transitions shared-element morph** (section 5). This is where the trionn reference and the Kalkbrenner gallery reference meet.
* **Testimonials:** **skip** them unless I provide real ones. Replace them with a "Cómo trabajamos" process section with the same layout idea: a vertical step list on the left and the active step's large description on the right, with ← → controls.
* **"Design in motion" → "IA en acción":** a curved WebGL ribbon of UI mockups that you design yourself (chatbot, dashboard, invoice automation, CRM, booking app). It bends on scroll and settles into a grid.
* **Footer:** a smoky dark background, a big Spanish CTA ("¿Listo para hacer tu negocio más inteligente?"), the mono CTAs, the user's local time, contact, social placeholders, and a **giant UPAMPI wordmark built from hover-reactive horizontal lines**. Sound is optional, off by default, and behind an explicit toggle.
* **Menu:** a floating panel with large links and a smooth open/close (it may use a View Transition).
* **Contact:** a lead-qualifying form (name, email, service chips, description with minimum length, budget range). The "Agenda una llamada de 30 min" CTA points to an easy-to-replace booking URL constant. Keep the reply-time promise as an editable placeholder.
* **Effects that must stay purposeful:** custom cursor (disabled on touch and under reduced motion), SplitText reveals, and magnetic pill buttons. Each effect must serve readability and the story.

## 2. THE OPENING IS MANDATORY: A COMPLETE HERO OVER A LIVING "SMART CORE"

Create a full-screen opening hero built around a real-time Three.js scene: an abstract **"smart core"** — e.g. a structure of particles, nodes, and connections that represents disordered, manual processes (scattered sheets, loose dots, noise) that can become an organized, intelligent system. You may invent a stronger concept, but it must visually express *transformation from chaos to smart software*.

On initial load the scene must be composed and calm: render a deliberate still state (subtle, low-cost ambient motion is allowed only if it doesn't distract or compete with the text; respect `prefers-reduced-motion`).

The first screen must already feel like the entrance to a finished premium website. Include:

* The UPAMPI wordmark (design an SVG wordmark/logo if none is supplied) with "Smart Software".
* Usable navigation (Servicios, IA, Proceso, Proyectos/Soluciones, Contacto).
* A strong editorial headline and concise supporting copy about digital transformation and AI for SMEs.
* A purposeful primary CTA (e.g. "Agenda un diagnóstico") and a secondary CTA.
* A subtle scroll indication.

Design these elements over the 3D scene with excellent readability and deliberate placement. Show a matching static poster (pre-rendered or CSS/SVG equivalent) while WebGL initializes, with no visible jump. Keep the hero usable while loading.

## 3. SCROLL DRIVES THE TRANSFORMATION

Pin the opening scene while the user scrolls. Map scroll progress directly to the scene timeline:

* Forward scrolling advances the transformation (chaos → order → intelligent system).
* Backward scrolling reverses it precisely.
* When scrolling stops, the scene settles at the corresponding state and holds.

Do not trigger autoplay timelines on section enter; scroll must scrub the experience with responsive, low-latency response. Choreograph hero text and navigation as the journey begins, keeping important content readable before it leaves.

The intended feeling: the visitor enters the system and watches their business's disorder become smart software.

## 4. IMMEDIATE HANDOFF, NO EMPTY GAP

This requirement is critical. When the hero transformation completes, the next designed visual event must begin immediately. There must be no extra scrolling through an empty viewport, no artificial pause, no blank spacer.

Coordinate the end of the hero timeline, scroll range, pinning, and next-scene visibility. A possible direction: the organized core collapses into a single point of light that becomes the first UI element / icon of the services section, or the camera flies through the core into the next scene. You may invent a stronger approach.

Avoid white flashes, layout jumps, premature reveals, or overlapping scenes. The transition must also work naturally when scrolling backward. Preload whatever the next scene needs.

## 5. VIEW TRANSITIONS AS A SIGNATURE (MANDATORY)

Use the **View Transitions API** as a core part of the experience, in the spirit of the gallery at https://www.paulkalkbrenner.net/gallery: a visual index where clicking an item morphs its image/card seamlessly into a detail view, and going back morphs it into its original place.

Implement:

* **Shared-element morphs** with unique `view-transition-name` (or Astro `transition:name`) per item: card/thumbnail → detail-page hero image, title → detail title, and the reverse on back navigation.
* **Cross-document or router-level transitions** between real pages (`/`, `/servicios/[slug]`, `/soluciones/[slug]`, `/contacto`), using Astro's `<ClientRouter />` (handle `astro:page-load`, `astro:before-swap`, and `astro:after-swap` to re-init and clean up GSAP, Lenis, and Three.js; use `transition:persist` for the header and any persistent canvas where useful), so the browser's back/forward buttons also animate correctly.
* **Same-document transitions** (`document.startViewTransition`) for in-page state changes: filtering the solutions index (e.g. Todas / Automatización / IA / Web & Apps / Integraciones), switching layouts (grid ↔ list), and theme toggle if you add one.
* Custom `::view-transition-old()` / `::view-transition-new()` / `::view-transition-group()` animations with deliberate easing and duration — not just the default crossfade. Consider clip-path reveals, staggered titles, and a persistent header (`view-transition-name: header`) that does not flicker.
* Keep GSAP/ScrollTrigger and Lenis in sync across navigations: kill/re-init triggers and dispose Three.js resources on page swap, restore scroll position on back.
* **Progressive enhancement:** feature-detect; browsers without support must navigate instantly and correctly. Under `prefers-reduced-motion`, replace morphs with a short fade or none.

## 6. REAL-TIME 3D AS A MAJOR CREATIVE MOMENT

Beyond the hero, create at least one memorable signature 3D sequence coordinated with GSAP + ScrollTrigger. Suggested concept (you may improve it): an **"AI implementation" sequence** where a process flow (inputs: documents, messages, sales, inventory) passes through an intelligent core and comes out as automated outputs (reports, replies, alerts, dashboards), with typography explaining each step.

Give the 3D strong presence: dramatic scale changes, expressive camera moves, careful lighting, glass/metal/emissive materials. Plan intentional spaces for copy so 3D never obscures text or controls. Render only when visible (pause the render loop offscreen), cap pixel ratio, and dispose resources properly.

## 7. CONTENT AND SECTIONS

Choose the sections yourself, connected by a clear visual story, balancing major motion sequences with quieter moments. They should cover at least:

* **Qué hacemos:** digital transformation of processes; custom software (web apps, internal tools, dashboards, mobile); integrations and automation; **AI implementation** (assistants/chatbots, document processing, smart automation, data analysis, agents integrated with their tools).
* **Para quién:** SMEs, businesses, and professionals — explain benefits in plain language (less manual work, fewer errors, more time, better decisions).
* **Cómo trabajamos:** a clear process (diagnóstico → diseño → desarrollo → implementación → acompañamiento).
* **Soluciones / Proyectos index:** the View Transitions gallery (section 5) with at least 6–8 items, each with a real detail page. Use clearly illustrative solution examples per industry (retail, clinics, restaurants, professional services, logistics, education…), not fake clients. Create distinctive visuals for each (procedural/SVG/3D renders or supplied images) and vary their scale, composition, and rhythm — avoid a repetitive grid of identical cards.
* **FAQ** focused on SME concerns (cost, time, "¿necesito saber de tecnología?", data security, AI in practice).
* **Final CTA + contact:** a working, lead-qualifying contact form in the style of the trionn.com reference (name, email, service chips, description, budget range) with client-side and server-side validation and clear success/error states. Submit it to the Astro endpoint `POST /api/contact` described in section 8. Footer with navigation.

Every CTA and nav link must perform a meaningful action within the implemented site. No dead controls or unfinished destinations.

Deliver responsive desktop and mobile layouts. Adapt camera framing, typography, crops, and scroll distances to the device. Respect reduced-motion preferences with an intentional accessible alternative. Use semantic HTML, keyboard focus states, sufficient contrast, and good SEO metadata (title, description, Open Graph, Spanish `lang`).

## 8. PRODUCTION BUILD AND DEPLOYMENT TO MY VPS (upampi.com)

The site will be self-hosted on my own Linux VPS (assume Ubuntu 22.04/24.04) at **https://upampi.com**, with `www.upampi.com` redirecting to the apex domain. **Prepare everything for deployment, but do not attempt to connect to or modify the server.** I will run the deploy myself.

**Build and site config**
* Set `site: 'https://upampi.com'` in `astro.config`. Generate `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`, canonical URLs, Open Graph images, a favicon set, and a `manifest.webmanifest`.
* Use self-hosted fonts (no runtime Google Fonts dependency), optimized images (`astro:assets`, AVIF/WebP), and code-split heavy modules. Load Three.js, GSAP, and Lenis only where they are used. Keep the initial JS small and report bundle sizes.
* Static assets in `/_astro/*` are content-hashed, so they get long-lived caching.

**Contact endpoint (`src/pages/api/contact.ts`, `prerender = false`)**
* Validate input server-side (e.g. with zod).
* Protect it with a honeypot field, a minimum time-to-submit check, and simple in-memory rate limiting per IP.
* Send the email with a pluggable transport chosen by environment variables: **Resend** (`RESEND_API_KEY`) or **SMTP** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) via nodemailer. Also set `CONTACT_TO`, `CONTACT_FROM`, and optionally `CONTACT_REPLY_TO` = the visitor's email.
* When no credentials are set, log the message and return success in dev (dry-run).
* Never expose secrets to the client. Provide a `.env.example` and keep `.env` in `.gitignore`.

**Deployment files (create a `deploy/` folder)**
* `deploy/Caddyfile` (the **primary option**, with automatic HTTPS) for `upampi.com` + `www.upampi.com` → redirect to the apex domain. It should:
  * serve `dist/client` as static files;
  * reverse-proxy `/api/*` to the Node server on `127.0.0.1:4321`;
  * enable gzip/zstd compression;
  * set cache headers (`/_astro/*` immutable for 1 year; HTML `no-cache`);
  * set security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) and a Content-Security-Policy compatible with WebGL, workers/blob URLs if used, and the booking embed/link;
  * serve a custom 404 page.
* `deploy/nginx.conf`: an equivalent **alternative** config for Nginx + Certbot, in case the VPS already runs Nginx.
* `deploy/upampi-contact.service`: a systemd unit that runs the Astro Node server (`node dist/server/entry.mjs`, `HOST=127.0.0.1`, `PORT=4321`, `EnvironmentFile=/etc/upampi/contact.env`), restarts automatically, and runs as a non-root user. Also add an optional `deploy/ecosystem.config.cjs` for PM2.
* `deploy/deploy.sh`: an idempotent script with configurable `VPS_HOST`, `VPS_USER`, and `REMOTE_DIR`. It should:
  * run `npm ci` and `npm run build`;
  * `rsync` `dist/` plus `package.json`/lockfile to the server into a timestamped release directory;
  * install production dependencies remotely;
  * switch a `current` symlink atomically;
  * restart the service and reload Caddy/Nginx;
  * keep the last 3 releases for rollback.
* Optional: `.github/workflows/deploy.yml` that builds on push to `main` and runs the same deploy over SSH using repository secrets.
* `DEPLOY.md` (in Spanish): a step-by-step guide covering:
  * DNS records (`A` for `upampi.com` and `www` → VPS IP, plus `AAAA` if IPv6);
  * firewall (open 80/443 only);
  * installing Node LTS and Caddy (or Nginx + Certbot);
  * creating the user and directories, and placing the env file;
  * first deploy, updates, rollback, and viewing logs (`journalctl -u upampi-contact`);
  * how to test the form in production.

**Verification for this section**
* `npm run build` succeeds without warnings that matter.
* Run the built server locally (`node dist/server/entry.mjs`) and confirm that static pages, View Transitions, 3D, and `POST /api/contact` all work.
* Validate the `deploy/` configs syntactically where tools are available (e.g. `caddy validate`, `nginx -t`). Otherwise, state clearly that they were not validated.

## 9. VERIFY THE ACTUAL RESULT

Implement the complete website, then inspect it in the browser. Verify:

* The initial hero contains branding, tagline, navigation, headline, and CTAs.
* The hero is composed and stable before scrolling.
* Forward, backward, and stopped scrolling control the hero transformation correctly.
* The next visual event begins immediately when the hero sequence ends; no inactive empty scroll interval.
* The 3D sequences load and their choreography works in both directions.
* View Transitions: index → detail morph, detail → index morph (including browser back), filter transitions, persistent header without flicker; graceful fallback without support.
* GSAP/ScrollTrigger and Three.js re-initialize cleanly after navigations, with no duplicate triggers or memory leaks.
* Text and controls remain readable and usable; the contact form works against the local `/api/contact` endpoint (with a test email transport or a logged dry-run when no credentials are set).
* The production build works: `npm run build` succeeds and `npm run preview` (or the built Node server) serves the same experience as dev, including View Transitions, 3D, fonts, and the contact endpoint.
* The trionn.com-inspired layer works: preloader → hero handoff without a gap, hero shatter/reassemble scrubbed in both directions, press-and-hold interaction (mouse, touch, keyboard), scroll-scrubbed manifesto, marquee, dark ↔ light wipes, the services signature sequence, horizontal Soluciones scroll, curved ribbon → grid, hover-line footer wordmark, and custom cursor. Compare side by side with https://trionn.com/ and confirm the quality bar is met without copying it.
* Desktop and mobile layouts work without significant console errors or broken assets.

Refine issues before finishing. Clearly distinguish completed browser checks from anything you could not verify.

Briefly explain the creative concept, how View Transitions, 3D, and the skills were used, and what you tested. Make the first version creatively ambitious. Start it on **http://localhost:5179/**.
