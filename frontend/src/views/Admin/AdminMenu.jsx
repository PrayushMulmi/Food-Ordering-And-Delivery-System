import { useEffect, useState } from "react";
import { Button, Input } from "../../shared/ui";
import { api } from "../../lib/api";
import { toast } from "sonner";

const emptyForm = { name: '', category: 'General', description: '', price: '', is_available: true };

export function AdminMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadItems = async () => {
    const res = await api.get('/api/restaurant-admin/menu');
    setItems(res.data || []);
  };

  useEffect(() => { loadItems().catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/menu', { ...form, price: Number(form.price) });
      toast.success('Menu item added');
      setForm(emptyForm);
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Could not save menu item');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/menu/${id}`);
      toast.success('Menu item removed');
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold">Menu Management</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 grid md:grid-cols-2 gap-4">
        <Input placeholder="Item name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
        <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
        <Input placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <div className="md:col-span-2"><Button type="submit">Add Menu Item</Button></div>
      </form>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-sm text-gray-700">Rs. {Number(item.price || 0).toFixed(2)}</p>
            </div>
            <Button variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
          </div>
        ))}
        {!items.length && <div className="bg-white rounded-lg border p-8 text-center text-gray-600">No menu items yet.</div>}
      </div>
    </div>
  );
}
