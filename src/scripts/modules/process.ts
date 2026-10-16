import { gsap } from '../lib/gsap';
import type { PageCtx } from '../lib/env';

/** "Cómo trabajamos": accessible vertical tabs with ← → controls and a blur-in panel swap. */
export default function init(root: HTMLElement, ctx: PageCtx) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  let active = 0;

  const select = (i: number, focus = false) => {
    i = (i + tabs.length) % tabs.length;
    if (i === active) return;
    const prev = panels[active];
    active = i;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    prev.hidden = true;
    const next = panels[i];
    next.hidden = false;
    if (!ctx.reduced) {
      gsap.fromTo(
        next.children,
        { opacity: 0, y: 24, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: 'expo.out', clearProps: 'filter' },
      );
    }
  };

  const onClick = (e: Event) => {
    const t = e.target as Element;
    const tab = t.closest<HTMLButtonElement>('[role="tab"]');
    if (tab) select(Number(tab.dataset.step));
    if (t.closest('[data-proc-prev]')) select(active - 1);
    if (t.closest('[data-proc-next]')) select(active + 1);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!(e.target as Element).closest('[role="tab"]')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') (e.preventDefault(), select(active + 1, true));
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') (e.preventDefault(), select(active - 1, true));
    if (e.key === 'Home') (e.preventDefault(), select(0, true));
    if (e.key === 'End') (e.preventDefault(), select(tabs.length - 1, true));
  };
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);

  // Touch: swipe the active panel left/right to change step (GSAP Observer, loaded on demand).
  let observer: { kill: () => void } | null = null;
  const panelsEl = root.querySelector<HTMLElement>('.proc-panels')!;
  if (window.matchMedia('(pointer: coarse)').matches) {
    import('gsap/Observer').then(({ Observer }) => {
      gsap.registerPlugin(Observer);
      observer = Observer.create({
        target: panelsEl,
        type: 'touch',
        dragMinimum: 30,
        tolerance: 40,
        lockAxis: true,
        onLeft: () => select(active + 1),
        onRight: () => select(active - 1),
      });
    });
  }
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKey);
    observer?.kill();
  };
}
