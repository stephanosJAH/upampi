export type ServiceIcon = 'transform' | 'custom' | 'automation' | 'ai' | 'apps' | 'data';

export interface Service {
  slug: string;
  index: string;
  title: string;
  /** Palabra corta para la secuencia de palabras gigantes. */
  word: string;
  icon: ServiceIcon;
  short: string;
  lead: string;
  problems: string[];
  includes: { title: string; text: string }[];
  example: { label: string; text: string };
  start: string;
}

export const services: Service[] = [
  {
    slug: 'transformacion-digital',
    index: '01',
    title: 'Transformación digital',
    word: 'Digitaliza',
    icon: 'transform',
    short: 'Pasamos tus procesos de papel, correo y hojas sueltas a un sistema claro que todo tu equipo entiende.',
    lead: 'Antes de escribir una línea de código, entendemos cómo trabaja tu negocio hoy. Luego ordenamos el proceso y lo llevamos a herramientas digitales que tu equipo realmente va a usar.',
    problems: [
      'La información vive en cuadernos, chats y archivos con nombres como “final_final2.xlsx”.',
      'Cada persona hace la misma tarea de una forma distinta.',
      'Saber cómo va el negocio requiere preguntar a tres personas.',
    ],
    includes: [
      { title: 'Mapa del proceso actual', text: 'Documentamos paso a paso cómo se hace hoy, dónde se pierde tiempo y dónde aparecen errores.' },
      { title: 'Diseño del proceso digital', text: 'Proponemos el flujo nuevo: qué se automatiza, qué se simplifica y qué se queda igual.' },
      { title: 'Herramientas adecuadas', text: 'Elegimos entre software existente, configuración o desarrollo a la medida, según lo que más te convenga.' },
      { title: 'Adopción del equipo', text: 'Capacitación práctica y guías cortas para que el cambio se quede.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Un taller que registra órdenes de servicio en papel pasa a un formulario en tablet: la orden llega al técnico, el cliente recibe avisos y el dueño ve el estado de todo en una pantalla.',
    },
    start: 'Empezamos con un diagnóstico de tus procesos principales y te entregamos un mapa con prioridades.',
  },
  {
    slug: 'software-a-la-medida',
    index: '02',
    title: 'Software a la medida',
    word: 'Construye',
    icon: 'custom',
    short: 'Herramientas internas, portales y sistemas diseñados exactamente para cómo opera tu negocio.',
    lead: 'Cuando ninguna aplicación del mercado encaja, construimos la tuya: simple, segura y pensada para crecer contigo.',
    problems: [
      'Pagas varias suscripciones que solo cubren una parte de lo que necesitas.',
      'Tu operación tiene reglas propias que ningún software genérico entiende.',
      'Tu equipo usa trucos y parches para que el sistema actual funcione.',
    ],
    includes: [
      { title: 'Herramientas internas', text: 'Paneles de operación, inventarios, cotizadores, control de pedidos y más.' },
      { title: 'Portales para clientes', text: 'Que tus clientes consulten, pidan y paguen sin llamarte.' },
      { title: 'Arquitectura que crece', text: 'Código mantenible, documentado y con respaldo de datos desde el día uno.' },
      { title: 'El código es tuyo', text: 'Entregamos el código fuente y los accesos. Sin dependencias ocultas.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Una distribuidora reemplaza tres hojas de cálculo y un grupo de chat por un sistema de pedidos donde cada vendedor ve stock real y precios vigentes.',
    },
    start: 'Definimos juntos la primera versión útil: la más pequeña que ya resuelve el problema principal.',
  },
  {
    slug: 'automatizacion-e-integraciones',
    index: '03',
    title: 'Automatización e integraciones',
    word: 'Automatiza',
    icon: 'automation',
    short: 'Conectamos tus herramientas para que los datos fluyan solos y las tareas repetitivas desaparezcan.',
    lead: 'Copiar datos de un sistema a otro no debería ser el trabajo de nadie. Conectamos lo que ya usas y automatizamos el resto.',
    problems: [
      'Alguien pasa horas copiando pedidos del correo al sistema.',
      'Las ventas, la facturación y el inventario no se hablan entre sí.',
      'Los recordatorios y seguimientos dependen de la memoria de alguien.',
    ],
    includes: [
      { title: 'Integración entre sistemas', text: 'Tienda en línea, facturación, CRM, hojas de cálculo, WhatsApp, correo y ERP.' },
      { title: 'Flujos automáticos', text: 'Disparadores, aprobaciones, avisos y reportes que se envían solos.' },
      { title: 'Monitoreo', text: 'Si algo falla, te enteras antes que tus clientes.' },
      { title: 'Documentación clara', text: 'Cada automatización queda explicada en lenguaje simple.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Una tienda en línea que, al confirmar un pago, genera la factura, descuenta inventario, avisa a bodega y envía el número de guía al cliente, sin intervención manual.',
    },
    start: 'Identificamos las tres tareas repetitivas que más tiempo le quitan a tu equipo y empezamos por ahí.',
  },
  {
    slug: 'implementacion-de-ia',
    index: '04',
    title: 'Implementación de IA',
    word: 'Entiende',
    icon: 'ai',
    short: 'Asistentes, lectura de documentos y agentes conectados a tus herramientas. IA práctica, no humo.',
    lead: 'La inteligencia artificial es útil cuando resuelve un problema concreto. La integramos en tus procesos con reglas claras, supervisión humana y datos protegidos.',
    problems: [
      'Tu equipo responde todos los días las mismas preguntas de clientes.',
      'Leer facturas, contratos o formularios y capturarlos toma horas.',
      'Tienes datos, pero nadie tiene tiempo de analizarlos.',
    ],
    includes: [
      { title: 'Asistentes y chatbots', text: 'En tu web o WhatsApp, entrenados con la información de tu negocio y con paso a una persona cuando hace falta.' },
      { title: 'Procesamiento de documentos', text: 'Extraemos datos de facturas, órdenes y formularios y los llevamos a tu sistema.' },
      { title: 'Agentes conectados', text: 'IA que consulta tu inventario, agenda o CRM y ejecuta tareas acotadas con tu aprobación.' },
      { title: 'Análisis de datos', text: 'Resúmenes y alertas en lenguaje natural sobre lo que está pasando en tu negocio.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Un despacho contable recibe facturas por correo; la IA las lee, extrae datos fiscales, montos y fechas, y las deja listas para revisión en su sistema. El contador solo valida.',
    },
    start: 'Probamos la idea con un piloto acotado y medimos si realmente ahorra tiempo antes de escalarla.',
  },
  {
    slug: 'apps-web-y-moviles',
    index: '05',
    title: 'Apps web y móviles',
    word: 'Conecta',
    icon: 'apps',
    short: 'Aplicaciones rápidas y claras para tu equipo o tus clientes, en el navegador o en el teléfono.',
    lead: 'Diseñamos y desarrollamos aplicaciones que se sienten simples de usar, aunque por dentro resuelvan algo complejo.',
    problems: [
      'Tus clientes te piden reservar, pedir o pagar en línea y hoy no pueden.',
      'Tu equipo en campo reporta por fotos y mensajes sueltos.',
      'Tu sitio actual no convierte visitas en clientes.',
    ],
    includes: [
      { title: 'Diseño de experiencia', text: 'Pantallas pensadas para tus usuarios reales, probadas antes de programar.' },
      { title: 'Web y móvil', text: 'Aplicaciones web progresivas o nativas, según lo que tu caso necesite.' },
      { title: 'Reservas, pedidos y pagos', text: 'Flujos completos conectados con tus sistemas.' },
      { title: 'Rendimiento y accesibilidad', text: 'Rápidas en cualquier conexión y usables por todas las personas.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Un estudio de entrenamiento lanza una app donde sus alumnos reservan clases, pagan su mensualidad y reciben recordatorios; el estudio deja de gestionar la agenda por chat.',
    },
    start: 'Prototipamos las pantallas clave en pocos días para validarlas contigo y con usuarios reales.',
  },
  {
    slug: 'dashboards-y-datos',
    index: '06',
    title: 'Dashboards y datos',
    word: 'Decide',
    icon: 'data',
    short: 'Tableros claros con los números que importan, actualizados solos, para decidir con datos y no con corazonadas.',
    lead: 'Unificamos la información que hoy está dispersa y la convertimos en tableros que responden tus preguntas de negocio.',
    problems: [
      'Armar el reporte mensual toma días y llega tarde.',
      'Cada área tiene su propia versión de los números.',
      'No sabes qué producto, cliente o sucursal es realmente rentable.',
    ],
    includes: [
      { title: 'Unificación de datos', text: 'Conectamos ventas, inventario, finanzas y operación en una sola fuente.' },
      { title: 'Tableros a la medida', text: 'Indicadores que tú defines, con filtros simples y acceso desde el celular.' },
      { title: 'Alertas', text: 'Avisos automáticos cuando un número sale de lo esperado.' },
      { title: 'Preguntas en lenguaje natural', text: 'Opcionalmente, consulta tus datos escribiendo como hablas.' },
    ],
    example: {
      label: 'Ejemplo ilustrativo',
      text: 'Una cadena de cafeterías ve ventas por sucursal y por hora en un tablero; descubre qué horarios necesitan más personal y cuáles productos conviene retirar.',
    },
    start: 'Definimos las cinco preguntas que más te importan y construimos el primer tablero para responderlas.',
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
