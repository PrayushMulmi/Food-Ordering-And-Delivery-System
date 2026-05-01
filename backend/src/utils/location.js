const GOOGLE_MAPS_HOSTS = new Set([
  'maps.google.com',
  'www.google.com',
  'google.com',
  'www.google.com.np',
  'maps.app.goo.gl',
  'goo.gl',
]);

export function normalizeCoordinate(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(7)) : null;
}

export function areValidCoordinates(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
}

export function parseCoordinatesFromText(value) {
  if (!value) return null;
  const text = String(value).trim();
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const latitude = normalizeCoordinate(match[1]);
  const longitude = normalizeCoordinate(match[2]);
  if (!areValidCoordinates(latitude, longitude)) return null;
  return { latitude, longitude };
}

export function parseCoordinatesFromGoogleMapsUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.toLowerCase();
    if (![...GOOGLE_MAPS_HOSTS].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      return null;
    }

    const queryValue = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('destination');
    const direct = parseCoordinatesFromText(queryValue);
    if (direct) return direct;

    const atMatch = decodeURIComponent(url.href).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) {
      const latitude = normalizeCoordinate(atMatch[1]);
      const longitude = normalizeCoordinate(atMatch[2]);
      if (areValidCoordinates(latitude, longitude)) return { latitude, longitude };
    }

    const pathDirect = parseCoordinatesFromText(url.pathname);
    if (pathDirect) return pathDirect;
  } catch {
    return null;
  }

  return null;
}

export function normalizeSavedLocationInput(data = {}) {
  const label = String(data.label || data.location_name || '').trim();
  const rawInput = String(data.location_input || data.google_maps_url || data.coordinates || '').trim();
  const latitude = normalizeCoordinate(data.latitude);
  const longitude = normalizeCoordinate(data.longitude);
  const urlCoords = parseCoordinatesFromGoogleMapsUrl(rawInput);
  const textCoords = parseCoordinatesFromText(rawInput);
  const effectiveCoords = areValidCoordinates(latitude, longitude)
    ? { latitude, longitude }
    : urlCoords || textCoords;

  return {
    label,
    rawInput,
    latitude: effectiveCoords?.latitude ?? null,
    longitude: effectiveCoords?.longitude ?? null,
    googleMapsUrl: rawInput.startsWith('http') ? rawInput : null,
    hasValidCoordinates: Boolean(effectiveCoords),
  };
}

export function calculateDistanceMeters(a, b) {
  if (!a || !b) return 0;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
