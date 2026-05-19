# Food Ordering and Delivery System V19 - Change Summary and Setup

## Release artifacts

- Updated project ZIP: `Food_Ordering_And_Delivery_System_V19.zip`
- Database migration: `V19_RELEASE_FIXES_MIGRATION.sql`

## Bugs fixed and features added

### Forgot Password with WhatsApp OTP

- Reworked the customer forgot-password modal into a step-by-step flow:
  1. username/email entry,
  2. registered phone number entry,
  3. WhatsApp OTP verification,
  4. password reset.
- Backend now verifies that the provided username/email/full name belongs to the submitted registered 10-digit phone number before generating an OTP.
- OTPs are generated with Node crypto as 6-digit values, hashed with bcrypt before storage, expire after 10 minutes, and are never returned to the frontend.
- Added resend protection: the same account cannot request another OTP within 60 seconds.
- Password reset now requires username, phone, OTP, and password confirmation, and the new password is stored through the existing bcrypt hashing path.
- Added WhatsApp provider service support for Twilio WhatsApp and Meta WhatsApp Cloud API using environment variables.
- Configured the sender number default as `+9779849425091` via `WHATSAPP_FROM_NUMBER`.

### Footer, About Us, and FAQs

- Removed footer links for restaurant admin login and super admin login.
- Replaced the footer with customer-facing links and information: About Us, FAQs, Restaurants, Customer Login, Order History, Reviews, support email, and location.
- Added a public About Us page matching the existing green/white card-based style.
- Added a public FAQs page with questions around ordering, closed restaurants, order tracking, notes, password reset, price levels, and bill printing.
- Linked both pages from the footer and router.

### Price range labels

- Replaced symbol-based price levels with `Low`, `Medium`, and `High`.
- Backend normalizes old values (`$`, `$$`, `$$$`) and mixed-case labels to the new labels.
- Frontend restaurant filters, admin registration, restaurant profile form, listings, detail pages, and superadmin display now use the new labels.
- Database schema defaults and seed values were updated to `Medium`, `Low`, and `High`.
- Migration script converts existing data safely.

### Theme route

- Confirmed and preserved the authenticated route `PUT /api/auth/me/theme`.
- The route updates only the logged-in user’s theme and returns the updated profile.
- The frontend theme button continues to call the correct endpoint and applies the response immediately.

### Bill printing

- Reworked the print button to print a dedicated cloned invoice container inside a temporary hidden iframe.
- This prevents the browser from printing the full application shell, navigation, footer, wrappers, or hidden layout space.
- The printable invoice still includes restaurant logo when available, restaurant/customer/order details, item table, VAT portion, discount, delivery fee, final total, and customer note.

### Restaurant open/close status

- Added backend endpoint: `PUT /api/restaurant-admin/restaurant/status`.
- Restaurant admins can now toggle their own restaurant between open and closed from the Admin Dashboard.
- The endpoint is protected by restaurant-admin role guard and updates only the restaurant owned by the logged-in admin.
- User-facing restaurant cards and detail pages clearly display open/closed status.
- Closed restaurants can be viewed but ordering is disabled in the UI.
- Backend now blocks adding items to basket and placing/previewing orders if the restaurant is closed.
- Chatbot/recommendation database queries were also tightened to avoid suggesting closed restaurants or unavailable menu items.

## Root causes identified

- Forgot password previously used only phone number verification and did not enforce the requested username + phone ownership check.
- Footer still exposed administrative login/navigation links on public pages.
- About Us and FAQs routes/pages were not present.
- Price level values were hardcoded in multiple frontend and backend places as symbols.
- Print CSS hid content by visibility but could still leave full-page layout space, causing extra printed pages.
- Admin dashboard did not expose a focused open/close toggle even though the database already had `is_open` support.
- Basket/order APIs did not consistently block closed restaurants at the backend layer.

## Files added

- `backend/src/services/whatsappService.js`
- `frontend/src/views/AboutUs.jsx`
- `frontend/src/views/FAQs.jsx`
- `V19_RELEASE_FIXES_MIGRATION.sql`
- `V19_CHANGE_SUMMARY_AND_SETUP.md`

## Files modified

### Backend

- `backend/.env`
- `backend/.env.example`
- `backend/src/config/db.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/restaurantAdminController.js`
- `backend/src/models/basketModel.js`
- `backend/src/models/chatbotModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/restaurantModel.js`
- `backend/src/routes/restaurantAdminRoutes.js`
- `backend/src/database/schema.sql`

### Frontend

- `frontend/src/routes/router.jsx`
- `frontend/src/shared/layout.jsx`
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/views/LandingPage.jsx`
- `frontend/src/views/Restaurants.jsx`
- `frontend/src/views/RestaurantDetail.jsx`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/RoleLoginPage.jsx`
- `frontend/src/views/admin/AdminAbout.jsx`
- `frontend/src/views/admin/AdminDashboard.jsx`

### Database/root SQL

- `schema.sql`
- `VERSION_10_SCHEMA.sql`

## Database changes

Run `V19_RELEASE_FIXES_MIGRATION.sql` on an existing V18 database.

The migration:

- ensures `users.theme` exists,
- ensures `password_reset_codes` exists,
- adds an index for password reset throttling/history lookup,
- ensures `restaurants.is_open` exists,
- changes `restaurants.price_level` to `VARCHAR(20) DEFAULT 'Medium'`,
- converts `$` to `Low`, `$$` to `Medium`, and `$$$` to `High`.

The backend startup migration in `backend/src/config/db.js` also applies the important compatibility updates automatically where possible.

## WhatsApp OTP configuration

No WhatsApp API secret is hardcoded.

Set one of the following provider configurations in `backend/.env`:

### Twilio WhatsApp

```env
WHATSAPP_PROVIDER=twilio
WHATSAPP_FROM_NUMBER=+9779849425091
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Meta WhatsApp Cloud API

```env
WHATSAPP_PROVIDER=meta
WHATSAPP_FROM_NUMBER=+9779849425091
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

### Local testing only

```env
WHATSAPP_DEV_LOG_OTP=true
```

This prints the OTP to the backend console only and should not be enabled in production.

## Setup instructions

### Backend

```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

Backend default port in the included `.env` is `5050`.

### Frontend

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Database

For a fresh database, import the updated `schema.sql` or let the backend initialize the schema using its startup migration.

For an existing V18 database:

```bash
mysql -u root -p food_ordering_and_delivery_app < V19_RELEASE_FIXES_MIGRATION.sql
```

If your database name is different, update the `USE food_ordering_and_delivery_app;` line in the migration before running it.

## Validation performed

- Backend source files were checked with `node --check`.
- Frontend production build was run successfully with `npm run build`.
- Static verification confirmed the new routes, components, and endpoint wiring are present.

## Notes and limitations

- A live MySQL server was not available in this environment, so end-to-end database writes and live route calls could not be executed here.
- WhatsApp OTP delivery requires valid Twilio or Meta WhatsApp provider credentials. Without credentials, OTP delivery cannot be fully verified.
- The current project schema does not have a separate `username` column. The V19 reset flow treats the entered username as the customer email, email local-part, or full name so it works with the existing schema without a disruptive database redesign.
- No unrelated UI redesign or broad architectural refactor was performed.
