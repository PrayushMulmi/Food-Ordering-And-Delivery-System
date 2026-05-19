# Food Ordering and Delivery System V18 - Change Summary and Setup

## Bugs fixed

1. **Basket stability and restaurant name**
   - Basket API now returns `restaurant_name` at the basket level.
   - Basket item queries now use each menu item's restaurant relationship instead of depending only on the basket-level restaurant join.
   - Added strict quantity validation so item quantities can only be updated deliberately between 1 and 99.
   - Added backend validation for missing menu item IDs and invalid quantities.

2. **SuperAdmin scroll/layout behavior**
   - Updated SuperAdmin Users and Restaurants pages so only the left-side list scrolls.
   - Right-side detail panels now remain sticky and visible while browsing long lists.
   - Fixed the user-detail visibility issue that required scrolling back to the top.

3. **Theme persistence**
   - Added `/api/auth/me/theme` backend endpoint.
   - Theme toggle now saves the selected theme to the database immediately.
   - Frontend local theme state, local storage, authenticated user state, and database theme setting are synchronized.
   - Theme changes now remain consistent after refresh and across sessions.

4. **Order notes in admin order details**
   - Admin order detail panel now displays customer order notes.
   - Empty notes are handled with a clear `No customer note added.` message.
   - Admin order details now also show customer phone/email and delivery fee for better context.

5. **Role-based access and cross-tab session consistency**
   - Customer-only pages are now guarded by the `customer` role instead of simple login status.
   - If an authenticated Admin, SuperAdmin, or Rider tries to access another role's guarded page, they are redirected to their own dashboard.
   - Role login portals now redirect already-authenticated users to the active role dashboard.
   - Frontend auth state now emits and listens for session-change events so tabs respond more consistently to login/logout/session changes.

6. **Formal printed bill and blank print pages**
   - Reworked print bill content into a formal invoice format.
   - Added restaurant logo support where available.
   - Added restaurant details, customer details, order status, delivery address, customer notes, itemized tax details, subtotal, VAT, discount, delivery fee, and grand total.
   - Updated print CSS to avoid unnecessary blank pages.

7. **Form validation and mobile validation**
   - Mobile number validation is now exactly 10 numeric digits in frontend and backend registration/profile flows.
   - Restaurant contact phone validation now enforces the same 10-digit rule where supplied.
   - Added/strengthened validation for profile, restaurant profile, menu item, password, basket, and checkout/order fields.
   - Menu item price must be a positive number.

8. **AI chatbot and recommendation privacy**
   - Frontend chatbot browser history is now keyed per authenticated user ID.
   - Logging out and logging in as another customer no longer reuses the previous customer's chat history.
   - Added optional per-user backend chatbot message storage through `chatbot_messages`, always filtered by authenticated `user_id`.
   - Existing recommendation logic remains database-grounded and continues to use live restaurant/menu/order/rating/location context.

9. **Backend syntax/runtime stability**
   - Fixed a duplicate `const blockedStatuses` declaration in `orderModel.js` that could break backend startup.

## Root causes identified

- Basket summary did not expose `restaurant_name` at the basket response level, causing the UI to fall back to `Selected restaurant`.
- Customer route guards only checked whether a token existed, not whether the current token belonged to a customer.
- Theme toggle only called local theme application and did not persist the changed preference to the database.
- Admin order detail UI did not render the stored `orders.notes` field.
- Chatbot history used one global session-storage key, so another customer in the same browser session could see the previous customer's messages.
- Print CSS used absolute positioning and broad page visibility rules that could produce extra blank pages.
- Mobile validation was too permissive in the backend and inconsistent across frontend forms.

## Files modified

### Frontend
- `frontend/src/lib/auth.js`
- `frontend/src/components/RouteGuards.jsx`
- `frontend/src/components/FoodChatbot.jsx`
- `frontend/src/routes/router.jsx`
- `frontend/src/shared/layout.jsx`
- `frontend/src/styles/index.css`
- `frontend/src/views/Dashboard.jsx`
- `frontend/src/views/LoginPage.jsx`
- `frontend/src/views/RoleLoginPage.jsx`
- `frontend/src/views/UserProfile.jsx`
- `frontend/src/views/RestaurantDetail.jsx`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/admin/AdminAbout.jsx`
- `frontend/src/views/admin/AdminMenu.jsx`
- `frontend/src/views/admin/AdminOrders.jsx`
- `frontend/src/views/superadmin/SuperAdminRestaurants.jsx`
- `frontend/src/views/superadmin/SuperAdminUsers.jsx`

### Backend
- `backend/src/controllers/authController.js`
- `backend/src/controllers/basketController.js`
- `backend/src/controllers/chatbotController.js`
- `backend/src/controllers/menuController.js`
- `backend/src/controllers/restaurantAdminController.js`
- `backend/src/models/basketModel.js`
- `backend/src/models/chatbotModel.js`
- `backend/src/models/orderModel.js`
- `backend/src/models/userModel.js`
- `backend/src/routes/authRoutes.js`

### Added
- `V18_RELEASE_FIXES_MIGRATION.sql`
- `V18_CHANGE_SUMMARY_AND_SETUP.md`

## Database changes

Run `V18_RELEASE_FIXES_MIGRATION.sql` if you want persistent backend chatbot history:

```sql
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chatbot_messages_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

No existing columns were removed. The app now validates `users.phone` and `restaurants.contact_phone` as exactly 10 numeric digits when provided.

## Setup instructions

### Backend

```bash
cd backend
npm install
npm run dev
```

Required `.env` values remain the same as the previous version, including database credentials and `JWT_SECRET`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For production build:

```bash
cd frontend
npm run build
```

### Database

1. Import the existing schema/database as usual.
2. Run `V18_RELEASE_FIXES_MIGRATION.sql` after the existing schema if persistent chatbot history is needed.

## Validation performed

- Backend JavaScript syntax checked with `node --check` across backend source files.
- Frontend JSX/JS syntax parsed successfully with Babel parser across frontend source files.
- Frontend production build completed successfully with `npm run build`.

## Notes and assumptions

- Full runtime testing against MySQL was not possible because no live database credentials/server were provided in this environment.
- Existing UI style and project flow were preserved as much as possible.
- No unrelated page redesign or broad architecture rewrite was performed.
