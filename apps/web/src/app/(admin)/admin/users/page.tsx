'use client';

import React, { useState, useEffect } from 'react';
import { Search, Ban, RotateCcw, Loader2 } from 'lucide-react';
import { Badge, StatusBadge } from '@captionstudio/ui';
import { api } from '@/lib/api-client';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DEACTIVATED';
  projectsCount: number;
  workspacesCount: number;
  primaryWorkspace: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: AdminUser[] }>('/admin/users');
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setActionLoadingId(id);
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus as any } : u))
      );
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.primaryWorkspace && u.primaryWorkspace.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">User Management</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            View registered accounts from database, inspect projects, and enforce access restrictions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 dark:text-zinc-400">
            No users found matching your search.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
              <tr>
                <th className="p-3.5 pl-4">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Primary Workspace</th>
                <th className="p-3.5">Projects</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-4">
                    <p className="font-semibold text-slate-900 dark:text-zinc-100">{u.name || 'Anonymous User'}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <Badge variant={u.role === 'ADMIN' ? 'brand' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-300">
                    {u.primaryWorkspace || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">{u.projectsCount}</td>
                  <td className="p-3.5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right pr-4">
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      disabled={actionLoadingId === u.id}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        u.status === 'SUSPENDED'
                          ? 'text-emerald-500 hover:bg-emerald-500/10'
                          : 'text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      {actionLoadingId === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : u.status === 'SUSPENDED' ? (
                        <>
                          <RotateCcw className="h-3 w-3" />
                          <span>Restore</span>
                        </>
                      ) : (
                        <>
                          <Ban className="h-3 w-3" />
                          <span>Suspend</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
