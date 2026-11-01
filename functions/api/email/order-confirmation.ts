import { renderEmailLayout, sendEmail } from '../../lib/email';
import { clientIp, EMAIL_PATTERN, isRateLimited } from '../../lib/rate-limit';

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
}

interface OrderConfirmationBody {
  to?: string;
  customerName?: string;
  orderNumber?: string;
  venueName?: string;
  fulfillmentType?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  estimatedTime?: string;
  items?: OrderItem[];
  total?: number;
  currency?: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const clean = (value: unknown, max = 160): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const formatMoney = (value: number, currency: string) =>
  `${currency} ${value.toFixed(2)}`;

/**
 * POST /api/email/order-confirmation
 * Sends a branded receipt to the customer after checkout.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.RESEND_API_KEY) {
    return json({ error: 'El servicio de email no está configurado.' }, 503);
  }

  if (isRateLimited(`order:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
    return json({ error: 'Demasiados emails. Intentá más tarde.' }, 429);
  }

  let body: OrderConfirmationBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const to = clean(body.to, 200);
  if (!EMAIL_PATTERN.test(to)) {
    return json({ error: 'Email del cliente inválido.' }, 400);
  }

  const orderNumber = clean(body.orderNumber, 40);
  if (!orderNumber) {
    return json({ error: 'Falta el número de pedido.' }, 400);
  }

  const customerName = clean(body.customerName, 120) || 'cliente';
  const venueName = clean(body.venueName, 120) || 'MiMenu';
  const currency = clean(body.currency, 8) || 'Bs.';
  const estimatedTime = clean(body.estimatedTime, 40);
  const tableNumber = clean(body.tableNumber, 20);
  const deliveryAddress = clean(body.deliveryAddress, 200);

  const items = (Array.isArray(body.items) ? body.items : [])
    .slice(0, 100)
    .map((item) => ({
      name: clean(item?.name, 120) || 'Ítem',
      quantity: Math.max(1, Math.min(99, Number(item?.quantity) || 1)),
      price: Math.max(0, Number(item?.price) || 0),
    }));

  if (items.length === 0) {
    return json({ error: 'El pedido no tiene ítems.' }, 400);
  }

  const total = Number(body.total);
  const totalValue = Number.isFinite(total) && total >= 0
    ? total
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const fulfillmentLabel =
    body.fulfillmentType === 'delivery'
      ? deliveryAddress
        ? `Delivery · ${deliveryAddress}`
        : 'Delivery'
      : body.fulfillmentType === 'dine_in'
        ? `Mesa ${tableNumber || '1'}`
        : 'Retiro en barra';

  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;color:#334155;font-size:14px;">${item.quantity}× ${escapeHtml(item.name)}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:right;white-space:nowrap;">${formatMoney(item.price * item.quantity, currency)}</td>
      </tr>`
    )
    .join('');

  const contentHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-top:1px solid #ede9fe;">
      ${rows}
      <tr>
        <td style="padding:14px 0 0;border-top:2px solid #3f127a;color:#3f127a;font-size:15px;font-weight:700;">Total</td>
        <td style="padding:14px 0 0;border-top:2px solid #3f127a;color:#3f127a;font-size:15px;font-weight:700;text-align:right;white-space:nowrap;">${formatMoney(totalValue, currency)}</td>
      </tr>
    </table>
    <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
      ${escapeHtml(fulfillmentLabel)}${estimatedTime ? ` · Tiempo estimado: ${escapeHtml(estimatedTime)}` : ''}
    </p>`;

  const html = renderEmailLayout({
    heading: `¡Recibimos tu pedido #${escapeHtml(orderNumber)}!`,
    intro: `Hola ${escapeHtml(customerName)}, tu pedido en ${escapeHtml(venueName)} ya está confirmado. Te avisamos cuando esté listo.`,
    contentHtml,
    note: 'Conservá este email como comprobante. Si necesitás cambiar algo, respondé este mensaje o hablá con el local.',
  });

  const text = `Hola ${customerName}, tu pedido #${orderNumber} en ${venueName} está confirmado.\n\n${items
    .map((item) => `${item.quantity}x ${item.name} - ${formatMoney(item.price * item.quantity, currency)}`)
    .join('\n')}\n\nTotal: ${formatMoney(totalValue, currency)}\n${fulfillmentLabel}${
    estimatedTime ? `\nTiempo estimado: ${estimatedTime}` : ''
  }\n\nTe avisamos cuando esté listo.`;

  try {
    const result = await sendEmail(env, {
      to,
      subject: `Pedido #${orderNumber} confirmado · ${venueName}`,
      html,
      text,
    });

    return json({ id: result.id });
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    return json({ error: 'No se pudo enviar la confirmación.' }, 502);
  }
};
