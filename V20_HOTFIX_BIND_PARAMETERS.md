# V20 Hotfix: Undefined SQL Bind Parameters

## Issue fixed
The application could show this backend/MySQL error when saving theme or changing restaurant open/close status:

`Bind parameters must not contain undefined. To pass SQL NULL specify JS null`

## Root cause
Some authenticated requests could reach MySQL helper/model methods with an `undefined` bind value when stale session data, older JWT payload formats, or incomplete route fallback payloads were present. MySQL2 rejects `undefined` bind parameters before executing the query.

## Changes made
- Added bind-parameter sanitisation in `backend/src/config/db.js` so accidental `undefined` values are converted to SQL `NULL` instead of crashing with the raw MySQL2 error.
- Hardened authentication in `backend/src/middleware/authMiddleware.js`:
  - supports token payloads using `id`, `userId`, `user_id`, or `sub`;
  - rejects invalid token payloads before database calls;
  - preserves proper 401/403 responses.
- Hardened `UserModel` theme/profile lookup/update methods so invalid authenticated user IDs are rejected cleanly.
- Hardened `RestaurantModel` restaurant lookup/update/status methods so invalid restaurant/admin IDs are rejected cleanly.
- Re-verified backend JavaScript syntax with `node --check`.
- Re-verified frontend production build with `npm run build`.

## Setup reminder
After extracting the ZIP, stop any old backend process still running on port `5050`, then reinstall dependencies and restart both apps:

```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

If the browser still has an old token/session, log out and log in again once after restarting the backend.
