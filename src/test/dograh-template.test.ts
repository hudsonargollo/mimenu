import { describe, expect, it } from 'vitest';
import {
  defaultSettings,
  normalizeSettings,
  toolNamesFor,
} from '../../shared/dograh/persona';
import { renderConcierge } from '../../shared/dograh/render';
import { buildTenantTools, buildWorkflowDefinition } from '../../shared/dograh/template';
import { TEMPLATE_VERSION } from '../../shared/dograh/template-version';
import type { VenueSnapshot } from '../../shared/dograh/types';

const venue: VenueSnapshot = {
  id: 'venue-jaleo',
  slug: 'jaleo',
  name: 'Jaleo',
  tagline: 'Cocina de autor — Santa Cruz de la Sierra',
  description: 'Tapas, arroces y parrilla de autor.',
  city: 'Santa Cruz de la Sierra',
  address: 'Av. Monseñor Rivero 123',
  phone: '+591 70000000',
  whatsapp: 'https://wa.me/59170000000',
  currency: 'Bs.',
  isActive: true,
  menuUrl: '/jaleo',
  categories: [
    { key: 'tapas', name: 'TAPAS', itemCount: 2 },
    { key: 'pastas', name: 'PASTAS', itemCount: 1 },
  ],
  items: [
    {
      id: 'item-1',
      name: 'Pulpo a la gallega',
      description: 'Pulpo, papa y pimentón',
      price: 120,
      categoryKey: 'tapas',
      categoryName: 'TAPAS',
      available: true,
      featured: true,
      tags: ['mariscos'],
      allergens: ['moluscos'],
      dietary: [],
    },
    {
      id: 'item-2',
      name: 'Pasta sin gluten',
      description: 'Pasta de arroz con verduras',
      price: 90,
      categoryKey: 'pastas',
      categoryName: 'PASTAS',
      available: true,
      featured: false,
      tags: ['vegetariano'],
      allergens: [],
      dietary: ['sin gluten'],
    },
  ],
};

describe('concierge settings', () => {
  it('defaults to disabled and derives contact data from the venue', () => {
    const settings = defaultSettings(venue);
    expect(settings.enabled).toBe(false);
    expect(settings.assistantName).toContain('Jaleo');
    expect(settings.languages).toEqual(['es', 'en', 'pt']);
    expect(settings.reservationEnabled).toBe(true);
    expect(settings.whatsapp).toBe('https://wa.me/59170000000');
  });

  it('bounds untrusted settings instead of failing', () => {
    const settings = normalizeSettings(
      {
        enabled: true,
        languages: ['es', 'fr'] as never,
        hours: [
          { days: 'Lun-Vie', open: '12:00', close: '23:00' },
          { days: 'Sabado', open: 'noon', close: '23:00' },
        ],
        maxPartySize: 99,
        reservationEmail: 'not-an-email',
        whatsapp: '+591 70000001',
        faq: [
          { id: 'Delivery!', question: '¿Hacen delivery?', answer: 'Sí, por WhatsApp.', tags: ['delivery'] },
          { id: 'short', question: 'a', answer: 'b', tags: [] },
        ],
      },
      venue
    );

    expect(settings.enabled).toBe(true);
    expect(settings.languages).toEqual(['es']);
    expect(settings.hours).toHaveLength(1);
    expect(settings.maxPartySize).toBe(50);
    expect(settings.reservationEmail).toBe('');
    expect(settings.whatsapp).toBe('https://wa.me/59170000001');
    expect(settings.faq).toHaveLength(1);
    expect(settings.faq[0].id).toBe('delivery');
  });

  it('prefers a full WhatsApp URL and ignores unusable numbers', () => {
    expect(normalizeSettings({ whatsapp: 'https://wa.me/59171111111' }, venue).whatsapp).toBe(
      'https://wa.me/59171111111'
    );
    expect(normalizeSettings({ whatsapp: '123' }, venue).whatsapp).toBe(venue.whatsapp);
  });
});

describe('concierge render', () => {
  it('renders a tenant-scoped prompt with menu, hours and tool names', () => {
    const settings = normalizeSettings(
      {
        enabled: true,
        assistantName: 'Jaleo Concierge',
        hours: [{ days: 'Lun-Dom', open: '12:00', close: '23:30' }],
        serviceNotes: 'Delivery propio en radio de 5 km.',
        reservationEmail: 'reservas@jaleo.com',
      },
      venue
    );
    const rendered = renderConcierge(venue, settings, { publicBaseUrl: 'https://mimenu.clubemkt.digital' });

    expect(rendered.prompt).toContain('Jaleo Concierge');
    expect(rendered.prompt).toContain('Av. Monseñor Rivero 123');
    expect(rendered.prompt).toContain('TAPAS (tapas)');
    expect(rendered.prompt).toContain('Lun-Dom: 12:00–23:30');
    expect(rendered.prompt).toContain('Delivery propio en radio de 5 km.');
    expect(rendered.prompt).toContain('mm_jaleo_get_menu');
    expect(rendered.prompt).toContain('mm_jaleo_create_reservation');
    expect(rendered.prompt).toContain('https://mimenu.clubemkt.digital/jaleo');
    expect(rendered.prompt).toContain('hasta 12 personas');
    expect(rendered.prompt).not.toContain('Aberdeen Alley');
    expect(rendered.menuUrl).toBe('https://mimenu.clubemkt.digital/jaleo');
  });

  it('disables reservations in the prompt when the tenant turns them off', () => {
    const rendered = renderConcierge(
      venue,
      { reservationEnabled: false },
      { publicBaseUrl: 'https://mimenu.clubemkt.digital' }
    );
    expect(rendered.prompt).toContain('No disponibles por este canal');
  });

  it('keeps the config hash stable across admin edits that do not change behavior', () => {
    const settings = normalizeSettings({ enabled: true, assistantName: 'Jaleo Concierge' }, venue);
    const first = renderConcierge(venue, { ...settings, updatedAt: '2026-11-01T10:00:00.000Z' });
    const second = renderConcierge(venue, { ...settings, updatedAt: '2026-11-03T18:00:00.000Z' });
    const changed = renderConcierge(venue, { ...settings, assistantName: 'Jaleo Bot' });

    expect(first.configHash).toBe(second.configHash);
    expect(first.configHash).not.toBe(changed.configHash);
    expect(first.templateVersion).toBe(TEMPLATE_VERSION);
  });

  it('sanitizes tool names per venue', () => {
    expect(toolNamesFor('Mi Resto!')).toEqual({
      menu: 'mm_mi_resto_get_menu',
      venueInfo: 'mm_mi_resto_get_venue_info',
      faq: 'mm_mi_resto_lookup_faq',
      reservation: 'mm_mi_resto_create_reservation',
    });
  });
});

describe('dograh template', () => {
  const rendered = renderConcierge(venue, { enabled: true }, { publicBaseUrl: 'https://mimenu.clubemkt.digital' });

  it('builds one workflow with the rendered prompt and tool bindings', () => {
    const definition = buildWorkflowDefinition(rendered, ['tool-1', 'tool-2']);
    expect(definition.nodes).toHaveLength(1);
    const node = definition.nodes[0];
    expect(node.type).toBe('startCall');
    expect(node.data.prompt).toBe(rendered.prompt);
    expect(node.data.greeting).toBe(rendered.greeting);
    expect(node.data.greeting_type).toBe('text');
    expect(node.data.tool_uuids).toEqual(['tool-1', 'tool-2']);
    expect(definition.edges).toEqual([]);
  });

  it('builds the four tenant tools with signed-credential references', () => {
    const tools = buildTenantTools(rendered, 'https://mimenu.clubemkt.digital', 'credential-uuid');
    expect(tools.map((tool) => tool.name)).toEqual([
      'mm_jaleo_get_menu',
      'mm_jaleo_get_venue_info',
      'mm_jaleo_lookup_faq',
      'mm_jaleo_create_reservation',
    ]);
    expect(tools[0].definition.config.method).toBe('GET');
    expect(tools[0].definition.config.url).toBe('https://mimenu.clubemkt.digital/api/concierge/menu');
    expect(tools[0].definition.config.credential_uuid).toBe('credential-uuid');
    expect(tools[3].definition.config.method).toBe('POST');
    const required = tools[3].definition.config.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);
    expect(required).toEqual(['name', 'phone', 'party_size', 'date', 'time']);
  });
});
