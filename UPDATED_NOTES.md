Food Ordering And Delivery App - V7

Implemented only the requested V7 scope while preserving the existing backend and restoring Version 5 style/layout where requested.

Completed V7 updates
- Landing page reverted toward Version 5 feel and merged with home behavior.
- Navbar labels updated:
  - Find Restaurants -> Restaurants
  - Your Reviews -> Reviews
- Navbar font sizing normalized.
- Restaurants discovery on landing page changed to horizontal category sections:
  - Highest Rated
  - Fast Delivery
  - Best Quality
  - each with View More links to filtered Restaurants page.
- Restaurant listing cards use restaurant cover photos.
- Restaurant detail page now uses tabs:
  - Menu
  - About
  - Reviews
- Cart popup restored at bottom-right with item count and Expand action.
- Full basket remains available on dedicated basket page.
- Order history/order details preserve the prior layout direction while keeping the newer right-side bill panel.
- Admin dashboard background adjusted to theme-consistent color.
- Admin menu management supports editing menu items and uploading menu item photos.
- Restaurant About page supports logo, cover photo, and multiple gallery photos.
- Admin orders page supports detailed order view:
  - items
  - quantity
  - subtotal
  - total
  - customer name
  - delivery location
  - discounts
- Admin logout moved beside profile area and now asks for confirmation.
- Admin preferences removed from admin navigation flow.
- Super admin preferences removed from super admin navigation flow.
- Super admin Restaurants and Users pages now support clicking through to detailed information panels.
- Database schema updated to support restaurant cover photos and multiple gallery images.
- Upload handling included for new image fields using local /uploads storage.

Validation completed
- Frontend production build passed.
- Backend app import passed.

Notes
- New uploaded images are stored by backend in /uploads and served statically.
- Seed schema includes the new restaurant image fields.


## Version 10 updates
- Landing page auth-aware CTA redirect
- Restaurant Google Maps location URL support
- Rider role, dashboard, orders, notifications, and profile access
- Automatic rider assignment when order enters Preparing
- Rider location polling every 15 seconds from rider orders page
- Checkout delivery pin with stored latitude/longitude
- Order tracking map upgraded to restaurant/rider/customer coordinates
