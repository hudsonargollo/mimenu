import { describe, it, expect } from 'vitest';
import {
  SALES_EMAIL,
  SALES_WHATSAPP,
  buildUpgradeMailtoUrl,
  buildUpgradeMessage,
  buildUpgradeWhatsAppUrl,
} from '../salesContact';

describe('salesContact', () => {
  it('names the venue and both plans in the WhatsApp message', () => {
    const message = buildUpgradeMessage({
      venueName: '4 Llamas Café',
      venueSlug: '4-llamas-cafe',
      currentPlanName: 'Basic',
      targetPlanName: 'Pro',
      featureLabel: 'KDS y operación de cocina',
    });

    expect(message).toContain('4 Llamas Café (4-llamas-cafe)');
    expect(message).toContain('del plan Basic al plan Pro');
    expect(message).toContain('KDS y operación de cocina');
  });

  it('does not repeat the name when no display name is available', () => {
    const message = buildUpgradeMessage({ venueSlug: 'some-cafe', currentPlanName: 'Basic' });

    expect(message).toContain('soy some-cafe');
    expect(message).not.toContain('some-cafe (some-cafe)');
    expect(message).toContain('mejorar mi plan Basic');
  });

  it('builds an encoded WhatsApp deep link to the sales number', () => {
    const url = buildUpgradeWhatsAppUrl({
      venueName: '4 Llamas Café',
      venueSlug: '4-llamas-cafe',
      currentPlanName: 'Basic',
      targetPlanName: 'Premium',
    });

    expect(url.startsWith(`https://wa.me/${SALES_WHATSAPP}?text=`)).toBe(true);
    expect(url).toContain('4%20Llamas%20Caf%C3%A9');
    expect(url).toContain('Premium');
  });

  it('builds an encoded mailto with a plan-specific subject', () => {
    const url = buildUpgradeMailtoUrl({
      venueSlug: 'jaleo',
      currentPlanName: 'Pro',
      targetPlanName: 'Custom',
    });

    expect(url.startsWith(`mailto:${SALES_EMAIL}?subject=`)).toBe(true);
    expect(decodeURIComponent(url)).toContain('subject=Upgrade a Custom');
    expect(decodeURIComponent(url)).toContain('del plan Pro al plan Custom');
  });
});
