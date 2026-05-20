import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Button } from '../../shared/ui';
import { toast } from 'sonner';
import { buildOpenStreetMapDirectionsUrl, parseCoordinatesFromMapUrl } from '../../utils/location';

const TRACKING_INTERVAL_MS = 10000;

function numericCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function coordinatesFromPair(latValue, lngValue) {
  const lat = numericCoordinate(latValue);
  const lng = numericCoordinate(lngValue);
  return lat != null && lng != null ? { lat, lng } : null;
}

function readCurrentGpsCoordinates() {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 },
    );
  });
}

export function RiderOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Waiting until an order is dispatched.');
  const timerRef = useRef(null);
  const selectedOrderRef = useRef(null);

  const load = useCallback(async () => {
    const res = await api.get('/api/rider/orders');
    const nextOrders = res.data || [];
    setOrders(nextOrders);
    if (selectedOrderRef.current) {
      const match = nextOrders.find((item) => Number(item.id) === Number(selectedOrderRef.current.id));
      if (match) {
        const detail = await api.get(`/api/rider/orders/${match.id}`);
        setSelectedOrder(detail.data || match);
      }
    }
  }, []);

  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const activeOrder = useMemo(() => orders.find((item) => item.status === 'Out for Delivery'), [orders]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activeOrder) {
      setGpsStatus('Waiting until an order is dispatched.');
      return undefined;
    }

    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported on this device.');
      return undefined;
    }

    const syncLocation = () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          active_order_id: activeOrder.id,
          accuracy_meters: position.coords.accuracy,
        };

        try {
          const response = await api.put('/api/rider/location', next);
          setGpsStatus(`Live GPS synced at ${new Date().toLocaleTimeString()}${response?.data?.accuracy_meters ? ` • ±${Math.round(response.data.accuracy_meters)}m` : ''}`);
          load().catch(() => {});
        } catch (error) {
          toast.error(error.message || 'Could not update rider location');
        }
      }, (error) => {
        if (error.code === 1) setGpsStatus('Location permission denied. Enable GPS access to share live delivery updates.');
        else if (error.code === 3) setGpsStatus('Timed out while requesting GPS. Move near a window or try a mobile device.');
        else setGpsStatus('Unable to read GPS right now.');
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      });
    };

    setGpsStatus('Order collected. Sharing real GPS every 10 seconds...');
    syncLocation();
    timerRef.current = window.setInterval(syncLocation, TRACKING_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeOrder, load]);

  const openDetail = async (orderId) => {
    try {
      const res = await api.get(`/api/rider/orders/${orderId}`);
      setSelectedOrder(res.data || null);
    } catch (error) {
      toast.error(error.message || 'Could not load order detail');
    }
  };

  const openNavigation = async () => {
    if (!selectedOrder) return;

    const destination = {
      lat: numericCoordinate(selectedOrder.delivery_latitude),
      lng: numericCoordinate(selectedOrder.delivery_longitude),
      address: selectedOrder.delivery_address,
    };

    let source = coordinatesFromPair(selectedOrder.rider_current_latitude, selectedOrder.rider_current_longitude);
    if (!source) source = await readCurrentGpsCoordinates();
    if (!source) source = coordinatesFromPair(selectedOrder.restaurant_latitude, selectedOrder.restaurant_longitude);
    if (!source) source = parseCoordinatesFromMapUrl(selectedOrder.restaurant_location_url);

    const url = buildOpenStreetMapDirectionsUrl(destination, source);
    if (!url) {
      toast.error('Customer location is missing or invalid');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const updateDeliveryStatus = async (status) => {
    if (!selectedOrder) return;
    try {
      const res = await api.put(`/api/rider/orders/${selectedOrder.id}/status`, { status });
      setSelectedOrder(res.data || { ...selectedOrder, status });
      toast.success(`Order marked as ${status}`);
      await load();
    } catch (error) {
      toast.error(error.message || 'Could not update delivery status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Assigned Orders</h1>
        <p className="text-gray-600">{gpsStatus}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-4">
          {orders.length ? orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{order.order_code}</h2>
                  <p className="text-sm text-gray-600">{order.restaurant_name} → {order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.delivery_address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{order.status}</Badge>
                  <Button variant="outline" onClick={() => openDetail(order.id)}>View detail</Button>
                </div>
              </div>
            </div>
          )) : <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">No assigned orders yet.</div>}
        </div>

        <aside className="rounded-2xl border bg-white p-6 shadow-sm">
          {selectedOrder ? (
            <>
              <h2 className="text-2xl font-semibold">Order detail</h2>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Order:</span> {selectedOrder.order_code}</p>
                <p><span className="font-semibold">Customer:</span> {selectedOrder.customer_name}</p>
                <p><span className="font-semibold">Customer phone:</span> {selectedOrder.customer_phone || '-'}</p>
                <p><span className="font-semibold">Restaurant:</span> {selectedOrder.restaurant_name}</p>
                <p><span className="font-semibold">Pickup:</span> {selectedOrder.restaurant_address || '-'}</p>
                <p><span className="font-semibold">Drop-off:</span> {selectedOrder.delivery_address}</p>
                <p><span className="font-semibold">Delivery fee:</span> Rs. {Number(selectedOrder.delivery_fee || 0).toFixed(2)}</p>
                <p><span className="font-semibold">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-semibold">Rider coordinates:</span> {selectedOrder.rider_current_latitude && selectedOrder.rider_current_longitude ? `${selectedOrder.rider_current_latitude}, ${selectedOrder.rider_current_longitude}` : 'Waiting for GPS update'}</p>
              </div>
              <Button type="button" className="mt-4 w-full" onClick={openNavigation}>Open customer in OpenStreetMap</Button>
              {selectedOrder.status === 'Out for Delivery' && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Button type="button" onClick={() => updateDeliveryStatus('Delivered')}>Mark Delivered</Button>
                  <Button type="button" variant="destructive" onClick={() => updateDeliveryStatus('Delivery Failed')}>Delivery Failed</Button>
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-500">Select an order to view customer and delivery details.</p>}
        </aside>
      </div>
    </div>
  );
}
