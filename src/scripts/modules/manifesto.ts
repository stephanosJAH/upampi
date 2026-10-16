import { ScrollTrigger } from '../lib/gsap';
import { clamp, type PageCtx } from '../lib/env';

/** Scroll-scrubbed manifesto: words light up from dim grey to white. */
export default function init(root: HTMLElement, ctx: PageCtx) {
  const words = [...root.querySelectorAll<HTMLElement>('.man-text .w')];
  const text = root.querySelector<HTMLElement>('.man-text')!;
  if (ctx.reduced) {
    words.forEach((w) => w.style.setProperty('--o', '1'));
    return;
  }
  const n = words.length;
  let lastI = -1;
  const st = ScrollTrigger.create({
    trigger: text,
    start: 'top 82%',
    end: 'bottom 38%',
    onUpdate: (self) => {
      const f = self.progress * n;
      const i = Math.floor(f);
      if (i === lastI && f % 1 < 0.02) return;
      lastI = i;
      for (let k = 0; k < n; k++) {
        const o = 0.16 + 0.84 * clamp(f - k + 1 - 0.0);
        words[k].style.setProperty('--o', o.toFixed(3));
      }
    },
  });
  return () => st.kill();
}
