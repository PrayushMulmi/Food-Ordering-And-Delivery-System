# Real-time Location + Saved Locations Change Summary

## Files modified
- `backend/src/config/db.js`
- `backend/src/controllers/riderController.js`
- `backend/src/database/schema.sql`
- `backend/src/models/riderModel.js`
- `backend/src/models/userModel.js`
- `backend/src/routes/authRoutes.js`
- `frontend/src/components/GoogleMapPicker.jsx`
- `frontend/src/components/LiveOrderMap.jsx`
- `frontend/src/views/OrderCheckout.jsx`
- `frontend/src/views/OrderTracking.jsx`
- `frontend/src/views/UserProfile.jsx`
- `frontend/src/views/rider/RiderOrders.jsx`

## New files added
- `backend/src/controllers/savedLocationController.js`
- `backend/src/models/savedLocationModel.js`
- `backend/src/utils/location.js`
- `frontend/src/utils/location.js`
- `LOCATION_TRACKING_AND_SAVED_LOCATIONS.sql`

## Removed logic
- Removed rider-side artificial interval-based map movement behavior.
- Replaced blind 15-second location pushes with `navigator.geolocation.watchPosition()`.
- Backend now ignores unchanged rider coordinates instead of writing duplicate GPS points.

## Implementation notes
- Rider location updates now happen only after a real GPS reading changes.
- User order tracking map now updates only when new rider coordinates arrive.
- Rider dashboard includes a Google Maps handoff button for navigation to the customer.
- Profile page now supports saved delivery locations.
- Checkout now allows manual location entry or selection from saved locations.
