import { gsap, ScrollTrigger } from '../lib/gsap';
import type { PageCtx } from '../lib/env';

/** Giant triad: drifts on its own and is pushed by scroll velocity (both directions). */
export default function init(root: HTMLElement, ctx: PageCtx) {
  const track = root.querySelector<HTMLElement>('.mq-track')!;
  const set = root.querySelector<HTMLElement>('.mq-set')!;
  if (ctx.reduced) return;
  let x = 0;
  let vel = 0;
  let dir = -1;
  let visible = false;
  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (s) => (visible = s.isActive),
    onUpdate: (s) => {
      vel = s.getVelocity() / 900;
      if (Math.abs(vel) > 0.2) dir = vel > 0 ? -1 : 1;
    },
  });
  const tick = (_t: number, dtMs: number) => {
    if (!visible) return;
    const w = set.offsetWidth;
    vel *= 0.92;
    x += dir * (0.9 + Math.min(Math.abs(vel), 6) * 4) * (dtMs / 16.6);
    if (x <= -w) x += w;
    if (x > 0) x -= w;
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    st.kill();
  };
}
