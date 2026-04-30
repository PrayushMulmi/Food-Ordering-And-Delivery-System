# Setup Instructions

## Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start backend:
   ```bash
   npm run dev
   ```
3. The backend migration bootstrap already creates the new `user_saved_locations` table automatically.
4. If you prefer a manual SQL update, run `LOCATION_TRACKING_AND_SAVED_LOCATIONS.sql` against the application database.

## Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start frontend:
   ```bash
   npm run dev
   ```

## Google Maps API key
- `VITE_GOOGLE_MAPS_API_KEY` enables the interactive Google Maps JS map and map picker.
- Without the API key, the app falls back to Google Maps embed links where possible.

## Real-time rider tracking behavior
- Rider device must grant browser GPS permission.
- Tracking uses `navigator.geolocation.watchPosition()` with high-accuracy mode.
- Frontend sends updates only when one of these is true:
  - first live GPS point
  - rider moved at least ~15 meters
  - or at least 10 seconds passed since the last sync
- Backend still validates coordinates and skips unchanged points.

## Edge cases handled
- GPS permission denied
- geolocation unavailable on device/browser
- invalid Google Maps URL or coordinates for saved locations
- no saved locations in checkout
