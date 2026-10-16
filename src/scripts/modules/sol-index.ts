/**
 * Solutions index — same-document View Transitions for filtering and for the
 * grid ↔ list layout switch. Each card has its own view-transition-name, so
 * the browser morphs them to their new positions; entering/leaving cards use
 * the custom `sol-card` keyframes. Without support the change is instant.
 */
import { gsap, ScrollTrigger } from '../lib/gsap';
import { supportsVT, type PageCtx } from '../lib/env';
import { categories } from '../../data/solutions';

export default function init(root: HTMLElement, ctx: PageCtx) {
  const grid = root.querySelector<HTMLElement>('[data-sx-grid]')!;
  const items = [...grid.querySelectorAll<HTMLElement>('.sx-item')];
  const filterBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const layoutBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-layout]')];
  const status = root.querySelector<HTMLElement>('[data-sx-status]')!;
  const empty = root.querySelector<HTMLElement>('[data-sx-empty]')!;

  const transition = async (update: () => void) => {
    if (ctx.reduced) {
      update();
      ScrollTrigger.refresh();
      return;
    }
    if (!supportsVT()) {
      // Progressive enhancement: GSAP Flip gives the same "cards rearrange" feel without the View Transitions API.
      const { Flip } = await import('gsap/Flip');
      gsap.registerPlugin(Flip);
      const state = Flip.getState(items);
      update();
      Flip.from(state, {
        duration: 0.7,
        ease: 'power3.inOut',
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
      return;
    }
    document.documentElement.classList.add('vt-same-doc');
    const t = document.startViewTransition(update);
    t.finished.finally(() => {
      document.documentElement.classList.remove('vt-same-doc');
      ScrollTrigger.refresh();
    });
  };

  const applyFilter = (id: string) => {
    let shown = 0;
    items.forEach((it) => {
      const match = id === 'todas' || (it.dataset.cats || '').split(' ').includes(id);
      it.hidden = !match;
      if (match) shown++;
    });
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === id)));
    empty.hidden = shown > 0;
    const label = categories.find((c) => c.id === id)?.label ?? id;
    status.textContent = `${shown} soluciones · ${label}`;
  };
  const applyLayout = (v: string) => {
    grid.dataset.view = v;
    layoutBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layout === v)));
  };
  const syncUrl = () => {
    const u = new URL(location.href);
    const f = filterBtns.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'todas';
    if (f === 'todas') u.searchParams.delete('filtro');
    else u.searchParams.set('filtro', f);
    if (grid.dataset.view === 'list') u.searchParams.set('vista', 'lista');
    else u.searchParams.delete('vista');
    history.replaceState(history.state, '', u);
  };

  // initial state from the URL (shareable filters)
  const params = new URLSearchParams(location.search);
  const f0 = params.get('filtro');
  if (f0 && categories.some((c) => c.id === f0)) applyFilter(f0);
  if (params.get('vista') === 'lista') applyLayout('list');

  const onClick = (e: Event) => {
    const t = e.target as Element;
    const fb = t.closest<HTMLButtonElement>('[data-filter]');
    if (fb && fb.getAttribute('aria-pressed') !== 'true') {
      transition(() => {
        applyFilter(fb.dataset.filter!);
        syncUrl();
      });
    }
    const lb = t.closest<HTMLButtonElement>('[data-layout]');
    if (lb && lb.getAttribute('aria-pressed') !== 'true') {
      transition(() => {
        applyLayout(lb.dataset.layout!);
        syncUrl();
      });
    }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
