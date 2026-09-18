'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '@captionstudio/ui';
import { UserPlus, Mail, Trash2 } from 'lucide-react';
import { WorkspaceRole } from '@captionstudio/types';

interface Member {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatar: string;
  isCurrentUser?: boolean;
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'm-1',
      name: 'Alex Rivera',
      email: 'alex.creator@captionstudio.io',
      role: WorkspaceRole.OWNER,
      avatar: 'AR',
      isCurrentUser: true,
    },
    {
      id: 'm-2',
      name: 'Jordan Vance',
      email: 'jordan.vance@studio.net',
      role: WorkspaceRole.EDITOR,
      avatar: 'JV',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>(WorkspaceRole.EDITOR);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteEmail.slice(0, 2).toUpperCase(),
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Invite Member Card */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Invite Team Member</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Collaborate on video captioning and shared brand presets. Pro Studio includes up to 3 seats.
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
          <div className="w-full sm:flex-1">
            <Input
              label="Email Address"
              type="email"
              placeholder="editor@studio.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-36">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
            >
              <option value={WorkspaceRole.ADMIN}>Admin</option>
              <option value={WorkspaceRole.EDITOR}>Editor</option>
              <option value={WorkspaceRole.VIEWER}>Viewer</option>
            </select>
          </div>

          <Button type="submit" size="md" leftIcon={<UserPlus className="h-4 w-4" />}>
            Invite
          </Button>
        </form>
      </Card>

      {/* Members List */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Workspace Members ({members.length}/3)</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Active collaborators who have access to projects in this workspace.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {members.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center font-bold text-xs">
                  {m.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-zinc-100">{m.name}</p>
                    {m.isCurrentUser && (
                      <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.2 text-[10px] text-slate-400">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={m.role === WorkspaceRole.OWNER ? 'brand' : 'neutral'}>
                  {m.role}
                </Badge>
                {!m.isCurrentUser && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

