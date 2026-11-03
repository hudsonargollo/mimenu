/**
 * The single Dograh template, stamped once per tenant.
 *
 * Tools are ordinary Dograh HTTP API tools scoped by a signed tenant token.
 * The workflow only wires the Start Call node to those tools; all tenant
 * variation lives in the rendered prompt and the tool URLs.
 */

import type {
  DograhHttpToolSpec,
  DograhWorkflowDefinition,
  RenderedConcierge,
} from './types.ts';

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}${path}`;
}

export function buildTenantTools(
  rendered: RenderedConcierge,
  publicBaseUrl: string,
  credentialUuid?: string
): DograhHttpToolSpec[] {
  const { venue, toolNames, settings } = rendered;
  const api = joinUrl(publicBaseUrl, '/api/concierge');
  const credential = credentialUuid ? { credential_uuid: credentialUuid } : {};

  return [
    {
      name: toolNames.menu,
      description:
        `Busca platos y precios en la carta de ${venue.name}. Usala antes de responder sobre platos, precios, ` +
        'ingredientes, opciones vegetarianas o recomendaciones. Devuelve categorías y platos con precio y disponibilidad.',
      category: 'http_api',
      definition: {
        type: 'http_api',
        schema_version: 1,
        messages: [],
        config: {
          method: 'GET',
          url: `${api}/menu`,
          ...credential,
          parameters: [
            {
              name: 'query',
              type: 'string',
              required: false,
              description:
                'Texto libre del cliente para buscar en la carta (ej. "pasta", "sin gluten", "carne"). Omitir para ver categorías y destacados.',
            },
            {
              name: 'category',
              type: 'string',
              required: false,
              description: `Clave o nombre de una categoría de la carta. Claves: ${
                venue.categories.map((category) => category.key).join(', ') || 'sin categorías'
              }.`,
            },
            {
              name: 'max_price',
              type: 'number',
              required: false,
              description: `Precio máximo en ${venue.currency}.`,
            },
            {
              name: 'featured_only',
              type: 'boolean',
              required: false,
              description: 'true para devolver solo platos destacados.',
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              description: 'Máximo de platos a devolver (1-50). Por defecto 20.',
            },
          ],
          timeout_ms: 8000,
        },
      },
    },
    {
      name: toolNames.venueInfo,
      description:
        `Devuelve dirección, teléfono, WhatsApp, horarios, servicios y enlace a la carta de ${venue.name}. ` +
        'Usala para preguntas de ubicación, horarios o contacto.',
      category: 'http_api',
      definition: {
        type: 'http_api',
        schema_version: 1,
        messages: [],
        config: {
          method: 'GET',
          url: `${api}/venue-info`,
          ...credential,
          parameters: [],
          timeout_ms: 8000,
        },
      },
    },
    {
      name: toolNames.faq,
      description:
        `Busca respuestas aprobadas por ${venue.name} sobre políticas y servicios (delivery, pagos, eventos, ` +
        'mascotas, estacionamiento). Usala antes de decir que no sabés algo.',
      category: 'http_api',
      definition: {
        type: 'http_api',
        schema_version: 1,
        messages: [],
        config: {
          method: 'GET',
          url: `${api}/faq`,
          ...credential,
          parameters: [
            {
              name: 'query',
              type: 'string',
              required: true,
              description: 'La pregunta del cliente, tal como la hizo.',
            },
          ],
          timeout_ms: 8000,
        },
      },
    },
    {
      name: toolNames.reservation,
      description:
        `Registra una solicitud de reserva en ${venue.name}. Usala solo cuando ya tenés nombre, teléfono, ` +
        'cantidad de personas, fecha (YYYY-MM-DD) y hora (HH:MM) confirmados por el cliente. ' +
        'La reserva queda pendiente de confirmación del local.',
      category: 'http_api',
      definition: {
        type: 'http_api',
        schema_version: 1,
        messages: [],
        config: {
          method: 'POST',
          url: `${api}/reservations`,
          ...credential,
          parameters: [
            {
              name: 'name',
              type: 'string',
              required: true,
              description: 'Nombre completo de la persona que reserva.',
            },
            {
              name: 'phone',
              type: 'string',
              required: true,
              description: 'Teléfono de contacto del cliente, con código de país si lo dio.',
            },
            {
              name: 'party_size',
              type: 'number',
              required: true,
              description: `Cantidad de personas (1-${settings.maxPartySize}).`,
            },
            {
              name: 'date',
              type: 'string',
              required: true,
              description: 'Fecha de la reserva en formato YYYY-MM-DD.',
            },
            {
              name: 'time',
              type: 'string',
              required: true,
              description: 'Hora de la reserva en formato HH:MM (24 horas).',
            },
            {
              name: 'notes',
              type: 'string',
              required: false,
              description: 'Pedidos especiales, alergias o comentarios del cliente.',
            },
            {
              name: 'lang',
              type: 'string',
              required: false,
              description: 'Idioma de la conversación: es, en o pt. Por defecto es.',
            },
          ],
          timeout_ms: 10000,
        },
      },
    },
  ];
}

export function buildWorkflowDefinition(
  rendered: RenderedConcierge,
  toolUuids: string[]
): DograhWorkflowDefinition {
  return {
    nodes: [
      {
        id: 'start',
        type: 'startCall',
        position: { x: 0, y: 0 },
        data: {
          name: 'Inicio',
          is_start: true,
          greeting_type: 'text',
          greeting: rendered.greeting,
          prompt: rendered.prompt,
          allow_interrupt: true,
          allow_greeting_interrupt: true,
          add_global_prompt: false,
          delayed_start: false,
          delayed_start_duration: 2,
          extraction_enabled: false,
          tool_uuids: toolUuids,
        },
      },
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}
