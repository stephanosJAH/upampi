export const manifesto =
  'En UPAMPI convertimos el trabajo manual de tu negocio en software que piensa contigo. Ordenamos lo que hoy vive en papeles, chats y hojas de cálculo, lo conectamos y le sumamos inteligencia artificial donde de verdad ayuda. Tú recuperas tiempo. Tu equipo trabaja con calma. Tus decisiones dejan de ser corazonadas.';

export const facts = [
  {
    kicker: 'Para empezar',
    title: 'Diagnóstico inicial sin costo',
    text: 'Revisamos tus procesos y te decimos con honestidad qué conviene automatizar y qué no.',
  },
  {
    kicker: 'Propiedad',
    title: 'Tuyo.',
    text: 'El código, los accesos y los datos son tuyos. Siempre.',
  },
  {
    kicker: 'Ritmo',
    title: 'Entregas por etapas',
    text: 'Ves avances funcionando desde las primeras semanas, no una promesa al final.',
  },
];

export const capabilities = [
  'TypeScript',
  'Python',
  'Node.js',
  'PostgreSQL',
  'Modelos de lenguaje (LLM)',
  'APIs REST',
  'WhatsApp Business API',
  'Automatización de flujos',
  'Apps web progresivas',
  'Nube y respaldos',
];

export const audience = [
  {
    who: 'Pymes',
    benefit: 'Menos trabajo manual',
    text: 'Las tareas repetitivas pasan a hacerse solas. Tu equipo se enfoca en atender, vender y mejorar.',
    example: 'Ejemplo: una ferretería que deja de capturar pedidos a mano.',
  },
  {
    who: 'Negocios independientes',
    benefit: 'Menos errores',
    text: 'Los datos se capturan una sola vez y viajan solos entre tus herramientas. Se acabó copiar y pegar.',
    example: 'Ejemplo: una tienda en línea cuyo inventario ya no se desfasa.',
  },
  {
    who: 'Profesionales',
    benefit: 'Más tiempo',
    text: 'Agenda, recordatorios, cotizaciones y seguimiento funcionando mientras tú trabajas en lo tuyo.',
    example: 'Ejemplo: una nutrióloga cuyas citas se confirman sin llamadas.',
  },
  {
    who: 'Equipos directivos',
    benefit: 'Mejores decisiones',
    text: 'Los números importantes en una pantalla, al día, explicados en lenguaje claro.',
    example: 'Ejemplo: una distribuidora que ve su cobranza en tiempo real.',
  },
];

export const steps = [
  {
    name: 'Diagnóstico',
    title: 'Entendemos tu negocio antes de proponer nada.',
    text: 'Conversamos contigo y con tu equipo, observamos cómo se trabaja hoy y detectamos dónde se pierde tiempo o dinero. Sales con un mapa de oportunidades priorizado, aunque decidas no trabajar con nosotros.',
    deliverable: 'Mapa de procesos y oportunidades',
  },
  {
    name: 'Diseño',
    title: 'Dibujamos la solución contigo, pantalla por pantalla.',
    text: 'Definimos el alcance de la primera versión, diseñamos el flujo y las pantallas, y las validamos con quienes las van a usar. Acordamos tiempos y costos claros por etapa.',
    deliverable: 'Prototipo navegable y plan por etapas',
  },
  {
    name: 'Desarrollo',
    title: 'Construimos en entregas cortas que puedes probar.',
    text: 'Trabajamos por etapas. En cada una ves funcionalidad real, das retroalimentación y ajustamos el rumbo. Sin cajas negras: tienes acceso al avance en todo momento.',
    deliverable: 'Software funcionando, etapa por etapa',
  },
  {
    name: 'Implementación',
    title: 'Lo ponemos a trabajar en tu operación real.',
    text: 'Migramos datos, conectamos tus herramientas, capacitamos a tu equipo y acompañamos los primeros días de uso para que el cambio sea tranquilo.',
    deliverable: 'Sistema en producción y equipo capacitado',
  },
  {
    name: 'Acompañamiento',
    title: 'Seguimos contigo mientras tu negocio crece.',
    text: 'Monitoreo, mejoras continuas y soporte. Medimos si la solución está cumpliendo su objetivo y proponemos el siguiente paso cuando tenga sentido.',
    deliverable: 'Soporte, mejoras y nuevas etapas',
  },
];

export const faqs = [
  {
    q: '¿Cuánto cuesta un proyecto?',
    a: 'Depende del alcance, por eso empezamos con un diagnóstico sin costo. Después te entregamos una propuesta por etapas con precio cerrado para cada una, así decides cuánto invertir y cuándo. Muchas veces la primera etapa es pequeña y ya genera ahorro.',
  },
  {
    q: '¿Cuánto tiempo toma?',
    a: 'Las automatizaciones acotadas suelen estar listas en pocas semanas; un sistema a la medida se construye en varias etapas. En la propuesta verás un calendario concreto para tu caso, y desde la primera etapa tendrás algo funcionando.',
  },
  {
    q: '¿Necesito saber de tecnología?',
    a: 'No. Tú conoces tu negocio y nosotros traducimos eso a software. Explicamos todo en lenguaje simple, sin tecnicismos, y capacitamos a tu equipo para que use las herramientas con confianza.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Trabajamos con accesos controlados, cifrado, respaldos y el mínimo de datos necesario. Cuando usamos IA, elegimos proveedores y configuraciones que no usan tu información para entrenar modelos, y te explicamos dónde se guarda cada dato.',
  },
  {
    q: '¿Qué hace la IA en la práctica?',
    a: 'Cosas concretas: responder preguntas frecuentes, leer documentos y extraer datos, clasificar solicitudes, redactar borradores, resumir información y detectar anomalías. Siempre con reglas claras y una persona supervisando las decisiones importantes.',
  },
  {
    q: '¿Puedo usar lo que ya tengo?',
    a: 'Sí, y casi siempre es lo recomendable. Integramos tus hojas de cálculo, tu sistema de facturación, tu tienda en línea o tu CRM antes de proponer reemplazar algo.',
  },
  {
    q: '¿Qué pasa después de la entrega?',
    a: 'El código y los datos son tuyos. Puedes seguir con nosotros con un plan de acompañamiento o llevarte todo a otro equipo, con documentación incluida.',
  },
];

export const aiFlow = {
  inputs: ['Documentos', 'Mensajes', 'Ventas', 'Inventario', 'Agenda', 'Correos'],
  outputs: ['Reportes', 'Respuestas', 'Alertas', 'Tableros', 'Citas', 'Registros'],
  steps: [
    { k: 'Entra', t: 'Lo que hoy llega desordenado: facturas, chats, pedidos, hojas de cálculo.' },
    { k: 'Entiende', t: 'La IA lee, clasifica y extrae lo importante con reglas que tú defines.' },
    { k: 'Sale', t: 'Respuestas, registros, alertas y tableros. Listo para decidir.' },
  ],
};
