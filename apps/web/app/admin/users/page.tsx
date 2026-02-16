'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users');
        setUsers(data.users || []);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err?.response?.data?.error || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-mesh-green pt-20 safe-bottom-nav">
      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
        <PageHeader
          title="User Directory"
          subtitle={`${users.length} platform users`}
          breadcrumbs={['Admin', 'Users']}
        />

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-panel border border-danger-200 bg-danger-50/60 p-4 text-sm font-medium text-danger-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/70 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-600">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-600">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-600">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-neutral-900">{user.name}</td>
                      <td className="px-4 py-3 text-neutral-700">{user.email}</td>
                      <td className="px-4 py-3 text-neutral-500">{user.phone || '—'}</td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

