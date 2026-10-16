import { gsap } from '../lib/gsap';
import type { PageCtx } from '../lib/env';

/** Key facts: cards swing in with perspective tilt, scrubbed by scroll. */
export default function init(root: HTMLElement, ctx: PageCtx) {
  if (ctx.reduced || ctx.mobile) return;
  const left = root.querySelector<HTMLElement>('[data-tilt="left"]')!;
  const mid = root.querySelector<HTMLElement>('[data-tilt="mid"]')!;
  const right = root.querySelector<HTMLElement>('[data-tilt="right"]')!;
  const wrap = root.querySelector<HTMLElement>('.facts-cards')!;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'center 45%', scrub: 0.8 },
  });
  tl.fromTo(left, { rotateY: 38, rotateX: 10, z: -260, y: 120, xPercent: 18 }, { rotateY: 16, rotateX: 4, z: 0, y: 0, xPercent: 0 }, 0)
    .fromTo(right, { rotateY: -38, rotateX: 10, z: -260, y: 120, xPercent: -18 }, { rotateY: -16, rotateX: 4, z: 0, y: 0, xPercent: 0 }, 0)
    .fromTo(mid, { y: 160, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1 }, 0.1);
  return () => tl.scrollTrigger?.kill();
}
