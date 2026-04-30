# Authentication Fixes Applied

## Main fixes
- Preserved database data across backend restarts by preventing destructive schema re-initialization when the `users` table already exists.
- Added automatic migration to bcrypt-hash any existing plain-text seeded passwords.
- Removed insecure plain-text password comparison fallback.
- Normalized email addresses during register/login/database lookup.
- Improved auth validation error messages.
- Made CORS origins configurable and expanded local dev coverage.
- Improved frontend network error reporting for "Failed to Fetch" scenarios.

## Files changed
- `backend/src/config/db.js`
- `backend/src/models/userModel.js`
- `backend/src/controllers/authController.js`
- `backend/src/app.js`
- `backend/.env`
- `backend/.env.example`
- `frontend/src/lib/api.js`
