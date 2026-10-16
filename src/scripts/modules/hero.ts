/**
 * HERO — "smart core".
 * The UPAMPI mark, voxelised into ~1k instanced tiles. Scroll scrubs one
 * GPU-side timeline: mark → chaos of documents / chats / sheets / invoices →
 * wireframe structure → ordered voxel core → (manifesto) cells light up →
 * (marquee) collapses into a single point of light.
 * Everything is a pure function of scroll, so it reverses exactly.
 */
import * as THREE from 'three';
import { gsap } from '../lib/gsap';
import { MARK } from '../../lib/brand.mjs';
import { clamp, lerp, range, smooth, stickyProgress, type PageCtx } from '../lib/env';

const SIGNAL = new THREE.Color('#cdff3b');

const vert = /* glsl */ `
  attribute vec3 aHome;
  attribute vec3 aChaos;
  attribute vec3 aOrder;
  attribute vec4 aRand;
  attribute vec4 aRand2;
  uniform float uShatter;
  uniform float uOrder;
  uniform float uCollapse;
  uniform float uTime;
  uniform float uCell;
  varying vec3 vN;
  varying vec3 vLocal;
  varying vec3 vLocalN;
  varying vec3 vShape;
  varying vec3 vView;
  varying float vChaos;
  varying float vOrderAmt;
  varying vec4 vRand;
  varying vec4 vRand2;
  varying vec3 vWorld;

  mat3 rotAxis(vec3 a, float r) {
    float s = sin(r), c = cos(r), oc = 1.0 - c;
    return mat3(
      oc*a.x*a.x + c,     oc*a.x*a.y + a.z*s, oc*a.z*a.x - a.y*s,
      oc*a.x*a.y - a.z*s, oc*a.y*a.y + c,     oc*a.y*a.z + a.x*s,
      oc*a.z*a.x + a.y*s, oc*a.y*a.z - a.x*s, oc*a.z*a.z + c
    );
  }

  void main() {
    float d = aRand.z;
    float s1 = smoothstep(0.0, 1.0, clamp(uShatter * 1.7 - d * 0.7, 0.0, 1.0));
    float s2 = smoothstep(0.0, 1.0, clamp(uOrder * 1.7 - (1.0 - d) * 0.7, 0.0, 1.0));
    float chaos = s1 * (1.0 - s2);

    // panel proportions per document type: doc, chat, sheet, invoice
    float t = aRand.w;
    vec3 panel = t < 0.25 ? vec3(1.7, 2.2, 0.14) : t < 0.5 ? vec3(1.3, 2.4, 0.14) : t < 0.75 ? vec3(2.4, 1.6, 0.14) : vec3(1.6, 2.1, 0.14);
    panel *= 0.8 + aRand2.x * 0.6;
    vec3 shape = mix(vec3(0.94), panel, chaos);
    shape = mix(shape, vec3(0.9), s2);

    vec3 axis = normalize(vec3(aRand.x - 0.5, aRand.y - 0.5, aRand2.y - 0.5) + 1e-4);
    float ang = chaos * (2.2 + aRand.x * 5.0) + chaos * uTime * (0.08 + aRand2.z * 0.12);
    mat3 R = rotAxis(axis, ang);

    vec3 pos = mix(aHome, aChaos, s1);
    pos = mix(pos, aOrder, s2);
    // gentle orbital drift in chaos so the cloud never feels frozen
    pos += chaos * vec3(sin(uTime * 0.3 + aRand.x * 6.28), cos(uTime * 0.25 + aRand.y * 6.28), 0.0) * 0.08;

    float col = uCollapse * uCollapse;
    pos = mix(pos, vec3(0.0), col);
    float shrink = 1.0 - smoothstep(0.55, 1.0, uCollapse);

    vec3 local = R * (position * shape) * uCell * shrink;
    vec4 world = modelMatrix * vec4(pos + local, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    vN = normalize(mat3(modelMatrix) * (R * (normal / shape)));
    vLocal = position + 0.5;
    vLocalN = normal;
    vShape = shape;
    vView = cameraPosition - world.xyz;
    vWorld = world.xyz;
    vChaos = chaos;
    vOrderAmt = s2;
    vRand = aRand;
    vRand2 = aRand2;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform vec3 uSignal;
  uniform float uWire;
  uniform float uLight;
  uniform float uDim;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vLocal;
  varying vec3 vLocalN;
  varying vec3 vShape;
  varying vec3 vView;
  varying float vChaos;
  varying float vOrderAmt;
  varying vec4 vRand;
  varying vec4 vRand2;
  varying vec3 vWorld;

  float box(vec2 p, vec2 c, vec2 h) { vec2 d = abs(p - c) - h; return step(max(d.x, d.y), 0.0); }

  float content(vec2 uv, float t) {
    float m = 0.0;
    if (t < 0.25) {            // document: paragraph lines
      float row = floor(uv.y * 11.0);
      float len = 0.45 + fract(sin(row * 12.9898 + vRand.x * 78.2) * 43758.5) * 0.4;
      m = step(0.12, uv.x) * step(uv.x, 0.12 + len) * step(0.5, fract(uv.y * 11.0)) * step(0.12, uv.y) * step(uv.y, 0.8);
      m = max(m, box(uv, vec2(0.35, 0.88), vec2(0.23, 0.035)));
    } else if (t < 0.5) {      // chat: alternating bubbles
      m = box(uv, vec2(0.38, 0.78), vec2(0.26, 0.07));
      m = max(m, box(uv, vec2(0.62, 0.55), vec2(0.26, 0.09)) * 2.0);
      m = max(m, box(uv, vec2(0.36, 0.30), vec2(0.24, 0.06)));
      m = max(m, box(uv, vec2(0.66, 0.12), vec2(0.2, 0.05)) * 2.0);
    } else if (t < 0.75) {     // spreadsheet grid
      vec2 g = fract(uv * vec2(5.0, 8.0));
      m = (1.0 - step(0.06, g.x) * step(0.08, g.y)) * 0.8;
      m = max(m, box(uv, vec2(0.5, 0.94), vec2(0.5, 0.06)));
    } else {                   // invoice: header, rows, total
      m = box(uv, vec2(0.3, 0.86), vec2(0.18, 0.06)) * 2.0;
      float row = step(0.5, fract(uv.y * 14.0)) * step(0.25, uv.y) * step(uv.y, 0.68);
      m = max(m, row * step(0.12, uv.x) * step(uv.x, 0.88) * 0.8);
      m = max(m, box(uv, vec2(0.7, 0.14), vec2(0.18, 0.05)) * 2.0);
    }
    return m;
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);

    // distance to the nearest box edge, measured on the face we're on
    vec3 d = min(vLocal, 1.0 - vLocal) * vShape;
    float mn = min(d.x, min(d.y, d.z));
    float mx = max(d.x, max(d.y, d.z));
    float e = d.x + d.y + d.z - mn - mx;
    float edge = 1.0 - smoothstep(0.028, 0.06, e);

    // key softbox (top-left/front), signal kicker (bottom-right), reflection sweep
    vec3 L = normalize(vec3(-4.0, 5.0, 7.0) - vWorld);
    vec3 L2 = normalize(vec3(4.5, -3.5, 2.5) - vWorld);
    float diff = max(dot(N, L), 0.0);
    vec3 Rf = reflect(-V, N);
    float spec = pow(max(dot(N, normalize(L + V)), 0.0), 90.0);
    float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 40.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float sweep = smoothstep(-0.6, 1.4, vWorld.y * 0.55 - vWorld.x * 0.35 + Rf.y * 0.8);
    float jitter = (vRand2.z - 0.5) * 0.035;

    vec3 col = vec3(0.03, 0.033, 0.038) + jitter;
    col += diff * vec3(0.07, 0.075, 0.08);
    col += sweep * vec3(0.11, 0.115, 0.125) * (0.45 + fres);
    col += spec * 0.85;
    col += spec2 * uSignal * 0.55;
    col += fres * vec3(0.5, 0.55, 0.6) * 0.3;
    col += fres * uSignal * 0.25 * smoothstep(0.2, -0.6, N.y);

    // documents / chats / sheets / invoices printed on the big faces during chaos
    float face = step(0.5, abs(vLocalN.z));
    float cm = content(vLocal.xy, vRand.w) * face * vChaos;
    col = mix(col, vec3(0.62, 0.64, 0.6), clamp(cm, 0.0, 1.0) * 0.45);
    col += uSignal * step(1.5, cm) * 0.3 * step(0.55, vRand2.y);
    // some panels glow like lit screens — the "light inside the fragments"
    float screen = face * vChaos * step(0.9, vRand2.w);
    col += uSignal * screen * (0.16 + 0.1 * sin(uTime * 1.3 + vRand.x * 20.0));

    // ordered core: cells switch on as the manifesto is read
    float lit = step(vRand.y, uLight) * vOrderAmt;
    float glow = 0.035 + vChaos * (0.06 + step(0.7, vRand.x) * 0.55) + uWire * 1.1 + lit * 0.95;
    col += uSignal * edge * glow;
    col += uSignal * lit * 0.05 * (1.0 - edge);

    if (uWire > vRand2.w && edge < 0.5) discard;

    gl_FragColor = vec4(col * uDim, 1.0);
  }
`;

const dustVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSpark;
  uniform float uPx;
  varying float vA;
  varying float vSignal;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.15 + aSeed * 40.0) * 0.25;
    p.y += cos(uTime * 0.12 + aSeed * 31.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float s = 1.0 + uSpark * step(0.8, aSeed) * 2.5;
    gl_PointSize = uPx * s * (1.5 + aSeed * 2.0) * (10.0 / -mv.z);
    vA = 0.18 + aSeed * 0.35 + uSpark * step(0.8, aSeed) * 0.5;
    vSignal = step(0.8, aSeed) * uSpark;
  }
`;
const dustFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSignal;
  varying float vA;
  varying float vSignal;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vA;
    gl_FragColor = vec4(mix(vec3(0.85, 0.88, 0.9), uSignal, vSignal), a);
  }
`;
const flareFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSignal;
  uniform float uI;
  uniform float uCore;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float core = exp(-r * 60.0) * uCore;
    float halo = exp(-r * 7.0) * 0.55;
    float streak = exp(-abs(p.y) * 160.0) * exp(-abs(p.x) * 3.0) * 0.8;
    vec3 c = mix(uSignal, vec3(1.0), clamp(core, 0.0, 1.0));
    float a = (core + halo + streak * uCore) * uI;
    gl_FragColor = vec4(c * a, a);
  }
`;

/** Rasterise the mark into a voxel grid. */
function voxelise(cell: number, layers: number) {
  const [vx, vy, vw, vh] = MARK.viewBox.split(' ').map(Number);
  const cols = Math.ceil(vw / cell);
  const rows = Math.ceil(vh / cell);
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.scale(1 / cell, 1 / cell);
  g.translate(-vx, -vy);
  g.lineWidth = MARK.stroke;
  g.strokeStyle = '#fff';
  g.fillStyle = '#fff';
  g.stroke(new Path2D(MARK.path));
  g.fillRect(MARK.bit.x, MARK.bit.y, MARK.bit.size, MARK.bit.size);
  const data = g.getImageData(0, 0, cols, rows).data;
  const pts: [number, number, number][] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (data[(y * cols + x) * 4 + 3] > 110)
        for (let z = 0; z < layers; z++) pts.push([x - cols / 2 + 0.5, rows / 2 - y - 0.5, z - (layers - 1) / 2]);
  return { pts, rows, cols };
}

/** Ordered core: voxel sphere positions, filled from the centre outwards. */
function orderedCore(n: number) {
  const side = Math.ceil(Math.cbrt(n * 1.95)) | 1;
  const h = (side - 1) / 2;
  const all: [number, number, number][] = [];
  for (let x = 0; x < side; x++)
    for (let y = 0; y < side; y++) for (let z = 0; z < side; z++) all.push([x - h, y - h, z - h]);
  all.sort((a, b) => a[0] ** 2 + a[1] ** 2 + a[2] ** 2 - (b[0] ** 2 + b[1] ** 2 + b[2] ** 2) || a[1] - b[1]);
  return all.slice(0, n);
}

export default function init(root: HTMLElement, ctx: PageCtx) {
  const stage = root.querySelector<HTMLElement>('.core-stage')!;
  const canvas = root.querySelector<HTMLCanvasElement>('.core-canvas')!;
  const linesCanvas = root.querySelector<HTMLCanvasElement>('.core-lines')!;
  const heroSec = root.querySelector<HTMLElement>('[data-hero]')!;
  const manSec = root.querySelector<HTMLElement>('.manifesto')!;
  const mqSec = root.querySelector<HTMLElement>('.marquee')!;
  const holdBtn = root.querySelector<HTMLButtonElement>('[data-hold]')!;
  const captions = [...root.querySelectorAll<HTMLElement>('[data-phase]')];
  const fades = [...root.querySelectorAll<HTMLElement>('[data-hero-fade]')];
  const titleLines = [...root.querySelectorAll<HTMLElement>('.ht-line > span')];
  const head = root.querySelector<HTMLElement>('.hero-head')!;
  const foot = root.querySelector<HTMLElement>('.hero-foot')!;
  const disposers: (() => void)[] = [];

  /* ---------------------------------------------------- renderer -- */
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    window.dispatchEvent(new Event('upampi:hero-ready'));
    return; // poster stays — the page remains fully usable
  }
  const maxDpr = ctx.mobile ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* ------------------------------------------------------ voxels -- */
  const cellUnits = ctx.mobile ? 0.74 : 0.56;
  const { pts, rows } = voxelise(cellUnits, ctx.mobile ? 2 : 3);
  const N = pts.length;
  const MARK_H = 3.2; // world units for the mark's height at group scale 1
  const cellWorld = MARK_H / rows;
  const order = orderedCore(N);
  const coreScale = cellWorld * 1.18;

  const home = new Float32Array(N * 3);
  const chaos = new Float32Array(N * 3);
  const ord = new Float32Array(N * 3);
  const rand = new Float32Array(N * 4);
  const rand2 = new Float32Array(N * 4);
  // shuffle the order targets so tiles cross paths in chaos
  const perm = [...Array(N).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < N; i++) {
    const [x, y, z] = pts[i];
    home.set([x * cellWorld, y * cellWorld, z * cellWorld], i * 3);
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    const r = 2.2 + Math.pow(Math.random(), 0.6) * 3.6;
    chaos.set(
      [Math.sin(v) * Math.cos(u) * r * 1.5, Math.sin(v) * Math.sin(u) * r * 0.85, Math.cos(v) * r * 0.9 - 0.6],
      i * 3,
    );
    const o = order[perm[i]];
    ord.set([o[0] * coreScale, o[1] * coreScale, o[2] * coreScale], i * 3);
    rand.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    rand2.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }

  const box = new THREE.BoxGeometry(1, 1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = box.index;
  geo.setAttribute('position', box.getAttribute('position'));
  geo.setAttribute('normal', box.getAttribute('normal'));
  geo.setAttribute('aHome', new THREE.InstancedBufferAttribute(home, 3));
  geo.setAttribute('aChaos', new THREE.InstancedBufferAttribute(chaos, 3));
  geo.setAttribute('aOrder', new THREE.InstancedBufferAttribute(ord, 3));
  geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 4));
  geo.setAttribute('aRand2', new THREE.InstancedBufferAttribute(rand2, 4));
  geo.instanceCount = N;

  const uniforms = {
    uShatter: { value: 0 },
    uOrder: { value: 0 },
    uCollapse: { value: 0 },
    uWire: { value: 0 },
    uLight: { value: 0 },
    uDim: { value: 1 },
    uTime: { value: 0 },
    uCell: { value: cellWorld },
    uSignal: { value: SIGNAL },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;

  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  /* -------------------------------------------------------- dust -- */
  const DUST = ctx.mobile ? 260 : 520;
  const dpos = new Float32Array(DUST * 3);
  const dseed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dpos.set([(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 11, (Math.random() - 0.5) * 8 - 1], i * 3);
    dseed[i] = Math.random();
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dgeo.setAttribute('aSeed', new THREE.BufferAttribute(dseed, 1));
  const dmat = new THREE.ShaderMaterial({
    vertexShader: dustVert,
    fragmentShader: dustFrag,
    uniforms: { uTime: uniforms.uTime, uSpark: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uSignal: uniforms.uSignal },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dgeo, dmat);
  scene.add(dust);

  /* ------------------------------------------------------- flare -- */
  const fmat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: flareFrag,
    uniforms: { uSignal: uniforms.uSignal, uI: { value: 0 }, uCore: { value: 0 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), fmat);
  flare.renderOrder = 10;
  group.add(flare);

  disposers.push(() => {
    box.dispose();
    geo.dispose();
    mat.dispose();
    dgeo.dispose();
    dmat.dispose();
    flare.geometry.dispose();
    fmat.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  });

  /* ------------------------------------------- layout & framing -- */
  let W = 0;
  let H = 0;
  const anchor = { x: 0.68, y: 0.52, h: 0.46 };
  function readAnchor() {
    const cs = getComputedStyle(stage);
    const px = (v: string, base: number, fb: number) => {
      v = v.trim();
      if (!v) return fb;
      if (v.endsWith('%')) return parseFloat(v) / 100;
      if (v.endsWith('vh')) return parseFloat(v) / 100;
      return parseFloat(v) / base || fb;
    };
    anchor.x = px(cs.getPropertyValue('--poster-x'), W, 0.68);
    anchor.y = px(cs.getPropertyValue('--poster-y'), H, 0.52);
    anchor.h = px(cs.getPropertyValue('--poster-h'), H, 0.46);
  }
  function resize() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    readAnchor();
    linesResize();
    needsRender = true;
  }
  const visH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  /* --------------------------------------------------- hairlines -- */
  const lctx = linesCanvas.getContext('2d')!;
  type Line = { x0: number; y0: number; dx: number; dy: number; len: number; off: Float32Array; vel: Float32Array };
  let lines: Line[] = [];
  const SEG = 48;
  const pointer = { x: -9999, y: -9999, active: false };
  function linesResize() {
    const dpr = Math.min(devicePixelRatio, 2);
    linesCanvas.width = W * dpr;
    linesCanvas.height = H * dpr;
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = ctx.mobile ? 7 : 12;
    const ang = (-62 * Math.PI) / 180;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const len = Math.hypot(W, H) * 1.3;
    lines = Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const cx = -W * 0.35 + t * W * 1.7 + (Math.sin(i * 7.1) * W) / 30;
      return { x0: cx - (dx * len) / 2, y0: H / 2 - (dy * len) / 2, dx, dy, len, off: new Float32Array(SEG + 1), vel: new Float32Array(SEG + 1) };
    });
  }
  let linesAlpha = 1;
  function drawLines(dt: number) {
    lctx.clearRect(0, 0, W, H);
    if (linesAlpha <= 0.01) return;
    const nx = -lines[0]?.dy || 0;
    const ny = lines[0]?.dx || 0;
    for (const L of lines) {
      lctx.beginPath();
      let energy = 0;
      for (let s = 0; s <= SEG; s++) {
        const t = s / SEG;
        const bx = L.x0 + L.dx * L.len * t;
        const by = L.y0 + L.dy * L.len * t;
        if (pointer.active) {
          const ddx = bx + nx * L.off[s] - pointer.x;
          const ddy = by + ny * L.off[s] - pointer.y;
          const dist = Math.hypot(ddx, ddy);
          if (dist < 140) {
            const side = Math.sign(ddx * nx + ddy * ny) || 1;
            L.vel[s] += side * (1 - dist / 140) * 2.4;
          }
        }
        // spring back + neighbour coupling = a plucked string
        const nb = ((L.off[s - 1] ?? 0) + (L.off[s + 1] ?? 0)) * 0.5;
        L.vel[s] += (nb - L.off[s]) * 0.25 - L.off[s] * 0.04;
        L.vel[s] *= 0.9;
        L.off[s] += L.vel[s] * Math.min(dt * 60, 2);
        energy = Math.max(energy, Math.abs(L.off[s]));
        const x = bx + nx * L.off[s];
        const y = by + ny * L.off[s];
        if (s === 0) lctx.moveTo(x, y);
        else lctx.lineTo(x, y);
      }
      const e = Math.min(1, energy / 26);
      lctx.strokeStyle = e > 0.05 ? `rgba(205,255,59,${(0.1 + e * 0.6) * linesAlpha})` : `rgba(236,238,232,${0.075 * linesAlpha})`;
      lctx.lineWidth = 1;
      lctx.stroke();
    }
  }
  const onMove = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
  };
  const onLeave = () => (pointer.active = false);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  disposers.push(() => {
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
  });

  /* -------------------------------------------- hold to transform -- */
  let holding = false;
  let hold = 0;
  const startHold = (e?: Event) => {
    e?.preventDefault();
    holding = true;
    holdBtn.setAttribute('aria-pressed', 'true');
  };
  const endHold = () => {
    holding = false;
    holdBtn.setAttribute('aria-pressed', 'false');
  };
  holdBtn.addEventListener('pointerdown', (e) => {
    holdBtn.setPointerCapture(e.pointerId);
    startHold(e);
  });
  holdBtn.addEventListener('pointerup', endHold);
  holdBtn.addEventListener('pointercancel', endHold);
  holdBtn.addEventListener('lostpointercapture', endHold);
  holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
  holdBtn.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(e);
    else if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
  });
  holdBtn.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') endHold();
  });
  holdBtn.addEventListener('blur', endHold);
  holdBtn.addEventListener('click', (e) => e.preventDefault());

  /* ------------------------------------------- hero UI choreography -- */
  // Headline intro after the preloader, then scroll-driven exit (scrubbed).
  const introTl = gsap.timeline({ paused: true });
  if (!ctx.reduced) {
    introTl
      .from(titleLines, { yPercent: 115, duration: 1.3, stagger: 0.1, ease: 'expo.out' })
      .from(fades, { opacity: 0, y: 18, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.35);
    const play = () => introTl.play();
    if (document.querySelector('[data-preloader]:not(.is-done)')) window.addEventListener('upampi:intro', play, { once: true });
    else play();
    disposers.push(() => window.removeEventListener('upampi:intro', play));
  }

  /* --------------------------------------------------- the frame -- */
  const state = { p: 0, m: 0, k: 0, sp: 0, sm: 0, sk: 0 };
  let needsRender = true;
  let visible = true;
  let last = performance.now();
  let time = 0;

  function computeProgress() {
    state.p = stickyProgress(heroSec);
    const vh = window.innerHeight;
    const mr = manSec.getBoundingClientRect();
    state.m = clamp((vh - mr.top) / (mr.height + vh * 0.2));
    const kr = mqSec.getBoundingClientRect();
    state.k = clamp((vh - kr.top) / (kr.height + vh * 0.15));
  }

  function applyUI(p: number) {
    // headline + UI leave early but stay readable through the first beat
    // (intro tweens live on the children; scroll exit lives on the containers)
    const out = range(p, 0.02, 0.12);
    const headOut = smooth(range(p, 0.04, 0.16));
    head.style.transform = `translate3d(0,${(-headOut * 14).toFixed(2)}vh,0)`;
    head.style.opacity = String(1 - headOut);
    head.style.visibility = headOut >= 1 ? 'hidden' : '';
    foot.style.opacity = String(1 - out);
    foot.style.visibility = out >= 1 ? 'hidden' : '';
    const phases = [
      [0.12, 0.36],
      [0.38, 0.6],
      [0.62, 0.84],
    ];
    captions.forEach((c, i) => {
      const [a, b] = phases[i];
      const o = Math.min(range(p, a, a + 0.05), 1 - range(p, b - 0.05, b));
      c.style.opacity = String(o);
      c.style.transform = `translateY(${((1 - o) * 8).toFixed(1)}px)`;
    });
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!ctx.reduced) time += dt;

    computeProgress();
    // short damping: responsive, but settles (and holds) when scrolling stops
    const k = ctx.reduced ? 1 : 1 - Math.pow(0.0008, dt);
    state.sp = lerp(state.sp, state.p, k);
    state.sm = lerp(state.sm, state.m, k);
    state.sk = lerp(state.sk, state.k, k);

    hold = clamp(hold + (holding ? dt / 1.7 : -dt / 0.9));
    holdBtn.style.setProperty('--hold', hold.toFixed(3));

    const p = state.sp;
    const hp = smooth(hold);
    const shatter = Math.max(smooth(range(p, 0.04, 0.4)), smooth(range(hp, 0, 0.5)));
    const ordr = Math.max(smooth(range(p, 0.48, 0.84)), hold > 0 && p < 0.5 ? smooth(range(hp, 0.55, 1)) : 0);
    const wireScroll = Math.min(range(p, 0.34, 0.47), 1 - range(p, 0.6, 0.74));
    const wireHold = p < 0.3 ? Math.min(range(hp, 0.35, 0.5), 1 - range(hp, 0.62, 0.8)) : 0;
    uniforms.uShatter.value = shatter;
    uniforms.uOrder.value = ordr;
    uniforms.uWire.value = Math.max(wireScroll, wireHold);
    uniforms.uLight.value = smooth(range(state.sm, 0.05, 0.85));
    uniforms.uCollapse.value = smooth(range(state.sk, 0.3, 0.68));
    uniforms.uDim.value = lerp(1, 0.3, range(state.sm, 0.0, 0.2)) * lerp(1, 2.8, range(state.sk, 0.3, 0.65));
    uniforms.uTime.value = time;
    dmat.uniforms.uSpark.value = shatter * (1 - ordr);

    const coll = uniforms.uCollapse.value;
    fmat.uniforms.uI.value = 0.12 + shatter * (1 - ordr) * 0.25 + uniforms.uLight.value * 0.35 + Math.sin(coll * Math.PI) * 1.2 + smooth(range(coll, 0.4, 0.95)) * 2.4;
    fmat.uniforms.uCore.value = coll;
    flare.scale.setScalar(lerp(0.7, 1.2, coll) / Math.max(group.scale.x, 0.001) * 0.9);
    flare.quaternion.copy(camera.quaternion);

    // framing: mark sits at its anchor, the core drifts centre-stage
    const vh = visH();
    const vw = vh * camera.aspect;
    const baseScale = (anchor.h * vh) / MARK_H;
    const toCentre = smooth(range(p, 0.08, 0.42));
    const ax = (anchor.x - 0.5) * vw;
    const ay = (0.5 - anchor.y) * vh;
    const coreX = 0;
    group.position.x = lerp(ax, 0, toCentre) + (ordr > 0 ? coreX * ordr : 0);
    group.position.y = lerp(ay, ctx.mobile ? -0.1 : 0, toCentre);
    const s = baseScale * lerp(1, ctx.mobile ? 0.9 : 1.05, toCentre) * lerp(1, ctx.mobile ? 1.25 : 1.5, ordr);
    group.scale.setScalar(s);
    const drift = ctx.reduced ? 0 : Math.sin(time * 0.25) * 0.06;
    group.rotation.y = lerp(-0.48, 0.2, toCentre) + ordr * (0.55 + p * 0.6 + state.sm * 1.4 + state.sk * 1.2) + drift;
    group.rotation.x = lerp(0.16, -0.05, toCentre) + ordr * 0.38 + (ctx.reduced ? 0 : Math.cos(time * 0.2) * 0.03);
    camera.position.z = 10 - Math.sin(shatter * Math.PI * (1 - ordr * 0.5)) * 1.4;

    linesAlpha = 1 - range(p, 0.05, 0.2);
    stage.style.setProperty('--glow-o', (1 - toCentre * 0.85).toFixed(3));
    applyUI(p);
    drawLines(dt);

    renderer.render(scene, camera);
    if (needsRender) {
      needsRender = false;
    }
  }

  let raf = 0;
  let firstFrame = true;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    frame(now);
    if (firstFrame) {
      firstFrame = false;
      root.classList.add('is-live');
      window.dispatchEvent(new Event('upampi:hero-ready'));
    }
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) last = performance.now();
  });
  io.observe(root);
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();
  // start at the restored scroll position (back/forward navigation) — no catch-up sweep
  computeProgress();
  state.sp = state.p;
  state.sm = state.m;
  state.sk = state.k;
  raf = requestAnimationFrame(loop);

  const onLost = (e: Event) => {
    e.preventDefault();
    root.classList.remove('is-live');
  };
  canvas.addEventListener('webglcontextlost', onLost);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    introTl.kill();
    canvas.removeEventListener('webglcontextlost', onLost);
    disposers.forEach((d) => d());
  };
}
