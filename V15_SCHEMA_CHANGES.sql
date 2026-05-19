-- V15 schema changes for GPS/map source support.
-- The backend startup migration also creates these columns automatically when missing.

ALTER TABLE restaurants
  ADD COLUMN latitude DECIMAL(10,7) NULL AFTER restaurant_location_url,
  ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude;

-- Optional one-time backfill may be handled by the backend for rows that already contain OpenStreetMap URLs.
