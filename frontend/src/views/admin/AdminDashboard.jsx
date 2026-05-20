import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge, Button } from "../../shared/ui";
import { api } from "../../lib/api";
import { toast } from "sonner";

export function AdminDashboard() {//
  const [restaurant, setRestaurant] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/restaurant-admin/restaurant"),
      api.get("/api/restaurant-admin/dashboard"),
      api.get("/api/restaurant-admin/active-coupons"),
    ])
      .then(([r, d, c]) => {
        setRestaurant(r.data);
        setDashboard(d.data);
        setActiveCoupons(c.data || []);
      })
      .catch(() => {});
  }, []);

  const statsData = useMemo(() => {
    const summary = dashboard?.summary || {};
    const reviews = dashboard?.recentReviews || [];
    const avg = reviews.length
      ? (
          reviews.reduce((a, r) => a + Number(r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : Number(restaurant?.rating_average || 0).toFixed(1);
    return [
      {
        label: "Total Orders",
        value: summary.total_orders ?? 0,
        color: "from-[#22C55E] to-[#16A34A]",
      },
      {
        label: "Revenue",
        value: `Rs. ${Number(summary.total_sales || 0).toFixed(2)}`,
        color: "from-[#F97316] to-[#EA580C]",
      },
      { label: "Avg Rating", value: avg, color: "from-[#FACC15] to-[#EAB308]" },
      {
        label: "Total Reviews",
        value: reviews.length,
        color: "from-[#22C55E] to-[#16A34A]",
      },
    ];
  }, [dashboard, restaurant]);

  const bestsellers = dashboard?.topItems || [];
  const recentReviews = dashboard?.recentReviews || [];
  const restaurantSuspended = String(restaurant?.status || '').toLowerCase() === 'suspended';

  const toggleRestaurantStatus = async () => {
    if (!restaurant) return;
    if (restaurantSuspended) {
      toast.error('This restaurant is suspended. Open/close status cannot be changed until SuperAdmin restores it.');
      return;
    }
    setStatusUpdating(true);
    try {
      let res;
      const nextOpen = !restaurant.is_open;
      try {
        res = await api.put('/api/restaurant-admin/restaurant/status', { is_open: nextOpen });
      } catch (statusRouteError) {
        if (!/route not found/i.test(statusRouteError.message || '')) throw statusRouteError;
        res = await api.put('/api/restaurant-admin/restaurant', { ...restaurant, is_open: nextOpen });
      }
      setRestaurant(res.data || { ...restaurant, is_open: nextOpen });
      toast.success(`Restaurant is now ${(res.data || { is_open: nextOpen })?.is_open ? 'open' : 'closed'}`);
    } catch (error) {
      toast.error(error.message || 'Could not update restaurant status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-2 text-2xl font-semibold">
          {restaurant?.name || "Restaurant Dashboard"}
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          {restaurant?.address || "No address added yet"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-[#16A34A] px-4 py-2 text-white">
            {currentDate}
          </Badge>
          <Badge className={restaurantSuspended ? 'bg-red-600 px-4 py-2 text-white' : restaurant?.is_open ? 'bg-[#22C55E] px-4 py-2 text-white' : 'bg-gray-700 px-4 py-2 text-white'}>
            {restaurantSuspended ? 'Suspended' : restaurant?.is_open ? 'Open' : 'Closed'}
          </Badge>
          <Button type="button" variant="outline" onClick={toggleRestaurantStatus} disabled={!restaurant || statusUpdating || restaurantSuspended}>
            {restaurantSuspended ? 'Status locked' : statusUpdating ? 'Updating...' : restaurant?.is_open ? 'Close restaurant' : 'Open restaurant'}
          </Button>
        </div>
        {restaurantSuspended && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <p className="font-semibold">Restaurant suspended</p>
            <p className="mt-1">Your restaurant is currently suspended by SuperAdmin. Restaurant management actions, menu changes, order updates, and open/close status changes are disabled until the restaurant is restored.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg bg-gradient-to-br ${stat.color} p-6 text-white shadow-lg`}
          >
            <p className="mb-2 text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg bg-[#ffffff00] p-6 lg:col-span-2 border-2">
          <h2 className="mb-6 text-lg font-semibold">Sales</h2>
          <div className="grid gap-4 text-center md:grid-cols-3">
            <div className="rounded-lg bg-white p-6">
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-lg font-semibold">
                {dashboard?.summary?.delivered_orders ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-semibold">
                {dashboard?.summary?.pending_orders ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-lg font-semibold">
                Rs. {Number(dashboard?.summary?.total_sales || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#f8f8f800] p-6 border-2">
          <h2 className="mb-4 text-lg font-semibold">Active Coupons</h2>
          <div className="space-y-3">
            {activeCoupons.length ? (
              activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-2xl border bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{coupon.code}</span>
                    <Badge>{Number(coupon.discount_value || 0)}%</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Expires{" "}
                    {coupon.end_date
                      ? new Date(coupon.end_date).toISOString().slice(0, 10)
                      : "-"}
                  </p>
                  {coupon.max_discount_amount && (
                    <p className="text-xs text-gray-500">
                      Max value Rs.{" "}
                      {Number(coupon.max_discount_amount).toFixed(2)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-gray-600">
                No active coupons for this restaurant.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-lg bg-[#fcfcfc00] p-6 lg:col-span-2 border-2">
          <h2 className="mb-6 text-lg font-semibold">Bestsellers</h2>
          <ul className="space-y-4">
            {bestsellers.length ? (
              bestsellers.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-white px-5 py-4"
                >
                  <span className="font-semibold">{item.item_name}</span>
                  <span className="text-sm text-gray-600">
                    {item.total_quantity} sold
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-lg bg-white px-5 py-4 text-sm text-gray-600">
                No sales data yet.
              </li>
            )}
          </ul>
        </section>

        <section>
          <div className="rounded-lg bg-[#fafafa00] p-6 border-2">
            <h2 className="mb-6 text-lg font-semibold">Overall Review</h2>
            <p className="mb-6 text-center font-medium">Recent Reviews</p>

            <div className="mb-8 space-y-4">
              {recentReviews.length ? (
                recentReviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-black bg-white px-6 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "fill-[#FACC15] text-[#FACC15]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-2 text-base font-semibold text-gray-900">
                      {review.customer_name || "Anonymous Customer"}
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-600">
                  No reviews yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
