//5
import { useEffect, useState } from "react";
import { Input, Button, Textarea } from "../../shared/ui";
import { api } from "../../lib/api";
import { toast } from "sonner";

export function AdminAbout() {
  const [form, setForm] = useState({ name: '', cuisine: '', address: '', contact_phone: '', description: '' });

  useEffect(() => {
    api.get('/api/restaurant-admin/restaurant').then((res) => setForm(res.data || form)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/restaurant-admin/restaurant', form);
      toast.success('Restaurant profile updated');
    } catch (error) {
      toast.error(error.message || 'Update failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Restaurant</h1>
      <form onSubmit={handleSave} className="bg-white rounded-lg border p-6 grid md:grid-cols-2 gap-4">
        <Input placeholder="Restaurant name" value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input placeholder="Cuisine" value={form.cuisine || ''} onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))} />
        <Input placeholder="Address" value={form.address || ''} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <Input placeholder="Contact phone" value={form.contact_phone || ''} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
        <div className="md:col-span-2">
          <Textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="md:col-span-2"><Button type="submit">Save Changes</Button></div>
      </form>
    </div>
  );
}
