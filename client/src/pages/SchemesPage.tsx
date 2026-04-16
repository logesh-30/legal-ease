import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Landmark, ArrowRight, Search, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Scheme } from '../types';

const CATEGORIES = ['All', 'Education', 'Business', 'Financial', 'Health', 'Agriculture'];

const categoryMeta: Record<string, { color: string; bg: string }> = {
  Education:   { color: 'var(--sky)',     bg: '#0ea5e918' },
  Business:    { color: 'var(--saffron)', bg: '#f9731618' },
  Financial:   { color: 'var(--mint)',    bg: '#10b98118' },
  Health:      { color: '#ec4899',        bg: '#ec489918' },
  Agriculture: { color: '#84cc16',        bg: '#84cc1618' },
};

export default function SchemesPage() {
  const { i18n } = useTranslation();
  const ta = i18n.language === 'ta';
  const [category, setCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  // Drive search directly from URL so first keystroke works
  const search = searchParams.get('q') ?? '';

  const handleSearch = (val: string) => {
    if (val.trim()) setSearchParams({ q: val }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const { data = [], isLoading } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => (await api.get<Scheme[]>('/schemes')).data,
  });

  const filtered = data.filter((s) => {
    const matchesCategory = category === 'All' || s.category === category;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameTa.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div
        className="rounded-2xl px-8 py-10"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(249,115,22,0.2)' }}
          >
            <Landmark size={20} color="var(--saffron-light)" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {ta ? 'அரசு திட்டங்கள்' : 'Government Schemes'}
          </h1>
        </div>
        <p className="text-white/70 text-sm mb-6">
          {ta ? 'உங்களுக்கான நலத்திட்டங்களை கண்டறியுங்கள்' : 'Discover welfare schemes you may be eligible for'}
        </p>
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={ta ? 'திட்டம் தேடுங்கள்...' : 'Search schemes...'}
            className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--navy-dark)' }}
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-200 transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c;
          const meta = categoryMeta[c];
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
              style={
                active
                  ? { background: 'var(--navy)', color: '#fff', boxShadow: '0 2px 8px rgba(26,60,143,0.25)' }
                  : { background: meta?.bg ?? '#e2e8f0', color: meta?.color ?? 'var(--navy-dark)' }
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {filtered.length} {ta ? 'திட்டங்கள்' : `scheme${filtered.length !== 1 ? 's' : ''}`}
        {category !== 'All' && ` — ${category}`}
        {search && ` ${ta ? 'தேடல் முடிவு' : `for "${search}"`}`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const meta = categoryMeta[s.category];
            return (
              <Link
                key={s._id}
                to={`/schemes/${s._id}`}
                className="card group flex flex-col gap-3 p-5 no-underline"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy-dark)' }}>
                    {ta ? s.nameTa : s.nameEn}
                  </h3>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: meta?.bg ?? '#e2e8f0', color: meta?.color ?? 'var(--navy)' }}
                  >
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3">
                  {ta ? s.eligibilityTa : s.eligibilityEn}
                </p>
                <span
                  className="mt-auto flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--saffron)' }}
                >
                  {ta ? 'தகுதி சரிபார்க்க' : 'Check eligibility'} <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="card py-16 text-center">
          <Landmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-slate-500">
            {ta ? 'திட்டங்கள் எதுவும் கிடைக்கவில்லை' : 'No schemes found'}
          </p>
          {(search || category !== 'All') && (
            <button
              onClick={() => { handleSearch(''); setCategory('All'); }}
              className="mt-3 text-sm font-semibold"
              style={{ color: 'var(--navy)' }}
            >
              {ta ? 'வடிகட்டிகளை அழிக்கவும்' : 'Clear filters'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
