'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { Spinner } from '@/components/atoms/Spinner';
import { createStaff, updateStaff, listStaffWithEmails, type StaffRole } from '@/actions/staff';

type StaffRow = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  email: string | null;
};

export default function TeamPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await listStaffWithEmails();
      setStaff(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load staff';
      if (msg.includes('Admin access required')) {
        router.push('/admin/dashboard');
        return;
      }
      alert(msg);
    } finally {
      setIsFetching(false);
    }
  }, [router]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  return (
    <AdminPageTemplate
      title="Team"
      description="Manage staff users. Only admins can create or edit staff."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setAddOpen(true);
            setEditingId(null);
          }}
        >
          Add staff
        </Button>
      }
    >
      {addOpen && (
        <AddStaffForm
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            loadStaff();
          }}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      )}

      {isFetching ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((row) => (
                <tr key={row.id} className="bg-white">
                  {editingId === row.id ? (
                    <EditStaffForm
                      staff={row}
                      onClose={() => setEditingId(null)}
                      onSuccess={() => {
                        setEditingId(null);
                        loadStaff();
                      }}
                      isSubmitting={isSubmitting}
                      setIsSubmitting={setIsSubmitting}
                    />
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.email ?? '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="capitalize text-gray-700">{row.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(row.id);
                            setAddOpen(false);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && !isFetching && (
            <p className="px-4 py-8 text-center text-gray-500">No staff yet. Add your first team member above.</p>
          )}
        </div>
      )}
    </AdminPageTemplate>
  );
}

function AddStaffForm({
  onClose,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  onClose: () => void;
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<StaffRole>('staff');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      alert('Email and password are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createStaff(email.trim(), password, fullName.trim() || email.split('@')[0], role);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add staff member</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="add-email" required>Email</Label>
          <input
            id="add-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
            required
          />
        </div>
        <div>
          <Label htmlFor="add-password" required>Password</Label>
          <input
            id="add-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
            required
          />
        </div>
        <div>
          <Label htmlFor="add-fullName">Full name</Label>
          <input
            id="add-fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="add-role">Role</Label>
          <select
            id="add-role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
            Create staff
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditStaffForm({
  staff,
  onClose,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  staff: StaffRow;
  onClose: () => void;
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}) {
  const [fullName, setFullName] = useState(staff.full_name);
  const [role, setRole] = useState<StaffRole>(staff.role as StaffRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateStaff(staff.id, { full_name: fullName.trim(), role });
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <td colSpan={5} className="px-4 py-3 bg-gray-50">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px]">
          <Label htmlFor="edit-fullName">Full name</Label>
          <input
            id="edit-fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
          />
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="edit-role">Role</Label>
          <select
            id="edit-role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting} isLoading={isSubmitting}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </form>
    </td>
  );
}
