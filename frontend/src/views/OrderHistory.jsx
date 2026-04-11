import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../shared/ui';
import { api } from '../lib/api';

export function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/api/orders/my').then((res) => setOrders(res.data || [])).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-4xl font-bold">Order history</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{order.restaurant_name}</h2>
                <p className="text-sm text-gray-500">Order #{order.order_code}</p>
                <p className="mt-2 text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary">{order.status}</Badge>
                <Badge>Rs. {Number(order.final_total || 0).toFixed(2)}</Badge>
                <Button variant="outline" asChild><Link to={`/order/${order.id}`}>Track order</Link></Button>
              </div>
            </div>
          </div>
        ))}
        {!orders.length && <div className="rounded-3xl border bg-white p-10 text-center text-gray-600">No orders yet.</div>}
      </div>
    </div>
  );
}
