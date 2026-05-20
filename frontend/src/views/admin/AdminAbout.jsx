import { useEffect, useState } from "react";
import { Input, Button, Textarea, ImageWithFallback } from "../../shared/ui";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { toBase64 } from "../../lib/fileUpload";//
import { GoogleMapPicker } from "../../components/GoogleMapPicker";
import { buildOpenStreetMapMarkerUrl } from "../../utils/location";

const digitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value) => !value || /^\d{10}$/.test(String(value || ''));

const initialForm = {
  name: '', cuisine: '', address: '', contact_phone: '', description: '', image_url: '', cover_photo_url: '',
  gallery_images: [], restaurant_location_url: '', latitude: '', longitude: '', region: 'Kathmandu', price_level: 'Medium',
};

export function AdminAbout() {
  const [form, setForm] = useState(initialForm);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const restaurantSuspended = String(form?.status || '').toLowerCase() === 'suspended';

  useEffect(() => {
    api.get('/api/restaurant-admin/restaurant').then((res) => setForm({ ...initialForm, ...(res.data || {}) })).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (restaurantSuspended) return toast.error('Restaurant is suspended. Profile changes are disabled.');
    if (!String(form.name || '').trim()) return toast.error('Restaurant name is required');
    if (form.contact_phone && !isValidPhone(form.contact_phone)) return toast.error('Mobile number must be exactly 10 digits');
    try {
      const payload = {
        ...form,
        logo_file: await toBase64(logoFile),
        cover_photo_file: await toBase64(coverFile),
        gallery_files: await Promise.all(galleryFiles.map((file) => toBase64(file))),
      };
      const res = await api.put('/api/restaurant-admin/restaurant', payload);
      setForm({ ...initialForm, ...(res.data || {}) });
      setLogoFile(null); setCoverFile(null); setGalleryFiles([]);
      toast.success('Restaurant profile updated');
    } catch (error) { toast.error(error.message || 'Update failed'); }
  };

  const removeGalleryImage = (idx) => setForm((p) => ({ ...p, gallery_images: (p.gallery_images || []).filter((_, i) => i !== idx) }));

  const handleLocationPick = (coords) => {
    setForm((previous) => ({
      ...previous,
      latitude: coords.lat,
      longitude: coords.lng,
      restaurant_location_url: buildOpenStreetMapMarkerUrl(coords),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">About Restaurant</h1>
      {restaurantSuspended && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">Restaurant suspended</p>
          <p className="mt-1">Restaurant profile editing is disabled until SuperAdmin restores this restaurant.</p>
        </div>
      )}
      <form onSubmit={handleSave} className={`grid gap-4 rounded-lg border bg-white p-6 md:grid-cols-2 ${restaurantSuspended ? 'opacity-70' : ''}`}>
        <fieldset disabled={restaurantSuspended} className="contents">
        <Input placeholder="Restaurant name" value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input placeholder="Cuisine" value={form.cuisine || ''} onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))} />
        <Input placeholder="Address" value={form.address || ''} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <Input placeholder="Contact phone" value={form.contact_phone || ''} maxLength={10} inputMode="numeric" pattern="\d{10}" onChange={(e) => setForm((p) => ({ ...p, contact_phone: digitsOnly(e.target.value) }))} />
        <select value={form.region || 'Kathmandu'} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="Kathmandu">Kathmandu</option>
          <option value="Bhaktapur">Bhaktapur</option>
          <option value="Lalitpur">Lalitpur</option>
        </select>
        <select value={form.price_level || 'Medium'} onChange={(e) => setForm((p) => ({ ...p, price_level: e.target.value }))} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <Input placeholder="Logo image URL" value={form.image_url || ''} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
        <Input placeholder="Cover photo URL" value={form.cover_photo_url || ''} onChange={(e) => setForm((p) => ({ ...p, cover_photo_url: e.target.value }))} />
        <div><label className="block text-sm font-medium">Upload logo</label><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div>
        <div><label className="block text-sm font-medium">Upload cover photo</label><input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
        <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
        <div className="md:col-span-2">
          <GoogleMapPicker
            title="Restaurant map location"
            description="Click the map or use GPS to store the restaurant source location for order tracking and rider navigation. Latitude and longitude are calculated automatically."
            value={{ lat: form.latitude, lng: form.longitude }}
            onChange={handleLocationPick}
          />
        </div>
        <div className="md:col-span-2"><label className="block text-sm font-medium">Upload gallery photos</label><input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} /></div>
        <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
          {(form.gallery_images || []).map((img, idx) => <div key={idx} className="relative h-24 overflow-hidden rounded-xl bg-gray-100"><ImageWithFallback src={fileUrl(img)} alt={`gallery-${idx}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeGalleryImage(idx)} className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs">Remove</button></div>)}
        </div>
        <div className="md:col-span-2"><Button type="submit" disabled={restaurantSuspended}>{restaurantSuspended ? 'Suspended' : 'Save Changes'}</Button></div>
        </fieldset>
      </form>
    </div>
  );
}
