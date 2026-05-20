# Food Ordering and Delivery System V21 - Change Summary and Setup

## Bugs fixed and features updated

### Login password eye icon
- Ensured login password fields render only one app-controlled eye toggle.
- Added CSS to hide browser-native password reveal controls that can appear as a second eye icon.
- Applied the same behavior to customer, admin, superadmin, rider, signup, and password reset password fields.

### Dark theme icon hover color
- Added dark-theme-only hover CSS so SVG icons change to black on hover.
- Light theme styling remains unchanged.

### Restaurant open/close status
- Kept and reinforced the exact backend route: `PUT /api/restaurant-admin/restaurant/status`.
- Route remains protected by authentication and restaurant admin role checks.
- The route updates only the authenticated admin's own restaurant.
- Suspended restaurants cannot be opened or closed by the restaurant admin.
- User-facing restaurant cards continue to show Open/Closed, and closed restaurants remain blocked from ordering by backend basket/order validation.

### WhatsApp OTP delivery
- Strengthened the WhatsApp Web sender flow for `+9779849425091`.
- Recipient numbers are normalized to Nepali international format, for example `9845272447` becomes `+9779845272447`.
- Before sending, the backend checks whether the recipient is a registered/reachable WhatsApp account when the library supports it.
- The backend now waits for WhatsApp acknowledgement instead of blindly reporting success after `sendMessage()` returns.
- OTP message remains short: `Your OTP code is: 123456`.
- Added clearer backend logs showing sender, recipient, chat id, and acknowledgement status.
- Added scripts:
  - `npm run test:whatsapp`
  - `npm run whatsapp:send-test -- 9845272447 123456`
  - `npm run whatsapp:qr -- 9845272447 123456`

### Login rate limiting
- Added account-specific failed login tracking.
- After 7 failed attempts on the same account, login is blocked for 10 minutes.
- Successful login resets failed attempt count.
- Applies to customer, restaurant admin, superadmin, and rider because all roles use the same backend login controller.
- User-friendly error message: `Too many failed login attempts. Please try again after 10 minutes.`

### Update password eye icons
- Added persistent show/hide toggles for:
  - Current password
  - New password
  - Confirm password
- Icons remain visible after typing, focusing another field, or validation updates.

### Order status workflow
- Restaurant/admin order workflow is now limited to:
  - Pending → Confirmed → Preparing → Dispatched
- Admin cannot mark an order as Delivered.
- Backend rejects restaurant/admin attempts to set Delivered or Delivery Failed.
- Rider can mark a dispatched order as:
  - Delivered
  - Delivery Failed
- Backend validates that rider delivery result changes are only allowed after the order is dispatched and only for the assigned rider.

### Restaurant search and recommendation layout
- When a search query is active, searched/matched restaurant results are shown first.
- Recommended restaurants shift below search results.
- When there is no search query, the default recommendation placement is preserved.

## Root causes identified
- Native/browser password controls could overlap the custom eye icon.
- Global dark theme text/icon overrides did not define hover behavior for SVG icons.
- The status route existed in some versions but needed stronger route alignment and clearer protected update behavior.
- WhatsApp Web readiness did not guarantee that the target number was reachable or that WhatsApp acknowledged the message.
- Login failures were not tracked server-side per account.
- User profile password fields used plain password inputs without stable toggle components.
- Admin order controls exposed a Delivered transition that should belong only to rider flow.
- Search results and recommendations were rendered in a fixed order regardless of active search.

## Files modified

### Backend
- `backend/src/constants/orderStatus.js`
- `backend/src/config/db.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/orderController.js`
- `backend/src/controllers/riderController.js`
- `backend/src/models/userModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/riderModel.js`
- `backend/src/routes/riderRoutes.js`
- `backend/src/services/whatsappService.js`
- `backend/src/services/whatsappWebService.js`
- `backend/package.json`
- `backend/.env`
- `backend/.env.example`
- `backend/src/database/schema.sql`

### Frontend
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/views/RoleLoginPage.jsx`
- `frontend/src/views/UserProfile.jsx`
- `frontend/src/views/admin/AdminOrders.jsx`
- `frontend/src/views/rider/RiderOrders.jsx`
- `frontend/src/views/Restaurants.jsx`
- `frontend/src/styles/theme.css`

### Root/database files
- `schema.sql`
- `V21_RELEASE_FIXES_MIGRATION.sql`
- `V21_CHANGE_SUMMARY_AND_SETUP.md`

## Files added
- `backend/scripts/initWhatsappQr.js`
- `V21_RELEASE_FIXES_MIGRATION.sql`
- `V21_CHANGE_SUMMARY_AND_SETUP.md`

## Database changes
Run `V21_RELEASE_FIXES_MIGRATION.sql` on an existing database.

Changes:
- Adds `users.failed_login_attempts`.
- Adds `users.login_blocked_until`.
- Updates `orders.status` enum to include `Delivery Failed`.

The backend startup migration also attempts to add these columns and enum updates automatically, but running the SQL file manually is recommended for existing databases.

## Setup instructions

### Backend
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

Backend default URL:
```text
http://localhost:5050
```

### Frontend
Open a new terminal:

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

Frontend default URL:
```text
http://localhost:5173
```

### Database update
For an existing database, import/run:

```text
V21_RELEASE_FIXES_MIGRATION.sql
```

If creating a fresh database, use the updated `schema.sql` or `backend/src/database/schema.sql`.

## WhatsApp OTP setup

Backend `.env` should contain:

```env
WHATSAPP_PROVIDER=web
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_WEB_CLIENT_ID=annaya-otp
WHATSAPP_WEB_READY_TIMEOUT_MS=120000
WHATSAPP_SEND_ACK_TIMEOUT_MS=20000
WHATSAPP_DEV_LOG_OTP=false
```

Start backend:

```bash
cd backend
npm run dev
```

Scan the QR from WhatsApp number `+9779849425091`:

```text
WhatsApp → Settings → Linked Devices → Link a Device
```

Direct WhatsApp test after QR scan:

```bash
npm run whatsapp:send-test -- 9845272447 123456
```

Expected backend logs include:

```text
[WhatsApp OTP] Preparing to send OTP from +9779849425091 to +9779845272447.
[WhatsApp OTP] Sending OTP to WhatsApp chat 9779845272447@c.us.
[WhatsApp OTP] OTP send confirmed for +9779845272447. Ack: ...
```

If the sender session is wrong, clear it and rescan:

```bash
rm -rf backend/.wwebjs_auth backend/.wwebjs_cache
cd backend
npm run dev
```

## Validation performed
- Backend source files checked with `node --check`.
- WhatsApp OTP mock provider test passed with `npm run test:whatsapp`.
- Frontend production build passed with `npm run build`.

## Notes and limitations
- Live MySQL testing was not possible in this environment because no running MySQL server/credentials were provided.
- Live WhatsApp delivery cannot be completed from this environment because it requires the real phone session for `+9779849425091` to remain connected and scanned on the user machine.
- The project now logs precise WhatsApp delivery acceptance/acknowledgement information so delivery issues can be separated from code issues, phone-session issues, and receiver-number issues.
