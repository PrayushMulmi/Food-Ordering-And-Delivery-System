import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Input } from '../../shared/ui';
import { api } from '../../lib/api';
import { toast } from 'sonner';

const blankForm = {
  restaurant_id: '',
  code: '',
  discount_value: 10,
  max_discount_amount: '',
  min_order_amount: 0,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  usage_limit: '',
  status: 'active',
};

const formatDate = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';

export function SuperAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(blankForm);

  const load = async () => {
    try {
      const [couponRes, restaurantRes] = await Promise.all([
        api.get('/api/super-admin/coupons'),
        api.get('/api/super-admin/restaurants'),
      ]);
      setCoupons(couponRes.data || []);
      setRestaurants(restaurantRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Could not load coupon management data');
    }
  };

  useEffect(() => { load(); }, []);

  const restaurantOptions = useMemo(() => restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name || `Restaurant #${restaurant.id}`,
  })), [restaurants]);

  const createCoupon = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/super-admin/coupons', {
        ...form,
        discount_type: 'percentage',
      });
      toast.success('Coupon created');
      setForm(blankForm);
      load();
    } catch (error) {
      toast.error(error.message || 'Coupon creation failed');
    }
  };

  const startEdit = (coupon) => {
    setEditingId(coupon.id);
    setEditForm({
      restaurant_id: coupon.restaurant_id,
      code: coupon.code || '',
      discount_value: Number(coupon.discount_value || 0),
      max_discount_amount: coupon.max_discount_amount ?? '',
      min_order_amount: Number(coupon.min_order_amount || 0),
      start_date: formatDate(coupon.start_date),
      end_date: formatDate(coupon.end_date),
      usage_limit: coupon.usage_limit ?? '',
      status: coupon.status || 'active',
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/api/super-admin/coupons/${editingId}`, {
        ...editForm,
        discount_type: 'percentage',
      });
      toast.success('Coupon updated');
      setEditingId(null);
      load();
    } catch (error) {
      toast.error(error.message || 'Coupon update failed');
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      await api.delete(`/api/super-admin/coupons/${couponId}`);
      toast.success('Coupon deleted');
      if (editingId === couponId) setEditingId(null);
      load();
    } catch (error) {
      toast.error(error.message || 'Coupon deletion failed');
    }
  };

  const Field = ({ label, children }) => (
    <label className="space-y-1 text-sm">
      <span className="font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );

  const CouponFormFields = ({ value, setValue, includeRestaurant = false }) => (
    <>
      {includeRestaurant && (
        <Field label="Restaurant">
          <select value={value.restaurant_id || ''} onChange={(event) => setValue((prev) => ({ ...prev, restaurant_id: event.target.value }))} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
            <option value="">Select restaurant</option>
            {restaurantOptions.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Coupon code">
        <Input value={value.code || ''} onChange={(event) => setValue((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} placeholder="SAVE10" required />
      </Field>
      <Field label="Discount percentage">
        <Input type="number" min="1" max="100" value={value.discount_value ?? ''} onChange={(event) => setValue((prev) => ({ ...prev, discount_value: event.target.value }))} required />
      </Field>
      <Field label="Maximum value">
        <Input type="number" min="0" value={value.max_discount_amount ?? ''} onChange={(event) => setValue((prev) => ({ ...prev, max_discount_amount: event.target.value }))} placeholder="Optional cap, e.g. 300" />
      </Field>
      <Field label="Minimum order amount">
        <Input type="number" min="0" value={value.min_order_amount ?? 0} onChange={(event) => setValue((prev) => ({ ...prev, min_order_amount: event.target.value }))} />
      </Field>
      <Field label="Start date">
        <Input type="date" value={value.start_date || ''} onChange={(event) => setValue((prev) => ({ ...prev, start_date: event.target.value }))} required />
      </Field>
      <Field label="Expiry date">
        <Input type="date" value={value.end_date || ''} onChange={(event) => setValue((prev) => ({ ...prev, end_date: event.target.value }))} required />
      </Field>
      <Field label="Maximum user usage limit">
        <Input type="number" min="1" value={value.usage_limit ?? ''} onChange={(event) => setValue((prev) => ({ ...prev, usage_limit: event.target.value }))} placeholder="Optional" />
      </Field>
      <Field label="Status">
        <select value={value.status || 'active'} onChange={(event) => setValue((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
    </>
  );

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <p className="mt-1 text-sm text-gray-600">Create, edit, and remove restaurant coupons from one SuperAdmin page.</p>
      </div>

      <form onSubmit={createCoupon} className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Create coupon</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <CouponFormFields value={form} setValue={setForm} includeRestaurant />
        </div>
        <Button type="submit" className="mt-5">Create coupon</Button>
      </form>

      <section className="space-y-4">
        {coupons.length ? coupons.map((coupon) => (
          <article key={coupon.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{coupon.code}</h2>
                  <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>{coupon.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">{coupon.restaurant_name} • {Number(coupon.discount_value || 0)}% off{coupon.max_discount_amount ? ` up to Rs. ${Number(coupon.max_discount_amount).toFixed(2)}` : ''}</p>
                <p className="text-xs text-gray-500">Expires {formatDate(coupon.end_date) || '-'} • Usage {coupon.used_count || 0}/{coupon.usage_limit || '∞'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => startEdit(coupon)}>Edit</Button>
                <Button type="button" variant="destructive" onClick={() => deleteCoupon(coupon.id)}>Delete</Button>
              </div>
            </div>

            {editingId === coupon.id && (
              <form onSubmit={saveEdit} className="mt-5 rounded-2xl bg-gray-50 p-4">
                <h3 className="mb-4 text-base font-semibold">Edit selected coupon</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <CouponFormFields value={editForm} setValue={setEditForm} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button type="submit">Save coupon</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </form>
            )}
          </article>
        )) : <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">No coupons found.</div>}
      </section>
    </div>
  );
}
//