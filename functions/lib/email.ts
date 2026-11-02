export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface ResendEnvironment {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

const DEFAULT_FROM = 'MiMenu <no-reply@mimenu.clubemkt.digital>';

export async function sendEmail(
  env: ResendEnvironment,
  message: EmailMessage
): Promise<{ id: string }> {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || DEFAULT_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Resend responded with ${response.status}`);
  }

  return { id: payload.id };
}

export interface EmailLayoutOptions {
  heading: string;
  intro: string;
  contentHtml?: string;
  cta?: { label: string; url: string };
  note?: string;
}

export function renderEmailLayout({ heading, intro, contentHtml, cta, note }: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0f5;">
            <tr>
              <td style="background:#3f127a;padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em;">Mi<span style="color:#ff5e1e;">Menu</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;color:#0f172a;font-size:22px;line-height:1.3;">${heading}</h1>
                <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">${intro}</p>
                ${contentHtml || ''}
                ${
                  cta
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                          <td style="border-radius:10px;background:#ff5e1e;">
                            <a href="${cta.url}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${cta.label}</a>
                          </td>
                        </tr>
                      </table>`
                    : ''
                }
                ${
                  note
                    ? `<p style="margin:0;padding-top:16px;border-top:1px solid #ede9fe;color:#64748b;font-size:13px;line-height:1.6;">${note}</p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:16px 32px;color:#94a3b8;font-size:12px;">
                Enviado por MiMenu · Santa Cruz de la Sierra
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
