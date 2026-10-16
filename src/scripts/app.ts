/**
 * Global client bootstrap. Runs once per hard load; the ClientRouter swaps
 * <body> on navigation, so everything page-specific is (re)initialised on
 * `astro:page-load` and torn down on `astro:before-swap`.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, SplitText } from './lib/gsap';
import { isFinePointer, prefersReduced, isMobile, supportsVT, type Cleanup, type PageCtx } from './lib/env';
import { restoreSound, setSound, soundEnabled } from './lib/sound';
import { positionRails, positionServices } from './lib/rail-math';

/* ------------------------------------------------------------ modules -- */

type ModuleInit = (el: HTMLElement, ctx: PageCtx) => Cleanup | void | Promise<Cleanup | void>;
const loaders: Record<string, () => Promise<{ default: ModuleInit }>> = {
  hero: () => import('./modules/hero'),
  manifesto: () => import('./modules/manifesto'),
  marquee: () => import('./modules/marquee'),
  wipe: () => import('./modules/wipe'),
  facts: () => import('./modules/facts'),
  rail: () => import('./modules/rail'),
  services: () => import('./modules/services'),
  ribbon: () => import('./modules/ribbon'),
  process: () => import('./modules/process'),
  'footer-lines': () => import('./modules/footer-lines'),
  'sol-index': () => import('./modules/sol-index'),
  contact: () => import('./modules/contact'),
};

let cleanups: Cleanup[] = [];
let pageToken = 0;
const onCleanup = (fn: Cleanup) => cleanups.push(fn);

/* -------------------------------------------------------------- lenis -- */

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

function startLenis() {
  if (lenis || prefersReduced()) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
}
gsap.ticker.add((t) => lenis?.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/** Smooth in-page anchor scrolling; cross-page anchors are left to the router. */
window.addEventListener(
  'click',
  (ev) => {
    const a = (ev.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
    if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    ev.preventDefault();
    ev.stopPropagation();
    closeMenu(true);
    history.pushState(history.state, '', url.hash);
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  },
  true,
);

/* ------------------------------------------------------------- cursor -- */

const cursor = { x: -100, y: -100, rx: -100, ry: -100, on: false };
function setupCursor() {
  const el = document.querySelector<HTMLElement>('[data-cursor]');
  if (!el || !isFinePointer() || prefersReduced()) return;
  document.documentElement.classList.add('has-cursor');
  const dot = el.querySelector<HTMLElement>('.cursor__dot')!;
  const ring = el.querySelector<HTMLElement>('.cursor__ring')!;
  const label = el.querySelector<HTMLElement>('.cursor__label')!;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    if (!cursor.on) {
      cursor.on = true;
      cursor.rx = cursor.x;
      cursor.ry = cursor.y;
      el.classList.add('is-on');
    }
    const t = e.target as Element;
    const view = t.closest?.('[data-cursor-view]');
    el.classList.toggle('is-view', !!view);
    if (view) label.textContent = view.getAttribute('data-cursor-view') || 'Ver';
    el.classList.toggle('is-link', !view && !!t.closest?.('a, button, label, [role="tab"], summary'));
  });
  document.addEventListener('pointerleave', () => {
    cursor.on = false;
    el.classList.remove('is-on');
  });
  gsap.ticker.add(() => {
    cursor.rx += (cursor.x - cursor.rx) * 0.2;
    cursor.ry += (cursor.y - cursor.ry) * 0.2;
    dot.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0)`;
    ring.style.transform = `translate3d(${cursor.rx}px,${cursor.ry}px,0)`;
    label.style.transform = ring.style.transform;
  });
}

/* ----------------------------------------------------------- magnetic -- */

function setupMagnetic(root: ParentNode) {
  if (!isFinePointer() || prefersReduced()) return;
  root.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    if (el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* --------------------------------------------------------------- menu -- */

let lastFocus: HTMLElement | null = null;
const menuEl = () => document.querySelector<HTMLElement>('[data-menu]');
const withVT = (fn: () => void, instant = false) => {
  if (!instant && supportsVT() && !prefersReduced()) {
    document.documentElement.classList.add('vt-same-doc');
    const t = document.startViewTransition(fn);
    t.finished.finally(() => document.documentElement.classList.remove('vt-same-doc'));
  } else fn();
};
function openMenu() {
  const m = menuEl();
  if (!m || !m.hidden) return;
  lastFocus = document.activeElement as HTMLElement;
  withVT(() => {
    m.hidden = false;
  });
  lenis?.stop();
  document.querySelectorAll('[data-menu-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  requestAnimationFrame(() => m.querySelector<HTMLElement>('[data-menu-link]')?.focus());
}
function closeMenu(instant = false) {
  const m = menuEl();
  if (!m || m.hidden) return;
  withVT(() => {
    m.hidden = true;
  }, instant);
  lenis?.start();
  document.querySelectorAll('[data-menu-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  if (!instant) lastFocus?.focus();
}
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-menu-open]')) openMenu();
  else if (t.closest('[data-menu-close]')) closeMenu();
  else if (t.closest('[data-menu-link]')) closeMenu(true);
  const s = t.closest('[data-sound-toggle]');
  if (s) setSound(!soundEnabled());
});
document.addEventListener('keydown', (e) => {
  const m = menuEl();
  if (!m || m.hidden) return;
  if (e.key === 'Escape') closeMenu();
  if (e.key === 'Tab') {
    const f = [...m.querySelectorAll<HTMLElement>('a, button')];
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1]?.focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0]?.focus();
    }
  }
});

/* -------------------------------------------------------- header theme -- */

let chapters: HTMLElement[] = [];
let headerTheme = '';
function updateHeaderTheme() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const probe = 38;
  let theme = document.body.dataset.theme || 'dark';
  for (const c of chapters) {
    const r = c.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) theme = c.dataset.theme || theme;
  }
  if (theme !== headerTheme) {
    headerTheme = theme;
    header.dataset.theme = theme;
    document.documentElement.dataset.ui = theme;
  }
}
gsap.ticker.add(updateHeaderTheme);

function markCurrentNav() {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const current = !href.includes('#') && href !== '/' && location.pathname.startsWith(href);
    if (current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/* ------------------------------------------------------------ reveals -- */

function setupReveals(root: ParentNode, reduced: boolean) {
  const splits: SplitText[] = [];

  root.querySelectorAll<HTMLElement>('[data-split-reveal]').forEach((el) => {
    if (reduced) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
    });
    splits.push(split);
  });

  // Blur-to-sharp letters, scrubbed by scroll.
  root.querySelectorAll<HTMLElement>('[data-blur-reveal]').forEach((el) => {
    if (reduced) return;
    const split = SplitText.create(el, { type: 'words,chars' });
    splits.push(split);
    gsap.fromTo(
      split.chars,
      { filter: 'blur(14px)', opacity: 0, yPercent: 18, scale: 1.08 },
      {
        filter: 'blur(0px)',
        opacity: 1,
        yPercent: 0,
        scale: 1,
        ease: 'none',
        stagger: { each: 0.04, from: 'random' },
        scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 45%', scrub: 0.6 },
      },
    );
  });

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (reduced) return;
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      delay: Number(el.dataset.reveal) || 0,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  root.querySelectorAll<SVGElement>('[data-draw]').forEach((svg) => {
    const paths = svg.querySelectorAll('path, circle, line, rect, polyline, ellipse');
    if (reduced) return;
    gsap.from(paths, {
      drawSVG: '0%',
      duration: 1.6,
      stagger: 0.06,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: svg, start: 'top 88%', once: true },
    });
  });

  return () => splits.forEach((s) => s.revert());
}

/* -------------------------------------------------------------- clock -- */

function setupClock(): Cleanup {
  const clocks = document.querySelectorAll<HTMLElement>('[data-local-time]');
  if (!clocks.length) return () => {};
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Local';
  const fmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () =>
    clocks.forEach((c) => {
      c.querySelector('[data-tz]')!.textContent = city;
      const t = c.querySelector('time')!;
      const now = new Date();
      t.textContent = fmt.format(now);
      t.dateTime = now.toISOString();
    });
  tick();
  const id = window.setInterval(tick, 15000);
  return () => clearInterval(id);
}

/* ---------------------------------------------------------- preloader -- */

function runPreloader() {
  const pre = document.querySelector<HTMLElement>('[data-preloader]');
  if (!pre) return;
  const done = () => {
    if (pre.classList.contains('is-done')) return;
    pre.classList.add('is-done');
    document.documentElement.classList.add('is-loaded');
    window.dispatchEvent(new CustomEvent('upampi:intro'));
    setTimeout(() => pre.remove(), 1500);
  };
  const ready = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise<void>((r) => window.addEventListener('upampi:hero-ready', () => r(), { once: true })),
  ]);
  const minDelay = new Promise((r) => setTimeout(r, 650));
  Promise.race([Promise.all([ready, minDelay]), new Promise((r) => setTimeout(r, 2400))]).then(done);
}

/* ---------------------------------------------------------- lifecycle -- */

async function initPage() {
  const token = ++pageToken;
  const reduced = prefersReduced();
  const ctx: PageCtx = { reduced, mobile: isMobile(), onCleanup };

  startLenis();
  lenis?.start();
  lenis?.resize();
  markCurrentNav();
  setupMagnetic(document);
  chapters = [...document.querySelectorAll<HTMLElement>('main [data-theme], body > footer[data-theme]')];
  headerTheme = '';
  updateHeaderTheme();

  onCleanup(setupReveals(document, reduced));
  onCleanup(setupClock());

  const els = [...document.querySelectorAll<HTMLElement>('[data-module]')];
  await Promise.all(
    els.map(async (el) => {
      const name = el.dataset.module!;
      const load = loaders[name];
      if (!load) return;
      try {
        const mod = await load();
        if (token !== pageToken) return; // navigated away while loading
        const c = await mod.default(el, ctx);
        if (typeof c === 'function') {
          if (token !== pageToken) c();
          else onCleanup(c);
        }
      } catch (err) {
        console.error(`[upampi] module "${name}" failed`, err);
      }
    }),
  );
  if (token !== pageToken) return;
  ScrollTrigger.refresh();
  setupMagnetic(document);
}

function teardown() {
  cleanups.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
  cleanups = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.getChildren(false, true, true).forEach((t) => {
    // keep ticker-level quickTo tweens of persisted elements (cursor, magnetic pills in header)
    const targets = (t as gsap.core.Tween).targets?.() ?? [];
    const persisted = targets.some((x) => x instanceof Element && x.closest('[data-astro-transition-persist]'));
    if (!persisted) t.kill();
  });
}

/**
 * Shared-element scoping: only the item being opened (or returned from) keeps
 * its view-transition-name, so it morphs alone while the rest of the page
 * rides the root curtain. Keys come from detail URLs on either side.
 */
const detailKey = (u: URL) => u.pathname.match(/^\/(?:soluciones|servicios)\/([^/]+)\/?$/)?.[1];
let vtKeys = new Set<string>();
const scopeNames = (root: ParentNode) =>
  root.querySelectorAll<HTMLElement>('[data-vt-key]').forEach((el) => {
    el.style.viewTransitionName = vtKeys.has(el.dataset.vtKey!) ? '' : 'none';
  });
document.addEventListener('astro:before-preparation', (e) => {
  vtKeys = new Set([detailKey(e.from), detailKey(e.to)].filter((k): k is string => !!k));
  scopeNames(document); // before the old-state snapshot is taken
});

document.addEventListener('astro:before-swap', (e) => {
  scopeNames(e.newDocument); // before the new-state snapshot

  closeMenu(true);
  // cancel any in-flight smooth scroll so it can't fight the router's scroll restoration
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
  teardown();
  // the preloader belongs to the first hard load only
  e.newDocument.querySelector('[data-preloader]')?.remove();
});
document.addEventListener('astro:after-swap', () => {
  // Scroll was restored by the router before the new snapshot is taken:
  // position scroll-dependent elements now so shared-element morphs land correctly.
  positionRails();
  positionServices();
});
document.addEventListener('astro:page-load', () => {
  initPage();
});

setupCursor();
restoreSound();
runPreloader();
