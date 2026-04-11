import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { notifyBasketChanged } from '../lib/basket';

export function Checkout() {
  const navigate = useNavigate();
  const [basket, setBasket] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const loadBasket = () => api.get('/api/basket').then((res) => setBasket(res.data || { items: [] })).finally(() => setLoading(false));
  useEffect(() => { loadBasket().catch(() => {}); }, []);

  const subtotal = useMemo(() => Number(basket.subtotal || 0), [basket]);

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) await api.delete(`/api/basket/items/${itemId}`);
      else await api.put(`/api/basket/items/${itemId}`, { quantity });
      notifyBasketChanged();
      await loadBasket();
    } catch (error) {
      toast.error(error.message || 'Could not update basket');
    }
  };

  const clearBasket = async () => {
    try {
      await api.delete('/api/basket');
      notifyBasketChanged();
      await loadBasket();
      toast.success('Basket cleared');
    } catch (error) {
      toast.error(error.message || 'Could not clear basket');
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-10">Loading basket...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Your basket</h1>
          <p className="text-gray-600">Customer details are moved to checkout. This page is only for basket review and edits.</p>
        </div>
        {!!basket.items?.length && <Button variant="outline" onClick={clearBasket}>Clear basket</Button>}
      </div>

      {!basket.items?.length ? (
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <p className="text-lg text-gray-600">Your basket is empty.</p>
          <Button asChild className="mt-4"><Link to="/restaurants">Browse restaurants</Link></Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            {basket.items.map((item) => (
              <div key={item.id} className="rounded-3xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="mt-2 font-medium text-[#16A34A]">Rs. {Number(item.total_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}>-</Button>
                    <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                    <Button variant="outline" onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}>+</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Basket summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between"><span>Restaurant</span><span className="font-medium text-gray-900">{basket.restaurant_name || 'Selected restaurant'}</span></div>
              <div className="flex items-center justify-between"><span>Items</span><span className="font-medium text-gray-900">{basket.items.length}</span></div>
              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</span></div>
            </div>
            <Button className="mt-6 w-full" onClick={() => navigate('/order-checkout')}>Proceed to checkout</Button>
          </aside>
        </div>
      )}
    </div>
  );
}
