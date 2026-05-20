import dotenv from 'dotenv';
import { sendWhatsappOtp } from '../src/services/whatsappService.js';

dotenv.config();

console.log('[WhatsApp OTP] Initializing WhatsApp Web QR flow.');
console.log('[WhatsApp OTP] Scan the QR with +9779849425091, then press Ctrl+C after it is ready.');

try {
  // Sending to a harmless placeholder is not attempted until after readiness; this command is mainly used to trigger QR display.
  await sendWhatsappOtp({ phone: process.argv[2] || '9845272447', otp: process.argv[3] || '123456' });
  console.log('[WhatsApp OTP] Test OTP accepted by WhatsApp provider.');
} catch (error) {
  console.error('[WhatsApp OTP] QR initialization/send test failed:');
  console.error(error.message);
  process.exitCode = 1;
}
