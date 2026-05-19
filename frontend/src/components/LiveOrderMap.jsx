import { useMemo } from 'react';
import { Clock3, MapPin, Navigation, Store, UserRound } from 'lucide-react';
import { Button } from '../shared/ui';
import { buildOpenStreetMapDirectionsUrl, buildOsmEmbedSrc, parseCoordinatesFromMapUrl } from '../utils/location';

function formatCoordinates(coords) {
  if (!coords) return 'Unavailable';
  return `${Number(coords.lat).toFixed(4)}, ${Number(coords.lng).toFixed(4)}`;
}

function buildCoords(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { lat: latitude, lng: longitude } : null;
}

export function LiveOrderMap({ order }) {
  const storedRestaurantCoordinates = useMemo(
    () => buildCoords(order.restaurant_latitude, order.restaurant_longitude),
    [order.restaurant_latitude, order.restaurant_longitude],
  );

  const restaurantCoordinates = useMemo(
    () => storedRestaurantCoordinates || parseCoordinatesFromMapUrl(order.restaurant_location_url),
    [order.restaurant_location_url, storedRestaurantCoordinates],
  );

  const customerCoordinates = useMemo(() => buildCoords(order.delivery_latitude, order.delivery_longitude), [order.delivery_latitude, order.delivery_longitude]);

  const riderCoordinates = useMemo(() => buildCoords(order.rider_current_latitude, order.rider_current_longitude), [order.rider_current_latitude, order.rider_current_longitude]);

  const mapMode = order.status === 'Delivered'
    ? 'customer'
    : order.status === 'Out for Delivery'
      ? 'rider'
      : 'restaurant';

  const targetCoordinates = mapMode === 'customer'
    ? customerCoordinates
    : mapMode === 'rider'
      ? (riderCoordinates || customerCoordinates)
      : restaurantCoordinates;

  const routeUrl = useMemo(() => {
    if (customerCoordinates && restaurantCoordinates) {
      return buildOpenStreetMapDirectionsUrl(customerCoordinates, restaurantCoordinates);
    }
    return buildOpenStreetMapDirectionsUrl(customerCoordinates || targetCoordinates, restaurantCoordinates);
  }, [customerCoordinates, restaurantCoordinates, targetCoordinates]);

  const mapTitle = mapMode === 'restaurant'
    ? 'Restaurant location'
    : mapMode === 'customer'
      ? 'Delivered location'
      : 'Live rider location';

  const mapDescription = mapMode === 'restaurant'
    ? 'Until dispatch, the map shows the restaurant location saved by the restaurant admin.'
    : mapMode === 'customer'
      ? 'After delivery, the map shows the customer delivery location.'
      : 'After dispatch, the map shows the rider GPS position received from the rider device.';

  const fallbackMapSrc = buildOsmEmbedSrc({
    query: targetCoordinates ? null : `${order.restaurant_name || 'Restaurant'} ${order.restaurant_address || ''}`.trim(),
    coordinates: targetCoordinates,
  });

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{mapTitle}</h2>
          <p className="mt-1 text-sm text-gray-600">{mapDescription}</p>
        </div>
        <div className="rounded-full bg-[#f0fdf4] px-4 py-2 text-sm font-medium text-[#166534]">
          {mapMode === 'restaurant' ? 'Pre-dispatch view' : mapMode === 'customer' ? 'Delivery completed' : 'Live rider tracking'}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-gray-50">
        <iframe
          title={mapTitle}
          src={fallbackMapSrc}
          className="h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Store className="h-4 w-4 text-[#22C55E]" />
            Restaurant source
          </div>
          <p className="text-sm font-semibold text-gray-900">{order.restaurant_name}</p>
          <p className="mt-1 text-sm text-gray-600">{order.restaurant_address || 'Address unavailable'}</p>
          <p className="mt-1 text-xs text-gray-500">Coordinates: {formatCoordinates(restaurantCoordinates)}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-[#F97316]" />
            Delivery point
          </div>
          <p className="text-sm font-semibold text-gray-900">{order.delivery_address}</p>
          <p className="mt-1 text-xs text-gray-500">Coordinates: {formatCoordinates(customerCoordinates)}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <UserRound className="h-4 w-4 text-[#0EA5E9]" />
            Rider
          </div>
          <p className="text-sm font-semibold text-gray-900">{order.rider_name || 'Awaiting assignment'}</p>
          <p className="mt-1 text-sm text-gray-600">{order.rider_phone || 'No rider phone yet'}</p>
          <p className="mt-1 text-xs text-gray-500">Current: {formatCoordinates(riderCoordinates)}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            {mapMode === 'restaurant' ? <Clock3 className="h-4 w-4 text-[#F97316]" /> : <Navigation className="h-4 w-4 text-[#22C55E]" />}
            Tracking status
          </div>
          <p className="text-sm font-semibold text-gray-900">{mapMode === 'restaurant' ? 'Waiting for dispatch' : mapMode === 'customer' ? 'Delivered' : 'Tracking real GPS'}</p>
          <p className="mt-2 text-xs text-gray-500">
            {mapMode === 'restaurant'
              ? 'The restaurant latitude and longitude are used as the route source before dispatch.'
              : 'OpenStreetMap navigation starts from the restaurant and points to the delivery destination.'}
          </p>
          {routeUrl && (
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <a href={routeUrl} target="_blank" rel="noreferrer">Open route</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
