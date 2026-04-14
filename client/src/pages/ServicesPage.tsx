import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, FileText } from 'lucide-react';
import { api } from '../lib/api';
import type { Service } from '../types';

export default function ServicesPage() {
  const { i18n } = useTranslation();
  const ta = i18n.language === 'ta';
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const { data = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get<Service[]>('/services')).data,
  });

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.nameEn.toLowerCase().includes(q) ||
      s.nameTa.toLowerCase().includes(q) ||
      s.descriptionEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div
        className="rounded-2xl px-8 py-10"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(249,115,22,0.2)' }}
          >
            <FileText size={20} color="var(--saffron-light)" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {ta ? 'ஆவண சேவைகள்' : 'Document Services'}
          </h1>
        </div>
        <p className="text-white/70 text-sm mb-6">
          {ta ? 'அனைத்து அரசு ஆவண சேவைகளும் ஒரே இடத்தில்' : 'All government document services in one place'}
        </p>
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ta ? 'சேவை தேடுங்கள்...' : 'Search services...'}
            className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--navy-dark)' }}
          />
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-slate-500">
          {filtered.length} {ta ? 'முடிவுகள்' : 'results'} {ta ? 'கண்டறியப்பட்டது' : 'found'}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s._id}
              to={`/services/${s._id}`}
              className="card group flex items-start gap-4 p-5 no-underline"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: 'var(--bg)' }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy-dark)' }}>
                  {ta ? s.nameTa : s.nameEn}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                  {ta ? s.descriptionTa : s.descriptionEn}
                </p>
                <span
                  className="mt-3 flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--saffron)' }}
                >
                  {ta ? 'விவரங்கள் காண்க' : 'View details'} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="card py-16 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-slate-500">{ta ? 'சேவைகள் எதுவும் கிடைக்கவில்லை' : 'No services found'}</p>
        </div>
      )}
    </div>
  );
}
