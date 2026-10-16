/**
 * Procedural UI mockups for the "IA en acción" ribbon, painted with Canvas2D
 * into a 4×3 atlas: tiles 0–5 are messy inputs, 6–11 the clean outputs.
 */
export const TILE_W = 512;
export const TILE_H = 320;
export const ATLAS_COLS = 4;
export const ATLAS_ROWS = 3;

const SIG = '#cdff3b';
const INK = '#0b0c0e';
const SANS = '"Familjen Grotesk Variable", "Familjen Grotesk", sans-serif';
const MONO = '"Martian Mono", monospace';

type G = CanvasRenderingContext2D;

const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};
const text = (g: G, s: string, x: number, y: number, size: number, color: string, font = SANS, weight = 500) => {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.fillText(s, x, y);
};
const lines = (g: G, x: number, y: number, w: number, n: number, gap: number, color: string, jitter = 0, seed = 1) => {
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const l = w * (0.55 + (((Math.sin(seed * 9.1 + i * 3.7) + 1) / 2) * 0.45));
    g.save();
    g.translate(x, y + i * gap);
    g.rotate(jitter * Math.sin(i + seed));
    g.fillRect(0, 0, l, 5);
    g.restore();
  }
};
const header = (g: G, title: string, dark: boolean) => {
  g.fillStyle = dark ? '#16181c' : '#e9e6dc';
  g.fillRect(0, 0, TILE_W, 44);
  text(g, title.toUpperCase(), 22, 28, 12, dark ? '#9ea2a8' : '#6b675c', MONO, 400);
  if (dark) {
    g.fillStyle = SIG;
    g.beginPath();
    g.arc(TILE_W - 26, 22, 5, 0, Math.PI * 2);
    g.fill();
  }
};

/* ------------------------------------------------------- inputs (messy) -- */

function paper(g: G, title: string) {
  g.fillStyle = '#efece3';
  g.fillRect(0, 0, TILE_W, TILE_H);
  header(g, title, false);
}

const inputs: ((g: G) => void)[] = [
  // scanned invoice
  (g) => {
    paper(g, 'Factura escaneada.pdf');
    g.save();
    g.translate(60, 64);
    g.rotate(-0.06);
    g.fillStyle = '#fbfaf5';
    g.fillRect(0, 0, 300, 236);
    g.fillStyle = '#c9c5b8';
    g.fillRect(16, 16, 110, 18);
    lines(g, 16, 60, 250, 8, 18, '#b9b5a8', 0.01, 3);
    g.fillStyle = '#8c887c';
    g.fillRect(170, 206, 110, 9);
    g.restore();
    g.strokeStyle = 'rgba(140,100,60,.25)';
    g.lineWidth = 9;
    g.beginPath();
    g.arc(410, 200, 46, 0.3, 5.6);
    g.stroke();
    text(g, '¿IVA?', 380, 120, 26, '#b0413e', SANS, 400);
  },
  // unanswered chats
  (g) => {
    paper(g, 'Chat · 23 sin leer');
    const msgs = ['Hola!! siguen abiertos?', '¿Precio del servicio?', '¿Tienen disponible mañana?', 'Hola???', 'Necesito factura'];
    msgs.forEach((m, i) => {
      const y = 62 + i * 50;
      const x = 20 + (i % 2) * 40;
      rr(g, x, y, 300, 38, 14);
      g.fillStyle = '#fbfaf5';
      g.fill();
      text(g, m, x + 16, y + 25, 17, '#3b3a35', SANS, 450);
      g.fillStyle = '#d9534f';
      g.beginPath();
      g.arc(x + 300, y + 4, 10, 0, Math.PI * 2);
      g.fill();
    });
  },
  // inventory sheet
  (g) => {
    paper(g, 'inventario_final_v3.xlsx');
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 6; c++) {
        const x = 20 + c * 80;
        const y = 58 + r * 28;
        g.strokeStyle = '#cfcbbf';
        g.strokeRect(x, y, 80, 28);
        if (r === 0) text(g, ['SKU', 'Prod.', 'Stock', 'Mín', '??', 'Nota'][c], x + 8, y + 19, 12, '#6b675c', MONO, 400);
        else if ((r * 7 + c * 3) % 5 === 0) {
          g.fillStyle = r % 3 ? '#e8c9c3' : '#f1e3a8';
          g.fillRect(x + 1, y + 1, 78, 26);
        }
        if (r === 4 && c === 4) text(g, '#REF!', x + 8, y + 19, 13, '#b0413e', MONO, 400);
        else if (r > 0 && c < 4) g.fillStyle = '#a9a598', g.fillRect(x + 10, y + 12, 30 + ((r * c * 13) % 30), 5);
      }
  },
  // order email
  (g) => {
    paper(g, 'Bandeja de entrada');
    rr(g, 20, 60, 472, 240, 6);
    g.fillStyle = '#fbfaf5';
    g.fill();
    text(g, 'RE: RE: RE: Pedido URGENTE', 40, 96, 20, '#2d2c28', SANS, 600);
    text(g, 'De: compras@cliente…', 40, 122, 13, '#8c887c', MONO, 400);
    lines(g, 40, 146, 420, 7, 20, '#c3bfb2', 0, 5);
    text(g, 'adjunto: pedido(2).jpg', 40, 290, 12, '#8c887c', MONO, 400);
  },
  // paper agenda
  (g) => {
    paper(g, 'Agenda — semana');
    g.strokeStyle = '#d6d2c6';
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.moveTo(20, 70 + i * 28);
      g.lineTo(492, 70 + i * 28);
      g.stroke();
    }
    const items = ['9:00 Sra. López', '10:30 ¿confirmó?', '12:00 Pérez (llamar)', '16:00 —', '17:30 cambio??'];
    items.forEach((s, i) => {
      text(g, s, 40 + (i % 2) * 12, 92 + i * 46, 22, '#3a4f86', 'cursive', 400);
      if (i === 1 || i === 4) {
        g.strokeStyle = '#b0413e';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(36, 86 + i * 46);
        g.lineTo(280, 82 + i * 46);
        g.stroke();
        g.lineWidth = 1;
      }
    });
  },
  // pile of receipts
  (g) => {
    paper(g, 'Tickets del día');
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(60 + i * 104, 74 + (i % 2) * 22);
      g.rotate((i % 3) * 0.09 - 0.09);
      g.fillStyle = '#fbfaf5';
      g.fillRect(0, 0, 118, 210);
      g.fillStyle = '#8c887c';
      g.fillRect(14, 18, 60, 10);
      lines(g, 14, 50, 86, 5, 24, '#c3bfb2', 0, i + 1);
      g.fillStyle = '#4a4740';
      g.fillRect(50, 184, 54, 9);
      g.restore();
    }
  },
];

/* ------------------------------------------------------ outputs (clean) -- */

function screen(g: G, title: string) {
  g.fillStyle = '#0d0f12';
  g.fillRect(0, 0, TILE_W, TILE_H);
  header(g, title, true);
}
const field = (g: G, label: string, value: string, x: number, y: number, w: number) => {
  text(g, label.toUpperCase(), x, y, 11, '#7b8087', MONO, 400);
  rr(g, x, y + 10, w, 38, 6);
  g.fillStyle = '#16181c';
  g.fill();
  text(g, value, x + 14, y + 35, 17, '#eceee8', SANS, 500);
};
const pill = (g: G, s: string, x: number, y: number, on = true) => {
  g.font = `400 12px ${MONO}`;
  const w = g.measureText(s).width + 26;
  rr(g, x, y, w, 28, 14);
  g.fillStyle = on ? SIG : '#1d2025';
  g.fill();
  text(g, s, x + 13, y + 19, 12, on ? INK : '#9ea2a8', MONO, 400);
  return w;
};

const outputs: ((g: G) => void)[] = [
  (g) => {
    screen(g, 'Factura · registrada');
    field(g, 'Emisor', 'Papelería Central', 22, 72, 228);
    field(g, 'Fecha', '14 / 03', 266, 72, 224);
    field(g, 'Concepto', 'Material de oficina', 22, 146, 228);
    field(g, 'Total', '$ 2,480.00', 266, 146, 224);
    pill(g, 'VALIDADA ✓', 22, 262);
    pill(g, 'ENVIAR A CONTABILIDAD', 160, 262, false);
  },
  (g) => {
    screen(g, 'Asistente · WhatsApp');
    const rows: [string, boolean][] = [
      ['¿Tienen disponible mañana?', false],
      ['Sí. Mañana hay espacio a las 10:00 y 16:30. ¿Te reservo uno?', true],
      ['10:00 porfa', false],
      ['Listo, te envío la confirmación ✓', true],
    ];
    rows.forEach(([m, bot], i) => {
      const y = 62 + i * 60;
      g.font = `500 15px ${SANS}`;
      const w = Math.min(380, g.measureText(m).width + 30);
      const x = bot ? TILE_W - w - 22 : 22;
      rr(g, x, y, w, bot && w >= 380 ? 50 : 40, 14);
      g.fillStyle = bot ? SIG : '#1d2025';
      g.fill();
      if (bot && w >= 380) {
        text(g, m.slice(0, 40), x + 15, y + 21, 15, INK);
        text(g, m.slice(40), x + 15, y + 40, 15, INK);
      } else text(g, m, x + 15, y + 25, 15, bot ? INK : '#d8dad4');
    });
  },
  (g) => {
    screen(g, 'Inventario · alerta');
    rr(g, 22, 66, 468, 120, 10);
    g.fillStyle = '#16181c';
    g.fill();
    text(g, 'Stock bajo', 42, 104, 26, '#eceee8');
    text(g, 'Tornillo hexagonal 1/4" — Sucursal Centro', 42, 134, 15, '#9ea2a8', SANS, 400);
    g.fillStyle = '#2a2d33';
    g.fillRect(42, 152, 420, 8);
    g.fillStyle = SIG;
    g.fillRect(42, 152, 60, 8);
    pill(g, 'GENERAR PEDIDO →', 22, 214);
    pill(g, 'POSPONER', 196, 214, false);
    text(g, 'Sugerencia basada en ventas recientes', 22, 290, 12, '#7b8087', MONO, 400);
  },
  (g) => {
    screen(g, 'Pedido · en sistema');
    text(g, 'Pedido #A-1042', 22, 92, 28, '#eceee8');
    const st = ['Recibido', 'Preparando', 'Enviado', 'Entregado'];
    st.forEach((s, i) => {
      const x = 22 + i * 120;
      g.fillStyle = i < 2 ? SIG : '#2a2d33';
      g.fillRect(x, 128, 110, 6);
      text(g, s.toUpperCase(), x, 158, 11, i < 2 ? '#eceee8' : '#7b8087', MONO, 400);
    });
    lines(g, 22, 196, 300, 4, 22, '#2a2d33', 0, 2);
    text(g, 'Total  $ 6,320', 330, 284, 20, SIG);
  },
  (g) => {
    screen(g, 'Agenda · confirmada');
    for (let i = 0; i < 5; i++) {
      for (let r = 0; r < 4; r++) {
        const x = 22 + i * 94;
        const y = 64 + r * 58;
        const on = (i === 1 && r === 1) || (i === 3 && r === 2);
        rr(g, x, y, 86, 50, 6);
        g.fillStyle = on ? SIG : (i + r) % 3 === 0 ? '#1d2025' : '#121418';
        g.fill();
        if (on) text(g, '✓ 10:00', x + 12, y + 31, 15, INK);
      }
    }
  },
  (g) => {
    screen(g, 'Ventas · hoy');
    [
      ['Ventas', '$ 18.4k'],
      ['Tickets', '126'],
      ['Ticket prom.', '$ 146'],
    ].forEach(([k, v], i) => {
      const x = 22 + i * 158;
      rr(g, x, 62, 148, 70, 8);
      g.fillStyle = '#16181c';
      g.fill();
      text(g, k.toUpperCase(), x + 14, 86, 10, '#7b8087', MONO, 400);
      text(g, v, x + 14, 118, 24, i === 0 ? SIG : '#eceee8');
    });
    const hs = [40, 64, 52, 90, 76, 110, 98, 130, 86, 120];
    hs.forEach((h, i) => {
      g.fillStyle = i === 7 ? SIG : '#2a2d33';
      g.fillRect(28 + i * 46, 296 - h, 30, h);
    });
  },
];

/** Paint the atlas. Waits for webfonts so the type matches the site. */
export async function paintAtlas() {
  try {
    await Promise.all([
      document.fonts.load(`500 20px ${SANS}`),
      document.fonts.load(`400 12px ${MONO}`),
    ]);
  } catch {}
  const c = document.createElement('canvas');
  c.width = TILE_W * ATLAS_COLS;
  c.height = TILE_H * ATLAS_ROWS;
  const g = c.getContext('2d')!;
  [...inputs, ...outputs].forEach((paint, k) => {
    g.save();
    g.translate((k % ATLAS_COLS) * TILE_W, Math.floor(k / ATLAS_COLS) * TILE_H);
    g.beginPath();
    g.rect(0, 0, TILE_W, TILE_H);
    g.clip();
    paint(g);
    g.restore();
  });
  return c;
}
