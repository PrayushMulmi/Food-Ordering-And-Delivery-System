Food Ordering And Delivery App - V8

Implemented requested V8 updates while preserving the existing UI structure and working flows.

Included changes
- Clickable logos and visible Back buttons on customer/admin auth pages.
- Global back-button treatment on major customer, admin, and super admin pages.
- Fixed missing customer/admin/super admin profile routes.
- Added custom route fallback UI and router error boundaries.
- Header search now works reliably with route query syncing and restaurant/menu-item search support.
- Add-to-basket now stays on the restaurant page and shows a bottom-right basket popup notification.
- Basket popup count now refreshes live after basket changes.
- Checkout now includes pricing preview, delivery fee, discount, total, and coupon apply flow.
- Backend order pricing preview endpoint added with coupon validation and fixed delivery fee.
- Order tracking now polls for updates and shows pre-dispatch restaurant map plus simulated live rider tracking after dispatch.
- Logout and order cancellation now use centered confirmation modals.
- Super admin header now includes direct profile access for parity with admin profile routing.

Assumptions
- Delivery fee is fixed at Rs. 70 for every order.
- Live rider tracking runs in demo/simulated mode unless a real mobile GPS feed is connected.
- Google Maps embed works without a key in fallback mode; providing VITE_GOOGLE_MAPS_API_KEY enables key-ready embeds.

Dependencies
- No new npm dependencies were added.
