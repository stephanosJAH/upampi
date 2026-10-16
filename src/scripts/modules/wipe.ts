import { ScrollTrigger } from '../lib/gsap';
import { clamp, type PageCtx } from '../lib/env';

/** Chapter wipe (see Wipe.astro). Scrubbed by scroll, reversible. */
export default function init(root: HTMLElement, ctx: PageCtx) {
  if (ctx.reduced) return;
  const fix = root.querySelector<HTMLElement>('.wipe-fix')!;
  const cells = [...root.querySelectorAll<HTMLElement>('.wipe-grid i')];
  const cs = getComputedStyle(root);
  const rows = Number(cs.getPropertyValue('--rows')) || 8;
  const cols = Number(cs.getPropertyValue('--cols')) || 12;
  // rows fill bottom-up; within a row the fill snakes left→right / right→left
  const delays = cells.map((c) => {
    const r = Number(c.dataset.r);
    const k = Number(c.dataset.c);
    const col = r % 2 ? cols - 1 - k : k;
    return 0.62 * ((rows - 1 - r) / (rows - 1)) + 0.2 * (col / (cols - 1));
  });
  let last = -1;
  const set = (q: number) => {
    if (Math.abs(q - last) < 0.0005) return;
    last = q;
    const active = q > 0 && q < 1;
    root.classList.toggle('is-active', active);
    if (!active) return;
    const boundary = (1 - q) * 100; // boundary position, % of viewport from top
    fix.style.setProperty('--clip-b', `${(100 - boundary).toFixed(2)}%`);
    cells.forEach((c, i) => c.style.setProperty('--s', clamp((q - delays[i] * 0.85) / 0.18).toFixed(3)));
  };
  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'top top',
    onUpdate: (self) => set(self.progress),
    onRefresh: (self) => set(self.progress),
  });
  set(st.progress);
  return () => st.kill();
}
