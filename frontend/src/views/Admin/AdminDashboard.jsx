import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "../../shared/ui";
import { api } from "../../lib/api";

export function AdminDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/restaurant-admin/restaurant'),
      api.get('/api/restaurant-admin/dashboard'),
    ]).then(([r, d]) => {
      setRestaurant(r.data);
      setDashboard(d.data);
    }).catch(() => {});
  }, []);

  const statsData = useMemo(() => {
    const summary = dashboard?.summary || {};
    const reviews = dashboard?.recentReviews || [];
    const avg = reviews.length ? (reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : Number(restaurant?.rating_average || 0).toFixed(1);
    return [
      { label: 'Total Orders', value: summary.total_orders ?? 0, color: 'from-[#22C55E] to-[#16A34A]' },
      { label: 'Revenue', value: `Rs. ${Number(summary.total_sales || 0).toFixed(2)}`, color: 'from-[#F97316] to-[#EA580C]' },
      { label: 'Avg Rating', value: avg, color: 'from-[#FACC15] to-[#EAB308]' },
      { label: 'Total Reviews', value: reviews.length, color: 'from-[#22C55E] to-[#16A34A]' },
    ];
  }, [dashboard, restaurant]);

  const bestsellers = dashboard?.topItems || [];
  const recentReviews = dashboard?.recentReviews || [];
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{restaurant?.name || 'Restaurant Dashboard'}</h1>
        <p className="text-2xl text-gray-600 mb-4">{restaurant?.address || 'No address added yet'}</p>
        <Badge className="bg-[#16A34A] text-white text-base px-4 py-2">{currentDate}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg`}>
            <p className="text-lg font-medium mb-2 opacity-90">{stat.label}</p>
            <p className="text-4xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#f0fdf4] rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6">Sales</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-6"><p className="text-lg text-gray-600">Delivered</p><p className="text-3xl font-bold">{dashboard?.summary?.delivered_orders ?? 0}</p></div>
            <div className="bg-white rounded-lg p-6"><p className="text-lg text-gray-600">Pending</p><p className="text-3xl font-bold">{dashboard?.summary?.pending_orders ?? 0}</p></div>
            <div className="bg-white rounded-lg p-6"><p className="text-lg text-gray-600">Total Sales</p><p className="text-3xl font-bold">Rs. {Number(dashboard?.summary?.total_sales || 0).toFixed(2)}</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Overall Review</h2>
          <div className="bg-[#f0fdf4] rounded-lg p-6">
            <p className="text-xl font-medium text-center mb-6">Recent Reviews</p>
            <div className="space-y-4 mb-8">
              {recentReviews.length ? recentReviews.map((review, index) => (
                <div key={index} className="bg-white border border-black rounded-2xl px-6 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-[#FACC15] text-[#FACC15]' : 'text-gray-300'}`} />)}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                </div>
              )) : <p className="text-center text-gray-600">No reviews yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-6">Bestsellers</h2>
        <div className="bg-[#f0fdf4] rounded-lg p-6">
          <ul className="space-y-4">
            {bestsellers.length ? bestsellers.map((item, index) => (
              <li key={index} className="bg-white rounded-lg px-5 py-4 flex items-center justify-between">
                <span className="font-semibold">{item.item_name}</span>
                <span className="text-gray-600">{item.total_quantity} sold</span>
              </li>
            )) : <li className="bg-white rounded-lg px-5 py-4 text-gray-600">No sales data yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
//