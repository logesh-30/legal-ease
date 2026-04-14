import { type BaseSyntheticEvent, type ReactNode, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Briefcase, FileBadge2, FileStack, Home, MapPin,
  Pencil, Plus, Trash2, Users as UsersIcon, X, Shield, LogOut
} from 'lucide-react';
import { api } from '../../lib/api';
import type { Office, Scheme, Service, User } from '../../types';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [section, setSection] = useState<'dashboard' | 'services' | 'schemes' | 'offices' | 'users'>('dashboard');
  const [modal, setModal] = useState<{ type: 'service' | 'scheme' | 'office' | 'user' | null; mode: 'add' | 'edit' }>({ type: null, mode: 'add' });
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'service' | 'scheme' | 'office' | 'user'; id: string; label: string } | null>(null);

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: async () => (await api.get('/admin/stats')).data });
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: async () => (await api.get<Service[]>('/services')).data });
  const { data: schemes = [] } = useQuery({ queryKey: ['admin-schemes'], queryFn: async () => (await api.get<Scheme[]>('/schemes')).data });
  const { data: offices = [] } = useQuery({ queryKey: ['admin-offices'], queryFn: async () => (await api.get<Office[]>('/offices')).data });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get<User[]>('/users')).data });
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get<User>('/auth/me')).data });

  const serviceForm = useForm<any>();
  const schemeForm = useForm<any>();
  const officeForm = useForm<any>();
  const userForm = useForm<any>();

  const title = useMemo(
    () => ({ dashboard: 'Dashboard', services: 'Document Services', schemes: 'Schemes', offices: 'Offices', users: 'Users' }[section]),
    [section]
  );

  const openModal = (type: 'service' | 'scheme' | 'office' | 'user', mode: 'add' | 'edit', item?: any) => {
    setModal({ type, mode });
    setEditItem(item ?? null);
    const defaults = item ? {
      ...item,
      stepsEn: item.stepsEn?.join('\n'),
      stepsTa: item.stepsTa?.join('\n'),
      documentsEn: item.documentsEn?.join('\n'),
      documentsTa: item.documentsTa?.join('\n'),
      servicesOffered: item.servicesOffered?.join('\n'),
    } : {};
    if (type === 'service') serviceForm.reset(defaults);
    if (type === 'scheme') schemeForm.reset(defaults);
    if (type === 'office') officeForm.reset(defaults);
    if (type === 'user') userForm.reset(defaults);
  };

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-schemes'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    ]);
  };

  const submitService = serviceForm.handleSubmit(async (v) => {
    const payload = { ...v, stepsEn: v.stepsEn.split('\n').filter(Boolean), stepsTa: v.stepsTa.split('\n').filter(Boolean), documentsEn: v.documentsEn.split('\n').filter(Boolean), documentsTa: v.documentsTa.split('\n').filter(Boolean) };
    if (modal.mode === 'edit') await api.put(`/services/${editItem._id}`, payload);
    else await api.post('/services', payload);
    setModal({ type: null, mode: 'add' });
    await refreshAll();
  });

  const submitScheme = schemeForm.handleSubmit(async (v) => {
    if (modal.mode === 'edit') await api.put(`/schemes/${editItem._id}`, v);
    else await api.post('/schemes', v);
    setModal({ type: null, mode: 'add' });
    await refreshAll();
  });

  const submitOffice = officeForm.handleSubmit(async (v) => {
    const payload = { ...v, servicesOffered: v.servicesOffered.split('\n').filter(Boolean) };
    if (modal.mode === 'edit') await api.put(`/offices/${editItem._id}`, payload);
    else await api.post('/offices', payload);
    setModal({ type: null, mode: 'add' });
    await refreshAll();
  });

  const submitUser = userForm.handleSubmit(async (v) => {
    await api.put(`/users/${editItem._id}`, v);
    setModal({ type: null, mode: 'add' });
    await refreshAll();
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const path = deleteTarget.type === 'service' ? 'services' : deleteTarget.type === 'scheme' ? 'schemes' : deleteTarget.type === 'office' ? 'offices' : 'users';
    await api.delete(`/${path}/${deleteTarget.id}`);
    setDeleteTarget(null);
    await refreshAll();
  };

  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'services', label: 'Document Services', icon: FileBadge2 },
    { key: 'schemes', label: 'Schemes', icon: FileStack },
    { key: 'offices', label: 'Offices', icon: MapPin },
    { key: 'users', label: 'Users', icon: UsersIcon },
  ] as const;

  const statCards = [
    { label: 'Total Services', value: stats?.services ?? 0, icon: FileBadge2, color: 'var(--navy)', bg: '#1a3c8f15' },
    { label: 'Total Schemes', value: stats?.schemes ?? 0, icon: Briefcase, color: 'var(--saffron)', bg: '#f9731615' },
    { label: 'Total Offices', value: stats?.offices ?? 0, icon: MapPin, color: 'var(--mint)', bg: '#10b98115' },
    { label: 'Total Users', value: stats?.users ?? 0, icon: UsersIcon, color: 'var(--sky)', bg: '#0ea5e915' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col"
        style={{ background: 'var(--navy-dark)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--saffron)' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">LegalEase</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-left transition-all"
                style={
                  active
                    ? { background: 'var(--saffron)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.7)', background: 'transparent' }
                }
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'var(--saffron)' }}
            >
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{me?.email ?? 'admin@legalease.com'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Administrator</p>
            </div>
            <LogOut size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--navy-dark)' }}>{title}</h1>
          <span className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>

        {/* Dashboard stats */}
        {section === 'dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold" style={{ color: 'var(--navy-dark)' }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'services' && (
          <SectionTable
            title="Document Services"
            onAdd={() => openModal('service', 'add')}
            headers={['Name (EN)', 'Name (TA)', 'Portal', 'Actions']}
            rows={services.map((item) => ({
              id: item._id,
              columns: [item.nameEn, item.nameTa, item.officialPortalUrl],
              onEdit: () => openModal('service', 'edit', item),
              onDelete: () => setDeleteTarget({ type: 'service', id: item._id, label: item.nameEn }),
            }))}
          />
        )}
        {section === 'schemes' && (
          <SectionTable
            title="Schemes"
            onAdd={() => openModal('scheme', 'add')}
            headers={['Name (EN)', 'Name (TA)', 'Category', 'Actions']}
            rows={schemes.map((item) => ({
              id: item._id,
              columns: [item.nameEn, item.nameTa, item.category],
              onEdit: () => openModal('scheme', 'edit', item),
              onDelete: () => setDeleteTarget({ type: 'scheme', id: item._id, label: item.nameEn }),
            }))}
          />
        )}
        {section === 'offices' && (
          <SectionTable
            title="Offices"
            onAdd={() => openModal('office', 'add')}
            headers={['Name', 'Address', 'Working Hours', 'Actions']}
            rows={offices.map((item) => ({
              id: item._id,
              columns: [item.name, item.address, item.workingHours],
              onEdit: () => openModal('office', 'edit', item),
              onDelete: () => setDeleteTarget({ type: 'office', id: item._id, label: item.name }),
            }))}
          />
        )}
        {section === 'users' && (
          <SectionTable
            title="Users"
            headers={['Name', 'Email', 'Role', 'Actions']}
            rows={users.map((item) => ({
              id: item._id,
              columns: [item.name, item.email, item.role],
              onEdit: () => openModal('user', 'edit', item),
              onDelete: () => setDeleteTarget({ type: 'user', id: item._id, label: item.email }),
            }))}
          />
        )}
      </main>

      {/* Modals */}
      {modal.type === 'service' && (
        <FormModal title={`${modal.mode === 'add' ? 'Add' : 'Edit'} Service`} onClose={() => setModal({ type: null, mode: 'add' })} onSubmit={submitService}>
          <TwoCol>
            <Input label="Name (English)" reg={serviceForm.register('nameEn', { required: true })} />
            <Input label="Name (Tamil)" reg={serviceForm.register('nameTa', { required: true })} />
            <Input label="Description (English)" reg={serviceForm.register('descriptionEn', { required: true })} />
            <Input label="Description (Tamil)" reg={serviceForm.register('descriptionTa', { required: true })} />
            <Input label="Legal Details (English)" reg={serviceForm.register('legalDetailsEn', { required: true })} />
            <Input label="Legal Details (Tamil)" reg={serviceForm.register('legalDetailsTa', { required: true })} />
            <Input label="Portal URL" reg={serviceForm.register('officialPortalUrl', { required: true })} />
            <Input label="Icon/Emoji" reg={serviceForm.register('icon', { required: true })} />
            <TextArea label="Steps (English — one per line)" reg={serviceForm.register('stepsEn', { required: true })} />
            <TextArea label="Steps (Tamil — one per line)" reg={serviceForm.register('stepsTa', { required: true })} />
            <TextArea label="Documents (English — one per line)" reg={serviceForm.register('documentsEn', { required: true })} />
            <TextArea label="Documents (Tamil — one per line)" reg={serviceForm.register('documentsTa', { required: true })} />
          </TwoCol>
        </FormModal>
      )}
      {modal.type === 'scheme' && (
        <FormModal title={`${modal.mode === 'add' ? 'Add' : 'Edit'} Scheme`} onClose={() => setModal({ type: null, mode: 'add' })} onSubmit={submitScheme}>
          <TwoCol>
            <Input label="Name (English)" reg={schemeForm.register('nameEn', { required: true })} />
            <Input label="Name (Tamil)" reg={schemeForm.register('nameTa', { required: true })} />
            <Input label="Category" reg={schemeForm.register('category', { required: true })} />
            <Input label="Official Link" reg={schemeForm.register('officialLink', { required: true })} />
            <TextArea label="Eligibility (English)" reg={schemeForm.register('eligibilityEn', { required: true })} />
            <TextArea label="Eligibility (Tamil)" reg={schemeForm.register('eligibilityTa', { required: true })} />
            <TextArea label="Benefits (English)" reg={schemeForm.register('benefitsEn', { required: true })} />
            <TextArea label="Benefits (Tamil)" reg={schemeForm.register('benefitsTa', { required: true })} />
            <TextArea label="How to Apply (English)" reg={schemeForm.register('howToApplyEn', { required: true })} />
            <TextArea label="How to Apply (Tamil)" reg={schemeForm.register('howToApplyTa', { required: true })} />
          </TwoCol>
        </FormModal>
      )}
      {modal.type === 'office' && (
        <FormModal title={`${modal.mode === 'add' ? 'Add' : 'Edit'} Office`} onClose={() => setModal({ type: null, mode: 'add' })} onSubmit={submitOffice}>
          <TwoCol>
            <Input label="Name" reg={officeForm.register('name', { required: true })} />
            <Input label="Address" reg={officeForm.register('address', { required: true })} />
            <Input label="Latitude" reg={officeForm.register('latitude', { required: true })} />
            <Input label="Longitude" reg={officeForm.register('longitude', { required: true })} />
            <Input label="Working Hours" reg={officeForm.register('workingHours', { required: true })} />
            <TextArea label="Services Offered (one per line)" reg={officeForm.register('servicesOffered', { required: true })} />
          </TwoCol>
        </FormModal>
      )}
      {modal.type === 'user' && (
        <FormModal title="Edit User" onClose={() => setModal({ type: null, mode: 'add' })} onSubmit={submitUser}>
          <TwoCol>
            <Input label="Name" reg={userForm.register('name', { required: true })} />
            <Input label="Email" reg={userForm.register('email', { required: true })} />
            <Input label="Role (user/admin)" reg={userForm.register('role', { required: true })} />
          </TwoCol>
        </FormModal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>Confirm Delete</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{deleteTarget.label}</strong>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ borderColor: '#e2e8f0' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTable({ title, headers, rows, onAdd }: {
  title: string;
  headers: string[];
  rows: Array<{ id: string; columns: string[]; onEdit: () => void; onDelete: () => void }>;
  onAdd?: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f1f5f9' }}>
        <h2 className="font-bold" style={{ color: 'var(--navy-dark)' }}>{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="btn-primary text-sm py-2 px-4">
            <Plus size={15} /> Add New
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {headers.map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="border-t transition-colors hover:bg-orange-50/50"
                style={{ borderColor: '#f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbff' }}
              >
                {row.columns.map((col, idx) => (
                  <td key={`${row.id}-${idx}`} className="px-5 py-3 text-slate-700 max-w-[200px] truncate">{col}</td>
                ))}
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={row.onEdit}
                      className="rounded-lg border p-1.5 transition-colors hover:bg-blue-50"
                      style={{ borderColor: '#e2e8f0', color: 'var(--navy)' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={row.onDelete}
                      className="rounded-lg border p-1.5 transition-colors hover:bg-red-50"
                      style={{ borderColor: '#e2e8f0', color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No records found</div>
        )}
      </div>
    </div>
  );
}

function FormModal({ title, onClose, onSubmit, children }: {
  title: string;
  onClose: () => void;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f1f5f9' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-6">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#f1f5f9' }}>
          <button type="button" onClick={onClose} className="rounded-xl border px-5 py-2.5 text-sm font-medium" style={{ borderColor: '#e2e8f0' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary text-sm py-2.5 px-5">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Input({ label, reg }: { label: string; reg: any }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input {...reg} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={{ borderColor: '#e2e8f0' }} />
    </label>
  );
}

function TextArea({ label, reg }: { label: string; reg: any }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <textarea {...reg} rows={4} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 resize-none" style={{ borderColor: '#e2e8f0' }} />
    </label>
  );
}
