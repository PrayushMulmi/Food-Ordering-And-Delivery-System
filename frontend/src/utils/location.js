export function normalizeCoordinate(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(7)) : null;
}

export function parseCoordinatesFromText(value) {
  if (!value) return null;
  const match = String(value).trim().match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = normalizeCoordinate(match[1]);
  const lng = normalizeCoordinate(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng };
}

export function parseCoordinatesFromMapUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(String(url).trim());
    const directQuery = parsed.searchParams.get('q')
      || parsed.searchParams.get('query')
      || parsed.searchParams.get('destination')
      || (parsed.searchParams.get('mlat') && `${parsed.searchParams.get('mlat')},${parsed.searchParams.get('mlon')}`);
    const fromQuery = parseCoordinatesFromText(directQuery);
    if (fromQuery) return fromQuery;

    const decoded = decodeURIComponent(parsed.href);
    const googleMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (googleMatch) return { lat: normalizeCoordinate(googleMatch[1]), lng: normalizeCoordinate(googleMatch[2]) };

    const osmHash = decoded.match(/#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/);
    if (osmHash) return { lat: normalizeCoordinate(osmHash[1]), lng: normalizeCoordinate(osmHash[2]) };

    return parseCoordinatesFromText(parsed.pathname);
  } catch {
    return parseCoordinatesFromText(url);
  }
}

export const parseCoordinatesFromGoogleMapsUrl = parseCoordinatesFromMapUrl;

export function buildOpenStreetMapDirectionsUrl(destination, source = null) {
  if (!destination) return null;
  const destLat = destination.lat != null ? Number(destination.lat) : Number(destination.latitude);
  const destLng = destination.lng != null ? Number(destination.lng) : Number(destination.longitude);
  const sourceLat = source?.lat != null ? Number(source.lat) : Number(source?.latitude);
  const sourceLng = source?.lng != null ? Number(source.lng) : Number(source?.longitude);

  if (Number.isFinite(destLat) && Number.isFinite(destLng)) {
    const route = Number.isFinite(sourceLat) && Number.isFinite(sourceLng)
      ? `${sourceLat},${sourceLng};${destLat},${destLng}`
      : `;${destLat},${destLng}`;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}`;
  }
  if (destination.address) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(destination.address)}`;
  }
  return null;
}

export function buildOpenStreetMapMarkerUrl(coords) {
  const lat = coords?.lat != null ? Number(coords.lat) : Number(coords?.latitude);
  const lng = coords?.lng != null ? Number(coords.lng) : Number(coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export const buildGoogleMapsDirectionsUrl = buildOpenStreetMapDirectionsUrl;

export function buildOsmEmbedSrc({ query, coordinates }) {
  if (coordinates?.lat != null && coordinates?.lng != null) {
    const lat = Number(coordinates.lat);
    const lng = Number(coordinates.lng);
    const delta = 0.006;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  }
  const safeQuery = query || 'Kathmandu, Nepal';
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(safeQuery)}`;
}

export function calculateDistanceMeters(a, b) {
  if (!a || !b) return 0;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad((b.lat ?? b.latitude) - (a.lat ?? a.latitude));
  const dLng = toRad((b.lng ?? b.longitude) - (a.lng ?? a.longitude));
  const lat1 = toRad(a.lat ?? a.latitude);
  const lat2 = toRad(b.lat ?? b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
//