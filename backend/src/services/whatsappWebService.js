const DEFAULT_WEB_READY_TIMEOUT_MS = 120000;
const DEFAULT_SEND_ACK_TIMEOUT_MS = 20000;

let webClient = null;
let webInitPromise = null;
let webReady = false;
let webReadyError = null;
let waiters = [];

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function configuredSenderDigits() {
  return normalizeDigits(process.env.WHATSAPP_FROM_NUMBER || '+9779849425091');
}

function resolveWaiters() {
  const pending = waiters;
  waiters = [];

  pending.forEach(({ resolve, timeout }) => {
    clearTimeout(timeout);
    resolve();
  });
}

function rejectWaiters(error) {
  const pending = waiters;
  waiters = [];

  pending.forEach(({ reject, timeout }) => {
    clearTimeout(timeout);
    reject(error);
  });
}

async function loadWhatsappWebDependencies() {
  try {
    const whatsappWebModule = await import('whatsapp-web.js');
    const whatsappWeb = whatsappWebModule?.default || whatsappWebModule;

    let qrcodeTerminal = null;

    try {
      const qrcodeTerminalModule = await import('qrcode-terminal');
      qrcodeTerminal = qrcodeTerminalModule?.default || qrcodeTerminalModule;
    } catch {
      qrcodeTerminal = null;
    }

    const Client = whatsappWeb?.Client || whatsappWebModule?.Client;
    const LocalAuth = whatsappWeb?.LocalAuth || whatsappWebModule?.LocalAuth;

    if (typeof Client !== 'function') {
      throw new Error('whatsapp-web.js Client export was not found. Reinstall backend dependencies with npm install.');
    }

    if (typeof LocalAuth !== 'function') {
      throw new Error('whatsapp-web.js LocalAuth export was not found. Reinstall backend dependencies with npm install.');
    }

    return {
      Client,
      LocalAuth,
      qrcodeTerminal,
    };
  } catch (error) {
    throw new Error(
      `WhatsApp Web provider is selected, but dependencies are not installed or could not be loaded correctly. Run "npm install" inside backend. Details: ${error.message}`,
    );
  }
}

async function getWhatsappWebClient() {
  if (webClient) return webClient;
  if (webInitPromise) return webInitPromise;

  webInitPromise = (async () => {
    const { Client, LocalAuth, qrcodeTerminal } = await loadWhatsappWebDependencies();
    const clientId = process.env.WHATSAPP_WEB_CLIENT_ID || 'annaya-otp';
    const readyTimeout = Number(process.env.WHATSAPP_WEB_READY_TIMEOUT_MS || DEFAULT_WEB_READY_TIMEOUT_MS);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
    });

    client.on('qr', (qr) => {
      webReady = false;
      webReadyError = null;
      console.info('\n[WhatsApp OTP] Scan this QR using WhatsApp number +9779849425091:');
      if (qrcodeTerminal?.generate) {
        qrcodeTerminal.generate(qr, { small: true });
      } else {
        console.info(qr);
      }
      console.info('[WhatsApp OTP] Open WhatsApp on +9779849425091 → Linked devices → Link a device.\n');
    });

    client.on('ready', () => {
      webReady = true;
      webReadyError = null;
      const activeNumber = normalizeDigits(client.info?.wid?.user);
      const expectedNumber = configuredSenderDigits();

      if (expectedNumber && activeNumber && expectedNumber !== activeNumber) {
        webReady = false;
        webReadyError = new Error(
          `WhatsApp Web session is logged in as +${activeNumber}, but WHATSAPP_FROM_NUMBER is +${expectedNumber}. Log out this session and scan the QR with +${expectedNumber}.`,
        );
        console.error(`[WhatsApp OTP] ${webReadyError.message}`);
        rejectWaiters(webReadyError);
        return;
      }

      console.info(`[WhatsApp OTP] WhatsApp Web is ready as +${activeNumber || expectedNumber || 'unknown'}.`);
      resolveWaiters();
    });

    client.on('auth_failure', (message) => {
      webReady = false;
      webReadyError = new Error(`WhatsApp Web authentication failed: ${message || 'unknown error'}`);
      console.error(`[WhatsApp OTP] ${webReadyError.message}`);
      rejectWaiters(webReadyError);
    });

    client.on('disconnected', (reason) => {
      webReady = false;
      webClient = null;
      webInitPromise = null;
      webReadyError = new Error(`WhatsApp Web disconnected: ${reason || 'unknown reason'}`);
      console.warn(`[WhatsApp OTP] ${webReadyError.message}`);
      rejectWaiters(webReadyError);
    });

    webClient = client;
    client.initialize().catch((error) => {
      webReady = false;
      webClient = null;
      webInitPromise = null;
      webReadyError = error;
      rejectWaiters(error);
    });

    setTimeout(() => {
      if (!webReady) {
        console.info(
          `[WhatsApp OTP] Waiting for WhatsApp Web login. First-time setup requires scanning the QR within ${Math.round(readyTimeout / 1000)} seconds.`,
        );
      }
    }, 3000).unref?.();

    return client;
  })();

  return webInitPromise;
}

async function waitForWhatsappWebReady(timeoutMs = DEFAULT_WEB_READY_TIMEOUT_MS) {
  if (webReady) return;
  if (webReadyError) throw webReadyError;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          'WhatsApp Web is not ready yet. Scan the QR in the backend terminal with WhatsApp number +9779849425091, then request the OTP again.',
        ),
      );
    }, timeoutMs);

    waiters.push({ resolve, reject, timeout });
  });
}

function waitForMessageAck(client, messageId, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.off?.('message_ack', onAck);
      reject(new Error('WhatsApp did not acknowledge the OTP message in time. Check the sender phone internet connection and retry.'));
    }, timeoutMs);

    const onAck = (msg, ack) => {
      const currentId = msg?.id?._serialized || msg?.id?.id || msg?.id;
      const targetId = messageId?._serialized || messageId?.id || messageId;
      if (targetId && currentId && currentId !== targetId) return;
      if (Number(ack) >= 1) {
        clearTimeout(timer);
        client.off?.('message_ack', onAck);
        resolve(ack);
      }
    };

    client.on('message_ack', onAck);
  });
}

export async function sendViaWhatsappWeb({ to, message, from }) {
  const client = await getWhatsappWebClient();
  const timeoutMs = Number(process.env.WHATSAPP_WEB_READY_TIMEOUT_MS || DEFAULT_WEB_READY_TIMEOUT_MS);
  await waitForWhatsappWebReady(timeoutMs);

  const activeNumber = normalizeDigits(client.info?.wid?.user);
  const expectedNumber = normalizeDigits(from || process.env.WHATSAPP_FROM_NUMBER || '+9779849425091');
  if (expectedNumber && activeNumber && activeNumber !== expectedNumber) {
    throw new Error(
      `WhatsApp Web session is logged in as +${activeNumber}, but OTP sender must be +${expectedNumber}. Scan the QR using +${expectedNumber}.`,
    );
  }

  const recipientDigits = normalizeDigits(to);
  if (!/^\d{10,15}$/.test(recipientDigits)) {
    throw new Error('Invalid WhatsApp recipient number. Use a valid E.164 or 10-digit Nepali mobile number.');
  }

  const chatId = `${recipientDigits}@c.us`;
  console.info(`[WhatsApp OTP] Preparing to send OTP from +${expectedNumber} to +${recipientDigits}.`);

  if (typeof client.isRegisteredUser === 'function') {
    const registered = await client.isRegisteredUser(chatId);
    if (!registered) {
      throw new Error(`+${recipientDigits} is not reachable on WhatsApp or is not a registered WhatsApp account.`);
    }
  }

  console.info(`[WhatsApp OTP] Sending OTP to WhatsApp chat ${chatId}.`);
  const sentMessage = await client.sendMessage(chatId, message);
  const messageId = sentMessage?.id?._serialized || sentMessage?.id?.id || sentMessage?.id;
  const immediateAck = Number(sentMessage?.ack ?? 0);
  if (immediateAck >= 1) {
    console.info(`[WhatsApp OTP] OTP send confirmed for +${recipientDigits}. Ack: ${immediateAck}.`);
    return { ack: immediateAck, message_id: messageId };
  }

  const ackTimeoutMs = Number(process.env.WHATSAPP_SEND_ACK_TIMEOUT_MS || DEFAULT_SEND_ACK_TIMEOUT_MS);
  const ack = await waitForMessageAck(client, sentMessage?.id || messageId, ackTimeoutMs);
  console.info(`[WhatsApp OTP] OTP send confirmed for +${recipientDigits}. Ack: ${ack}.`);
  return { ack, message_id: messageId };
}
