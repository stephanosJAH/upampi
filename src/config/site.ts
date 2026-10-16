/**
 * Datos editables del sitio. Todo lo marcado con `EDITAR` es un placeholder
 * que debe confirmarse antes de publicar.
 */
export const SITE = {
  name: 'UPAMPI',
  tagline: 'Smart Software',
  url: 'https://upampi.com',
  locale: 'es_419',
  lang: 'es',
  description:
    'UPAMPI diseña software a la medida, automatizaciones e inteligencia artificial práctica para pymes, negocios independientes y profesionales. Menos trabajo manual, más tiempo para lo importante.',
  /** EDITAR: correo público de contacto. */
  email: 'hola@upampi.com',
  /**
   * EDITAR: URL de agenda (Cal.com, Calendly, Google Calendar…).
   * Mientras no exista, apunta al formulario con el tipo "llamada" preseleccionado.
   */
  bookingUrl: '/contacto?tipo=llamada',
  /** EDITAR: promesa de tiempo de respuesta que se muestra junto al formulario. */
  replyTime: 'Respondemos en menos de 2 días hábiles.',
  /** EDITAR: perfiles sociales reales (o vaciar la lista). */
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/upampi' },
    { label: 'Instagram', href: 'https://www.instagram.com/upampi' },
    { label: 'GitHub', href: 'https://github.com/upampi' },
  ],
} as const;

export const NAV = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'IA', href: '/#ia' },
  { label: 'Proceso', href: '/#proceso' },
  { label: 'Soluciones', href: '/soluciones' },
  { label: 'Contacto', href: '/contacto' },
] as const;
