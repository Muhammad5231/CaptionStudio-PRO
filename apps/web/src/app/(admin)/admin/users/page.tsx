'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, Check, Ban, RotateCcw } from 'lucide-react';
import { Button, StatusBadge, Badge } from '@captionstudio/ui';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED';
  projectsCount: number;
  exportsCount: number;
  joined: string;
}

const INITIAL_USERS: AdminUser[] = [
  { id: 'u-1', name: 'Sophia Chen', email: 'sophia@creatorhub.io', role: 'CREATOR', plan: 'PRO', status: 'ACTIVE', projectsCount: 18, exportsCount: 42, joined: 'Aug 14, 2026' },
  { id: 'u-2', name: 'Marcus Brody', email: 'marcus@brodymedia.com', role: 'CREATOR', plan: 'BUSINESS', status: 'ACTIVE', projectsCount: 142, exportsCount: 390, joined: 'Jul 02, 2026' },
  { id: 'u-3', name: 'Elena Rostova', email: 'elena@filmcraft.net', role: 'USER', plan: 'FREE', status: 'ACTIVE', projectsCount: 3, exportsCount: 4, joined: 'Sep 01, 2026' },
  { id: 'u-4', name: 'David Kim', email: 'david@fluxstream.tv', role: 'CREATOR', plan: 'CREATOR', status: 'SUSPENDED', projectsCount: 12, exportsCount: 22, joined: 'Jun 11, 2026' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
          };
        }
        return u;
      })
    );
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">User Management</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            View subscriber accounts, inspect usage, adjust subscription tiers, and enforce access restrictions.
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
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
            <tr>
              <th className="p-3.5 pl-4">User</th>
              <th className="p-3.5">Plan</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Projects</th>
              <th className="p-3.5">Exports</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Joined</th>
              <th className="p-3.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="p-3.5 pl-4">
                  <p className="font-semibold text-slate-900 dark:text-zinc-100">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </td>
                <td className="p-3.5">
                  <Badge variant={u.plan === 'PRO' || u.plan === 'BUSINESS' ? 'brand' : 'neutral'}>
                    {u.plan}
                  </Badge>
                </td>
                <td className="p-3.5 font-mono text-[11px]">{u.role}</td>
                <td className="p-3.5 font-mono text-[11px]">{u.projectsCount}</td>
                <td className="p-3.5 font-mono text-[11px]">{u.exportsCount}</td>
                <td className="p-3.5">
                  <StatusBadge status={u.status} />
                </td>
                <td className="p-3.5 text-slate-400">{u.joined}</td>
                <td className="p-3.5 text-right pr-4">
                  <button
                    onClick={() => toggleStatus(u.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      u.status === 'ACTIVE'
                        ? 'text-red-500 hover:bg-red-500/10'
                        : 'text-emerald-500 hover:bg-emerald-500/10'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? (
                      <>
                        <Ban className="h-3 w-3" />
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

