import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea } from '../shared/ui';
import { createOrder } from '../controllers/orderController';
import { api } from '../lib/api';
import { toast } from 'sonner';

const DELIVERY_FEE = 70;

function getDefaultPricing(subtotal = 0) {
  const numericSubtotal = Number(subtotal || 0);
  return {
    subtotal: numericSubtotal,
    delivery_fee: DELIVERY_FEE,
    discount_amount: 0,
    final_total: numericSubtotal + DELIVERY_FEE,
    coupon: null,
  };
}

function normalizePricing(data, subtotalFallback = 0) {
  const fallback = getDefaultPricing(subtotalFallback);
  return {
    subtotal: Number(data?.subtotal ?? fallback.subtotal),
    delivery_fee: Number(data?.delivery_fee ?? fallback.delivery_fee),
    discount_amount: Number(data?.discount_amount ?? fallback.discount_amount),
    final_total: Number(data?.final_total ?? fallback.final_total),
    coupon: data?.coupon || null,
  };
}

export function OrderCheckout() {
  const navigate = useNavigate();
  const [basket, setBasket] = useState({ items: [] });
  const [form, setForm] = useState({ delivery_address: '', notes: '' });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [pricing, setPricing] = useState(getDefaultPricing());
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponState, setCouponState] = useState({ type: '', message: '' });

  const updatePricing = (data, subtotalFallback = basket.subtotal) => {
    const normalized = normalizePricing(data, subtotalFallback);
    setPricing(normalized);
    return normalized;
  };

  const loadPricing = async (couponCode = '', subtotalFallback = basket.subtotal) => {
    const res = await api.post('/api/orders/preview', couponCode ? { coupon_code: couponCode } : {});
    return updatePricing(res.data, subtotalFallback);
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const basketRes = await api.get('/api/basket');
        const nextBasket = basketRes.data || { items: [] };
        setBasket(nextBasket);
        setPricing(getDefaultPricing(nextBasket.subtotal || 0));

        if (nextBasket.items?.length) {
          try {
            await loadPricing('', nextBasket.subtotal || 0);
          } catch {
            setPricing(getDefaultPricing(nextBasket.subtotal || 0));
          }
        }
      } catch {
        setBasket({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  const applyCoupon = async () => {
    const code = couponInput.trim();

    if (!code) {
      setAppliedCoupon(null);
      setCouponState({ type: '', message: '' });
      try {
        await loadPricing('', basket.subtotal || 0);
      } catch {
        setPricing(getDefaultPricing(basket.subtotal || 0));
      }
      return;
    }

    setApplyingCoupon(true);
    try {
      const nextPricing = await loadPricing(code, basket.subtotal || 0);
      setAppliedCoupon(nextPricing.coupon);
      setCouponInput(nextPricing.coupon?.code || code);
      setCouponState({ type: 'success', message: `${nextPricing.coupon?.code || code} applied successfully.` });
    } catch (error) {
      if (!appliedCoupon || appliedCoupon.code === code) {
        try {
          await loadPricing('', basket.subtotal || 0);
        } catch {
          setPricing(getDefaultPricing(basket.subtotal || 0));
        }
        setAppliedCoupon(null);
      }
      setCouponState({ type: 'error', message: error.message || 'Invalid coupon code.' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponState({ type: '', message: '' });
    try {
      await loadPricing('', basket.subtotal || 0);
    } catch {
      setPricing(getDefaultPricing(basket.subtotal || 0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const order = await createOrder({
        ...form,
        coupon_code: appliedCoupon?.code || '',
        delivery_fee: pricing.delivery_fee,
      });
      toast.success('Order placed successfully');
      navigate(`/order/${order.data.id}`);
    } catch (error) {
      toast.error(error.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-10">Loading checkout...</div>;
  if (!basket.items?.length) return <div className="container mx-auto px-4 py-10">Your basket is empty.</div>;

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-4xl font-bold">Checkout</h1>
        <div className="space-y-4">
          <Input placeholder="Delivery address" className="h-12" value={form.delivery_address} onChange={(e) => setForm((p) => ({ ...p, delivery_address: e.target.value }))} required />
          <Textarea placeholder="Order notes (optional)" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
        <Button type="submit" disabled={placing} className="mt-6 w-full">{placing ? 'Placing order...' : 'Confirm order'}</Button>
      </form>

      <aside className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Order summary</h2>
        <div className="mt-4 space-y-4">
          {basket.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 border-b pb-3 text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500">Qty {item.quantity}</p>
              </div>
              <p className="font-medium">Rs. {Number(item.total_price || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Coupon code</h3>
              <p className="text-sm text-gray-500">Apply a valid restaurant coupon before placing the order.</p>
            </div>
            {appliedCoupon && (
              <span className="rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#166534]">Applied</span>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
            <Button type="button" variant="outline" onClick={applyCoupon} disabled={applyingCoupon}>
              {applyingCoupon ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          {appliedCoupon && (
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white p-3 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{appliedCoupon.code}</p>
                <p className="text-gray-500">{appliedCoupon.label || 'Discount applied to this order.'}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeCoupon}>Remove</Button>
            </div>
          )}
          {couponState.message && (
            <p className={`mt-3 text-sm ${couponState.type === 'error' ? 'text-red-600' : 'text-[#166534]'}`}>
              {couponState.message}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border p-4 text-sm text-gray-700">
          <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-gray-900">Rs. {pricing.subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between"><span>Delivery fee</span><span className="font-medium text-gray-900">Rs. {pricing.delivery_fee.toFixed(2)}</span></div>
          <div className="flex items-center justify-between"><span>Discount</span><span className="font-medium text-gray-900">- Rs. {pricing.discount_amount.toFixed(2)}</span></div>
          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold"><span>Final total</span><span>Rs. {pricing.final_total.toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  );
}
