// v6
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get('/api/super-admin/dashboard').then((res) => setDashboard(res.data)).catch(() => {});
  }, []);

  const counts = dashboard?.counts || {};
  const actions = dashboard?.recentActions || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          ['Users', counts.total_users || 0],
          ['Customers', counts.total_customers || 0],
          ['Restaurant Admins', counts.total_restaurant_admins || 0],
          ['Restaurants', counts.total_restaurants || 0],
          ['Orders', counts.total_orders || 0],
          ['Revenue', `Rs. ${Number(counts.delivered_revenue || 0).toFixed(2)}`],
        ].map(([label, value]) => <div key={label} className="bg-white rounded-lg border p-5"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b"><h2 className="text-2xl font-bold">Recent Platform Actions</h2></div>
        <table className="w-full">
          <thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left">Action By</th><th className="px-4 py-3 text-left">Target</th><th className="px-4 py-3 text-left">Action</th><th className="px-4 py-3 text-left">Reason</th></tr></thead>
          <tbody>
            {actions.map((action) => <tr key={action.id} className="border-t"><td className="px-4 py-3">{action.action_by_name || 'System'}</td><td className="px-4 py-3">{action.target_type} #{action.target_id}</td><td className="px-4 py-3">{action.action_type}</td><td className="px-4 py-3">{action.reason || '-'}</td></tr>)}
            {!actions.length && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-600">No admin actions logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
