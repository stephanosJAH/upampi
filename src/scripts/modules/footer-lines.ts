/**
 * Footer wordmark built from horizontal lines. Each scanline is a string:
 * passing the pointer plucks it (spring physics), it glows signal-lime while
 * vibrating and — if sound is on — plays a soft pentatonic note.
 */
import { GLYPHS, WORDMARK_WIDTH, CAP, STROKE } from '../../lib/brand.mjs';
import { pluck } from '../lib/sound';
import type { PageCtx } from '../lib/env';

type Row = { y: number; segs: [number, number][]; off: number; vel: number; px: number; t: number };

const MAX_OFF = 14;
const MAX_VEL = 12;
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

export default function init(root: HTMLElement, ctx: PageCtx) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const g = canvas.getContext('2d');
  if (!g) return;
  let rows: Row[] = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  const pointer = { x: -1e4, y: -1e4, vy: 0, inside: false };

  const build = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    if (!W || !H) return;
    dpr = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    // rasterise the wordmark at CSS-pixel resolution
    const off = document.createElement('canvas');
    off.width = Math.ceil(W);
    off.height = Math.ceil(H);
    const o = off.getContext('2d', { willReadFrequently: true })!;
    const k = Math.min(W / (WORDMARK_WIDTH + 0.4), H / (CAP + 1.2));
    o.translate((W - WORDMARK_WIDTH * k) / 2, (H - CAP * k) / 2);
    o.scale(k, k);
    o.lineWidth = STROKE;
    o.strokeStyle = '#fff';
    o.miterLimit = 1.6;
    GLYPHS.forEach((gl) => {
      o.save();
      o.translate(gl.x, 0);
      o.stroke(new Path2D(gl.d));
      o.restore();
    });
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const gap = Math.max(4, Math.round(H / (ctx.mobile ? 26 : 52)));
    rows = [];
    for (let y = Math.floor(gap / 2); y < off.height; y += gap) {
      const segs: [number, number][] = [];
      let start = -1;
      for (let x = 0; x < off.width; x++) {
        const a = data[(y * off.width + x) * 4 + 3] > 120;
        if (a && start < 0) start = x;
        if (!a && start >= 0) {
          segs.push([start, x]);
          start = -1;
        }
      }
      if (start >= 0) segs.push([start, off.width]);
      if (segs.length) rows.push({ y, segs, off: 0, vel: 0, px: 0, t: 0 });
    }
    root.classList.add('is-live');
    draw();
  };

  const draw = () => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.lineWidth = Math.max(1.5, H / 160);
    g.lineCap = 'butt';
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const e = Math.min(1, Math.abs(r.off) / 10);
      const near = pointer.inside ? Math.max(0, 1 - Math.abs(pointer.y - r.y) / 60) : 0;
      g.strokeStyle =
        e > 0.04
          ? `rgba(205,255,59,${0.35 + e * 0.65})`
          : `rgba(${Math.round(52 + near * 120)},${Math.round(56 + near * 120)},${Math.round(62 + near * 110)},1)`;
      g.beginPath();
      for (const [x0, x1] of r.segs) {
        if (Math.abs(r.off) < 0.05) {
          g.moveTo(x0, r.y);
          g.lineTo(x1, r.y);
          continue;
        }
        const step = 6;
        for (let x = x0; x <= x1; x += step) {
          const fall = Math.exp(-((x - r.px) ** 2) / (2 * 140 * 140));
          const y = r.y + r.off * fall;
          if (x === x0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.lineTo(x1, r.y + r.off * Math.exp(-((x1 - r.px) ** 2) / (2 * 140 * 140)));
      }
      g.stroke();
    }
  };

  let raf = 0;
  let active = false;
  const step = () => {
    let energy = 0;
    for (const r of rows) {
      r.vel += -r.off * 0.18;
      r.vel *= 0.86;
      r.off = clamp(r.off + r.vel, MAX_OFF);
      energy += Math.abs(r.off) + Math.abs(r.vel);
    }
    draw();
    if (energy > 0.05 || pointer.inside) raf = requestAnimationFrame(step);
    else active = false;
  };
  const kick = () => {
    if (!active) {
      active = true;
      raf = requestAnimationFrame(step);
    }
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const prevY = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.inside = true;
    if (ctx.reduced) return draw();
    const lo = Math.min(prevY, y);
    const hi = Math.max(prevY, y);
    const now = performance.now();
    rows.forEach((row, i) => {
      // pluck only lines the pointer actually crossed this move, with a short
      // per-line cooldown so jitter can't keep pumping energy into one string
      if (y === prevY || row.y < lo || row.y > hi || hi - lo >= 200) return;
      if (now - row.t < 90) return;
      row.t = now;
      row.px = x;
      row.vel = clamp(row.vel + Math.sign(y - prevY) * Math.min(9, 2 + (hi - lo) * 0.25), MAX_VEL);
      pluck(1 - i / rows.length);
    });
    kick();
  };
  const onLeave = () => {
    pointer.inside = false;
    pointer.y = -1e4;
    kick();
  };
  canvas.style.touchAction = 'pan-y';
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  const ro = new ResizeObserver(build);
  ro.observe(root);
  document.fonts?.ready.then(build);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
  };
}
