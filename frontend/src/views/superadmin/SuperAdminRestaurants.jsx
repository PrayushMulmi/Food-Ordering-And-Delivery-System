import { useEffect, useState } from 'react';
import { Badge, Button, ImageWithFallback } from '../../shared/ui';
import { api, fileUrl } from '../../lib/api';
import { toast } from 'sonner';

function DetailPanel({ restaurant, onClose }) {
  if (!restaurant) {
    return (
      <aside className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-gray-500">
          Select a restaurant to view full details.
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{restaurant.name}</h2>
          <p className="text-sm text-gray-500">Restaurant details</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      <div className="mb-5 h-44 overflow-hidden rounded-2xl bg-gray-100">
        <ImageWithFallback
          src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p><span className="font-semibold">Cuisine:</span> {restaurant.cuisine || 'Not set'}</p>
        <p><span className="font-semibold">Address:</span> {restaurant.address || 'Not set'}</p>
        <p><span className="font-semibold">Contact:</span> {restaurant.contact_phone || 'Not set'}</p>
        <p><span className="font-semibold">Price Level:</span> {restaurant.price_level || 'Not set'}</p>
        <p><span className="font-semibold">Open:</span> {restaurant.is_open ? 'Yes' : 'No'}</p>
        <p><span className="font-semibold">Status:</span> {restaurant.status}</p>
        <p><span className="font-semibold">Rating:</span> {Number(restaurant.rating_average || 0).toFixed(1)}</p>
        <p><span className="font-semibold">Created:</span> {restaurant.created_at ? new Date(restaurant.created_at).toLocaleString() : '-'}</p>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 font-semibold">Description</h3>
        <p className="text-sm text-gray-600">{restaurant.description || 'No description provided.'}</p>
      </div>

      {!!restaurant.gallery_images?.length && (
        <div className="mt-5">
          <h3 className="mb-3 font-semibold">Gallery</h3>
          <div className="grid grid-cols-2 gap-3">
            {restaurant.gallery_images.slice(0, 6).map((img, index) => (
              <div key={`${img}-${index}`} className="h-24 overflow-hidden rounded-xl bg-gray-100">
                <ImageWithFallback src={fileUrl(img)} alt={`gallery-${index}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export function SuperAdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const load = async () => {
    const res = await api.get('/api/super-admin/restaurants');
    setRestaurants(res.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/api/super-admin/restaurants/${id}`);
      setSelectedRestaurant(res.data || null);
    } catch (error) {
      toast.error(error.message || 'Could not load restaurant detail');
    }
  };

  const runAction = async (restaurant, action) => {
    try {
      if (action === 'delete') await api.delete(`/api/super-admin/restaurants/${restaurant.id}`);
      else await api.put(`/api/super-admin/restaurants/${restaurant.id}/${action}`, {});
      toast.success(`Restaurant ${action}d successfully`);
      await load();
      if (selectedRestaurant?.id === restaurant.id) {
        if (action === 'delete') setSelectedRestaurant(null);
        else openDetail(restaurant.id);
      }
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Restaurant Management</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <button
                  type="button"
                  onClick={() => openDetail(restaurant.id)}
                  className="flex flex-1 items-center gap-4 text-left"
                >
                  <div className="h-20 w-28 overflow-hidden rounded-xl bg-gray-100">
                    <ImageWithFallback src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)} alt={restaurant.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{restaurant.name}</h3>
                    <p className="text-gray-600">{restaurant.cuisine || 'Cuisine not set'} • {restaurant.address || 'No address'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{Number(restaurant.rating_average || 0).toFixed(1)}★</Badge>
                      <Badge variant={restaurant.status === 'active' ? 'default' : 'outline'}>{restaurant.status}</Badge>
                    </div>
                  </div>
                </button>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => openDetail(restaurant.id)}>View Details</Button>
                  {restaurant.status === 'active' ? (
                    <Button variant="outline" onClick={() => runAction(restaurant, 'suspend')}>Suspend</Button>
                  ) : (
                    <Button variant="outline" onClick={() => runAction(restaurant, 'restore')}>Restore</Button>
                  )}
                  <Button variant="destructive" onClick={() => runAction(restaurant, 'delete')}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
          {!restaurants.length && (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-600">No restaurants found.</div>
          )}
        </div>
        <DetailPanel restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} />
      </div>
    </div>
  );
}
//