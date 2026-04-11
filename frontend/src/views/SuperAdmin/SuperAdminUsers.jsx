import { useEffect, useState } from 'react';
import { Badge, Button } from '../../shared/ui';
import { api } from '../../lib/api';
import { toast } from 'sonner';

function DetailPanel({ user, onClose }) {
  if (!user) {
    return (
      <aside className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-gray-500">Select a user to view full details.</div>
      </aside>
    );
  }

  const preferences = Array.isArray(user.food_preferences)
    ? user.food_preferences
    : (() => {
        try {
          return user.food_preferences ? JSON.parse(user.food_preferences) : [];
        } catch {
          return [];
        }
      })();

  return (
    <aside className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{user.full_name}</h2>
          <p className="text-sm text-gray-500">User details</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Phone:</span> {user.phone || 'Not set'}</p>
        <p><span className="font-semibold">Role:</span> {user.role}</p>
        <p><span className="font-semibold">Status:</span> {user.status}</p>
        <p><span className="font-semibold">Theme:</span> {user.theme || 'light'}</p>
        <p><span className="font-semibold">Created:</span> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</p>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 font-semibold">Food Preferences</h3>
        {preferences.length ? (
          <div className="flex flex-wrap gap-2">
            {preferences.map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No preferences saved.</p>
        )}
      </div>
    </aside>
  );
}

export function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    const res = await api.get('/api/super-admin/users');
    setUsers((res.data || []).filter((u) => u.role !== 'super_admin'));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/api/super-admin/users/${id}`);
      setSelectedUser(res.data || null);
    } catch (error) {
      toast.error(error.message || 'Could not load user detail');
    }
  };

  const runAction = async (user, action) => {
    try {
      if (action === 'delete') await api.delete(`/api/super-admin/users/${user.id}`);
      else await api.put(`/api/super-admin/users/${user.id}/${action}`, {});
      toast.success(`User ${action}d successfully`);
      await load();
      if (selectedUser?.id === user.id) {
        if (action === 'delete') setSelectedUser(null);
        else openDetail(user.id);
      }
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">User Management</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <button type="button" onClick={() => openDetail(user.id)} className="flex-1 text-left">
                  <h3 className="text-xl font-bold">{user.full_name}</h3>
                  <p className="text-gray-600">{user.email} • {user.phone || 'No phone'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>{user.status}</Badge>
                  </div>
                </button>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => openDetail(user.id)}>View Details</Button>
                  {user.status === 'active' ? (
                    <Button variant="outline" onClick={() => runAction(user, 'suspend')}>Suspend</Button>
                  ) : (
                    <Button variant="outline" onClick={() => runAction(user, 'restore')}>Restore</Button>
                  )}
                  <Button variant="destructive" onClick={() => runAction(user, 'delete')}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
          {!users.length && <div className="rounded-lg border bg-white p-8 text-center text-gray-600">No users found.</div>}
        </div>
        <DetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      </div>
    </div>
  );
}
//