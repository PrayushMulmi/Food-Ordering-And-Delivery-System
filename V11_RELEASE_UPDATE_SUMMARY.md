# V11 Release Stabilisation Update Summary

## Bugs fixed
- Customer login portal now blocks admin, superadmin, and rider credentials through an `expected_role` check.
- Signup no longer creates an active frontend session; users are returned to the login section after registration.
- Login/logout notification duration is set to 5 seconds.
- Login/signup password fields include show/hide eye controls.
- Login/signup panels are smaller and inactive panels are disabled while the other mode is active.
- Back button is removed from all pages except the order detail/tracking page.
- Basket button remains fixed at the bottom-right even when the basket preview is expanded.
- Theme switching now applies the `dark` class globally and persists in local storage/user profile.
- Google Maps UI dependency was replaced with OpenStreetMap iframe previews and links.
- Rider GPS updates are accepted for live user tracking only when an order is in the dispatched/out-for-delivery phase.

## Features added
- Customer forgot-password flow using registered phone number, a 6-digit verification code, and secure password hashing.
- User and restaurant/admin location input supports OpenStreetMap URLs and raw `lat,lng` coordinates.
- Restaurant/admin can save restaurant region: Kathmandu, Bhaktapur, or Lalitpur.
- Rider can select working region: Kathmandu, Bhaktapur, or Lalitpur.
- Automatic rider assignment now prioritises riders whose region matches the restaurant region.
- SuperAdmin Coupons page added with list, create, edit, and delete support.
- Coupon edit form supports maximum discount value, expiry date, user usage limit, and discount percentage.
- Admin dashboard now shows active coupons for the admin’s own restaurant.
- Admin order status progression now uses a single “Next” button instead of multiple manual status controls.

## Main files modified
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/views/RoleLoginPage.jsx`
- `frontend/src/views/LandingPage.jsx`
- `frontend/src/views/Root.jsx`
- `frontend/src/shared/layout.jsx`
- `frontend/src/styles/theme.css`
- `frontend/src/styles/fonts.css`
- `frontend/src/lib/api.js`
- `frontend/src/lib/theme.js`
- `frontend/src/components/GoogleMapPicker.jsx`
- `frontend/src/components/LiveOrderMap.jsx`
- `frontend/src/utils/location.js`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/admin/AdminDashboard.jsx`
- `frontend/src/views/admin/AdminOrders.jsx`
- `frontend/src/views/admin/AdminAbout.jsx`
- `frontend/src/views/rider/RiderDashboard.jsx`
- `frontend/src/views/rider/RiderOrders.jsx`
- `frontend/src/views/superadmin/SuperAdminLayout.jsx`
- `frontend/src/routes/router.jsx`
- `backend/src/controllers/authController.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/superAdminController.js`
- `backend/src/routes/superAdminRoutes.js`
- `backend/src/controllers/restaurantAdminController.js`
- `backend/src/routes/restaurantAdminRoutes.js`
- `backend/src/models/couponModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/restaurantModel.js`
- `backend/src/models/riderModel.js`
- `backend/src/controllers/riderController.js`
- `backend/src/routes/riderRoutes.js`
- `backend/src/config/db.js`
- `backend/src/database/schema.sql`

## Files added
- `frontend/src/views/superadmin/SuperAdminCoupons.jsx`
- `frontend/src/lib/theme.js`
- `V11_RELEASE_FIXES_MIGRATION.sql`
- `V11_RELEASE_UPDATE_SUMMARY.md`

## Database changes
- `users.role` now supports `rider`.
- `restaurants.region` added for restaurant/rider matching.
- `coupons.max_discount_amount` added for maximum discount cap.
- `password_reset_codes` added for forgot-password verification.
- `rider_profiles.region` added for rider working area.
- Rider live location/order tracking columns are ensured by migration/auto-migration.

## Setup instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env
# update DB_HOST, DB_USER, DB_PASSWORD, DB_NAME if needed
npm run dev
```

The backend also contains auto-migration logic in `src/config/db.js`, so starting the server should ensure required columns/tables exist.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://127.0.0.1:5050 or your backend URL
npm run dev
```

No Google Maps API key is required. OpenStreetMap iframe/link support is used instead.

### Database update
For an existing database, import/run:

```sql
SOURCE V11_RELEASE_FIXES_MIGRATION.sql;
```

If your MySQL version does not support `ADD COLUMN IF NOT EXISTS`, skip already-existing columns manually or rely on the backend auto-migration.

## Assumptions
- The existing database status value `Out for Delivery` is used internally as the dispatched stage. The admin UI labels this progression as “Dispatched” while preserving the existing backend status constants.
- No SMS gateway credentials were provided, so forgot-password returns a development verification code outside production. In production, connect this endpoint to an SMS provider and hide the code.
- The existing `google_maps_url` database column name is preserved for compatibility, but the UI and parsing now support OpenStreetMap URLs and coordinates.

## Validation performed
- Selected backend files were checked with `node --check` successfully.
- Frontend dependency installation/build could not be completed inside this sandbox because `npm ci` did not finish within the available execution window. Please run `npm install && npm run build` locally after extracting the ZIP.
