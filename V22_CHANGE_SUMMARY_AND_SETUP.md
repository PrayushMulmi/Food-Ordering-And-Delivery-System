# Food Ordering and Delivery System V22 - Change Summary and Setup Notes

## Bugs fixed / features added

1. **Signup phone number uniqueness**
   - Customer and restaurant-admin registration now validate phone numbers on the backend.
   - Phone numbers are normalized to the project standard 10-digit Nepali format before checking duplicates.
   - Signup is blocked if the phone number already exists in the `users` table.

2. **Customer signup WhatsApp OTP verification**
   - Customer signup no longer creates an active account immediately.
   - If email and phone are available and Terms & Conditions are accepted, the backend creates a pending signup OTP record.
   - OTP is 6 digits, hashed in the database, expires after 10 minutes, and is not returned to the frontend.
   - The user must verify the OTP before the customer account is created.
   - Existing WhatsApp OTP provider flow is reused, including WhatsApp Web sending from `+9779849425091` when configured.

3. **Terms & Conditions page and signup acceptance**
   - Added `/terms-and-conditions` frontend page matching the existing Annaya page style.
   - Added Terms & Conditions link to the landing/public footer.
   - Added signup checkbox: `I accept the Terms & Conditions`.
   - Frontend and backend both block customer signup when terms are not accepted.
   - Terms acceptance and timestamp are saved with the created user.

4. **WhatsApp Web LocalAuth compatibility preserved**
   - `backend/src/services/whatsappWebService.js` now supports both CommonJS and ES module export formats from `whatsapp-web.js`.
   - This prevents `LocalAuth is not a constructor` when the library exposes exports under `default`.

## Root causes identified

- Customer registration previously created users immediately after form submission, without phone ownership verification.
- Phone duplicate checking existed for email only; phone numbers could be reused if users bypassed frontend checks.
- There was no pending signup OTP table, so signup OTP verification could not be enforced without creating an account first.
- The signup UI did not require Terms & Conditions acceptance.
- The footer had About/FAQ links but no Terms & Conditions link.

## Files modified

### Backend
- `backend/src/controllers/authController.js`
- `backend/src/models/userModel.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/services/whatsappWebService.js`
- `backend/src/database/schema.sql`
- `schema.sql`

### Frontend
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/routes/router.jsx`
- `frontend/src/shared/layout.jsx`

## Files added

- `frontend/src/views/TermsAndConditions.jsx`
- `V22_RELEASE_FIXES_MIGRATION.sql`
- `V22_CHANGE_SUMMARY_AND_SETUP.md`

## Database changes

- Added `users.terms_accepted`.
- Added `users.terms_accepted_at`.
- Added `signup_verifications` table for pending customer signup OTPs.
- Fresh schema now defines `users.phone` as unique.
- Migration includes phone normalization and a duplicate-check query before adding a unique phone index on existing databases.

## Setup instructions

### Backend

```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

If Puppeteer cannot download Chrome because of network restrictions, install with:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

Then use a locally installed Chrome/Chromium for WhatsApp Web if required.

### Frontend

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Database update

1. Back up your current MySQL database.
2. Import/run `V22_RELEASE_FIXES_MIGRATION.sql`.
3. If the duplicate-phone query returns rows, clean those duplicates before enabling the optional unique phone index.

### WhatsApp OTP setup

Use these backend `.env` values for local/demo WhatsApp Web OTP sending:

```env
WHATSAPP_PROVIDER=web
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_WEB_CLIENT_ID=annaya-otp
WHATSAPP_WEB_READY_TIMEOUT_MS=120000
WHATSAPP_SEND_ACK_TIMEOUT_MS=20000
WHATSAPP_DEV_LOG_OTP=false
```

Start the backend and scan the QR code from WhatsApp number `+9779849425091`:

```text
WhatsApp → Settings → Linked Devices → Link a Device
```

The OTP message format is:

```text
Your OTP code is: 123456
```

## Validation performed

- Backend JavaScript syntax checked with `node --check`.
- Frontend production build completed with `npm run build`.
- WhatsApp OTP mock-provider test completed with `npm run test:whatsapp`.
- Live WhatsApp delivery still requires your local WhatsApp Web session to remain connected after scanning the QR with `+9779849425091`.

## Assumptions and limitations

- Live MySQL signup testing could not be completed in this environment because no live database credentials/server were available.
- Live WhatsApp delivery cannot be completed from the sandbox because it requires the real phone session for `+9779849425091`.
- The backend now fails signup clearly if WhatsApp sending fails; it does not show signup success unless the OTP send request is accepted by the configured provider.
