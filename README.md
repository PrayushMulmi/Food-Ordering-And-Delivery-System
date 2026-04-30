# Food-Ordering-And-Delivery-App

This package separates the project into:

- `frontend/` — React JSX application using Vite
- `backend/` — Express MVC starter API

## How to run

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## What was changed
- Converted app source into `.jsx` / `.js`
- Removed the original `components/` folder pattern and consolidated reusable UI into `frontend/src/shared/ui.jsx`
- Added distinct frontend and backend folder structures
- Added a starter MVC backend for direct initialization with Node and React tooling
