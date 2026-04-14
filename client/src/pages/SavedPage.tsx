import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bookmark, FileText, Landmark, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Scheme, Service } from '../types';

export default function SavedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['saved'],
    queryFn: async () => (await api.get<{ services: Service[]; schemes: Scheme[] }>('/users/saved')).data,
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div
        className="rounded-2xl px-8 py-10"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(249,115,22,0.2)' }}
          >
            <Bookmark size={20} color="var(--saffron-light)" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Saves</h1>
        </div>
        <p className="text-white/70 text-sm mt-2">Your bookmarked services and schemes</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
      )}

      {/* Saved Services */}
      {!isLoading && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} style={{ color: 'var(--navy)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>
              Saved Services
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: '#1a3c8f15', color: 'var(--navy)' }}
            >
              {data?.services.length ?? 0}
            </span>
          </div>
          {data?.services.length === 0 ? (
            <div className="card py-10 text-center">
              <FileText size={32} className="mx-auto mb-2 opacity-25" />
              <p className="text-sm text-slate-500">No saved services yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.services.map((s) => (
                <Link
                  key={s._id}
                  to={`/services/${s._id}`}
                  className="card flex items-center gap-4 p-4 no-underline group"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: 'var(--bg)' }}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--navy-dark)' }}>{s.nameEn}</p>
                    <p className="text-xs text-slate-500 truncate">{s.descriptionEn}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--saffron)' }} />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Saved Schemes */}
      {!isLoading && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Landmark size={18} style={{ color: 'var(--navy)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>
              Saved Schemes
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: '#1a3c8f15', color: 'var(--navy)' }}
            >
              {data?.schemes.length ?? 0}
            </span>
          </div>
          {data?.schemes.length === 0 ? (
            <div className="card py-10 text-center">
              <Landmark size={32} className="mx-auto mb-2 opacity-25" />
              <p className="text-sm text-slate-500">No saved schemes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.schemes.map((s) => (
                <Link
                  key={s._id}
                  to={`/schemes/${s._id}`}
                  className="card flex items-center gap-4 p-4 no-underline group"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: '#1a3c8f12' }}
                  >
                    <Landmark size={18} style={{ color: 'var(--navy)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--navy-dark)' }}>{s.nameEn}</p>
                    <p className="text-xs text-slate-500 truncate">{s.eligibilityEn}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--saffron)' }} />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
