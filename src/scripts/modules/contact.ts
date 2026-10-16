import { supportsVT, type PageCtx } from '../lib/env';
import { MESSAGE_MIN, MESSAGE_MAX, SERVICE_SLUG_TO_OPTION } from '../../data/contact';

type Errors = Partial<Record<'name' | 'email' | 'services' | 'message' | 'budget' | 'consent' | 'form', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function init(root: HTMLElement, ctx: PageCtx) {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const submit = root.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = root.querySelector<HTMLElement>('[data-submit-label]')!;
  const done = root.querySelector<HTMLElement>('[data-done]')!;
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const grid = root.querySelector<HTMLElement>('.ct-grid')!;
  const ts = form.querySelector<HTMLInputElement>('[data-ts]')!;
  const source = form.querySelector<HTMLInputElement>('[data-source]')!;
  ts.value = String(Date.now());

  // Prefill from CTAs: ?tipo=diagnostico|llamada, ?servicio=slug, ?solucion=slug
  const q = new URLSearchParams(location.search);
  const pre = new Set<string>();
  const tipo = q.get('tipo');
  if (tipo === 'diagnostico' || tipo === 'llamada') pre.add(tipo);
  const svc = q.get('servicio');
  if (svc && SERVICE_SLUG_TO_OPTION[svc]) pre.add(SERVICE_SLUG_TO_OPTION[svc]);
  form.querySelectorAll<HTMLInputElement>('input[name="services"]').forEach((i) => (i.checked = pre.has(i.value)));
  source.value = [tipo && `tipo:${tipo}`, svc && `servicio:${svc}`, q.get('solucion') && `solucion:${q.get('solucion')}`]
    .filter(Boolean)
    .join(' ');
  if (tipo === 'llamada') {
    const msg = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]')!;
    if (!msg.value) msg.placeholder = 'Cuéntanos brevemente el tema de la llamada y tus horarios preferidos…';
  }

  const showDone = () => {
    const swap = () => {
      grid.hidden = true;
      done.hidden = false;
    };
    if (supportsVT() && !ctx.reduced) {
      document.documentElement.classList.add('vt-same-doc');
      document.startViewTransition(swap).finished.finally(() => document.documentElement.classList.remove('vt-same-doc'));
    } else swap();
    done.focus();
    window.scrollTo({ top: 0 });
  };
  // no-JS fallback redirects back here with a flag
  if (q.get('enviado') === '1') showDone();
  if (q.get('error') === '1') setStatus('No pudimos enviar tu solicitud. Revisa los campos o escríbenos por correo.', 'error');

  function setStatus(msg: string, kind: 'ok' | 'error' | '' = '') {
    status.textContent = msg;
    status.dataset.kind = kind;
  }

  const msgEl = form.elements.namedItem('message') as HTMLTextAreaElement;
  const onInput = () => (count.textContent = String(msgEl.value.trim().length));
  msgEl.addEventListener('input', onInput);
  onInput();

  const read = () => {
    const fd = new FormData(form);
    return {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      services: fd.getAll('services').map(String),
      message: String(fd.get('message') || '').trim(),
      budget: String(fd.get('budget') || ''),
      consent: fd.get('consent') === 'yes',
      website: String(fd.get('website') || ''),
      ts: Number(fd.get('ts') || 0),
      source: String(fd.get('source') || ''),
    };
  };

  const validate = (d: ReturnType<typeof read>): Errors => {
    const e: Errors = {};
    if (d.name.length < 2) e.name = 'Escribe tu nombre.';
    if (!EMAIL.test(d.email)) e.email = 'Revisa tu correo, parece incompleto.';
    if (!d.services.length) e.services = 'Elige al menos una opción.';
    if (d.message.length < MESSAGE_MIN) e.message = `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres).`;
    if (d.message.length > MESSAGE_MAX) e.message = `Máximo ${MESSAGE_MAX} caracteres.`;
    if (!d.budget) e.budget = 'Elige un rango (puede ser “Por definir”).';
    if (!d.consent) e.consent = 'Necesitamos tu autorización para responderte.';
    return e;
  };

  const paint = (errors: Errors) => {
    form.querySelectorAll<HTMLElement>('[data-err]').forEach((el) => {
      const k = el.dataset.err as keyof Errors;
      el.textContent = errors[k] || '';
      const field = form.querySelector<HTMLElement>(`input[name="${k}"]:not([type="checkbox"]):not([type="radio"]), textarea[name="${k}"]`);
      if (field) {
        if (errors[k]) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
      }
    });
    const first = Object.keys(errors).find((k) => k !== 'form') as keyof Errors | undefined;
    if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();
    const data = read();
    const errors = validate(data);
    paint(errors);
    if (Object.keys(errors).length) {
      setStatus('Revisa los campos marcados.', 'error');
      return;
    }
    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Enviando…';
    setStatus('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; message?: string };
      if (res.ok && json.ok) {
        form.reset();
        showDone();
      } else {
        if (json.errors) paint(json.errors);
        setStatus(json.message || 'No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.', 'error');
      }
    } catch {
      setStatus('Sin conexión con el servidor. Revisa tu internet o escríbenos por correo.', 'error');
    } finally {
      submit.removeAttribute('aria-busy');
      submitLabel.textContent = 'Enviar solicitud';
    }
  };
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('submit', onSubmit);
    msgEl.removeEventListener('input', onInput);
  };
}
