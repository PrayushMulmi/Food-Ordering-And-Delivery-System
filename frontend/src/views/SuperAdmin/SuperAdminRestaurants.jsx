import { useEffect, useState } from "react";
import { Button } from "../../shared/ui";
import { api } from "../../lib/api";
import { toast } from "sonner";

export function SuperAdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  const load = async () => {
    const res = await api.get('/api/super-admin/restaurants');
    setRestaurants(res.data || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const runAction = async (restaurant, action) => {
    try {
      if (action === 'delete') await api.delete(`/api/super-admin/restaurants/${restaurant.id}`);
      else await api.put(`/api/super-admin/restaurants/${restaurant.id}/${action}`, {});
      toast.success(`Restaurant ${action}d successfully`);
      load();
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Restaurant Management</h1>
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-lg border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{restaurant.name}</h3>
              <p className="text-gray-600">{restaurant.cuisine || 'Cuisine not set'} • {restaurant.address || 'No address'}</p>
              <p className="text-sm text-gray-500">Status: {restaurant.status}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {restaurant.status === 'active' ? <Button variant="outline" onClick={() => runAction(restaurant, 'suspend')}>Suspend</Button> : <Button variant="outline" onClick={() => runAction(restaurant, 'restore')}>Restore</Button>}
              <Button variant="destructive" onClick={() => runAction(restaurant, 'delete')}>Delete</Button>
            </div>
          </div>
        ))}
        {!restaurants.length && <div className="bg-white rounded-lg border p-8 text-center text-gray-600">No restaurants found.</div>}
      </div>
    </div>
  );
}
