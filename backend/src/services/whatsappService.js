import { sendViaWhatsappWeb } from './whatsappWebService.js';

const DEFAULT_WHATSAPP_SENDER = '+9779849425091';

function normalizeWhatsappNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  // Nepali mobile numbers are stored locally as 10 digits in this project.
  if (/^\d{10}$/.test(digits)) return `+977${digits}`;
  if (/^977\d{10}$/.test(digits)) return `+${digits}`;

  // Keep already international numbers usable for non-Nepal test accounts.
  return `+${digits}`;
}

function requireWhatsappNumber(phone, label = 'phone number') {
  const normalized = normalizeWhatsappNumber(phone);
  if (!/^\+\d{10,15}$/.test(normalized)) {
    throw new Error(`Invalid WhatsApp ${label}. Use a valid 10-digit Nepali mobile number or international E.164 number.`);
  }
  return normalized;
}

async function sendViaTwilio({ to, message, from }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return false;

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: message,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Twilio WhatsApp send failed: ${response.status} ${errorText}`.trim());
  }
  return true;
}

async function sendViaMetaCloud({ to, message, otp }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';
  const payload = templateName
    ? {
        messaging_product: 'whatsapp',
        to: to.replace(/^\+/, ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: String(otp) }],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: to.replace(/^\+/, ''),
        type: 'text',
        text: { preview_url: false, body: message },
      };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Meta WhatsApp send failed: ${response.status} ${errorText}`.trim());
  }
  return true;
}

async function sendViaCustomHttp({ to, message, from }) {
  const endpoint = process.env.WHATSAPP_API_URL || process.env.WHATSAPP_ENDPOINT;
  if (!endpoint) return false;

  const headers = { 'Content-Type': 'application/json' };
  const token = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_BEARER_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(endpoint, {
    method: process.env.WHATSAPP_API_METHOD || 'POST',
    headers,
    body: JSON.stringify({
      from,
      to,
      phone: to,
      recipient: to,
      message,
      body: message,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Custom WhatsApp API send failed: ${response.status} ${errorText}`.trim());
  }
  return true;
}

export async function sendWhatsappOtp({ phone, otp }) {
  const to = requireWhatsappNumber(phone, 'recipient number');
  const from = requireWhatsappNumber(process.env.WHATSAPP_FROM_NUMBER || DEFAULT_WHATSAPP_SENDER, 'sender number');
  if (to === from) {
    throw new Error('OTP recipient number cannot be the same as the WhatsApp sender number +9779849425091. Use another registered customer phone number.');
  }

  const message = `Your OTP code is: ${otp}`;
  const provider = String(process.env.WHATSAPP_PROVIDER || 'auto').toLowerCase();

  if (provider === 'web' || provider === 'whatsapp-web') {
    const confirmation = await sendViaWhatsappWeb({ to, from, message });
    return { provider: 'whatsapp-web', to, from, confirmation };
  }

  if ((provider === 'web-auto' || provider === 'auto') && process.env.WHATSAPP_WEB_ENABLED === 'true') {
    const confirmation = await sendViaWhatsappWeb({ to, from, message });
    return { provider: 'whatsapp-web', to, from, confirmation };
  }

  if (provider === 'twilio' || provider === 'auto') {
    const sent = await sendViaTwilio({ to, from, message });
    if (sent) return { provider: 'twilio', to, from };
  }

  if (provider === 'meta' || provider === 'cloud' || provider === 'auto') {
    const sent = await sendViaMetaCloud({ to, message, otp });
    if (sent) return { provider: 'meta', to, from };
  }

  if (provider === 'custom' || provider === 'http' || provider === 'auto') {
    const sent = await sendViaCustomHttp({ to, from, message });
    if (sent) return { provider: 'custom-http', to, from };
  }

  if (process.env.WHATSAPP_DEV_LOG_OTP === 'true') {
    console.info(`[DEV ONLY] WhatsApp OTP for ${to}: ${otp}`);
    return { provider: 'dev-log', to, from };
  }

  throw new Error('WhatsApp OTP was not sent because no live provider is configured. To send from +9779849425091, set WHATSAPP_PROVIDER=web, run npm install in backend, restart the backend, and scan the WhatsApp Web QR using +9779849425091. Alternatively configure Twilio, Meta Cloud API, or WHATSAPP_API_URL.');
}
