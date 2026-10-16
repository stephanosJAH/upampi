/**
 * IA EN ACCIÓN — a curved, twisting WebGL ribbon of UI mockups flows through
 * a glowing AI core: left of the core each tile shows the messy input, right
 * of it the clean output. Then the ribbon settles into a tidy grid.
 */
import * as THREE from 'three';
import { paintAtlas, ATLAS_COLS, ATLAS_ROWS } from '../lib/mockups';
import { clamp, lerp, range, smooth, stickyProgress, type PageCtx } from '../lib/env';

const SIGNAL = new THREE.Color('#cdff3b');
const TILES = 12;
const TW = 1.6;
const TH = 1.0;

const vert = /* glsl */ `
  attribute float aIndex;
  uniform float uOffset;
  uniform float uSettle;
  uniform float uR;
  uniform float uSpacing;
  uniform vec2 uGrid;      // cols, rows
  uniform float uGap;
  varying vec2 vUv;
  varying float vWorldX;
  varying float vDepth;
  varying float vSettle;
  varying float vTile;

  vec3 rotAround(vec3 v, vec3 k, float a) {
    return v * cos(a) + cross(k, v) * sin(a) + k * dot(k, v) * (1.0 - cos(a));
  }

  void main() {
    vUv = uv;
    vTile = aIndex;
    float s = uOffset - aIndex * uSpacing + position.x;
    float th = s / uR;
    vec3 c = vec3(uR * sin(th), s * 0.1 + sin(th * 1.7) * 0.25, uR * cos(th) - uR);
    vec3 T = normalize(vec3(cos(th), 0.1, -sin(th)));
    vec3 B = normalize(vec3(0.0, 1.0, 0.0) - T * T.y);
    float twist = sin(s * 0.22) * 0.55;
    B = rotAround(B, T, twist);
    vec3 ribbon = c + B * position.y;
    // tilt the whole ribbon for a diagonal sweep
    float a = -0.16;
    ribbon.xy = mat2(cos(a), sin(a), -sin(a), cos(a)) * ribbon.xy;

    // grid target
    float col = mod(aIndex, uGrid.x);
    float row = floor(aIndex / uGrid.x);
    vec2 size = vec2(uGrid.x * ${TW.toFixed(1)} + (uGrid.x - 1.0) * uGap, uGrid.y * ${TH.toFixed(1)} + (uGrid.y - 1.0) * uGap);
    vec3 grid = vec3(
      -size.x * 0.5 + ${(TW / 2).toFixed(2)} + col * (${TW.toFixed(1)} + uGap) + position.x,
      size.y * 0.5 - ${(TH / 2).toFixed(2)} - row * (${TH.toFixed(1)} + uGap) + position.y - 0.15,
      0.0
    );
    float st = smoothstep(0.0, 1.0, clamp(uSettle * 1.6 - (aIndex / ${TILES.toFixed(1)}) * 0.6, 0.0, 1.0));
    vec3 pos = mix(ribbon, grid, st);
    vSettle = st;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorldX = world.x;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uAtlas;
  uniform vec3 uSignal;
  uniform float uCoreX;
  uniform float uCam;
  varying vec2 vUv;
  varying float vWorldX;
  varying float vDepth;
  varying float vSettle;
  varying float vTile;

  vec2 tileUv(float k, vec2 uv) {
    k = floor(k + 0.5);
    float r = floor((k + 0.5) / ${ATLAS_COLS.toFixed(1)});
    float c = k - r * ${ATLAS_COLS.toFixed(1)};
    return vec2((c + uv.x) / ${ATLAS_COLS.toFixed(1)}, 1.0 - (r + 1.0 - uv.y) / ${ATLAS_ROWS.toFixed(1)});
  }
  float rbox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }

  void main() {
    float tile = floor(vTile + 0.5);   // varyings interpolate: never trust exact integers
    float pair = tile - floor((tile + 0.5) / 6.0) * 6.0;
    float dx = vWorldX - uCoreX;
    // flowing: input left of the core, output right of it.
    // settled grid: first half of the tiles show "antes", second half "después".
    float out_ = mix(smoothstep(-0.04, 0.04, dx), step(5.5, tile), vSettle);
    vec3 a = texture2D(uAtlas, tileUv(pair, vUv)).rgb;
    vec3 b = texture2D(uAtlas, tileUv(pair + 6.0, vUv)).rgb;
    vec3 col = mix(a, b, out_);

    // processing seam where the tile crosses the core
    float seam = exp(-abs(dx) * 26.0) * (1.0 - vSettle);
    col += uSignal * seam * 1.4;

    // rounded corners + hairline border
    vec2 p = (vUv - 0.5) * vec2(${TW.toFixed(1)}, ${TH.toFixed(1)});
    float d = rbox(p, vec2(${(TW / 2).toFixed(2)}, ${(TH / 2).toFixed(2)}), 0.05);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, d);
    float border = 1.0 - smoothstep(0.0, 0.008, abs(d + 0.006));
    col = mix(col, vec3(0.9), border * 0.25);

    float fog = smoothstep(uCam + 9.0, uCam + 2.0, vDepth);
    col *= mix(0.25, 1.0, fog);
    col *= mix(1.0, mix(0.55, 1.0, step(5.5, tile)), vSettle);
    if (alpha < 0.5) discard;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const coreFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSignal;
  uniform float uI;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float ring = exp(-abs(r - 0.18 - sin(uTime * 1.3) * 0.008) * 90.0);
    float ring2 = exp(-abs(r - 0.26) * 140.0) * (0.5 + 0.5 * sin(atan(p.y, p.x) * 12.0 + uTime * 2.0));
    float core = exp(-r * 22.0);
    float halo = exp(-r * 6.0) * 0.5;
    vec3 c = mix(uSignal, vec3(1.0), core);
    float a = (core * 1.4 + halo + ring * 0.9 + ring2 * 0.35) * uI;
    gl_FragColor = vec4(c * a, a);
  }
`;

export default async function init(root: HTMLElement, ctx: PageCtx) {
  const section = root.closest('section')!;
  const stage = root.querySelector<HTMLElement>('.ia-stage')!;
  const canvas = root.querySelector<HTMLCanvasElement>('.ia-canvas')!;
  let disposed = false;
  let built: Awaited<ReturnType<typeof build>> | null = null;

  async function build() {
    const atlasCanvas = await paintAtlas();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, ctx.mobile ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);

    const atlas = new THREE.CanvasTexture(atlasCanvas);
    atlas.colorSpace = THREE.SRGBColorSpace;
    atlas.anisotropy = renderer.capabilities.getMaxAnisotropy();
    atlas.generateMipmaps = true;
    atlas.minFilter = THREE.LinearMipmapLinearFilter;

    const plane = new THREE.PlaneGeometry(TW, TH, 32, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = plane.index;
    geo.setAttribute('position', plane.getAttribute('position'));
    geo.setAttribute('uv', plane.getAttribute('uv'));
    geo.setAttribute('aIndex', new THREE.InstancedBufferAttribute(new Float32Array([...Array(TILES).keys()]), 1));
    geo.instanceCount = TILES;

    const uniforms = {
      uOffset: { value: 0 },
      uSettle: { value: 0 },
      uR: { value: 6 },
      uSpacing: { value: 1.95 },
      uGrid: { value: new THREE.Vector2(6, 2) },
      uGap: { value: 0.2 },
      uAtlas: { value: atlas },
      uSignal: { value: SIGNAL },
      uCoreX: { value: 0 },
      uCam: { value: 10 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      side: THREE.DoubleSide,
      transparent: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const coreMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: coreFrag,
      uniforms: { uSignal: uniforms.uSignal, uI: { value: 1 }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), coreMat);
    core.renderOrder = 5;
    core.position.z = 0.4;
    scene.add(core);

    let gridCols = 6;
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const portrait = camera.aspect < 0.9;
      gridCols = portrait ? 3 : 6;
      uniforms.uGrid.value.set(gridCols, TILES / gridCols);
      uniforms.uR.value = portrait ? 4.2 : 6;
    };
    resize();

    let time = 0;
    const render = (p: number, dt: number) => {
      time += ctx.reduced ? 0 : dt;
      const portrait = camera.aspect < 0.9;
      const flow = range(p, 0, 0.74);
      const span = portrait ? 5 : 8;
      uniforms.uOffset.value = lerp(-span, span + (TILES - 1) * uniforms.uSpacing.value, flow);
      const settle = range(p, 0.6, 0.94);
      uniforms.uSettle.value = settle;
      coreMat.uniforms.uTime.value = time;
      coreMat.uniforms.uI.value = 1 - smooth(range(p, 0.6, 0.78));

      // camera: low and close while flowing, pulls back to frame the grid
      const gw = gridCols * TW + (gridCols - 1) * 0.2;
      const gh = (TILES / gridCols) * TH + (TILES / gridCols - 1) * 0.2;
      const fitH = gh / 0.62 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)));
      const fitW = gw / 0.86 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect);
      const dGrid = Math.max(fitH, fitW);
      const dFlow = portrait ? 8.6 : 6.4;
      const sm = smooth(settle);
      camera.position.set(0, lerp(0.25, 0, sm), lerp(dFlow, dGrid, sm));
      camera.lookAt(0, lerp(-0.1, 0, sm), 0);
      uniforms.uCam.value = camera.position.z;
      renderer.render(scene, camera);
      return settle;
    };
    const dispose = () => {
      plane.dispose();
      geo.dispose();
      mat.dispose();
      atlas.dispose();
      core.geometry.dispose();
      coreMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
    return { render, resize, dispose };
  }

  let visible = false;
  let sp = stickyProgress(root);
  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || !built) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const target = ctx.reduced ? 1 : stickyProgress(root);
    sp = ctx.reduced ? 1 : lerp(sp, target, 1 - Math.pow(0.0006, dt));
    const settle = built.render(sp, dt);
    stage.style.setProperty('--flow', String(1 - range(sp, 0.55, 0.66)));
    stage.style.setProperty('--final', String(range(settle, 0.75, 1)));
  };

  const near = new IntersectionObserver(
    async ([e]) => {
      if (e.isIntersecting && !built) {
        near.disconnect();
        try {
          const b = await build();
          if (disposed) b.dispose();
          else built = b;
        } catch (err) {
          console.warn('[upampi] ribbon WebGL unavailable', err);
        }
      }
    },
    { rootMargin: '120% 0px' },
  );
  near.observe(root);
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    last = performance.now();
  });
  vis.observe(root);
  const ro = new ResizeObserver(() => built?.resize());
  ro.observe(stage);
  raf = requestAnimationFrame(frame);
  void section;
  void clamp;

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    near.disconnect();
    vis.disconnect();
    ro.disconnect();
    built?.dispose();
    built = null;
  };
}
