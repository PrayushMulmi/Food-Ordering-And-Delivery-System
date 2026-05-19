const DEFAULT_WHATSAPP_SENDER = '+9779849425091';
const WEB_PROVIDER_NAMES = new Set(['web', 'whatsapp-web', 'whatsapp-web-js', 'webjs']);

let webClient = null;
let webClientPromise = null;
let webClientReady = false;
let lastQrAt = null;

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

function getWhatsappProvider() {
  return String(process.env.WHATSAPP_PROVIDER || 'auto').trim().toLowerCase();
}

function isWebProvider() {
  return WEB_PROVIDER_NAMES.has(getWhatsappProvider());
}

function getExpectedSenderNumber() {
  return requireWhatsappNumber(process.env.WHATSAPP_FROM_NUMBER || DEFAULT_WHATSAPP_SENDER, 'sender number');
}

function getSenderDigits() {
  return getExpectedSenderNumber().replace(/\D/g, '');
}

function getRecipientChatId(to) {
  return `${to.replace(/\D/g, '')}@c.us`;
}

async function loadWhatsappWebDependencies() {
  let whatsappWeb;
  let qrcodeTerminal;

  try {
    whatsappWeb = await import('whatsapp-web.js');
    qrcodeTerminal = await import('qrcode-terminal');
  } catch (error) {
    throw new Error(
      'WhatsApp Web dependencies are missing. Run `npm install` in the backend folder. ' +
        'Required packages: whatsapp-web.js and qrcode-terminal. Original error: ' +
        error.message,
    );
  }

  const webModule = whatsappWeb.default || whatsappWeb;
  const qrModule = qrcodeTerminal.default || qrcodeTerminal;

  return {
    Client: webModule.Client,
    LocalAuth: webModule.LocalAuth,
    qrcode: qrModule,
  };
}

function waitForWhatsappWebReady(timeoutMs = Number(process.env.WHATSAPP_WEB_READY_TIMEOUT_MS || 180000)) {
  if (webClientReady && webClient) return Promise.resolve(webClient);
  if (!webClient) return Promise.reject(new Error('WhatsApp Web client has not been initialized.'));

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          'WhatsApp Web is not ready yet. Scan the QR code in the backend terminal using WhatsApp number ' +
            getExpectedSenderNumber() +
            ', then request the OTP again.',
        ),
      );
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
      webClient.off('ready', onReady);
      webClient.off('auth_failure', onFailure);
      webClient.off('disconnected', onDisconnected);
    };

    const onReady = () => {
      cleanup();
      resolve(webClient);
    };
    const onFailure = (message) => {
      cleanup();
      reject(new Error(`WhatsApp Web authentication failed: ${message || 'unknown error'}`));
    };
    const onDisconnected = (reason) => {
      cleanup();
      reject(new Error(`WhatsApp Web disconnected before it was ready: ${reason || 'unknown reason'}`));
    };

    webClient.once('ready', onReady);
    webClient.once('auth_failure', onFailure);
    webClient.once('disconnected', onDisconnected);
  });
}

async function assertWhatsappWebSender(client) {
  const expectedSenderDigits = getSenderDigits();
  const actualSenderDigits = String(client?.info?.wid?.user || '').replace(/\D/g, '');

  if (!actualSenderDigits) {
    console.warn('[WhatsApp OTP] Could not read the connected WhatsApp sender number yet. Continuing with the active linked session.');
    return;
  }

  if (actualSenderDigits !== expectedSenderDigits) {
    throw new Error(
      `WhatsApp Web is linked to +${actualSenderDigits}, but this project is configured to send from ${getExpectedSenderNumber()}. ` +
        'Open WhatsApp Linked Devices, unlink this session, delete backend/.wwebjs_auth, restart backend, and scan the QR with the correct number.',
    );
  }
}

async function initializeWhatsappWebClient() {
  if (!isWebProvider()) return null;
  if (webClientPromise) return webClientPromise;

  webClientPromise = (async () => {
    const { Client, LocalAuth, qrcode } = await loadWhatsappWebDependencies();
    const authPath = process.env.WHATSAPP_WEB_AUTH_PATH || '.wwebjs_auth';
    const clientId = process.env.WHATSAPP_WEB_CLIENT_ID || 'food-ordering-otp';

    console.log('[WhatsApp OTP] Initializing WhatsApp Web sender...');
    console.log(`[WhatsApp OTP] Expected sender: ${getExpectedSenderNumber()}`);
    console.log('[WhatsApp OTP] A QR code will appear below if this backend is not already linked.');

    const puppeteerArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ];

    webClient = new Client({
      authStrategy: new LocalAuth({ clientId, dataPath: authPath }),
      puppeteer: {
        headless: true,
        args: puppeteerArgs,
      },
    });

    webClient.on('qr', (qr) => {
      lastQrAt = new Date();
      webClientReady = false;
      console.log('\n============================================================');
      console.log('[WhatsApp OTP] Scan this QR with WhatsApp number ' + getExpectedSenderNumber());
      console.log('WhatsApp -> Settings -> Linked Devices -> Link a Device');
      console.log('============================================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n[WhatsApp OTP] Waiting for QR scan...\n');
    });

    webClient.on('authenticated', () => {
      console.log('[WhatsApp OTP] WhatsApp Web authentication accepted. Waiting until client is ready...');
    });

    webClient.on('ready', async () => {
      webClientReady = true;
      try {
        await assertWhatsappWebSender(webClient);
        console.log(`[WhatsApp OTP] WhatsApp Web client is ready. OTPs will be sent from ${getExpectedSenderNumber()}.`);
      } catch (error) {
        console.error('[WhatsApp OTP] Sender validation failed:', error.message);
      }
    });

    webClient.on('auth_failure', (message) => {
      webClientReady = false;
      console.error('[WhatsApp OTP] WhatsApp Web authentication failed:', message || 'unknown error');
      console.error('[WhatsApp OTP] Delete backend/.wwebjs_auth and restart backend to scan a fresh QR.');
    });

    webClient.on('disconnected', (reason) => {
      webClientReady = false;
      webClientPromise = null;
      console.error('[WhatsApp OTP] WhatsApp Web disconnected:', reason || 'unknown reason');
    });

    await webClient.initialize();
    return webClient;
  })().catch((error) => {
    webClientReady = false;
    webClientPromise = null;
    console.error('[WhatsApp OTP] Failed to initialize WhatsApp Web:', error.message);
    throw error;
  });

  return webClientPromise;
}

async function sendViaWhatsappWeb({ to, message }) {
  const client = await initializeWhatsappWebClient();
  const readyClient = await waitForWhatsappWebReady();
  await assertWhatsappWebSender(readyClient);

  const digits = to.replace(/\D/g, '');
  let chatId = getRecipientChatId(to);

  if (typeof readyClient.getNumberId === 'function') {
    const numberId = await readyClient.getNumberId(digits);
    if (!numberId) {
      throw new Error(`The recipient number ${to} is not registered on WhatsApp or cannot be reached by WhatsApp Web.`);
    }
    chatId = numberId._serialized || chatId;
  }

  await readyClient.sendMessage(chatId, message);
  return true;
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

async function sendViaMetaCloud({ to, message }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/^\+/, ''),
      type: 'text',
      text: { preview_url: false, body: message },
    }),
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

export async function initializeWhatsappOnStartup() {
  if (!isWebProvider()) {
    console.log(`[WhatsApp OTP] Provider: ${getWhatsappProvider()}. QR code is only shown when WHATSAPP_PROVIDER=web.`);
    return null;
  }

  try {
    await initializeWhatsappWebClient();
  } catch (error) {
    console.error('[WhatsApp OTP] Startup initialization failed:', error.message);
  }
  return null;
}

export function getWhatsappStatus() {
  return {
    provider: getWhatsappProvider(),
    expected_sender: process.env.WHATSAPP_FROM_NUMBER || DEFAULT_WHATSAPP_SENDER,
    web_ready: webClientReady,
    qr_generated_at: lastQrAt,
  };
}

export async function sendWhatsappOtp({ phone, otp }) {
  const to = requireWhatsappNumber(phone, 'recipient number');
  const from = getExpectedSenderNumber();
  const message = `Your OTP code is: ${otp}`;
  const provider = getWhatsappProvider();

  if (WEB_PROVIDER_NAMES.has(provider)) {
    const sent = await sendViaWhatsappWeb({ to, message });
    if (sent) return { provider: 'whatsapp-web', to };
  }

  if (provider === 'twilio' || provider === 'auto') {
    const sent = await sendViaTwilio({ to, from, message });
    if (sent) return { provider: 'twilio', to };
  }

  if (provider === 'meta' || provider === 'cloud' || provider === 'auto') {
    const sent = await sendViaMetaCloud({ to, message });
    if (sent) return { provider: 'meta', to };
  }

  if (provider === 'custom' || provider === 'http' || provider === 'auto') {
    const sent = await sendViaCustomHttp({ to, from, message });
    if (sent) return { provider: 'custom-http', to };
  }

  if (process.env.WHATSAPP_DEV_LOG_OTP === 'true') {
    console.info(`[DEV ONLY] WhatsApp OTP for ${to}: ${otp}`);
    return { provider: 'dev-log', to };
  }

  throw new Error(
    'WhatsApp OTP was not sent. Set WHATSAPP_PROVIDER=web and scan the terminal QR, ' +
      'or configure Twilio, Meta Cloud API, a custom WHATSAPP_API_URL, or WHATSAPP_DEV_LOG_OTP=true for local testing only.',
  );
}
