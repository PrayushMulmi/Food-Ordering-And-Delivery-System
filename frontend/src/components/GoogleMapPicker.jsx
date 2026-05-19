import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Minus, Navigation, Plus } from 'lucide-react';
import { Button } from '../shared/ui';

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 11;
const MAX_ZOOM = 19;
const TILE_SIZE = 256;

function normalizePoint(point) {
  const lat = Number(point?.lat ?? point?.latitude);
  const lng = Number(point?.lng ?? point?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)) };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lngLatToWorldPixel(point, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latRad = (point.lat * Math.PI) / 180;
  const x = ((point.lng + 180) / 360) * scale;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
}

function worldPixelToLngLat(pixel, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (pixel.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * pixel.y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return normalizePoint({ lat, lng });
}

function buildTileUrl(x, y, zoom) {
  const tileCount = 2 ** zoom;
  const wrappedX = ((x % tileCount) + tileCount) % tileCount;
  return `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`;
}

function buildTiles(center, zoom, viewport) {
  const selectedCenter = normalizePoint(center) || DEFAULT_CENTER;
  const width = Math.max(Number(viewport.width || 0), 320);
  const height = Math.max(Number(viewport.height || 0), 280);
  const tileCount = 2 ** zoom;
  const centerPixel = lngLatToWorldPixel(selectedCenter, zoom);
  const topLeft = {
    x: centerPixel.x - width / 2,
    y: centerPixel.y - height / 2,
  };

  const minTileX = Math.floor(topLeft.x / TILE_SIZE);
  const maxTileX = Math.floor((topLeft.x + width) / TILE_SIZE);
  const minTileY = clamp(Math.floor(topLeft.y / TILE_SIZE), 0, tileCount - 1);
  const maxTileY = clamp(Math.floor((topLeft.y + height) / TILE_SIZE), 0, tileCount - 1);
  const tiles = [];

  for (let y = minTileY; y <= maxTileY; y += 1) {
    for (let x = minTileX; x <= maxTileX; x += 1) {
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        src: buildTileUrl(x, y, zoom),
        left: x * TILE_SIZE - topLeft.x,
        top: y * TILE_SIZE - topLeft.y,
      });
    }
  }

  return { tiles, centerPixel, width, height };
}

export function GoogleMapPicker({
  value,
  onChange,
  title = 'Location pin',
  description = 'Click the map to place the pin. Use + / − to zoom and GPS if available.',
}) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState(description);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [viewport, setViewport] = useState({ width: 0, height: 280 });
  const selected = normalizePoint(value);
  const center = selected || DEFAULT_CENTER;
  const { tiles } = useMemo(() => buildTiles(center, zoom, viewport), [center.lat, center.lng, zoom, viewport.width, viewport.height]);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return undefined;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };

    updateSize();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    resizeObserver?.observe(element);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    setStatus(description);
  }, [description]);

  const emitChange = (coords, message = 'Pin selected from the map.') => {
    const normalized = normalizePoint(coords);
    if (!normalized) return;
    onChange?.(normalized);
    setStatus(message);
  };

  const handleMapClick = (event) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerPixel = lngLatToWorldPixel(center, zoom);
    const clickedPixel = {
      x: centerPixel.x + (event.clientX - rect.left - rect.width / 2),
      y: centerPixel.y + (event.clientY - rect.top - rect.height / 2),
    };
    const coords = worldPixelToLngLat(clickedPixel, zoom);
    emitChange(coords, 'Pin selected from the map. Latitude and longitude were calculated automatically.');
  };

  const changeZoom = (nextZoom) => {
    setZoom((current) => clamp(typeof nextZoom === 'function' ? nextZoom(current) : nextZoom, MIN_ZOOM, MAX_ZOOM));
  };

  const nudgeMap = (latDelta, lngDelta) => {
    const movement = 0.003 * (15 / zoom);
    emitChange(
      {
        lat: center.lat + latDelta * movement,
        lng: center.lng + lngDelta * movement,
      },
      'Map centre adjusted. Click the map to refine the exact delivery pin.',
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported on this device. Please click on the map instead.');
      return;
    }
    setStatus('Reading your current GPS location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        emitChange(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          'Current device GPS location selected.',
        );
      },
      () => setStatus('Unable to read GPS location. You can still zoom and click on the map to select the pin.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border bg-gray-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation}>
          <LocateFixed className="h-4 w-4" /> Use GPS
        </Button>
      </div>

      <div
        ref={mapRef}
        role="button"
        tabIndex={0}
        onClick={handleMapClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            emitChange(center, 'Map centre selected as the delivery pin.');
          }
        }}
        className="relative h-[320px] cursor-crosshair overflow-hidden rounded-2xl border bg-[#e5e7eb] outline-none focus:ring-2 focus:ring-[#22C55E]"
        aria-label="Select location from OpenStreetMap"
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable="false"
            className="absolute h-64 w-64 select-none"
            style={{ left: `${tile.left}px`, top: `${tile.top}px` }}
          />
        ))}

        <div className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-xl border bg-white shadow-sm">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); changeZoom((current) => current + 1); }}
            className="flex h-9 w-9 items-center justify-center border-r text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); changeZoom((current) => current - 1); }}
            className="flex h-9 w-9 items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute left-3 top-3 z-20 grid grid-cols-3 gap-1 rounded-xl border bg-white p-1 shadow-sm">
          <span />
          <button type="button" onClick={(event) => { event.stopPropagation(); nudgeMap(1, 0); }} className="h-7 w-7 rounded text-xs hover:bg-gray-50" aria-label="Move map north">↑</button>
          <span />
          <button type="button" onClick={(event) => { event.stopPropagation(); nudgeMap(0, -1); }} className="h-7 w-7 rounded text-xs hover:bg-gray-50" aria-label="Move map west">←</button>
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#f0fdf4] text-[#166534]"><Navigation className="h-3.5 w-3.5" /></div>
          <button type="button" onClick={(event) => { event.stopPropagation(); nudgeMap(0, 1); }} className="h-7 w-7 rounded text-xs hover:bg-gray-50" aria-label="Move map east">→</button>
          <span />
          <button type="button" onClick={(event) => { event.stopPropagation(); nudgeMap(-1, 0); }} className="h-7 w-7 rounded text-xs hover:bg-gray-50" aria-label="Move map south">↓</button>
          <span />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-full bg-white p-1 shadow-lg">
          <MapPin className="h-8 w-8 text-[#22C55E]" />
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs text-gray-600 shadow-sm">
          OpenStreetMap • Zoom {zoom}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-3 text-xs text-gray-600">
        <span className="font-semibold text-gray-900">Auto-generated coordinates:</span>{' '}
        {selected ? `${selected.lat}, ${selected.lng}` : 'No pin selected yet'}
      </div>
    </div>
  );
}
