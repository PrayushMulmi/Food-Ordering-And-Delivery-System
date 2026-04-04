import { useEffect, useMemo, useState } from "react";
import { Badge, Input } from "../../shared/ui";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "sonner";

const statusOptions = ["Pending", "Confirmed", "Preparing", "Ready for Dispatch", "Out for Delivery", "Delivered", "Cancelled", "Refunded"];

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/restaurant-admin/orders');
      setOrders(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Could not load orders');
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = order.order_code?.toLowerCase().includes(q) || order.customer_name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [orders, searchQuery, filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/restaurant-admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input placeholder="Search by order code or customer name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border-2 border-gray-200 rounded-lg">
            <option value="all">All Status</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{order.order_code}</h3>
                <p className="text-gray-600">{order.customer_name}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{order.status}</Badge>
                <span className="font-semibold">Rs. {Number(order.final_total || 0).toFixed(2)}</span>
                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="px-4 py-2 border rounded-lg">
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700">Delivery address: {order.delivery_address}</p>
          </div>
        ))}
        {!filteredOrders.length && <div className="bg-white rounded-lg border p-8 text-center text-gray-600">No orders found.</div>}
      </div>
    </div>
  );
}
