// v6
import { useEffect, useState } from "react";
import { Button } from "../../shared/ui";
import { api } from "../../lib/api";
import { toast } from "sonner";

export function SuperAdminUsers() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await api.get('/api/super-admin/users');
    setUsers((res.data || []).filter((u) => u.role !== 'super_admin'));
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const runAction = async (user, action) => {
    try {
      if (action === 'delete') await api.delete(`/api/super-admin/users/${user.id}`);
      else await api.put(`/api/super-admin/users/${user.id}/${action}`, {});
      toast.success(`User ${action}d successfully`);
      load();
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">User Management</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{user.full_name}</h3>
              <p className="text-gray-600">{user.email} • {user.phone || 'No phone'}</p>
              <p className="text-sm text-gray-500">Role: {user.role} • Status: {user.status}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.status === 'active' ? <Button variant="outline" onClick={() => runAction(user, 'suspend')}>Suspend</Button> : <Button variant="outline" onClick={() => runAction(user, 'restore')}>Restore</Button>}
              <Button variant="destructive" onClick={() => runAction(user, 'delete')}>Delete</Button>
            </div>
          </div>
        ))}
        {!users.length && <div className="bg-white rounded-lg border p-8 text-center text-gray-600">No users found.</div>}
      </div>
    </div>
  );
}
