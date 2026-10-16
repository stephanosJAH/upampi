// Generates Open Graph images (1200×630) and the favicon set from the brand
// geometry in src/lib/brand.mjs. Text is converted to vector paths with
// opentype.js from the self-hosted @fontsource files, so output is identical
// on any machine (no system fonts involved). Run: node scripts/generate-assets.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { GLYPHS, MARK, STROKE, WORDMARK_WIDTH } from '../src/lib/brand.mjs';
import { solutions } from '../src/data/solutions.ts';
import { services } from '../src/data/services.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const font = (p) => opentype.parse(readFileSync(join(root, 'node_modules', p)).buffer);
const sans = font('@fontsource/familjen-grotesk/files/familjen-grotesk-latin-500-normal.woff');
const mono = font('@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff');

const SIGNAL = '#cdff3b';
const INK = '#0a0b0d';

const textPath = (f, str, x, y, size, fill, tracking = 0) => {
  let d = '';
  let cx = x;
  for (const ch of str) {
    const g = f.charToGlyph(ch);
    d += g.getPath(cx, y, size).toPathData(2);
    cx += (g.advanceWidth / f.unitsPerEm) * size + tracking;
  }
  return { svg: `<path d="${d}" fill="${fill}"/>`, width: cx - x };
};
const measure = (f, str, size, tracking = 0) =>
  [...str].reduce((w, ch) => w + (f.charToGlyph(ch).advanceWidth / f.unitsPerEm) * size + tracking, 0);
const wrap = (f, str, size, max, tracking) => {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (measure(f, t, size, tracking) > max && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
};

const markSvg = (x, y, h, color = '#eceee8', bit = SIGNAL) => {
  const [vx, vy, , vh] = MARK.viewBox.split(' ').map(Number);
  const k = h / vh;
  return `<g transform="translate(${x - vx * k} ${y - vy * k}) scale(${k})">
    <path d="${MARK.path}" fill="none" stroke="${color}" stroke-width="${MARK.stroke}"/>
    <rect x="${MARK.bit.x}" y="${MARK.bit.y}" width="${MARK.bit.size}" height="${MARK.bit.size}" fill="${bit}"/></g>`;
};
const wordmarkSvg = (x, y, h, color) => {
  const k = h / 14;
  return `<g transform="translate(${x} ${y}) scale(${k})" fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-miterlimit="1.6">${GLYPHS.map(
    (g) => `<path d="${g.d}" transform="translate(${g.x} 0)"/>`,
  ).join('')}</g>`;
};

function og({ kicker, title, theme = 'dark' }) {
  const dark = theme === 'dark';
  const bg = dark ? INK : '#dcddd8';
  const fg = dark ? '#eceee8' : '#0b0c0e';
  const mu = dark ? '#6c7078' : '#6a6d72';
  const grid = [];
  for (let x = 0; x <= 1200; x += 60) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="630"/>`);
  for (let y = 0; y <= 630; y += 60) grid.push(`<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`);
  const size = title.length > 34 ? 68 : 84;
  const lines = wrap(sans, title, size, 760, -size * 0.04).slice(0, 3);
  const titleSvg = lines
    .map((l, i) => textPath(sans, l, 64, 630 - 70 - (lines.length - 1 - i) * size * 0.98, size, fg, -size * 0.04).svg)
    .join('');
  const k = textPath(mono, kicker.toUpperCase(), 64, 630 - 70 - lines.length * size * 0.98 - 22, 15, mu, 1).svg;
  const tag = textPath(mono, 'SMART SOFTWARE', 300, 92, 13, mu, 1).svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  <defs><radialGradient id="g" cx="0.78" cy="0.42" r="0.5"><stop offset="0" stop-color="${SIGNAL}" stop-opacity="${dark ? 0.16 : 0.35}"/><stop offset="1" stop-color="${SIGNAL}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g stroke="${fg}" stroke-opacity="0.05">${grid.join('')}</g>
  ${markSvg(64, 66, 40, fg)}
  ${wordmarkSvg(116, 70, 30, fg)}
  <line x1="286" y1="66" x2="286" y2="106" stroke="${mu}"/>
  ${tag}
  ${markSvg(870, 150, 330, dark ? '#1e2126' : '#c4c5c0', SIGNAL)}
  ${k}
  ${titleSvg}
  <text x="1136" y="580" text-anchor="end" fill="${mu}" font-size="14">upampi.com</text>
</svg>`.replace(/<text[^>]*>upampi.com<\/text>/, textPath(mono, 'UPAMPI.COM', 1012, 580, 13, mu, 1).svg);
}

async function png(svg, out, w, h) {
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).resize(w, h).png({ compressionLevel: 9 }).toFile(out);
}

// --- Open Graph -----------------------------------------------------------
const ogJobs = [
  ['og/default.png', { kicker: 'Software · Automatización · IA para pymes', title: 'Software que trabaja por ti.' }],
  ['og/soluciones.png', { kicker: 'Índice de soluciones', title: 'Soluciones por industria', theme: 'light' }],
  ['og/servicios.png', { kicker: 'Seis disciplinas', title: 'Servicios de software e IA' }],
  ['og/contacto.png', { kicker: 'Diagnóstico inicial sin costo', title: 'Cuéntanos tu proyecto.', theme: 'light' }],
  ...solutions.map((s) => [`og/soluciones/${s.slug}.png`, { kicker: `${s.industry} · ejemplo ilustrativo`, title: s.title, theme: 'light' }]),
  ...services.map((s) => [`og/servicios/${s.slug}.png`, { kicker: `Servicio ${s.index}`, title: s.title }]),
];
for (const [file, opts] of ogJobs) await png(og(opts), join(pub, file), 1200, 630);

// --- Favicons -------------------------------------------------------------
const icon = (size, pad, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/>
  ${markSvg((size - (size - pad * 2) * (16.4 / 21.1)) / 2, pad, size - pad * 2, '#eceee8')}
</svg>`;
writeFileSync(join(pub, 'favicon.svg'), icon(64, 10, 14));
await png(icon(180, 30, 0), join(pub, 'icons/apple-touch-icon.png'), 180, 180);
await png(icon(192, 30, 40), join(pub, 'icons/icon-192.png'), 192, 192);
await png(icon(512, 80, 108), join(pub, 'icons/icon-512.png'), 512, 512);
await png(icon(512, 130, 0), join(pub, 'icons/icon-maskable-512.png'), 512, 512);

// favicon.ico (single 32×32 PNG inside an ICO container)
const ico32 = await sharp(Buffer.from(icon(32, 4, 7))).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, ico32]));

console.log(`[assets] ${ogJobs.length} OG images + favicon set written to /public`);
void WORDMARK_WIDTH;
