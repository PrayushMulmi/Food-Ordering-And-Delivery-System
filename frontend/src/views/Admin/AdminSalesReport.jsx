// v6
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

export function AdminSalesReport() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/api/restaurant-admin/orders').then((res) => setOrders(res.data || [])).catch(() => {});
  }, []);

  const metrics = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'Delivered');
    const revenue = delivered.reduce((sum, o) => sum + Number(o.final_total || 0), 0);
    return {
      totalOrders: orders.length,
      deliveredOrders: delivered.length,
      revenue,
      avgOrderValue: delivered.length ? revenue / delivered.length : 0,
    };
  }, [orders]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold">Sales Report</h1>
      <div className="grid md:grid-cols-4 gap-6">
        {[
          ['Total Orders', metrics.totalOrders],
          ['Delivered Orders', metrics.deliveredOrders],
          ['Revenue', `Rs. ${metrics.revenue.toFixed(2)}`],
          ['Avg Order Value', `Rs. ${metrics.avgOrderValue.toFixed(2)}`],
        ].map(([label, value]) => <div key={label} className="bg-white rounded-lg border p-6"><p className="text-gray-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Amount</th></tr></thead>
          <tbody>
            {orders.map((order) => <tr key={order.id} className="border-t"><td className="px-4 py-3">{order.order_code}</td><td className="px-4 py-3">{new Date(order.created_at).toLocaleString()}</td><td className="px-4 py-3">{order.status}</td><td className="px-4 py-3 text-right">Rs. {Number(order.final_total || 0).toFixed(2)}</td></tr>)}
            {!orders.length && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-600">No sales yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
