import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Input } from "../../shared/ui";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "sonner";

const statusOptions = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivery Failed", "Delivered", "Cancelled", "Refunded"];
const statusLabels = { "Out for Delivery": "Dispatched" };
const nextStatusMap = {
  Pending: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Out for Delivery",
  "Ready for Dispatch": "Out for Delivery",
};

const labelStatus = (status) => statusLabels[status] || status;
const getNextStatus = (status) => nextStatusMap[status] || null;

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [restaurant, setRestaurant] = useState(null);
  const restaurantSuspended = String(restaurant?.status || "").toLowerCase() === "suspended";

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/restaurant-admin/orders');
      setOrders(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Could not load orders');
    }
  };

  useEffect(() => {
    loadOrders();
    api.get('/api/restaurant-admin/restaurant').then((res) => setRestaurant(res.data || null)).catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = order.order_code?.toLowerCase().includes(q) || order.customer_name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [orders, searchQuery, filterStatus]);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/api/restaurant-admin/orders/${id}`);
      setSelectedOrder(res.data || null);
    } catch (error) {
      toast.error(error.message || 'Could not load order detail');
    }
  };

  const moveNext = async (order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    if (restaurantSuspended) {
      toast.error('Restaurant is suspended. Order updates are disabled.');
      return;
    }
    try {
      await api.put(`/api/restaurant-admin/orders/${order.id}/status`, { status: nextStatus });
      toast.success(`Order moved to ${labelStatus(nextStatus)}`);
      await loadOrders();
      if (selectedOrder?.id === order.id) await openDetail(order.id);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const OrderNextButton = ({ order }) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return <Badge variant="secondary">Final</Badge>;
    return <Button type="button" disabled={restaurantSuspended} onClick={() => moveNext(order)}>{restaurantSuspended ? "Suspended" : `Next: ${labelStatus(nextStatus)}`}</Button>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Orders Management</h1>
      {restaurantSuspended && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">Restaurant suspended</p>
          <p className="mt-1">Order status updates are disabled until SuperAdmin restores this restaurant. Existing orders remain visible for review.</p>
        </div>
      )}
      <div className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Input placeholder="Search by order code or customer name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm">
            <option value="all">All Status</option>
            {statusOptions.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="max-h-[calc(100vh-260px)] space-y-4 overflow-y-auto pr-2">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{order.order_code}</h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{labelStatus(order.status)}</Badge>
                  <span className="font-semibold">Rs. {Number(order.final_total || 0).toFixed(2)}</span>
                  <OrderNextButton order={order} />
                  <Button variant="outline" onClick={() => openDetail(order.id)}>View Detail</Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">Delivery address: {order.delivery_address}</p>
            </div>
          ))}
          {!filteredOrders.length && <div className="rounded-lg border bg-white p-8 text-center text-gray-600">No orders found.</div>}
        </div>

        <aside className="rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-32 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
          {selectedOrder ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Order detail</h2>
                <OrderNextButton order={selectedOrder} />
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Customer:</span> {selectedOrder.customer_name}</p>
                <p><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone || '-'}</p>
                <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email || '-'}</p>
                <p><span className="font-semibold">Location:</span> {selectedOrder.delivery_address}</p>
                <p><span className="font-semibold">Customer note:</span> {selectedOrder.notes?.trim() || 'No customer note added.'}</p>
                <p><span className="font-semibold">Status:</span> {labelStatus(selectedOrder.status)}</p>
                <p><span className="font-semibold">Discount:</span> Rs. {Number(selectedOrder.discount_amount || 0).toFixed(2)}</p>
              </div>
              <div className="mt-5 space-y-3">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 text-sm">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span>Rs. {Number(item.total_price || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between"><span>Subtotal</span><span>Rs. {Number(selectedOrder.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Delivery fee</span><span>Rs. {Number(selectedOrder.delivery_fee || 0).toFixed(2)}</span></div>
                <div className="flex items-center justify-between font-semibold"><span>Total</span><span>Rs. {Number(selectedOrder.final_total || 0).toFixed(2)}</span></div>
              </div>
            </>
          ) : <div className="text-sm text-gray-500">Select an order to view full details including items, subtotal, customer name, location, and discounts.</div>}
        </aside>
      </div>
    </div>
  );
}
