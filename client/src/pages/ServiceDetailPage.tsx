import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, FileCheck, Scale, Bookmark } from 'lucide-react';
import { api } from '../lib/api';
import type { Service } from '../types';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const ta = i18n.language === 'ta';

  const { data: s, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => (await api.get<Service>(`/services/${id}`)).data,
  });

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-24 animate-pulse" style={{ background: '#e2e8f0' }} />
      ))}
    </div>
  );
  if (!s) return null;

  const handleSave = async () => {
    try { await api.post(`/users/saved/services/${s._id}`); }
    catch { /* not logged in */ }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/services')}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--navy)' }}
      >
        <ArrowLeft size={16} /> {ta ? 'சேவைகளுக்கு திரும்பு' : 'Back to Services'}
      </button>

      {/* Header card */}
      <div
        className="rounded-2xl px-8 py-8 text-white"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {s.icon}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{ta ? s.nameTa : s.nameEn}</h1>
              <p className="mt-1 text-white/70 text-sm">{ta ? s.descriptionTa : s.descriptionEn}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            title="Save"
            className="shrink-0 rounded-xl p-2.5 transition-all"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Bookmark size={18} color="#fff" />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={20} style={{ color: 'var(--mint)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>
            {ta ? 'படிகள்' : 'Step-by-Step Process'}
          </h2>
        </div>
        <ol className="space-y-3">
          {(ta ? s.stepsTa : s.stepsEn).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--navy)' }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Documents */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck size={20} style={{ color: 'var(--sky)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>
            {ta ? 'தேவையான ஆவணங்கள்' : 'Required Documents'}
          </h2>
        </div>
        <ul className="space-y-2">
          {(ta ? s.documentsTa : s.documentsEn).map((doc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: 'var(--saffron)' }}
              />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Legal details */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={20} style={{ color: 'var(--gold)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--navy-dark)' }}>
            {ta ? 'சட்ட விவரங்கள்' : 'Legal Details'}
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {ta ? s.legalDetailsTa : s.legalDetailsEn}
        </p>
      </div>

      {/* CTA */}
      <a
        href={s.officialPortalUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-primary w-full justify-center py-4 rounded-2xl text-base no-underline"
        style={{ display: 'flex' }}
      >
        <ExternalLink size={18} />
        {ta ? 'அதிகாரப்பூர்வ தளம் திறக்க' : 'Open Official Portal'}
      </a>
    </div>
  );
}
