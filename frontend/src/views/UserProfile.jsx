import { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmDialog, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { clearSession, getUser, setUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../shared/navigation';
import { applyTheme } from '../lib/theme';
import { GoogleMapPicker } from '../components/GoogleMapPicker';
import { buildOpenStreetMapMarkerUrl } from '../utils/location';

const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Spicy Lover'];
const cuisineOptions = ['Nepali', 'Indian', 'Chinese', 'Italian', 'Japanese', 'Fast Food'];
const digitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value) => /^\d{10}$/.test(String(value || ''));


function normalizePreferences(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProfile(profile = {}) {
  const normalized = {
    full_name: '',
    email: '',
    phone: '',
    theme: 'light',
    food_preferences: [],
    saved_locations: [],
    ...profile,
  };

  normalized.food_preferences = normalizePreferences(profile.food_preferences);
  normalized.saved_locations = Array.isArray(profile.saved_locations) ? profile.saved_locations : [];
  return normalized;
}

const emptyLocationForm = { label: '', location_input: '', latitude: '', longitude: '' };

export function UserProfile() {
  const navigate = useNavigate();
  const sessionUser = getUser();
  const [profile, setProfile] = useState(normalizeProfile());
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [locationForm, setLocationForm] = useState(emptyLocationForm);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const refreshProfile = async () => {
    const res = await api.get('/api/auth/me');
    const normalized = normalizeProfile(res.data || {});
    setProfile(normalized);
    setUser(normalized);
  };

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  const selectedPreferences = useMemo(() => new Set(profile.food_preferences || []), [profile.food_preferences]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!String(profile.full_name || '').trim()) {
      toast.error('Full name is required');
      return;
    }
    if (profile.phone && !isValidPhone(profile.phone)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    try {
      const res = await api.put('/api/auth/me', profile);
      const normalized = normalizeProfile(res.data || profile);
      setProfile(normalized);
      setUser(normalized);
      applyTheme(normalized.theme || 'light');
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Could not update profile');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/change-password', security);
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Could not update password');
    }
  };

  const togglePreference = async (value) => {
    const current = new Set(profile.food_preferences || []);
    if (current.has(value)) current.delete(value); else current.add(value);
    const nextProfile = { ...profile, food_preferences: Array.from(current) };
    setProfile(nextProfile);
    try {
      const res = await api.put('/api/auth/me', nextProfile);
      const normalized = normalizeProfile(res.data || nextProfile);
      setProfile(normalized);
      setUser(normalized);
    } catch (error) {
      toast.error(error.message || 'Could not save preferences');
    }
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    try {
      if (editingLocationId) {
        await api.put(`/api/auth/me/locations/${editingLocationId}`, locationForm);
        toast.success('Saved location updated');
      } else {
        await api.post('/api/auth/me/locations', locationForm);
        toast.success('Saved location added');
      }
      setLocationForm(emptyLocationForm);
      setEditingLocationId(null);
      await refreshProfile();
    } catch (error) {
      toast.error(error.message || 'Could not save location');
    }
  };

  const editLocation = (location) => {
    setEditingLocationId(location.id);
    setLocationForm({ label: location.label || '', location_input: location.location_input || location.google_maps_url || '', latitude: location.latitude ?? '', longitude: location.longitude ?? '' });
  };

  const deleteLocation = async (id) => {
    try {
      await api.delete(`/api/auth/me/locations/${id}`);
      if (editingLocationId === id) {
        setEditingLocationId(null);
        setLocationForm(emptyLocationForm);
      }
      await refreshProfile();
      toast.success('Saved location deleted');
    } catch (error) {
      toast.error(error.message || 'Could not delete location');
    }
  };

  const handleLogout = () => {
    clearSession();
    setLogoutDialogOpen(false);
    navigate(sessionUser?.role === 'customer' ? '/' : getRoleHomePath(sessionUser?.role));
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">My profile</h1>
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid h-14 w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div><Label>Full name</Label><Input className="mt-2 h-12" value={profile.full_name || ''} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} required /></div>
                  <div><Label>Email</Label><Input className="mt-2 h-12" type="email" value={profile.email || ''} disabled /></div>
                  <div><Label>Phone</Label><Input className="mt-2 h-12" value={profile.phone || ''} maxLength={10} inputMode="numeric" pattern="\d{10}" onChange={(e) => setProfile((p) => ({ ...p, phone: digitsOnly(e.target.value) }))} /></div>
                  <div><Label>Theme</Label><select className="mt-2 h-12 w-full rounded-md border border-gray-300 px-3 text-sm" value={profile.theme || 'light'} onChange={async (e) => { const nextTheme = e.target.value; const previousTheme = profile.theme || 'light'; setProfile((p) => ({ ...p, theme: nextTheme })); applyTheme(nextTheme); try { let res; try { res = await api.put('/api/auth/me/theme', { theme: nextTheme }); } catch (themeRouteError) { if (!/route not found/i.test(themeRouteError.message || '')) throw themeRouteError; res = await api.put('/api/auth/me', { theme: nextTheme }); } const normalized = normalizeProfile(res.data || { ...profile, theme: nextTheme }); setProfile(normalized); setUser(normalized); } catch (error) { setProfile((p) => ({ ...p, theme: previousTheme })); applyTheme(previousTheme); toast.error(error.message || 'Could not save theme preference'); } }}><option value="light">Light</option><option value="dark">Dark</option></select></div>
                </div>
                <Button type="submit">Save changes</Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="locations">
            <div className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold">Saved locations</h2>
                <p className="mt-1 text-sm text-gray-600">Click the map or use GPS; coordinates are calculated automatically and saved behind the scenes.</p>
              </div>
              <form onSubmit={saveLocation} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <Label>Location name</Label>
                    <Input className="mt-2 h-12" value={locationForm.label} onChange={(e) => setLocationForm((p) => ({ ...p, label: e.target.value }))} placeholder="Home" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingLocationId ? 'Update' : 'Add'}</Button>
                    {editingLocationId ? <Button type="button" variant="outline" onClick={() => { setEditingLocationId(null); setLocationForm(emptyLocationForm); }}>Cancel</Button> : null}
                  </div>
                </div>
                <GoogleMapPicker
                  title="Saved delivery location"
                  value={{ lat: locationForm.latitude, lng: locationForm.longitude }}
                  onChange={(coords) => setLocationForm((prev) => ({
                    ...prev,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    location_input: buildOpenStreetMapMarkerUrl(coords),
                  }))}
                />
              </form>
              <div className="space-y-3">
                {profile.saved_locations?.length ? profile.saved_locations.map((location) => (
                  <div key={location.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{location.label}</p>
                      <p className="text-sm text-gray-600">{location.location_input || location.google_maps_url || `${location.latitude}, ${location.longitude}`}</p>
                      <p className="text-xs text-gray-500">Coordinates: {location.latitude != null && location.longitude != null ? `${location.latitude}, ${location.longitude}` : 'Unavailable'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => editLocation(location)}>Edit</Button>
                      <Button type="button" variant="destructive" onClick={() => deleteLocation(location.id)}>Delete</Button>
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500">No saved locations yet.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold">Dietary preferences</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {dietaryOptions.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4">
                      <input type="checkbox" checked={selectedPreferences.has(item)} onChange={() => togglePreference(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Favorite cuisines</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {cuisineOptions.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4">
                      <input type="checkbox" checked={selectedPreferences.has(item)} onChange={() => togglePreference(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <form onSubmit={savePassword} className="space-y-6">
                <div><Label>Current password</Label><Input className="mt-2 h-12" type="password" value={security.current_password} onChange={(e) => setSecurity((p) => ({ ...p, current_password: e.target.value }))} required /></div>
                <div><Label>New password</Label><Input className="mt-2 h-12" type="password" value={security.new_password} onChange={(e) => setSecurity((p) => ({ ...p, new_password: e.target.value }))} minLength={8} required /></div>
                <div><Label>Confirm new password</Label><Input className="mt-2 h-12" type="password" value={security.confirm_password} onChange={(e) => setSecurity((p) => ({ ...p, confirm_password: e.target.value }))} minLength={8} required /></div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Update password</Button>
                  <Button type="button" variant="destructive" onClick={() => setLogoutDialogOpen(true)}>Logout</Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Log out of your account?"
        description="Your current session will end immediately on this device."
        confirmText="Logout"
        confirmVariant="destructive"
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
