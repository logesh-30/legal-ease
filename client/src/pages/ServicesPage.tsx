import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Service } from '../types';

export default function ServicesPage() {
  const { i18n } = useTranslation();
  const { data = [] } = useQuery({ queryKey: ['services'], queryFn: async () => (await api.get<Service[]>('/services')).data });
  return <div className="grid gap-4 md:grid-cols-2">{data.map((s) => <Link key={s._id} className="rounded-2xl bg-white p-5 shadow hover:-translate-y-1 transition" to={`/services/${s._id}`}><div className="text-2xl">{s.icon}</div><h3 className="text-xl font-bold">{i18n.language === 'ta' ? s.nameTa : s.nameEn}</h3><p>{i18n.language === 'ta' ? s.descriptionTa : s.descriptionEn}</p></Link>)}</div>;
}
