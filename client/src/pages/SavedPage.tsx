import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Scheme, Service } from '../types';

export default function SavedPage() {
  const { data } = useQuery({ queryKey: ['saved'], queryFn: async () => (await api.get<{ services: Service[]; schemes: Scheme[] }>('/users/saved')).data });
  return <div className="space-y-6"><h1 className="text-3xl font-bold">My Saves</h1><div className="grid gap-3">{data?.services.map((s) => <div key={s._id} className="rounded bg-white p-3 shadow">{s.nameEn}</div>)}</div><div className="grid gap-3">{data?.schemes.map((s) => <div key={s._id} className="rounded bg-white p-3 shadow">{s.nameEn}</div>)}</div></div>;
}
