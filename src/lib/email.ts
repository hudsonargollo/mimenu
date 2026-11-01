export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderEmailPayload {
  to: string;
  customerName: string;
  orderNumber: string;
  venueName: string;
  fulfillmentType?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  estimatedTime?: string;
  items: OrderEmailItem[];
  total: number;
  currency?: string;
}

export interface UpgradeEmailPayload {
  venueName?: string | null;
  venueSlug?: string | null;
  currentPlanName?: string | null;
  targetPlanName?: string | null;
  featureLabel?: string | null;
  replyTo?: string;
}

async function postEmail(path: string, payload: unknown): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'No se pudo enviar el email.');
  }
}

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  return postEmail('/api/email/order-confirmation', payload);
}

export function sendUpgradeRequestEmail(payload: UpgradeEmailPayload): Promise<void> {
  return postEmail('/api/email/upgrade-request', payload);
}
