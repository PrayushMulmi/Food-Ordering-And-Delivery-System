# V20 WhatsApp OTP Hotfix

## What was fixed

- Added a WhatsApp Web provider so OTPs can be sent from the actual WhatsApp account `+9779849425091` during local/demo use.
- The backend now supports `WHATSAPP_PROVIDER=web`.
- First-time setup prints a QR code in the backend terminal. Scan it from WhatsApp on `+9779849425091` using **Linked devices → Link a device**.
- The backend verifies that the active WhatsApp Web session is logged in as `+9779849425091`; if another number is scanned, OTP sending is rejected with a clear error.
- OTP messages remain short: `Your OTP code is: 123456`.
- Recipient numbers are normalized from Nepali 10-digit format to E.164 format, e.g. `9860000000` → `+9779860000000`.
- The OTP recipient cannot be the same as the sender number.
- Added a mock provider test script to verify sender, recipient normalization, and OTP message format without needing a live WhatsApp account.
- Added a real-provider test script for manual live testing after scanning WhatsApp Web QR or configuring another provider.

## Files changed/added

### Changed
- `backend/src/services/whatsappService.js`
- `backend/src/controllers/authController.js`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/.env`
- `backend/.env.example`

### Added
- `backend/src/services/whatsappWebService.js`
- `backend/scripts/testWhatsappOtpService.js`
- `backend/scripts/sendWhatsappTest.js`
- `backend/.gitignore`

## Required setup for sending from +9779849425091

From the backend folder:

```bash
npm install
npm run dev
```

The included backend `.env` is configured as:

```env
WHATSAPP_PROVIDER=web
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_WEB_CLIENT_ID=annaya-otp
WHATSAPP_WEB_READY_TIMEOUT_MS=120000
WHATSAPP_DEV_LOG_OTP=false
```

On the first OTP request, watch the backend terminal. It will print a QR code. On the phone with WhatsApp number `+9779849425091`:

1. Open WhatsApp.
2. Go to **Linked devices**.
3. Tap **Link a device**.
4. Scan the QR shown in the backend terminal.
5. Request the OTP again after the backend says WhatsApp Web is ready.

The session is stored locally in `backend/.wwebjs_auth/`, so you should not need to scan the QR every time unless WhatsApp logs the session out.

## Test commands

### Mock provider test already run

```bash
cd backend
npm run test:whatsapp
```

Expected output:

```json
{
  "provider": "custom-http",
  "from": "+9779849425091",
  "to": "+9779860000000",
  "message": "Your OTP code is: 123456"
}
```

### Live WhatsApp test after QR scan

```bash
cd backend
node scripts/sendWhatsappTest.js 9860000000 123456
```

Replace `9860000000` with another user's registered WhatsApp/mobile number. Do not test by sending to `9849425091`, because sender and recipient must be different.

## Important notes

- Live delivery from `+9779849425091` requires that number to scan the backend terminal QR at least once.
- If the backend says the session is logged in as another number, delete `backend/.wwebjs_auth/`, restart the backend, and scan again with `+9779849425091`.
- Official providers are still supported: Twilio, Meta Cloud API, and custom HTTP APIs. For official Meta/Twilio production sending, the provider account must own or be approved to use the sender number.
- No OTP is returned to the frontend.
- If provider delivery fails, the API returns an error and deletes the newly generated OTP row so users cannot verify an OTP that was not accepted by the sending provider.
