# Version 10 setup notes

## New environment variables

### Frontend (`frontend/.env`)
- `VITE_API_URL=http://127.0.0.1:5050`
- `VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key`

## New/used backend routes
- `GET /api/rider/dashboard`
- `GET /api/rider/orders`
- `GET /api/rider/orders/:id`
- `PUT /api/rider/location`
- `PUT /api/rider/availability`

## Rider seed accounts
- `rider1@annaya.test / Rider1Pass!`
- `rider2@annaya.test / Rider2Pass!`
- `rider3@annaya.test / Rider3Pass!`

## Notes
- Rider GPS updates are sent from the rider orders page every 15 seconds while an active order exists and browser geolocation is allowed.
- Restaurant admins can now store a Google Maps URL from the About page.
- Checkout requires a delivery pin, which stores latitude and longitude on the order.
