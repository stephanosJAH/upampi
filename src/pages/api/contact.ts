import type { APIRoute } from 'astro';
import { z } from 'zod';
import { SERVICE_OPTIONS, BUDGET_OPTIONS, MESSAGE_MIN, MESSAGE_MAX, MIN_FILL_SECONDS } from '../../data/contact';

export const prerender = false;

const env = (k: string) => process.env[k]?.trim() || '';

/* ------------------------------------------------------------ schema -- */

const serviceIds = SERVICE_OPTIONS.map((s) => s.id) as [string, ...string[]];
const budgetIds = BUDGET_OPTIONS.map((b) => b.id) as [string, ...string[]];

const Schema = z.object({
  name: z.string({ error: 'Escribe tu nombre.' }).trim().min(2, 'Escribe tu nombre.').max(120),
  email: z.string({ error: 'Escribe tu correo.' }).trim().max(200).pipe(z.email('Revisa tu correo.')),
  company: z.string().trim().max(160).optional().default(''),
  services: z
    .array(z.enum(serviceIds), { error: 'Elige al menos una opción.' })
    .min(1, 'Elige al menos una opción.')
    .max(serviceIds.length),
  message: z
    .string({ error: 'Cuéntanos qué quieres resolver.' })
    .trim()
    .min(MESSAGE_MIN, `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres).`)
    .max(MESSAGE_MAX),
  budget: z.enum(budgetIds, 'Elige un rango de presupuesto.'),
  consent: z.literal(true, 'Necesitamos tu autorización para responderte.'),
  website: z.string().max(0).optional().default(''), // honeypot
  ts: z.coerce.number({ error: 'Recarga la página e inténtalo de nuevo.' }).int().positive(),
  source: z.string().max(200).optional().default(''),
});
type Lead = z.infer<typeof Schema>;

/* -------------------------------------------------------- rate limit -- */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return list.length > MAX_PER_WINDOW;
}

function clientIp(request: Request, clientAddress: string | undefined) {
  // Behind Caddy/Nginx on the same host the socket peer is loopback; trust the proxy header only then.
  const peer = clientAddress || '';
  const loopback = peer === '127.0.0.1' || peer === '::1' || peer === '::ffff:127.0.0.1';
  if (loopback) {
    const xff = request.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const real = request.headers.get('x-real-ip');
    if (real) return real.trim();
  }
  return peer || 'unknown';
}

/* --------------------------------------------------------- transport -- */

const label = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function compose(lead: Lead, ip: string) {
  const services = lead.services.map((s) => label(SERVICE_OPTIONS, s)).join(', ');
  const budget = label(BUDGET_OPTIONS, lead.budget);
  const subject = `Nuevo proyecto · ${lead.name}${lead.company ? ` (${lead.company})` : ''}`;
  const rows: [string, string][] = [
    ['Nombre', lead.name],
    ['Correo', lead.email],
    ['Empresa', lead.company || '—'],
    ['Servicios', services],
    ['Presupuesto', budget],
    ['Origen', lead.source || 'formulario'],
    ['IP', ip],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMensaje:\n${lead.message}\n`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0b0c0e">
  <h2 style="margin:0 0 16px">Nuevo proyecto desde upampi.com</h2>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>
  <p style="margin:20px 0 6px;color:#666">Mensaje</p>
  <p style="white-space:pre-wrap;margin:0">${esc(lead.message)}</p></div>`;
  return { subject, text, html };
}

async function send(lead: Lead, ip: string): Promise<'resend' | 'smtp' | 'dry-run'> {
  const to = env('CONTACT_TO');
  const from = env('CONTACT_FROM');
  const replyTo = env('CONTACT_REPLY_TO') !== 'false' ? lead.email : undefined;
  const { subject, text, html } = compose(lead, ip);

  if (env('RESEND_API_KEY') && to && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), subject, text, html, reply_to: replyTo }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => '')}`);
    return 'resend';
  }

  if (env('SMTP_HOST') && to && from) {
    const { createTransport } = await import('nodemailer');
    const port = Number(env('SMTP_PORT') || 587);
    const transport = createTransport({
      host: env('SMTP_HOST'),
      port,
      secure: env('SMTP_SECURE') === 'true' || port === 465,
      auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined,
    });
    await transport.sendMail({ from, to, subject, text, html, replyTo });
    return 'smtp';
  }

  if (import.meta.env.DEV || env('CONTACT_DRY_RUN') === 'true') {
    console.info(`[contact] DRY-RUN (no transport configured)\n--- ${subject}\n${text}`);
    return 'dry-run';
  }
  throw new Error('NO_TRANSPORT');
}

/* ---------------------------------------------------------- handler -- */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const type = request.headers.get('content-type') || '';
  const wantsJson = type.includes('application/json');
  const ip = clientIp(request, (() => {
    try {
      return clientAddress;
    } catch {
      return undefined;
    }
  })());

  const fail = (status: number, message: string, errors?: Record<string, string>) =>
    wantsJson ? json({ ok: false, message, errors }, status) : redirect('/contacto?error=1', 303);

  if (Number(request.headers.get('content-length') || 0) > 32_000) return fail(413, 'Mensaje demasiado largo.');

  let raw: Record<string, unknown>;
  try {
    if (wantsJson) raw = (await request.json()) as Record<string, unknown>;
    else {
      const fd = await request.formData();
      raw = {
        name: fd.get('name'),
        email: fd.get('email'),
        company: fd.get('company') || '',
        services: fd.getAll('services'),
        message: fd.get('message'),
        budget: fd.get('budget'),
        consent: fd.get('consent') === 'yes',
        website: fd.get('website') || '',
        ts: fd.get('ts') || Date.now() - 60_000, // no-JS form has no timestamp
        source: fd.get('source') || '',
      };
    }
  } catch {
    return fail(400, 'Solicitud inválida.');
  }

  if (limited(ip)) return fail(429, 'Demasiados envíos seguidos. Intenta de nuevo en unos minutos.');

  // Honeypot: pretend success so bots learn nothing.
  if (typeof raw.website === 'string' && raw.website.length > 0) {
    return wantsJson ? json({ ok: true }) : redirect('/contacto?enviado=1', 303);
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? 'form');
      errors[k] ??= issue.message;
    }
    return fail(422, 'Revisa los campos marcados.', errors);
  }
  const lead = parsed.data;

  const elapsed = (Date.now() - lead.ts) / 1000;
  if (elapsed < MIN_FILL_SECONDS || elapsed > 60 * 60 * 24) {
    return fail(422, 'No pudimos validar el envío. Recarga la página e inténtalo de nuevo.');
  }

  try {
    const via = await send(lead, ip);
    if (via !== 'dry-run') console.info(`[contact] sent via ${via} for ${lead.email}`);
  } catch (err) {
    console.error('[contact] send failed:', err instanceof Error ? err.message : err);
    return fail(503, 'No pudimos enviar tu solicitud ahora mismo. Escríbenos directamente por correo.');
  }
  return wantsJson ? json({ ok: true }) : redirect('/contacto?enviado=1', 303);
};

export const ALL: APIRoute = () => json({ ok: false, message: 'Método no permitido' }, 405);
