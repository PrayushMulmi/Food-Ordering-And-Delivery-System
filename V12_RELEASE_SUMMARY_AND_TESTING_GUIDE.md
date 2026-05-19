# Version 12 Release Stabilisation Summary

## Bugs fixed
- Fixed customer-facing secure order routing so order pages use `order_code` instead of raw database IDs.
- Fixed customer-facing restaurant routing so restaurant pages use `restaurant_code` instead of raw restaurant IDs.
- Added backend ownership validation for customer order-code access and cancellation.
- Fixed dark mode styling for the main navbar/header and landing page dark-state background.
- Removed the extra public navbar link so the main navbar only contains Home, Restaurants, Order History, and Reviews.
- Prevented forgot-password verification codes from being returned to the frontend API response.
- Kept the Order History detail page as the only customer page with a Back button.

## Features added
- Added database-backed `restaurant_code` generation and public restaurant-code lookup.
- Added BLOB image upload support for restaurant/admin logo, cover image, and menu item images.
- Added public BLOB image retrieval endpoints for restaurant and menu images.
- Added image type and size validation for uploads.
- Added 10-second real GPS sync from the rider device after an order reaches Out for Delivery.
- Added data-driven restaurant recommendation API and “Recommended For You” section in the Restaurants tab.
- Added recommendation fallback logic using popular and highly rated restaurants when a user has limited history.

## Main files modified
### Backend
- `backend/src/config/db.js`
- `backend/src/database/schema.sql`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/menuController.js`
- `backend/src/controllers/orderController.js`
- `backend/src/controllers/restaurantAdminController.js`
- `backend/src/controllers/restaurantController.js`
- `backend/src/models/menuModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/restaurantModel.js`
- `backend/src/models/riderModel.js`
- `backend/src/routes/menuRoutes.js`
- `backend/src/routes/orderRoutes.js`
- `backend/src/routes/restaurantRoutes.js`
- `backend/src/utils/generateOrderCode.js`
- `backend/src/utils/imageUpload.js`

### Frontend
- `frontend/src/controllers/orderController.js`
- `frontend/src/lib/fileUpload.js`
- `frontend/src/routes/router.jsx`
- `frontend/src/shared/layout.jsx`
- `frontend/src/styles/theme.css`
- `frontend/src/views/LandingPage.jsx`
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/views/OrderCheckout.jsx`
- `frontend/src/views/OrderHistory.jsx`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/RestaurantDetail.jsx`
- `frontend/src/views/Restaurants.jsx`
- `frontend/src/views/rider/RiderOrders.jsx`

## Database changes
- `restaurants.restaurant_code`
- `restaurants.image_blob`, `restaurants.image_mime`
- `restaurants.cover_photo_blob`, `restaurants.cover_photo_mime`
- `menu_items.image_blob`, `menu_items.image_mime`
- `orders.assigned_rider_user_id`
- `orders.delivery_latitude`, `orders.delivery_longitude`
- `orders.rider_current_latitude`, `orders.rider_current_longitude`, `orders.rider_location_updated_at`
- `password_reset_codes`
- `rider_profiles`
- `rider_notifications`
- Updated recommendation seed data is included through realistic users, restaurants, orders, order items, and ratings in `schema.sql`.

## Setup
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
For a clean setup, import the updated full schema:
```bash
mysql -u root -p < schema.sql
```

For an existing Version 12 database, apply the incremental migration first:
```bash
mysql -u root -p < V12_RELEASE_FIXES_MIGRATION.sql
```

## GPS testing guide
1. Start backend and frontend on the same Wi-Fi/local network.
2. In `frontend/.env`, set the backend URL to your computer’s LAN IP, for example:
   ```env
   VITE_API_URL=http://192.168.1.25:5050
   ```
3. In `backend/.env`, allow the frontend origin if needed:
   ```env
   CORS_ORIGINS=http://192.168.1.25:5173,http://localhost:5173
   ```
4. Open the frontend on a mobile browser using the LAN URL, for example:
   ```text
   http://192.168.1.25:5173
   ```
5. Log in as a rider, go to Rider Orders, and allow browser location permission.
6. Move an assigned order to `Out for Delivery`. GPS sharing starts only at this status.
7. Keep Rider Orders open. The page sends actual device GPS to `/api/rider/location` every 10 seconds.
8. Log in as the customer on another browser/device and open the order tracking URL using the order code.
9. Confirm the tracking map changes from restaurant location before dispatch to rider location during delivery.
10. In MySQL, verify updates:
    ```sql
    SELECT order_code, rider_current_latitude, rider_current_longitude, rider_location_updated_at
    FROM orders
    WHERE status = 'Out for Delivery';
    ```

## Feature testing checklist
- Toggle dark mode and confirm the navbar is dark, not white.
- Visit the landing page in dark mode and confirm it uses a black theme instead of a grey gradient.
- Confirm main navbar shows only Home, Restaurants, Order History, and Reviews.
- Place an order and confirm the frontend URL uses `/order/<order_code>`.
- Try changing the order code manually while logged in as another user; the API should return not found.
- Open a restaurant page and confirm the URL uses `/restaurant/<restaurant_code>`.
- Upload a restaurant logo/cover image from Admin > About Restaurant and confirm it displays after saving.
- Upload a menu item image from Admin > Menu Management and confirm it displays from the backend image endpoint.
- Confirm uploaded images above 2MB or unsupported types are rejected.
- Confirm Restaurants tab shows “Recommended For You” for logged-in customers.
- Confirm recommendations change based on user order and rating history where seed data exists.

## Assumptions
- “Dispatched” in the UI maps to the existing backend status `Out for Delivery`, preserving the current enum and avoiding wider workflow breakage.
- Existing admin/superadmin internal management screens may still use database IDs internally because the raw-ID restriction is focused on public/customer URLs.
- BLOB upload is implemented for restaurant logo, restaurant cover, and menu item images, which are the active restaurant-admin image upload surfaces in this codebase.
- The existing location table column name `google_maps_url` was preserved to avoid breaking old data, but OpenStreetMap URLs and coordinate inputs are supported.
