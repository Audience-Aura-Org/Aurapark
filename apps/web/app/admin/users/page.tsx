'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/users?q=${searchQuery}`);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      await axios.patch(`/api/admin/users/${editingUser._id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      alert(err?.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
        <PageHeader
          title="User Directory"
          subtitle={`${users.length} platform users`}
          breadcrumbs={['Admin', 'Users']}
          actions={
            <div className="flex gap-4">
              <div className="relative w-64">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          }
        />

        {loading && users.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-panel border border-danger-200 bg-danger-50/60 p-4 text-sm font-medium text-danger-700">
            {error}
          </div>
        )}

        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/70 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-neutral-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-neutral-600 uppercase tracking-wider">Email/Phone</th>
                  <th className="px-6 py-4 text-left font-bold text-neutral-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left font-bold text-neutral-600 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right font-bold text-neutral-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-900">{user.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900 font-medium">{user.email}</div>
                      <div className="text-[10px] text-neutral-500">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          user.role === 'ADMIN'
                            ? 'danger'
                            : user.role === 'AGENCY_STAFF'
                              ? 'info'
                              : user.role === 'DRIVER'
                                ? 'warning'
                                : 'default'
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel-strong w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-neutral-900">Edit User Account</h2>
              <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Full Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Email Address</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Phone Number</label>
                <Input
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Account Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                >
                  <option value="USER">Passenger</option>
                  <option value="AGENCY_STAFF">Agency Staff</option>
                  <option value="DRIVER">Driver</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="glass"
                  className="flex-1"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
