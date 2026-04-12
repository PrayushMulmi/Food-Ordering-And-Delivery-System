import { useEffect, useState } from "react";
import { Button, ImageWithFallback, Input, Textarea } from "../../shared/ui";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { toBase64 } from "../../lib/fileUpload";

const emptyForm = { id: null, name: '', category: 'General', description: '', price: '', image_url: '', is_available: true };

export function AdminMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);

  const loadItems = async () => {
    const res = await api.get('/api/restaurant-admin/menu');
    setItems(res.data || []);
  };

  useEffect(() => { loadItems().catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), image_file: await toBase64(file) };
      if (form.id) await api.put(`/api/menu/${form.id}`, payload);
      else await api.post('/api/menu', payload);
      toast.success(form.id ? 'Menu item updated' : 'Menu item added');
      setForm(emptyForm); setFile(null); loadItems();
    } catch (error) { toast.error(error.message || 'Could not save menu item'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/api/menu/${id}`); toast.success('Menu item removed'); loadItems(); }
    catch (error) { toast.error(error.message || 'Delete failed'); }
  };

  const startEdit = (item) => { setForm({ ...item, price: item.price ?? '' }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <h1 className="text-4xl font-bold">Menu Management</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border bg-white p-6 md:grid-cols-2">
        <Input placeholder="Item name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
        <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
        <label className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><input type="checkbox" checked={!!form.is_available} onChange={(e) => setForm((p) => ({ ...p, is_available: e.target.checked }))} /> Available</label>
        <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
        <div className="md:col-span-2 space-y-3"><Input placeholder="Image URL (optional)" value={form.image_url || ''} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} /><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
        <div className="md:col-span-2 flex gap-3"><Button type="submit">{form.id ? 'Update Menu Item' : 'Add Menu Item'}</Button>{form.id && <Button type="button" variant="outline" onClick={() => { setForm(emptyForm); setFile(null); }}>Cancel Edit</Button>}</div>
      </form>
      <div className="grid gap-4">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-5"><div className="flex items-center gap-4"><div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100"><ImageWithFallback src={fileUrl(item.image_url)} alt={item.name} className="h-full w-full object-cover" /></div><div><h3 className="font-bold">{item.name}</h3><p className="text-sm text-gray-500">{item.category}</p><p className="text-sm text-gray-700">Rs. {Number(item.price || 0).toFixed(2)}</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => startEdit(item)}>Edit</Button><Button variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button></div></div>)}{!items.length && <div className="rounded-lg border bg-white p-8 text-center text-gray-600">No menu items yet.</div>}</div>
    </div>
  );
}
//