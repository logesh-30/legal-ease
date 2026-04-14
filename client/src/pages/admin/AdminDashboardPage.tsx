import { type BaseSyntheticEvent, type ReactNode, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Office, Scheme, Service, User } from '../../types';
import { useForm } from 'react-hook-form';
import {
  Briefcase,
  FileBadge2,
  FileStack,
  Home,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users as UsersIcon,
  X
} from 'lucide-react';

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
    const defaults = item
      ? {
          ...item,
          stepsEn: item.stepsEn?.join('\n'),
          stepsTa: item.stepsTa?.join('\n'),
          documentsEn: item.documentsEn?.join('\n'),
          documentsTa: item.documentsTa?.join('\n'),
          servicesOffered: item.servicesOffered?.join('\n')
        }
      : {};
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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
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
    await api.delete(`/${deleteTarget.type === 'service' ? 'services' : deleteTarget.type === 'scheme' ? 'schemes' : deleteTarget.type === 'office' ? 'offices' : 'users'}/${deleteTarget.id}`);
    setDeleteTarget(null);
    await refreshAll();
  };

  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'services', label: 'Document Services', icon: FileBadge2 },
    { key: 'schemes', label: 'Schemes', icon: FileStack },
    { key: 'offices', label: 'Offices', icon: MapPin },
    { key: 'users', label: 'Users', icon: UsersIcon }
  ] as const;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white md:flex">
      <aside className="w-full bg-[#1a3c8f] p-4 text-white md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-72">
        <h2 className="mb-6 text-2xl font-bold">Admin Panel</h2>
        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${active ? 'bg-[#f97316] text-white' : 'hover:bg-white/15'}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 bg-white p-4 md:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a3c8f]">{title}</h1>
          <p className="text-sm text-slate-600">{me?.email ?? 'admin@legalease.com'}</p>
        </header>

        {section === 'dashboard' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'Total Services', value: stats?.services ?? 0, icon: FileBadge2, color: 'text-blue-600' }, { label: 'Total Schemes', value: stats?.schemes ?? 0, icon: Briefcase, color: 'text-orange-500' }, { label: 'Total Offices', value: stats?.offices ?? 0, icon: MapPin, color: 'text-green-600' }, { label: 'Total Users', value: stats?.users ?? 0, icon: UsersIcon, color: 'text-purple-600' }].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
                  <Icon className={card.color} />
                  <p className="mt-3 text-3xl font-bold">{card.value}</p>
                  <p className="text-sm text-slate-600">{card.label}</p>
                </div>
              );
            })}
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
              onDelete: () => setDeleteTarget({ type: 'service', id: item._id, label: item.nameEn })
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
              onDelete: () => setDeleteTarget({ type: 'scheme', id: item._id, label: item.nameEn })
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
              onDelete: () => setDeleteTarget({ type: 'office', id: item._id, label: item.name })
            }))}
          />
        )}
        {section === 'users' && (
          <SectionTable
            title="Users"
            onAdd={undefined}
            headers={['Name', 'Email', 'Role', 'Actions']}
            rows={users.map((item) => ({
              id: item._id,
              columns: [item.name, item.email, item.role],
              onEdit: () => openModal('user', 'edit', item),
              onDelete: () => setDeleteTarget({ type: 'user', id: item._id, label: item.email })
            }))}
          />
        )}
      </main>

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
            <TextArea label="Steps (English - one per line)" reg={serviceForm.register('stepsEn', { required: true })} />
            <TextArea label="Steps (Tamil - one per line)" reg={serviceForm.register('stepsTa', { required: true })} />
            <TextArea label="Documents (English - one per line)" reg={serviceForm.register('documentsEn', { required: true })} />
            <TextArea label="Documents (Tamil - one per line)" reg={serviceForm.register('documentsTa', { required: true })} />
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Delete Confirmation</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete <b>{deleteTarget.label}</b>?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border px-4 py-2">Cancel</button>
              <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTable({
  title,
  headers,
  rows,
  onAdd
}: {
  title: string;
  headers: string[];
  rows: Array<{ id: string; columns: string[]; onEdit: () => void; onDelete: () => void }>;
  onAdd?: () => void;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a3c8f]">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-3 py-2 font-medium text-white hover:opacity-90">
            <Plus size={16} />
            Add New
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              {headers.map((header) => (
                <th key={header} className="px-3 py-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-orange-50 transition`}>
                {row.columns.map((col, idx) => (
                  <td key={`${row.id}-${idx}`} className="px-3 py-2">{col}</td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={row.onEdit} className="rounded border p-1.5 text-[#1a3c8f] hover:bg-blue-50"><Pencil size={14} /></button>
                    <button onClick={row.onDelete} className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormModal({ title, onClose, onSubmit, children }: { title: string; onClose: () => void; onSubmit: (e?: BaseSyntheticEvent) => Promise<void>; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-4xl rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#1a3c8f]">{title}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto pr-1">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button>
          <button type="submit" className="rounded-lg bg-[#f97316] px-4 py-2 font-semibold text-white">Save</button>
        </div>
      </form>
    </div>
  );
}

function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function Input({ label, reg }: { label: string; reg: any }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input {...reg} className="w-full rounded-lg border px-3 py-2" />
    </label>
  );
}

function TextArea({ label, reg }: { label: string; reg: any }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea {...reg} rows={4} className="w-full rounded-lg border px-3 py-2" />
    </label>
  );
}
