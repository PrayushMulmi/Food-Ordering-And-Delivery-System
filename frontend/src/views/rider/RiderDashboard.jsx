import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Button } from '../../shared/ui';
import { toast } from 'sonner';

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const regions = ['Kathmandu', 'Bhaktapur', 'Lalitpur'];

export function RiderDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [changing, setChanging] = useState(false);
  const [regionChanging, setRegionChanging] = useState(false);

  const load = () => api.get('/api/rider/dashboard').then((res) => setDashboard(res.data || null)).catch(() => {});

  useEffect(() => { load(); }, []);

  const profile = dashboard?.profile || {};
  const summary = dashboard?.summary || {};

  const changeAvailability = async (availability_status) => {
    setChanging(true);
    try {
      await api.put('/api/rider/availability', { availability_status });
      toast.success('Availability updated');
      load();
    } catch (error) {
      toast.error(error.message || 'Could not update availability');
    } finally {
      setChanging(false);
    }
  };

  const changeRegion = async (region) => {
    setRegionChanging(true);
    try {
      await api.put('/api/rider/region', { region });
      toast.success('Working region updated');
      load();
    } catch (error) {
      toast.error(error.message || 'Could not update rider region');
    } finally {
      setRegionChanging(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rider Dashboard</h1>
          <p className="text-sm text-gray-600">Track profits, assigned deliveries, region, and rider status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{profile.availability_status || 'unknown'}</Badge>
          <select value={profile.region || 'Kathmandu'} disabled={regionChanging} onChange={(event) => changeRegion(event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
            {regions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
          <Button variant="outline" disabled={changing} onClick={() => changeAvailability('available')}>Go available</Button>
          <Button variant="outline" disabled={changing} onClick={() => changeAvailability('offline')}>Go offline</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total earnings', money(summary.total_earnings)],
          ['Daily profit', money(summary.daily_earnings)],
          ['Weekly profit', money(summary.weekly_earnings)],
          ['Monthly profit', money(summary.monthly_earnings)],
          ['Order count', Number(summary.total_orders || 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profile snapshot</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold">Name:</span> {profile.full_name || '-'}</p>
            <p><span className="font-semibold">Email:</span> {profile.email || '-'}</p>
            <p><span className="font-semibold">Phone:</span> {profile.phone || '-'}</p>
            <p><span className="font-semibold">Vehicle:</span> {profile.vehicle_label || '-'}</p>
            <p><span className="font-semibold">Working region:</span> {profile.region || 'Kathmandu'}</p>
            <p><span className="font-semibold">Completed orders:</span> {Number(summary.completed_orders || 0)}</p>
            <p><span className="font-semibold">Active orders:</span> {Number(summary.active_orders || 0)}</p>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="mt-4 space-y-3">
            {(dashboard?.notifications || []).length ? dashboard.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-gray-500">No notifications yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
