import dotenv from 'dotenv';
import { sendWhatsappOtp } from '../src/services/whatsappService.js';

dotenv.config();

const recipient = process.argv[2];
const otp = process.argv[3] || '123456';

if (!recipient) {
  console.error('Usage: node scripts/sendWhatsappTest.js <recipient-phone> [otp]');
  console.error('Example: node scripts/sendWhatsappTest.js 9860000000 123456');
  process.exit(1);
}

try {
  const result = await sendWhatsappOtp({ phone: recipient, otp });
  console.log('WhatsApp OTP test message accepted by provider.');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('WhatsApp OTP test failed:');
  console.error(error.message);
  process.exit(1);
}
