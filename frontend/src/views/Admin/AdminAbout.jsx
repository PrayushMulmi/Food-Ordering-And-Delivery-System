import { useEffect, useState } from "react";
import { Input, Button, Textarea, ImageWithFallback } from "../../shared/ui";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { toBase64 } from "../../lib/fileUpload";

export function AdminAbout() {
  const [form, setForm] = useState({ name: '', cuisine: '', address: '', contact_phone: '', description: '', image_url: '', cover_photo_url: '', gallery_images: [] });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  useEffect(() => { api.get('/api/restaurant-admin/restaurant').then((res) => setForm(res.data || form)).catch(() => {}); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        logo_file: await toBase64(logoFile),
        cover_photo_file: await toBase64(coverFile),
        gallery_files: await Promise.all(galleryFiles.map((file) => toBase64(file))),
      };
      const res = await api.put('/api/restaurant-admin/restaurant', payload);
      setForm(res.data || form);
      setLogoFile(null); setCoverFile(null); setGalleryFiles([]);
      toast.success('Restaurant profile updated');
    } catch (error) { toast.error(error.message || 'Update failed'); }
  };

  const removeGalleryImage = (idx) => setForm((p) => ({ ...p, gallery_images: (p.gallery_images || []).filter((_, i) => i !== idx) }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">About Restaurant</h1>
      <form onSubmit={handleSave} className="grid gap-4 rounded-lg border bg-white p-6 md:grid-cols-2">
        <Input placeholder="Restaurant name" value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input placeholder="Cuisine" value={form.cuisine || ''} onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))} />
        <Input placeholder="Address" value={form.address || ''} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <Input placeholder="Contact phone" value={form.contact_phone || ''} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
        <Input placeholder="Logo image URL" value={form.image_url || ''} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
        <Input placeholder="Cover photo URL" value={form.cover_photo_url || ''} onChange={(e) => setForm((p) => ({ ...p, cover_photo_url: e.target.value }))} />
        <div><label className="block text-sm font-medium">Upload logo</label><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div>
        <div><label className="block text-sm font-medium">Upload cover photo</label><input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
        <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium">Upload gallery photos</label><input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} /></div>
        <div className="md:col-span-2 grid grid-cols-2 gap-3 md:grid-cols-4">{(form.gallery_images || []).map((img, idx) => <div key={idx} className="relative h-24 overflow-hidden rounded-xl bg-gray-100"><ImageWithFallback src={fileUrl(img)} alt={`gallery-${idx}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeGalleryImage(idx)} className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs">Remove</button></div>)}</div>
        <div className="md:col-span-2"><Button type="submit">Save Changes</Button></div>
      </form>
    </div>
  );
}
