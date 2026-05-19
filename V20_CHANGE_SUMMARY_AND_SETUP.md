# Food Ordering and Delivery System V20 - Change Summary and Setup

## Bugs fixed / features stabilized

### Restaurant suspension handling
- Admin dashboard now detects `restaurants.status = 'suspended'` and shows a clear suspended warning.
- Admin dashboard open/close button is disabled for suspended restaurants.
- Admin restaurant profile editing is disabled in the UI when suspended.
- Admin menu create/update/delete controls are disabled in the UI when suspended.
- Admin order status actions are disabled in the UI when suspended.
- Backend now rejects suspended restaurant management actions with HTTP 403, including:
  - Restaurant profile updates
  - Restaurant open/close status changes
  - Coupon create/update/delete
  - Menu item create/update/delete
  - Restaurant order status updates
- SuperAdmin restaurant suspend/restore remains unchanged, but suspending a restaurant now also forces `is_open = 0` so suspended restaurants are never treated as normally open.

### Theme route and persistence
- Added direct backend aliases for the documented endpoints before the bundled `/api` router:
  - `PUT /api/auth/me/theme`
  - `PUT /api/restaurant-admin/restaurant/status`
- Existing route modules still also expose those routes.
- Theme updates remain authenticated and update only the logged-in user's `users.theme` value.
- Frontend theme controls now fall back to `PUT /api/auth/me` only if an older backend returns `Route not found` for `/api/auth/me/theme`.
- `frontend/.env.example` was corrected so local development does not accidentally point at an old LAN backend.

### Restaurant open/close status
- Backend status route now rejects suspended restaurants and only updates the authenticated admin's own restaurant.
- Admin dashboard includes a fallback to update via the restaurant profile endpoint only if an older backend does not have the dedicated status route.
- User-facing restaurant listings/details already show open/closed status and order placement already rejects closed or non-active restaurants; this behavior is preserved.

### WhatsApp OTP delivery
- WhatsApp OTP messages are now short: `Your OTP code is: 123456`.
- Nepali 10-digit phone numbers are normalized to `+977XXXXXXXXXX` before sending.
- Sender defaults to `+9779849425091` via `WHATSAPP_FROM_NUMBER`.
- OTP send errors are logged server-side and returned clearly to the frontend as a failed OTP request.
- OTP rows are deleted if delivery fails, preventing a database record from looking valid when no message was sent.
- Added optional custom HTTP provider support through `WHATSAPP_API_URL` and `WHATSAPP_API_TOKEN`, in addition to existing Twilio and Meta Cloud API support.

## Root causes identified
- Suspended restaurant status was available in the database, but Admin pages treated it the same as a normal active restaurant.
- Backend restaurant-admin mutation endpoints did not consistently check the authenticated admin's restaurant suspension status.
- Route-not-found reports were caused by the dedicated routes not being available early enough in some running backend copies and by local environments potentially pointing to an older backend process. V20 adds direct aliases and frontend fallback behavior.
- WhatsApp OTP generation was implemented, but provider configuration failures were not explicit enough and the message content was longer than required.

## Files modified

### Backend
- `backend/src/app.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/restaurantAdminController.js`
- `backend/src/controllers/menuController.js`
- `backend/src/models/restaurantModel.js`
- `backend/src/services/whatsappService.js`
- `backend/.env.example`

### Frontend
- `frontend/src/shared/layout.jsx`
- `frontend/src/views/UserProfile.jsx`
- `frontend/src/views/admin/AdminDashboard.jsx`
- `frontend/src/views/admin/AdminAbout.jsx`
- `frontend/src/views/admin/AdminMenu.jsx`
- `frontend/src/views/admin/AdminOrders.jsx`
- `frontend/.env.example`

### Added
- `V20_RELEASE_FIXES_MIGRATION.sql`
- `V20_CHANGE_SUMMARY_AND_SETUP.md`

## Database changes
Run `V20_RELEASE_FIXES_MIGRATION.sql` against existing installations. It verifies/adds:
- `users.theme`
- `restaurants.is_open`
- `restaurants.status ENUM('active','suspended')`
- `password_reset_codes`
- OTP indexes
- Forces `is_open = 0` for suspended restaurants

No destructive schema changes were added.

## Setup instructions

### Backend
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

The backend is configured for port `5050` in the included `.env`.

### Frontend
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

For local development, leave `VITE_API_URL` empty so the Vite proxy forwards `/api` to `http://localhost:5050`, or explicitly set:

```env
VITE_API_URL=http://localhost:5050
```

### Database
Import the base schema if setting up fresh, then apply V20 migration if updating an existing database:

```bash
mysql -u root -p food_ordering_and_delivery_app < V20_RELEASE_FIXES_MIGRATION.sql
```

### WhatsApp OTP configuration
At least one provider must be configured for live OTP delivery.

#### Twilio WhatsApp
```env
WHATSAPP_PROVIDER=twilio
WHATSAPP_FROM_NUMBER=+9779849425091
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

The sender number must be WhatsApp-enabled in Twilio. If using a Twilio sandbox, the Twilio sandbox sender must be used instead of an arbitrary number.

#### Meta WhatsApp Cloud API
```env
WHATSAPP_PROVIDER=meta
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
```

Meta Cloud API uses the configured phone number ID as the sender.

#### Custom HTTP WhatsApp provider
```env
WHATSAPP_PROVIDER=custom
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_API_URL=https://your-provider.example/send-whatsapp
WHATSAPP_API_TOKEN=your_provider_token
```

The backend sends a JSON payload containing `from`, `to`, `phone`, `recipient`, `message`, `body`, and `text` so simple gateway APIs can map the field they expect.

#### Local development only
```env
WHATSAPP_DEV_LOG_OTP=true
```

This logs the OTP in the backend terminal. Do not enable it in production.

## Validation performed
- Backend source files were checked with `node --check`.
- Frontend production build completed successfully with `npm run build`.
- No live MySQL server or WhatsApp provider credentials were available in this environment, so live database writes and actual WhatsApp delivery could not be verified here.

## Important notes
- If you still see `Route not found` after installing V20, stop any old backend running on port 5050 before starting the V20 backend:

```bash
lsof -i :5050
kill -9 <PID>
```

- A frontend pointed at an old LAN/ngrok backend will still show old route errors. Check `frontend/.env` and make sure it points to the backend you just started.
