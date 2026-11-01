/**
 * Sales contact helpers for plan upgrades.
 *
 * MiMenu has no self-service billing yet: an upgrade is applied by the team
 * once payment is confirmed. Every upgrade CTA therefore ends in the sales
 * channel — WhatsApp first, email as fallback — carrying the venue and the
 * requested plan so the conversation starts with full context.
 */
export const SALES_WHATSAPP = '59170000000';
export const SALES_EMAIL = 'contato@mimenu.clubemkt.digital';

export interface UpgradeContactInput {
  venueName?: string | null;
  venueSlug?: string | null;
  currentPlanName?: string | null;
  /** Omitted when the venue should simply be contacted about options. */
  targetPlanName?: string | null;
  featureLabel?: string | null;
}

export function buildUpgradeMessage(input: UpgradeContactInput): string {
  const { venueName, venueSlug, currentPlanName, targetPlanName, featureLabel } = input;
  const name = venueName?.trim();
  const slug = venueSlug?.trim();
  const who = name && slug && name !== slug ? `${name} (${slug})` : name || slug || null;

  const planPart =
    currentPlanName && targetPlanName
      ? `Quiero pasar del plan ${currentPlanName} al plan ${targetPlanName}`
      : currentPlanName
        ? `Quiero mejorar mi plan ${currentPlanName}`
        : 'Quiero activar mi restaurante en MiMenu';

  const featurePart = featureLabel ? ` para usar ${featureLabel}` : '';
  const greeting = who ? `Hola MiMenu, soy ${who}.` : 'Hola MiMenu.';
  return `${greeting} ${planPart}${featurePart}. ¿Me ayudan con la activación?`;
}

export function buildUpgradeWhatsAppUrl(input: UpgradeContactInput): string {
  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(buildUpgradeMessage(input))}`;
}

export function buildUpgradeMailtoUrl(input: UpgradeContactInput): string {
  const subject = input.targetPlanName
    ? `Upgrade a ${input.targetPlanName}`
    : 'Upgrade de plan';
  const body = encodeURIComponent(buildUpgradeMessage(input));
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}
