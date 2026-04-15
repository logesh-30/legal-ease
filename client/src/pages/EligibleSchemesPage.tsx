import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, Pencil, CheckCircle2, Tag, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import type { Scheme } from '../types';
import { useTranslation } from 'react-i18next';

const categoryMeta: Record<string, { color: string; bg: string }> = {
  Education: { color: 'var(--sky)', bg: '#0ea5e918' },
  Business:  { color: 'var(--saffron)', bg: '#f9731618' },
  Financial: { color: 'var(--mint)', bg: '#10b98118' },
  Health:    { color: '#ec4899', bg: '#ec489918' },
  Agriculture: { color: '#84cc16', bg: '#84cc1618' },
};

export default function EligibleSchemesPage() {
  const { i18n } = useTranslation();
  const ta = i18n.language === 'ta';
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['eligible-schemes'],
    retry: false,
    queryFn: async () => (await api.get<Scheme[]>('/eligible-schemes')).data,
  });

  useEffect(() => {
    if (isError) navigate('/eligibility-form');
  }, [isError, navigate]);

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--navy)' }}>
        <CheckCircle2 size={14} style={{ color: 'var(--mint)' }} />
        <span className="opacity-70">{ta ? 'விவரங்களை நிரப்பவும்' : 'Fill Your Details'}</span>
        <ArrowRight size={14} />
        <span className="rounded-full px-2 py-0.5 text-white" style={{ background: 'var(--saffron)' }}>2</span>
        <span>{ta ? 'திட்டங்களை காண்க' : 'View Schemes'}</span>
      </div>

      <div className="rounded-2xl px-8 py-8 text-white" style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{ta ? 'உங்களுக்கு பொருந்தும் திட்டங்கள்' : 'Eligible Schemes'}</h1>
            <p className="text-white/80 text-sm mt-2">
              {ta ? 'உங்கள் விவரங்களை அடிப்படையாக கொண்டு பொருந்தும் திட்டங்கள்.' : 'Schemes matched based on your submitted details.'}
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/eligibility-form')}>
            <Pencil size={16} />
            {ta ? 'விவரங்களை திருத்தவும்' : 'Edit My Details'}
          </button>
        </div>
      </div>

      {isLoading && <div className="card p-8">{ta ? 'திட்டங்கள் ஏற்றப்படுகிறது...' : 'Loading eligible schemes...'}</div>}

      {!isLoading && data.length === 0 && (
        <div className="card py-16 text-center">
          <Landmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-slate-500">
            {ta ? 'உங்கள் விவரங்களின் அடிப்படையில் திட்டங்கள் எதுவும் கிடைக்கவில்லை' : 'No eligible schemes found based on your details'}
          </p>
          <button onClick={() => navigate('/eligibility-form')} className="btn-primary mt-4">
            {ta ? 'விவரங்களை புதுப்பிக்கவும்' : 'Edit Details'}
          </button>
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((scheme) => {
            const meta = categoryMeta[scheme.category];
            const reasons = (scheme as any).matchedReasons as string[] ?? [];
            return (
              <div key={scheme._id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-sm leading-snug" style={{ color: 'var(--navy-dark)' }}>
                    {ta ? scheme.nameTa : scheme.nameEn}
                  </h2>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: meta?.bg ?? '#e2e8f0', color: meta?.color ?? 'var(--navy)' }}
                  >
                    {scheme.category}
                  </span>
                </div>

                {/* Matched reason tags */}
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {reasons.map((r) => (
                      <span
                        key={r}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: '#10b98115', color: 'var(--mint)' }}
                      >
                        <Tag size={9} />{r}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-slate-600 line-clamp-2">{ta ? scheme.benefitsTa : scheme.benefitsEn}</p>

                <div className="mt-auto flex items-center gap-3">
                  <a href={scheme.officialLink} target="_blank" rel="noreferrer"
                    className="btn-primary no-underline text-xs py-2 px-3"
                    style={{ display: 'inline-flex' }}
                  >
                    <ExternalLink size={13} />
                    {ta ? 'விண்ணப்பிக்க' : 'Apply Now'}
                  </a>
                  <Link to={`/schemes/${scheme._id}`}
                    className="flex items-center gap-1 text-xs font-semibold no-underline"
                    style={{ color: 'var(--navy)' }}
                  >
                    {ta ? 'விவரங்கள்' : 'Details'} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
