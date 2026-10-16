export type SolutionCategory = 'automatizacion' | 'ia' | 'web-apps' | 'integraciones';

export const categories: { id: SolutionCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'automatizacion', label: 'Automatización' },
  { id: 'ia', label: 'IA' },
  { id: 'web-apps', label: 'Web & Apps' },
  { id: 'integraciones', label: 'Integraciones' },
];

export type ArtVariant =
  | 'shelves'
  | 'calendar'
  | 'orders'
  | 'scan'
  | 'routes'
  | 'campus'
  | 'quote'
  | 'board';

export interface Solution {
  slug: string;
  num: string;
  industry: string;
  title: string;
  /** Una línea para la tarjeta. */
  line: string;
  categories: SolutionCategory[];
  art: ArtVariant;
  /** Tono de la ilustración: oscuro o claro, para variar el ritmo del índice. */
  tone: 'dark' | 'light' | 'signal';
  scenario: string;
  before: string[];
  after: string[];
  flow: { step: string; text: string }[];
  stack: string[];
  services: string[];
}

export const solutions: Solution[] = [
  {
    slug: 'inventario-que-se-repone-solo',
    num: '01',
    industry: 'Retail',
    title: 'Inventario que se repone solo',
    line: 'Stock sincronizado entre tienda física y en línea, con pedidos sugeridos al proveedor.',
    categories: ['automatizacion', 'integraciones'],
    art: 'shelves',
    tone: 'dark',
    scenario:
      'Ejemplo: una tienda de artículos para el hogar vende en mostrador y en línea. El inventario se cuadra a mano cada semana y, a veces, vende productos que ya no tiene.',
    before: [
      'Conteos manuales y diferencias entre sistemas.',
      'Ventas en línea de productos agotados.',
      'Pedidos al proveedor “a ojo”.',
    ],
    after: [
      'Un solo inventario para todos los canales, actualizado en cada venta.',
      'Alertas de stock bajo por producto y sucursal.',
      'Borrador de pedido al proveedor listo para aprobar.',
    ],
    flow: [
      { step: 'Venta', text: 'Cada venta en mostrador o en línea descuenta del mismo inventario.' },
      { step: 'Umbral', text: 'Cuando un producto baja de su mínimo, se genera una alerta.' },
      { step: 'Sugerencia', text: 'El sistema propone cantidades según el ritmo de ventas reciente.' },
      { step: 'Aprobación', text: 'El encargado revisa, ajusta y envía el pedido con un clic.' },
    ],
    stack: ['Punto de venta', 'Tienda en línea', 'Base de datos central', 'Correo al proveedor'],
    services: ['automatizacion-e-integraciones', 'dashboards-y-datos'],
  },
  {
    slug: 'agenda-clinica-sin-ausencias',
    num: '02',
    industry: 'Clínicas',
    title: 'Agenda clínica que confirma sola',
    line: 'Reservas en línea, recordatorios por WhatsApp y reprogramación sin llamadas.',
    categories: ['automatizacion', 'web-apps'],
    art: 'calendar',
    tone: 'light',
    scenario:
      'Ejemplo: una clínica dental con tres consultorios gestiona su agenda por teléfono. Recepción pasa buena parte del día confirmando citas.',
    before: [
      'Llamadas de confirmación una por una.',
      'Huecos en la agenda por pacientes que no llegan.',
      'Historias clínicas en carpetas físicas.',
    ],
    after: [
      'El paciente reserva en línea según disponibilidad real.',
      'Recordatorio automático con opción de confirmar o reprogramar.',
      'Los espacios liberados se ofrecen a la lista de espera.',
    ],
    flow: [
      { step: 'Reserva', text: 'El paciente elige servicio, profesional y horario disponible.' },
      { step: 'Recordatorio', text: 'Mensajes automáticos antes de la cita con botones de respuesta.' },
      { step: 'Reprogramación', text: 'Si cancela, el espacio se libera y se avisa a la lista de espera.' },
      { step: 'Seguimiento', text: 'Tras la cita, indicaciones y próxima visita sugerida.' },
    ],
    stack: ['Agenda web', 'WhatsApp Business', 'Expediente digital', 'Panel de recepción'],
    services: ['apps-web-y-moviles', 'automatizacion-e-integraciones'],
  },
  {
    slug: 'pedidos-por-whatsapp-a-cocina',
    num: '03',
    industry: 'Restaurantes',
    title: 'Pedidos de WhatsApp directo a cocina',
    line: 'Un asistente toma el pedido, confirma el total y lo envía a la pantalla de cocina.',
    categories: ['ia', 'integraciones'],
    art: 'orders',
    tone: 'signal',
    scenario:
      'Ejemplo: un restaurante recibe pedidos a domicilio por WhatsApp. En hora pico los mensajes se acumulan y algunos pedidos se transcriben mal.',
    before: [
      'Mensajes sin responder en hora pico.',
      'Pedidos copiados a mano en comandas.',
      'Errores en direcciones y totales.',
    ],
    after: [
      'Un asistente responde al instante con el menú vigente.',
      'El pedido confirmado llega ordenado a la pantalla de cocina.',
      'El cliente recibe avisos de preparación y envío.',
    ],
    flow: [
      { step: 'Conversación', text: 'El asistente entiende el pedido escrito como habla el cliente.' },
      { step: 'Confirmación', text: 'Resume productos, extras, dirección y total para aprobar.' },
      { step: 'Cocina', text: 'La comanda aparece en la pantalla de cocina por orden de llegada.' },
      { step: 'Entrega', text: 'Avisos automáticos de estado hasta que el pedido llega.' },
    ],
    stack: ['WhatsApp Business API', 'Modelo de lenguaje', 'Pantalla de cocina', 'Menú centralizado'],
    services: ['implementacion-de-ia', 'automatizacion-e-integraciones'],
  },
  {
    slug: 'facturas-leidas-por-ia',
    num: '04',
    industry: 'Servicios profesionales',
    title: 'Facturas que se capturan solas',
    line: 'La IA lee facturas y comprobantes, extrae los datos y los deja listos para revisión.',
    categories: ['ia', 'automatizacion'],
    art: 'scan',
    tone: 'dark',
    scenario:
      'Ejemplo: un despacho contable recibe cientos de comprobantes de sus clientes por correo cada mes y los captura manualmente.',
    before: [
      'Captura manual de cada comprobante.',
      'Errores de dedo en montos y fechas.',
      'Cierres de mes contrarreloj.',
    ],
    after: [
      'Los comprobantes se leen al llegar al correo.',
      'Los datos extraídos se validan contra reglas del despacho.',
      'El contador revisa y aprueba en lugar de capturar.',
    ],
    flow: [
      { step: 'Recepción', text: 'Un buzón dedicado recibe PDF, fotos y XML.' },
      { step: 'Lectura', text: 'La IA identifica emisor, conceptos, impuestos, montos y fechas.' },
      { step: 'Validación', text: 'Reglas automáticas marcan lo que necesita revisión humana.' },
      { step: 'Registro', text: 'Lo aprobado se envía al sistema contable del despacho.' },
    ],
    stack: ['Correo', 'Lectura de documentos con IA', 'Reglas de validación', 'Sistema contable'],
    services: ['implementacion-de-ia', 'automatizacion-e-integraciones'],
  },
  {
    slug: 'rutas-y-entregas-en-tiempo-real',
    num: '05',
    industry: 'Logística',
    title: 'Entregas visibles en tiempo real',
    line: 'Rutas del día, evidencia de entrega desde el teléfono y avisos al cliente.',
    categories: ['web-apps', 'integraciones'],
    art: 'routes',
    tone: 'light',
    scenario:
      'Ejemplo: una empresa de mensajería local coordina a sus repartidores por llamadas y recibe evidencias de entrega como fotos en un chat.',
    before: [
      'Rutas armadas a mano cada mañana.',
      'Clientes llamando para saber “dónde viene”.',
      'Evidencias perdidas entre cientos de fotos.',
    ],
    after: [
      'Rutas sugeridas según direcciones y ventanas de entrega.',
      'Enlace de seguimiento para cada cliente.',
      'Firma y foto guardadas con cada entrega.',
    ],
    flow: [
      { step: 'Planeación', text: 'Las entregas del día se agrupan en rutas sugeridas.' },
      { step: 'App del repartidor', text: 'Lista ordenada, navegación y botón de entregado.' },
      { step: 'Evidencia', text: 'Foto y firma quedan ligadas al pedido automáticamente.' },
      { step: 'Aviso', text: 'El cliente recibe la confirmación al momento.' },
    ],
    stack: ['App móvil', 'Mapas', 'Panel de despacho', 'Notificaciones'],
    services: ['apps-web-y-moviles', 'automatizacion-e-integraciones'],
  },
  {
    slug: 'asistente-para-alumnos',
    num: '06',
    industry: 'Educación',
    title: 'Un asistente para cada alumno',
    line: 'Respuestas sobre horarios, pagos y trámites a cualquier hora, con paso a una persona.',
    categories: ['ia', 'web-apps'],
    art: 'campus',
    tone: 'dark',
    scenario:
      'Ejemplo: una escuela de idiomas recibe las mismas preguntas sobre horarios, inscripciones y pagos por todos sus canales.',
    before: [
      'Preguntas repetidas en redes, correo y teléfono.',
      'Inscripciones con formularios en papel.',
      'Seguimiento de pagos en una hoja de cálculo.',
    ],
    after: [
      'Un asistente responde con información oficial y actualizada.',
      'Inscripción y pago en línea en pocos pasos.',
      'Casos especiales derivados a una persona con todo el contexto.',
    ],
    flow: [
      { step: 'Base de conocimiento', text: 'Reglamentos, horarios y precios en un solo lugar editable.' },
      { step: 'Asistente', text: 'Responde en web y WhatsApp citando la información oficial.' },
      { step: 'Trámites', text: 'Inscripciones y pagos guiados dentro de la conversación.' },
      { step: 'Escalamiento', text: 'Si no sabe, transfiere a una persona sin que el alumno repita nada.' },
    ],
    stack: ['Modelo de lenguaje', 'Base de conocimiento', 'Pasarela de pagos', 'Portal del alumno'],
    services: ['implementacion-de-ia', 'apps-web-y-moviles'],
  },
  {
    slug: 'cotizador-en-linea',
    num: '07',
    industry: 'Manufactura',
    title: 'Cotizaciones en minutos, no en días',
    line: 'Un cotizador que aplica tus reglas de precios y genera la propuesta en PDF.',
    categories: ['web-apps', 'automatizacion'],
    art: 'quote',
    tone: 'signal',
    scenario:
      'Ejemplo: un taller de carpintería a la medida arma cada cotización en una hoja de cálculo compleja que solo entiende una persona.',
    before: [
      'Cotizaciones que dependen de una sola persona.',
      'Precios desactualizados de materiales.',
      'Propuestas con formato distinto cada vez.',
    ],
    after: [
      'Cualquier vendedor cotiza con las mismas reglas.',
      'Costos de materiales centralizados y actualizables.',
      'Propuesta en PDF con tu marca, lista para enviar.',
    ],
    flow: [
      { step: 'Configuración', text: 'Medidas, materiales y acabados en un formulario guiado.' },
      { step: 'Reglas', text: 'Se aplican márgenes, mermas y tiempos de producción.' },
      { step: 'Propuesta', text: 'Se genera un PDF con desglose y condiciones.' },
      { step: 'Seguimiento', text: 'La cotización queda registrada para darle seguimiento.' },
    ],
    stack: ['Aplicación web', 'Motor de reglas', 'Generador de PDF', 'CRM'],
    services: ['software-a-la-medida', 'automatizacion-e-integraciones'],
  },
  {
    slug: 'tablero-de-direccion',
    num: '08',
    industry: 'Distribución',
    title: 'El negocio completo en una pantalla',
    line: 'Ventas, cobranza e inventario unificados en un tablero que se actualiza solo.',
    categories: ['integraciones', 'ia'],
    art: 'board',
    tone: 'light',
    scenario:
      'Ejemplo: una distribuidora de abarrotes arma su reporte semanal juntando datos de cuatro fuentes distintas.',
    before: [
      'Reportes manuales que llegan tarde.',
      'Cifras distintas según quién las calcule.',
      'Cuentas por cobrar vencidas sin detectar.',
    ],
    after: [
      'Indicadores clave actualizados automáticamente.',
      'Alertas de cobranza y de márgenes fuera de rango.',
      'Resumen semanal en lenguaje claro generado con IA.',
    ],
    flow: [
      { step: 'Conexión', text: 'Se integran ventas, facturación, inventario y bancos.' },
      { step: 'Modelo', text: 'Los datos se limpian y se calculan los indicadores acordados.' },
      { step: 'Tablero', text: 'Vistas por sucursal, vendedor y producto, también en el celular.' },
      { step: 'Resumen', text: 'Cada lunes llega un resumen con lo que cambió y por qué.' },
    ],
    stack: ['Integraciones', 'Almacén de datos', 'Tablero web', 'Resúmenes con IA'],
    services: ['dashboards-y-datos', 'implementacion-de-ia'],
  },
];

export const getSolution = (slug: string) => solutions.find((s) => s.slug === slug);
export const categoryLabel = (id: SolutionCategory) =>
  categories.find((c) => c.id === id)?.label ?? id;
