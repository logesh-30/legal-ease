import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scheme } from '../types';
import { useState } from 'react';

export default function SchemesPage() {
  const { i18n } = useTranslation();
  const [category, setCategory] = useState('All');
  const { data = [] } = useQuery({ queryKey: ['schemes'], queryFn: async () => (await api.get<Scheme[]>('/schemes')).data });
  const filtered = category === 'All' ? data : data.filter((s) => s.category === category);
  return <div className="space-y-4"><div className="flex gap-2">{['All', 'Education', 'Business', 'Financial', 'Health', 'Agriculture'].map((c) => <button key={c} onClick={() => setCategory(c)} className="rounded bg-[#1a3c8f] px-3 py-2 text-white">{c}</button>)}</div><div className="grid gap-4 md:grid-cols-2">{filtered.map((s) => <Link key={s._id} to={`/schemes/${s._id}`} className="rounded-2xl bg-white p-4 shadow"><h3 className="text-xl font-bold">{i18n.language === 'ta' ? s.nameTa : s.nameEn}</h3><p>{i18n.language === 'ta' ? s.eligibilityTa : s.eligibilityEn}</p></Link>)}</div></div>;
}
