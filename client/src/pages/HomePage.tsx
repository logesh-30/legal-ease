import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scheme, Service } from '../types';
import { useState } from 'react';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: async () => (await api.get<Service[]>('/services')).data });
  const { data: schemes = [] } = useQuery({ queryKey: ['schemes'], queryFn: async () => (await api.get<Scheme[]>('/schemes')).data });
  const startVoice = () => {
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) return alert('Voice input not supported in this browser');
    const rec = new Rec(); rec.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-IN';
    rec.onresult = (e: any) => { const text = e.results[0][0].transcript; setSearch(text); navigate('/services'); };
    rec.start();
  };
  return <div className="space-y-8">
    <section className="rounded-3xl bg-gradient-to-r from-[#1a3c8f] to-[#f97316] p-8 text-white shadow-xl">
      <h1 className="text-4xl font-extrabold">{t('hero')}</h1>
      <p className="mt-2 text-lg">எளிய படிகள் | Simple steps for every citizen</p>
      <div className="mt-6 flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')} className="w-full rounded-xl p-3 text-black" />
        <button onClick={startVoice} className="rounded-xl bg-white px-4 font-semibold text-[#1a3c8f]">🎤</button>
      </div>
    </section>
    <section><h2 className="mb-3 text-2xl font-bold">Popular Services</h2><div className="grid gap-4 md:grid-cols-3">{services.slice(0, 5).map((s) => <button key={s._id} onClick={() => navigate(`/services/${s._id}`)} className="rounded-2xl bg-white p-4 text-left shadow">{s.icon} {i18n.language === 'ta' ? s.nameTa : s.nameEn}</button>)}</div></section>
    <section><h2 className="mb-3 text-2xl font-bold">Government Schemes</h2><div className="grid gap-4 md:grid-cols-3">{schemes.slice(0, 3).map((s) => <button key={s._id} onClick={() => navigate(`/schemes/${s._id}`)} className="rounded-2xl bg-white p-4 text-left shadow">{i18n.language === 'ta' ? s.nameTa : s.nameEn}</button>)}</div></section>
  </div>;
}
