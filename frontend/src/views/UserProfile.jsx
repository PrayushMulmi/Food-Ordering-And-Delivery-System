import { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmDialog, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { clearSession, getUser, setUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../shared/navigation';

const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Spicy Lover'];
const cuisineOptions = ['Nepali', 'Indian', 'Chinese', 'Italian', 'Japanese', 'Fast Food'];

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
    ...profile,
  };

  normalized.food_preferences = normalizePreferences(profile.food_preferences);
  return normalized;
}

export function UserProfile() {
  const navigate = useNavigate();
  const sessionUser = getUser();
  const [profile, setProfile] = useState(normalizeProfile());
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    api.get('/api/auth/me').then((res) => {
      const normalized = normalizeProfile(res.data || {});
      setProfile(normalized);
      setUser(normalized);
    }).catch(() => {});
  }, []);

  const selectedPreferences = useMemo(() => new Set(profile.food_preferences || []), [profile.food_preferences]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/auth/me', profile);
      const normalized = normalizeProfile(res.data || profile);
      setProfile(normalized);
      setUser(normalized);
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

  const handleLogout = () => {
    clearSession();
    setLogoutDialogOpen(false);
    navigate(getRoleHomePath(sessionUser?.role));
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">My profile</h1>
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid h-14 w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div><Label>Full name</Label><Input className="mt-2 h-12" value={profile.full_name || ''} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input className="mt-2 h-12" type="email" value={profile.email || ''} disabled /></div>
                  <div><Label>Phone</Label><Input className="mt-2 h-12" value={profile.phone || ''} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>Theme</Label><select className="mt-2 h-12 w-full rounded-md border border-gray-300 px-3 text-sm" value={profile.theme || 'light'} onChange={(e) => setProfile((p) => ({ ...p, theme: e.target.value }))}><option value="light">Light</option><option value="dark">Dark</option></select></div>
                </div>
                <Button type="submit">Save changes</Button>
              </form>
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
                <div><Label>Current password</Label><Input className="mt-2 h-12" type="password" value={security.current_password} onChange={(e) => setSecurity((p) => ({ ...p, current_password: e.target.value }))} /></div>
                <div><Label>New password</Label><Input className="mt-2 h-12" type="password" value={security.new_password} onChange={(e) => setSecurity((p) => ({ ...p, new_password: e.target.value }))} /></div>
                <div><Label>Confirm new password</Label><Input className="mt-2 h-12" type="password" value={security.confirm_password} onChange={(e) => setSecurity((p) => ({ ...p, confirm_password: e.target.value }))} /></div>
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
