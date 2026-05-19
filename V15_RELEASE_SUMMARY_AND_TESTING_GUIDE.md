# Food Ordering and Delivery System V15 - Release Summary and Testing Guide

## Build validation

- Backend JavaScript syntax check passed using `node --check` across `backend/src`.
- Frontend production build passed using `npm run build` after refreshing dependencies locally.
- Generated `frontend/dist` was removed before packaging so the ZIP contains source files only.

## Bugs fixed and features added

1. Navigation and settings hover/active states
   - Added pointer cursor, hover colour, and active colour treatment for user navigation.
   - Updated shared tabs so settings tabs such as Profile and Locations follow the same hover/active behaviour.

2. Password visibility toggle
   - Added reusable eye/eye-off password fields to role login/register screens.
   - Covered Admin, SuperAdmin, and Rider login fields, plus restaurant admin registration password fields.

3. Role-based navbar consistency
   - Rebuilt Admin, SuperAdmin, and Rider layout headers to visually match the user navbar.
   - Preserved role-specific menus:
     - Admin: Dashboard, Orders, Sales Report, Ratings, Menu, About
     - SuperAdmin: Dashboard, Restaurants, Users, Coupons
     - Rider: Dashboard, Order

4. VAT Bill / KOT invoice
   - Added clean printable VAT/KOT-style invoice on the specific order tracking/detail page.
   - Includes items, quantity, unit price, subtotal, VAT portion, delivery fee, discount, and final total.

5. Basket icon beside theme toggle
   - Added a basket icon beside the dark/light theme toggle in the user header.
   - Existing floating basket behaviour remains unchanged.

6. ChatGPT API food and restaurant chatbot
   - Added customer-only Annaya Food Assistant.
   - Chatbot is restricted to system foods, restaurants, menu items, reviews, order history, weather-aware recommendations, and delivery-related suggestions.
   - API key is read from backend environment variables only.
   - Includes safe fallback mode if the OpenAI key is missing or the API request fails.

7. GPS and map UX improvements
   - Users and restaurant admins can now select/pin a location on the map or use GPS.
   - Latitude and longitude are calculated automatically and stored behind the scenes.
   - Restaurant latitude/longitude are stored and used as the rider route source.
   - OpenStreetMap route link now starts from the restaurant and points to the delivery location when coordinates exist.

8. Duplicate search bar removal
   - Removed the search bar from the restaurant filter section.
   - Navbar search remains unchanged.

9. Order tracking layout improvement
   - Moved Order Confirmed, Preparing, Out for Delivery, Delivered, and Delivered Successfully sections beside the map.
   - Kept the existing map and order detail logic while improving use of horizontal space.

10. Admin Orders scroll behaviour
   - Order list now scrolls independently.
   - Right-side order detail panel remains sticky/static while browsing orders.

11. Local network configuration preservation
   - Preserved Vite host configuration for LAN testing.
   - Extended CORS/allowed-host handling so localhost, saved LAN IPs, and private network origins remain supported.

## Files modified

### Frontend
- `frontend/vite.config.js`
- `frontend/src/shared/ui.jsx`
- `frontend/src/shared/layout.jsx`
- `frontend/src/views/RoleLoginPage.jsx`
- `frontend/src/views/Restaurants.jsx`
- `frontend/src/views/UserProfile.jsx`
- `frontend/src/views/OrderCheckout.jsx`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/admin/AdminLayout.jsx`
- `frontend/src/views/admin/AdminOrders.jsx`
- `frontend/src/views/admin/AdminAbout.jsx`
- `frontend/src/views/superadmin/SuperAdminLayout.jsx`
- `frontend/src/views/rider/RiderLayout.jsx`
- `frontend/src/components/GoogleMapPicker.jsx`
- `frontend/src/components/LiveOrderMap.jsx`
- `frontend/src/utils/location.js`

### Backend
- `backend/.env`
- `backend/.env.example`
- `backend/src/app.js`
- `backend/src/config/db.js`
- `backend/src/database/schema.sql`
- `backend/src/models/restaurantModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/routes/index.js`

### Database/schema
- `schema.sql`
- `V15_SCHEMA_CHANGES.sql`

## Files added

- `frontend/src/components/FoodChatbot.jsx`
- `backend/src/controllers/chatbotController.js`
- `backend/src/models/chatbotModel.js`
- `backend/src/routes/chatbotRoutes.js`
- `V15_RELEASE_SUMMARY_AND_TESTING_GUIDE.md`

## Database changes

V15 adds restaurant coordinate columns:

```sql
ALTER TABLE restaurants
  ADD COLUMN latitude DECIMAL(10,7) NULL AFTER restaurant_location_url,
  ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude;
```

The backend migration in `backend/src/config/db.js` also creates these columns automatically if missing and backfills coordinates from existing OpenStreetMap URLs where possible.

## Setup instructions

### Backend

```bash
cd backend
npm install
npm run dev
```

Check `.env`:

```env
PORT=5050
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=food_ordering_and_delivery_app
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Check `.env`:

```env
VITE_API_URL=http://127.0.0.1:5050
```

For mobile/local network testing, set `VITE_API_URL` to your computer IP, for example:

```env
VITE_API_URL=http://192.168.1.10:5050
```

Then open the frontend from another device on the same Wi-Fi:

```text
http://192.168.1.10:5173
```

### Database

1. Import `schema.sql` for a fresh database.
2. For an existing V14 database, run `V15_SCHEMA_CHANGES.sql`, or simply start the backend and let its migration create the missing restaurant coordinate columns.

### ChatGPT API key setup

Add your key only in `backend/.env`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Do not add the key to frontend files.

## Testing guide

1. Navbar hover/active states
   - Open Home, Restaurants, Order History, and Reviews.
   - Hover each item and confirm cursor pointer and green hover/active state.

2. Settings tabs
   - Open Profile/Settings.
   - Hover and select Profile, Locations, and other tabs.

3. Password eye icons
   - Visit Admin, SuperAdmin, and Rider login pages.
   - Toggle password visibility and confirm text/password switching.
   - Check Admin registration password and confirm password fields.

4. Role navbars
   - Login as Admin, SuperAdmin, and Rider.
   - Confirm navbar styling matches the customer navbar and role menus remain correct.

5. VAT/KOT bill
   - Open a specific order from Order History.
   - Confirm invoice section shows items, quantity, price, subtotal, VAT, delivery fee, discount, and final total.
   - Press Print to confirm it is report-friendly.

6. Basket icon
   - Login as customer.
   - Add items to basket.
   - Confirm basket icon appears beside the theme toggle and opens the basket page.
   - Confirm existing floating basket still works.

7. Chatbot
   - Login as customer.
   - Click Ask AI.
   - Ask: “Recommend food for me based on my order history.”
   - Ask an unrelated question such as “write C code” and confirm it refuses and stays food/restaurant scoped.
   - Remove `OPENAI_API_KEY` and confirm fallback recommendations still work.

8. GPS pinpoint and restaurant source
   - Customer: Profile > Locations, click map or GPS, save location.
   - Admin: About page, click map or GPS, save restaurant location.
   - Place an order and confirm tracking map has restaurant source coordinates.
   - Open route and confirm OpenStreetMap uses restaurant-to-delivery routing.

9. Duplicate search removal
   - Open Restaurants page.
   - Confirm the filter-section search is removed.
   - Confirm navbar search still filters restaurants/menu items.

10. Order tracking layout
   - Open a specific order tracking page.
   - Confirm status sections appear beside the map, not below it.

11. Admin Orders scroll
   - Login as Admin and open Orders.
   - Scroll order list and confirm detail panel stays visible.

12. Local network access
   - Run backend on `0.0.0.0:5050` or the configured LAN-accessible host.
   - Run frontend with `--host 0.0.0.0`.
   - Open the app from another device using the host computer IP.
   - Confirm login, restaurants, basket, checkout, maps, and chatbot endpoint work.
