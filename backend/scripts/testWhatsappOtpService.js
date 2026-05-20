import http from 'http';
import { sendWhatsappOtp } from '../src/services/whatsappService.js';

const TEST_PORT = 19090;
const EXPECTED_FROM = '+9779849425091';
const TEST_RECIPIENT = process.argv[2] || '9860000000';
const TEST_OTP = '123456';

let receivedPayload = null;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      receivedPayload = JSON.parse(body || '{}');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, id: 'mock-message-id' }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

function listen() {
  return new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
}

function close() {
  return new Promise((resolve) => server.close(resolve));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await listen();
  process.env.WHATSAPP_PROVIDER = 'custom';
  process.env.WHATSAPP_FROM_NUMBER = EXPECTED_FROM;
  process.env.WHATSAPP_API_URL = `http://127.0.0.1:${TEST_PORT}/send`;
  delete process.env.WHATSAPP_API_TOKEN;

  const result = await sendWhatsappOtp({ phone: TEST_RECIPIENT, otp: TEST_OTP });

  assert(result.provider === 'custom-http', 'Expected custom-http provider');
  assert(receivedPayload, 'Mock WhatsApp provider did not receive a request');
  assert(receivedPayload.from === EXPECTED_FROM, `Expected from ${EXPECTED_FROM}, got ${receivedPayload.from}`);
  assert(receivedPayload.to === '+9779860000000', `Expected recipient +9779860000000, got ${receivedPayload.to}`);
  assert(receivedPayload.message === `Your OTP code is: ${TEST_OTP}`, 'Unexpected OTP message body');

  console.log('WhatsApp OTP service test passed.');
  console.log(JSON.stringify({ provider: result.provider, from: receivedPayload.from, to: receivedPayload.to, message: receivedPayload.message }, null, 2));
} finally {
  await close();
}
