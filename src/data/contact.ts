/** Shared between the form (client) and the endpoint (server validation). */
export const SERVICE_OPTIONS = [
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'transformacion', label: 'Transformación digital' },
  { id: 'software', label: 'Software a la medida' },
  { id: 'automatizacion', label: 'Automatización e integraciones' },
  { id: 'ia', label: 'Implementación de IA' },
  { id: 'apps', label: 'Apps web y móviles' },
  { id: 'datos', label: 'Dashboards y datos' },
  { id: 'llamada', label: 'Llamada de 30 min' },
  { id: 'no-se', label: 'Aún no lo sé' },
] as const;

export const BUDGET_OPTIONS = [
  { id: 'por-definir', label: 'Por definir' },
  { id: 'menos-2k', label: 'Menos de US$2,000' },
  { id: '2k-5k', label: 'US$2,000 – 5,000' },
  { id: '5k-15k', label: 'US$5,000 – 15,000' },
  { id: 'mas-15k', label: 'Más de US$15,000' },
] as const;

export const MESSAGE_MIN = 40;
export const MESSAGE_MAX = 4000;
/** Minimum seconds between rendering the form and submitting it. */
export const MIN_FILL_SECONDS = 3;

/** Maps detail-page CTAs (?servicio=slug) to form chips. */
export const SERVICE_SLUG_TO_OPTION: Record<string, string> = {
  'transformacion-digital': 'transformacion',
  'software-a-la-medida': 'software',
  'automatizacion-e-integraciones': 'automatizacion',
  'implementacion-de-ia': 'ia',
  'apps-web-y-moviles': 'apps',
  'dashboards-y-datos': 'datos',
};
