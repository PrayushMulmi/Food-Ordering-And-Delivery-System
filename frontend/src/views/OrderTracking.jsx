import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, ConfirmDialog } from '../shared/ui';
import { Check, Clock, MapPin, Package, Truck } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { LiveOrderMap } from '../components/LiveOrderMap';

const steps = [
  { key: 'Pending', label: 'Order Confirmed', icon: Check },
  { key: 'Preparing', label: 'Preparing', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: MapPin },
];

export function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const loadOrder = useCallback(() => api.get(`/api/orders/my/${id}`).then((res) => setOrder(res.data || null)), [id]);

  useEffect(() => {
    loadOrder().catch(() => {});
  }, [loadOrder]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadOrder().catch(() => {});
    }, 10000);

    return () => window.clearInterval(timer);
  }, [loadOrder]);

  const cancelOrder = async () => {
    try {
      await api.put(`/api/orders/my/${id}/cancel`, {});
      toast.success('Order cancelled');
      setCancelDialogOpen(false);
      loadOrder();
    } catch (error) {
      toast.error(error.message || 'Could not cancel order');
    }
  };

  const activeIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === 'Delivered') return 3;
    if (order.status === 'Out for Delivery') return 2;
    if (['Preparing', 'Ready for Dispatch'].includes(order.status)) return 1;
    return 0;
  }, [order]);

  if (!order) return <div className="container mx-auto px-4 py-10">Loading order...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-12 text-center lg:text-left"><h1 className="mb-4 text-5xl font-bold">Track Your Order</h1><p className="text-xl text-gray-600">Order ID: #{order.order_code}</p></div>

          <LiveOrderMap order={order} />

          <div className="mb-12 rounded-2xl bg-white">
            <div className="relative">
              {steps.map((step, index) => {
                const completed = index <= activeIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative mb-8 flex items-start gap-4 last:mb-0">
                    {index !== steps.length - 1 && <div className={`absolute left-6 top-14 h-16 w-1 ${completed ? 'bg-[#22C55E]' : 'bg-gray-300'}`} />}
                    <div className={`z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${completed ? 'bg-[#22C55E] text-white' : 'bg-gray-200 text-gray-400'}`}><Icon className="h-6 w-6" /></div>
                    <div className="flex-1 pt-2">
                      <h3 className="mb-1 text-xl font-semibold">{step.label}</h3>
                      {completed && <p className="text-sm text-gray-500">Updated in your live order history</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 p-8"><div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/20"><Clock className="h-8 w-8 text-[#F97316]" /></div><div><h3 className="text-2xl font-bold">{order.status === 'Delivered' ? 'Delivered Successfully' : 'Arriving Soon!'}</h3><p className="text-lg text-gray-600">{order.status === 'Delivered' ? 'Your order has arrived.' : 'Track live progress from the restaurant.'}</p></div></div><div className="grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2"><div><p className="mb-1 text-sm text-gray-600">Delivery Address</p><p className="font-semibold">{order.delivery_address}</p></div><div><p className="mb-1 text-sm text-gray-600">Restaurant</p><p className="font-semibold">{order.restaurant_name}</p></div></div></div>
          {['Pending', 'Confirmed', 'Preparing'].includes(order.status) && <Button variant="outline" className="w-full" onClick={() => setCancelDialogOpen(true)}>Cancel order</Button>}
        </div>
        <aside className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">Order details</h2><p className="text-sm text-gray-500">{order.restaurant_name}</p></div><Badge>{order.status}</Badge></div><div className="space-y-3 text-sm">{(order.items || []).map((item) => <div key={item.id} className="flex items-center justify-between border-b pb-3"><span>{item.item_name} × {item.quantity}</span><span>Rs. {Number(item.total_price || 0).toFixed(2)}</span></div>)}<div className="flex items-center justify-between"><span>Subtotal</span><span>Rs. {Number(order.subtotal || 0).toFixed(2)}</span></div><div className="flex items-center justify-between"><span>Discount</span><span>- Rs. {Number(order.discount_amount || 0).toFixed(2)}</span></div><div className="flex items-center justify-between"><span>Delivery Fee</span><span>Rs. {Number(order.delivery_fee || 0).toFixed(2)}</span></div><div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span>Rs. {Number(order.final_total || 0).toFixed(2)}</span></div></div></aside>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel this order?"
        description="This action will cancel the current order and stop further preparation."
        confirmText="Cancel order"
        confirmVariant="destructive"
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={cancelOrder}
      />
    </div>
  );
}
