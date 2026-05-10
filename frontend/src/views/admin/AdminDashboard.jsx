import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "../../shared/ui";
import { api } from "../../lib/api";

export function AdminDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);

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
        <Badge className="bg-[#16A34A] px-4 py-2 text-white">
          {currentDate}
        </Badge>
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
