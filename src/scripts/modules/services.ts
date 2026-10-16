/**
 * SERVICES — signature sequence.
 * Light chapter turns to smoke-dark → a raw monolith falls and smashes the six
 * service words (letters fly with ballistic physics) → a slicing plane
 * "compiles" the rock into a clean chip → the UPAMPI mark is etched into it
 * trace by trace → service cards rise past, alternating left/right, their
 * line-art icons drawing in. All scrubbed by scroll, fully reversible.
 */
import * as THREE from 'three';
import { gsap, SplitText } from '../lib/gsap';
import { noise3 } from '../lib/glsl';
import { MARK, GLYPHS } from '../../lib/brand.mjs';
import { clamp, lerp, range, smooth, stickyProgress, type PageCtx } from '../lib/env';
import { SVC_C0, SVC_C1 } from '../lib/rail-math';

const SIGNAL = new THREE.Color('#cdff3b');
const BOX = { w: 2.2, h: 2.2, d: 0.62 };

const chipVert = /* glsl */ `
  ${noise3}
  uniform float uCompile;
  varying vec3 vObj;
  varying vec3 vWorld;
  varying vec3 vNObj;
  varying vec2 vUv;
  varying float vC;
  float sliceY() { return mix(1.45, -1.45, uCompile); }
  void main() {
    vec3 p = position;
    float c = smoothstep(sliceY() - 0.05, sliceY() + 0.05, p.y);
    vec3 dir = normalize(p + vec3(0.0001));
    float n = fbm(p * 1.25 + 4.0);
    vec3 rough = p * vec3(1.08, 1.12, 1.9) + dir * (n * 0.42 + 0.14) + dir * 0.12 * snoise(p * 3.1);
    vec3 pos = mix(rough, p, c);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vObj = p;
    vNObj = normal;
    vUv = uv;
    vC = c;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const chipFrag = /* glsl */ `
  ${noise3}
  uniform vec3 uSignal;
  uniform float uCompile;
  uniform float uEtch;
  uniform float uImpact;
  uniform sampler2D uEtchMap;
  uniform vec3 uHalf;
  varying vec3 vObj;
  varying vec3 vWorld;
  varying vec3 vNObj;
  varying vec2 vUv;
  varying float vC;
  float sliceY() { return mix(1.45, -1.45, uCompile); }
  void main() {
    vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 V = normalize(cameraPosition - vWorld);
    if (dot(N, V) < 0.0) N = -N;
    vec3 L = normalize(vec3(-0.5, 0.8, 0.55));
    float diff = max(dot(N, L), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 R = reflect(-V, N);

    // raw stone: faceted, grainy, cold
    float grain = fbm(vObj * 7.0) * 0.5 + 0.5;
    vec3 stone = mix(vec3(0.07, 0.075, 0.08), vec3(0.24, 0.25, 0.26), grain) * (0.25 + diff * 0.95);
    stone += fres * 0.08;
    stone += uSignal * uImpact * 0.12 * smoothstep(0.0, -1.0, N.y);

    // compiled chip: glossy graphite with bevel light
    vec3 chip = vec3(0.03, 0.033, 0.038) + diff * 0.05;
    chip += smoothstep(-0.2, 1.0, R.y) * vec3(0.09, 0.1, 0.11);
    chip += pow(max(dot(R, L), 0.0), 60.0) * 0.9;
    chip += fres * vec3(0.4, 0.44, 0.48) * 0.4;
    vec3 d3 = uHalf - abs(vObj);
    float mn = min(d3.x, min(d3.y, d3.z));
    float mx = max(d3.x, max(d3.y, d3.z));
    float e = d3.x + d3.y + d3.z - mn - mx;
    chip += (1.0 - smoothstep(0.0, 0.035, e)) * vec3(0.55, 0.6, 0.55) * 0.5;

    // etched circuit + mark on the front face
    if (vNObj.z > 0.5) {
      vec4 t = texture2D(uEtchMap, vUv);
      float trace = step(0.5, t.g);
      float revealed = trace * step(t.r, uEtch) * step(0.001, uEtch);
      float hot = trace * (1.0 - smoothstep(0.0, 0.035, abs(t.r - uEtch))) * step(0.001, uEtch) * step(uEtch, 0.999);
      chip *= 1.0 - trace * 0.35;                  // faint engraved groove before reveal
      chip += uSignal * revealed * 1.25;
      chip += vec3(1.0) * hot * 1.6;
    }

    vec3 col = mix(stone, chip, vC);
    // the slicing plane
    float slice = exp(-abs(vObj.y - sliceY()) * 38.0) * step(0.001, uCompile) * step(uCompile, 0.999);
    col += mix(uSignal, vec3(1.0), 0.35) * slice * 1.8;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const smokeFrag = /* glsl */ `
  ${noise3}
  uniform float uTime;
  uniform float uSmoke;
  uniform float uScroll;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * vec2(2.4, 1.6);
    float n = fbm(vec3(p + vec2(uScroll * 0.6, -uTime * 0.03), uTime * 0.04 + uScroll));
    float n2 = fbm(vec3(p * 1.7 - vec2(uTime * 0.02, 0.0), 3.0 + uScroll * 0.5));
    float s = smoothstep(-0.1, 0.8, n * 0.7 + n2 * 0.5);
    float vign = smoothstep(1.1, 0.2, length(vUv - vec2(0.5, 0.45)));
    vec3 col = vec3(0.32, 0.34, 0.36) * s;
    gl_FragColor = vec4(col, s * 0.32 * uSmoke * vign);
  }
`;

const sparkVert = /* glsl */ `
  attribute vec3 aVel;
  attribute float aSeed;
  uniform float uT;
  uniform float uPx;
  varying float vA;
  void main() {
    float t = uT * (0.6 + aSeed * 0.6);
    vec3 p = position + aVel * t + vec3(0.0, -6.0, 0.0) * t * t;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPx * (2.0 + aSeed * 3.0) * (8.0 / -mv.z);
    vA = (1.0 - smoothstep(0.2, 1.0, uT)) * step(0.001, uT);
  }
`;
const sparkFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSignal;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vA;
    gl_FragColor = vec4(mix(uSignal, vec3(1.0), 0.4) * a, a);
  }
`;

/** Draw the etch map: R = reveal order (0..1), G = trace mask. */
function etchTexture(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, size, size);
  g.lineCap = 'round';
  g.lineJoin = 'round';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  document.body.appendChild(svg);

  const strokeSampled = (pts: [number, number][], t0: number, t1: number, width: number) => {
    g.lineWidth = width;
    for (let i = 1; i < pts.length; i++) {
      const t = t0 + (t1 - t0) * (i / (pts.length - 1));
      g.strokeStyle = `rgb(${Math.round(t * 255)},255,0)`;
      g.beginPath();
      g.moveTo(pts[i - 1][0], pts[i - 1][1]);
      g.lineTo(pts[i][0], pts[i][1]);
      g.stroke();
    }
  };
  const samplePath = (d: string, transform: (x: number, y: number) => [number, number], step = 2) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d);
    svg.appendChild(el);
    const len = el.getTotalLength();
    const out: [number, number][] = [];
    for (let l = 0; l <= len; l += step / 10) {
      const p = el.getPointAtLength(l);
      out.push(transform(p.x, p.y));
    }
    el.remove();
    return out;
  };
  const line = (a: [number, number], b: [number, number], n = 24) =>
    Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * (i / n), a[1] + (b[1] - a[1]) * (i / n)] as [number, number]);

  const S = size;
  const m = S * 0.06;
  // chip frame
  const frame: [number, number][] = [
    ...line([m, m], [S - m, m]),
    ...line([S - m, m], [S - m, S - m]),
    ...line([S - m, S - m], [m, S - m]),
    ...line([m, S - m], [m, m]),
  ];
  strokeSampled(frame, 0, 0.12, S * 0.004);

  // circuit traces from the frame toward the core, outside-in
  const cx = S / 2;
  const cy = S * 0.46;
  const rnd = (() => {
    let s = 7;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const traces = 28;
  for (let i = 0; i < traces; i++) {
    const side = i % 4;
    const u = 0.12 + rnd() * 0.76;
    const start: [number, number] =
      side === 0 ? [m, S * u] : side === 1 ? [S - m, S * u] : side === 2 ? [S * u, m] : [S * u, S - m];
    const ang = Math.atan2(start[1] - cy, start[0] - cx);
    const r = S * (0.27 + rnd() * 0.04);
    const end: [number, number] = [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    const horizontal = side < 2;
    const run = 0.25 + rnd() * 0.35;
    const mid: [number, number] = horizontal
      ? [start[0] + (end[0] - start[0]) * run, start[1]]
      : [start[0], start[1] + (end[1] - start[1]) * run];
    // 45° leg then straight
    const dx = end[0] - mid[0];
    const dy = end[1] - mid[1];
    const k = Math.min(Math.abs(dx), Math.abs(dy));
    const mid2: [number, number] = [mid[0] + Math.sign(dx) * k, mid[1] + Math.sign(dy) * k];
    const pts = [...line(start, mid, 16), ...line(mid, mid2, 16), ...line(mid2, end, 16)];
    const t0 = 0.08 + (i / traces) * 0.36;
    strokeSampled(pts, t0, t0 + 0.14, S * 0.005);
    g.fillStyle = `rgb(${Math.round((t0 + 0.14) * 255)},255,0)`;
    g.beginPath();
    g.arc(end[0], end[1], S * 0.009, 0, Math.PI * 2);
    g.fill();
  }

  // the mark, centred
  const [vx, vy, vw, vh] = MARK.viewBox.split(' ').map(Number);
  const markH = S * 0.4;
  const k = markH / vh;
  const ox = cx - (vw * k) / 2 - vx * k;
  const oy = cy - markH / 2 - vy * k;
  const T = (x: number, y: number): [number, number] => [ox + x * k, oy + y * k];
  // double contour = engraved outline
  for (const off of [-1, 1]) {
    const pts = samplePath(MARK.path, (x, y) => T(x + off * MARK.stroke * 0.36, y));
    strokeSampled(pts, 0.5, 0.86, S * 0.006);
  }
  const b = MARK.bit;
  const bit: [number, number][] = [
    ...line(T(b.x, b.y), T(b.x + b.size, b.y), 8),
    ...line(T(b.x + b.size, b.y), T(b.x + b.size, b.y + b.size), 8),
    ...line(T(b.x + b.size, b.y + b.size), T(b.x, b.y + b.size), 8),
    ...line(T(b.x, b.y + b.size), T(b.x, b.y), 8),
  ];
  strokeSampled(bit, 0.84, 0.9, S * 0.006);
  g.fillStyle = `rgb(${Math.round(0.9 * 255)},255,0)`;
  const [bx, by] = T(b.x + b.size * 0.25, b.y + b.size * 0.25);
  g.fillRect(bx, by, b.size * k * 0.5, b.size * k * 0.5);

  // wordmark
  const wk = (S * 0.36) / 68;
  const wx = cx - (68 * wk) / 2;
  const wy = S * 0.79;
  GLYPHS.forEach((gl, i) => {
    const pts = samplePath(gl.d, (x, y) => [wx + (gl.x + x) * wk, wy + y * wk], 1);
    const t0 = 0.88 + i * 0.018;
    strokeSampled(pts, t0, t0 + 0.02, S * 0.008);
  });

  svg.remove();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

export default function init(section: HTMLElement, ctx: PageCtx) {
  const stage = section.querySelector<HTMLElement>('.svc-stage')!;
  const canvas = section.querySelector<HTMLCanvasElement>('.svc-canvas')!;
  const wordsEl = section.querySelector<HTMLElement>('.svc-words')!;
  const cardsEl = section.querySelector<HTMLElement>('.svc-cards')!;
  const cards = [...section.querySelectorAll<HTMLElement>('.svc-card')];
  const steps = [...section.querySelectorAll<HTMLElement>('[data-svc-step]')];
  const icons = cards.map((c) => [...c.querySelectorAll<SVGGeometryElement>('.svc-icon path, .svc-icon circle, .svc-icon rect, .svc-icon line')]);

  if (ctx.reduced) {
    section.dataset.theme = 'dark';
    return;
  }

  /* ------------------------------------------------ letter physics -- */
  const split = SplitText.create(wordsEl.querySelectorAll('.svc-word'), { type: 'chars', charsClass: 'ch' });
  type Ch = { el: HTMLElement; vx: number; vy: number; rot: number; delay: number };
  let chars: Ch[] = [];
  const measure = () => {
    const r = stage.getBoundingClientRect();
    const cx = r.width / 2;
    const cy = r.height / 2;
    chars = (split.chars as HTMLElement[]).map((el) => {
      el.style.transform = '';
      const b = el.getBoundingClientRect();
      const x = b.left - r.left + b.width / 2 - cx;
      const y = b.top - r.top + b.height / 2 - cy;
      const dist = Math.hypot(x / r.width, y / r.height);
      const power = 1.6 - Math.min(dist, 0.7);
      return {
        el,
        vx: (x / r.width + (Math.random() - 0.5) * 0.35) * r.width * 1.5 * power,
        vy: -(0.45 + Math.random() * 0.9) * r.height * power,
        rot: (Math.random() - 0.5) * 900,
        delay: Math.min(dist * 0.25, 0.18),
      };
    });
  };
  let lastE = -1;
  const applyLetters = (e: number) => {
    if (Math.abs(e - lastE) < 0.0005) return;
    lastE = e;
    for (const c of chars) {
      const t = clamp((e - c.delay) / (1 - c.delay));
      if (t <= 0) {
        c.el.style.transform = '';
        c.el.style.opacity = '';
        continue;
      }
      const x = c.vx * t;
      const y = c.vy * t + 2.2 * window.innerHeight * t * t;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(c.rot * t).toFixed(1)}deg)`;
      c.el.style.opacity = String(1 - range(t, 0.55, 0.95));
    }
  };

  /* ----------------------------------------------- cards + icons -- */
  let travel = 0;
  let cardTops: number[] = [];
  const measureCards = () => {
    travel = Math.max(0, cardsEl.scrollHeight - window.innerHeight * 0.35);
    cardTops = cards.map((c) => c.offsetTop + c.offsetHeight / 2);
  };
  const drawState = cards.map(() => -1);
  icons.forEach((paths) => gsap.set(paths, { drawSVG: '0%' }));
  const C0 = SVC_C0;
  const C1 = SVC_C1;
  const applyCards = (p: number) => {
    const c = range(p, C0, C1);
    const y = -c * travel;
    cardsEl.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
    const vh = window.innerHeight;
    cards.forEach((_card, i) => {
      const cy = cardTops[i] + y;
      const d = Math.round(clamp((vh * 0.98 - cy) / (vh * 0.5)) * 100) / 100;
      if (d !== drawState[i]) {
        drawState[i] = d;
        gsap.set(icons[i], { drawSVG: `${d * 100}%` });
      }
    });
  };
  const onFocus = (e: FocusEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.svc-card');
    if (!card) return;
    const i = cards.indexOf(card);
    const vh = window.innerHeight;
    const c = clamp((cardTops[i] - vh / 2) / (travel || 1));
    const p = C0 + c * (C1 - C0);
    const top = section.offsetTop + p * (section.offsetHeight - vh);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(top, { duration: 0.6 });
    else window.scrollTo({ top });
  };
  section.addEventListener('focusin', onFocus);

  /* ------------------------------------------------------- three -- */
  let three: ReturnType<typeof createThree> | null = null;
  function createThree() {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, ctx.mobile ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 8);

    const etch = etchTexture(ctx.mobile ? 1024 : 2048);
    const uniforms = {
      uCompile: { value: 0 },
      uEtch: { value: 0 },
      uImpact: { value: 0 },
      uSignal: { value: SIGNAL },
      uEtchMap: { value: etch },
      uHalf: { value: new THREE.Vector3(BOX.w / 2, BOX.h / 2, BOX.d / 2) },
    };
    const seg = ctx.mobile ? 28 : 44;
    const geo = new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d, seg, seg, Math.round(seg / 3));
    const mat = new THREE.ShaderMaterial({ vertexShader: chipVert, fragmentShader: chipFrag, uniforms });
    const chip = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Group();
    pivot.add(chip);
    scene.add(pivot);

    // smoke backdrop
    const smokeMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: smokeFrag,
      uniforms: { uTime: { value: 0 }, uSmoke: { value: 0 }, uScroll: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    const smoke = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), smokeMat);
    smoke.position.z = -4;
    smoke.renderOrder = -1;
    scene.add(smoke);

    // impact sparks
    const SP = 180;
    const sp = new Float32Array(SP * 3);
    const sv = new Float32Array(SP * 3);
    const ss = new Float32Array(SP);
    for (let i = 0; i < SP; i++) {
      sp.set([(Math.random() - 0.5) * BOX.w, -BOX.h / 2 - 0.1, (Math.random() - 0.5) * 0.6], i * 3);
      const a = Math.random() * Math.PI;
      const v = 2 + Math.random() * 5;
      sv.set([Math.cos(a) * v * 1.4, Math.sin(a) * v * 0.9, (Math.random() - 0.5) * 3], i * 3);
      ss[i] = Math.random();
    }
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sgeo.setAttribute('aVel', new THREE.BufferAttribute(sv, 3));
    sgeo.setAttribute('aSeed', new THREE.BufferAttribute(ss, 1));
    const smat = new THREE.ShaderMaterial({
      vertexShader: sparkVert,
      fragmentShader: sparkFrag,
      uniforms: { uT: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uSignal: uniforms.uSignal },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sgeo, smat);
    sparks.frustumCulled = false;
    scene.add(sparks);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vh = 2 * (camera.position.z + 4) * Math.tan(THREE.MathUtils.degToRad(17.5));
      smoke.scale.set(vh * camera.aspect * 1.2, vh * 1.2, 1);
    };
    resize();

    let time = 0;
    const render = (p: number, dt: number) => {
      time += dt;
      const fall = range(p, 0.1, 0.215);
      const bounce = range(p, 0.215, 0.28);
      const compile = smooth(range(p, 0.3, 0.5));
      const orient = smooth(range(p, 0.4, 0.56));
      const etchP = range(p, 0.5, 0.86);
      const settle = range(p, 0.9, 1);
      const mobile = camera.aspect < 0.8;

      uniforms.uCompile.value = compile;
      uniforms.uEtch.value = etchP;
      uniforms.uImpact.value = Math.max(0, 1 - Math.abs(p - 0.22) * 18);
      smokeMat.uniforms.uSmoke.value = range(p, 0.06, 0.16);
      smokeMat.uniforms.uTime.value = time;
      smokeMat.uniforms.uScroll.value = p * 2;
      smat.uniforms.uT.value = range(p, 0.214, 0.3);

      const y0 = mobile ? 0.9 : 0.15;
      pivot.position.y = lerp(7.5, y0, fall * fall) + Math.sin(bounce * Math.PI) * 0.35 * (1 - bounce);
      sparks.position.y = y0;
      const scale = (mobile ? 0.72 : 1) * lerp(1, 0.92, settle);
      pivot.scale.setScalar(scale);
      pivot.rotation.z = (1 - fall) * 0.5 + lerp(0.06, 0, orient);
      pivot.rotation.x = lerp((1 - fall) * 0.9 - 0.32, 0.12, orient);
      pivot.rotation.y = lerp(0.55 + p * 2.2, -0.22 + Math.sin(time * 0.3) * 0.04, orient);

      const since = p - 0.215;
      const shake = since > 0 ? Math.exp(-since * 70) * 0.09 * Math.sin(since * 520) : 0;
      camera.position.x = shake;
      camera.position.y = shake * 0.6;
      renderer.render(scene, camera);
    };
    const dispose = () => {
      geo.dispose();
      mat.dispose();
      etch.dispose();
      smoke.geometry.dispose();
      smokeMat.dispose();
      sgeo.dispose();
      smat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
    return { render, resize, dispose };
  }

  /* -------------------------------------------------------- loop -- */
  let near = false;
  let visible = false;
  let sp = stickyProgress(section);
  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const target = stickyProgress(section);
    sp = lerp(sp, target, 1 - Math.pow(0.0006, dt));
    if (Math.abs(sp - target) < 0.0002) sp = target;
    const p = sp;

    const dark = smooth(range(p, 0.05, 0.14));
    stage.style.setProperty('--dark', dark.toFixed(3));
    stage.style.setProperty('--foot', range(p, 0.3, 0.38).toFixed(3));
    const theme = dark > 0.5 ? 'dark' : 'light';
    if (section.dataset.theme !== theme) section.dataset.theme = theme;

    applyLetters(range(p, 0.205, 0.38));
    applyCards(p);
    const sr: [number, number][] = [
      [0.24, 0.4],
      [0.42, 0.6],
    ];
    steps.forEach((s, i) => {
      const [a, b] = sr[i];
      s.style.opacity = String(Math.min(range(p, a, a + 0.03), 1 - range(p, b - 0.03, b)));
    });
    three?.render(p, dt);
  };
  let raf = requestAnimationFrame(frame);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.rootBounds && e.target === section) {
          near = e.isIntersecting;
          if (near && !three) {
            try {
              three = createThree();
            } catch (err) {
              console.warn('[upampi] services WebGL unavailable', err);
            }
          }
        }
      }
    },
    { rootMargin: '100% 0px 100% 0px' },
  );
  io.observe(section);
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    last = performance.now();
  });
  vis.observe(section);

  const onResize = () => {
    lastE = -1;
    measure();
    measureCards();
    three?.resize();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(stage);
  document.fonts?.ready.then(onResize);
  measure();
  measureCards();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    vis.disconnect();
    ro.disconnect();
    section.removeEventListener('focusin', onFocus);
    split.revert();
    three?.dispose();
    three = null;
  };
}
