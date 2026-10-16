import { gsap } from '../lib/gsap';
import { positionRail, railActive } from '../lib/rail-math';
import type { PageCtx } from '../lib/env';

/** Pinned horizontal "Soluciones" rail (CSS sticky + scroll-mapped translateX). */
export default function init(section: HTMLElement, _ctx: PageCtx) {
  const track = section.querySelector<HTMLElement>('[data-rail-track]')!;
  let lastY = -1;
  const tick = () => {
    if (!railActive()) {
      track.style.transform = '';
      return;
    }
    if (window.scrollY === lastY) return;
    lastY = window.scrollY;
    positionRail(section);
  };
  gsap.ticker.add(tick);
  const onResize = () => {
    lastY = -1;
  };
  window.addEventListener('resize', onResize);

  // Keyboard: bring a focused card into view by scrolling the page to its slot.
  const onFocus = (e: FocusEvent) => {
    if (!railActive()) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('.rcard, .rail-end a, .rail-intro a');
    if (!card) return;
    const max = track.scrollWidth - window.innerWidth;
    if (max <= 0) return;
    const left = card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2;
    const p = Math.min(1, Math.max(0, left / max));
    const top = section.offsetTop + p * (section.offsetHeight - window.innerHeight);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(top, { duration: 0.8 });
    else window.scrollTo({ top });
  };
  section.addEventListener('focusin', onFocus);

  tick();
  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    section.removeEventListener('focusin', onFocus);
  };
}
