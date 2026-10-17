import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Search, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api.ts';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'admin';
  isActive: boolean;
  createdAt?: string;
  profile?: {
    companyName?: string;
    farmSizeAcres?: number;
    verificationStatus?: string;
    location?: { state?: string; district?: string };
  } | null;
}

interface AdminUsersPageProps {
  onNavigate: (path: string) => void;
}

const pageSize = 15;

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/users', {
        params: { role, status, search, page, limit: pageSize },
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Could not load user accounts.');
      }
      setUsers(response.data.users);
      setTotalPages(Math.max(1, response.data.pagination.totalPages));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = async (user: AdminUser) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const reason = window.prompt(`Reason to ${action} ${user.name}'s account:`);
    if (reason === null) return;
    if (!reason.trim()) {
      setError('Please provide a reason for the account status change.');
      return;
    }

    try {
      setUpdatingId(user._id);
      setError(null);
      setNotice(null);
      const response = await api.put(`/admin/users/${user._id}/status`, {
        isActive: !user.isActive,
        reason: reason.trim(),
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Could not update this account.');
      }
      setNotice(response.data.message);
      await fetchUsers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">Platform administration</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">User Accounts</h1>
          <p className="mt-1 text-sm text-neutral-600">Review registered accounts and manage account access.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Admin dashboard
        </button>
      </div>

      <form onSubmit={handleSearch} className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, or phone"
            className="w-full rounded-xl border border-neutral-300 py-2 pl-9 pr-3 text-sm text-neutral-900 focus:outline-emerald-800"
          />
        </label>
        <select value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm">
          <option value="all">All roles</option>
          <option value="farmer">Farmers</option>
          <option value="buyer">Buyers</option>
          <option value="admin">Admins</option>
        </select>
        <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm">
          <option value="all">All account states</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950">Search</button>
      </form>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
            <p className="text-sm font-semibold text-neutral-800">No matching accounts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Account</th>
                  <th className="px-5 py-3 font-semibold">Role / profile</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">{user.name}</p>
                      <p className="mt-1 text-xs text-neutral-600">{user.email}</p>
                      <p className="text-xs text-neutral-500">{user.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-neutral-800">{user.role}</span>
                      {user.profile?.companyName && <p className="mt-1 text-xs text-neutral-500">{user.profile.companyName}</p>}
                      {user.profile?.farmSizeAcres !== undefined && <p className="mt-1 text-xs text-neutral-500">{user.profile.farmSizeAcres} acres</p>}
                      {user.profile?.verificationStatus && <p className="mt-1 text-xs capitalize text-neutral-500">Buyer: {user.profile.verificationStatus.replace(/_/g, ' ')}</p>}
                    </td>
                    <td className="px-5 py-4 text-xs text-neutral-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(user)}
                        disabled={updatingId === user._id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {user.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        {updatingId === user._id ? 'Updating…' : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 text-xs text-neutral-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
};
