import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search, Mic, ArrowRight, FileText, Landmark, MapPin, Users,
  ChevronRight, TrendingUp
} from 'lucide-react';
import { api } from '../lib/api';
import type { Scheme, Service } from '../types';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const ta = i18n.language === 'ta';

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get<Service[]>('/services')).data,
  });
  const { data: schemes = [] } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => (await api.get<Scheme[]>('/schemes')).data,
  });

  // Live suggestions: match against both services and schemes by title
  const q = search.toLowerCase().trim();
  const matchedServices = q
    ? services.filter((s) =>
        s.nameEn.toLowerCase().startsWith(q) ||
        s.nameTa.toLowerCase().startsWith(q))
    : [];
  const matchedSchemes = q
    ? schemes.filter((s) =>
        s.nameEn.toLowerCase().startsWith(q) ||
        s.nameTa.toLowerCase().startsWith(q))
    : [];
  const showDropdown = q.length > 0 && (matchedServices.length > 0 || matchedSchemes.length > 0);

  const startVoice = () => {
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) {
      setVoiceError(ta ? 'உங்கள் உலாவி குரல் உள்ளீட்டை ஆதரிக்கவில்லை' : 'Voice input not supported in this browser');
      return;
    }
    setVoiceError('');
    const rec = new Rec();
    rec.lang = ta ? 'ta-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);

    rec.onresult = (e: any) => {
      const transcript = (e.results[0][0].transcript as string).trim();
      setListening(false);
      setSearch(transcript);
      const tq = transcript.toLowerCase();
      const schemeHit = schemes.find((s) =>
        s.nameEn.toLowerCase().startsWith(tq) || s.nameTa.toLowerCase().startsWith(tq)
      );
      if (schemeHit) navigate(`/schemes?q=${encodeURIComponent(transcript)}`);
      else navigate(`/services?q=${encodeURIComponent(transcript)}`);
    };

    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === 'not-allowed') {
        setVoiceError(ta ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதிக்கவும்.' : 'Microphone permission denied. Please allow it in browser settings.');
      } else if (e.error === 'no-speech') {
        setVoiceError(ta ? 'குரல் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'No speech detected. Please try again.');
      } else {
        setVoiceError(ta ? 'குரல் பிழை. மீண்டும் முயற்சிக்கவும்.' : `Voice error: ${e.error}. Please try again.`);
      }
    };

    rec.onend = () => setListening(false);

    try {
      rec.start();
    } catch {
      setListening(false);
      setVoiceError(ta ? 'குரல் தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not start voice input. Please try again.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) { navigate('/services'); return; }
    // Route to schemes if more scheme matches, else services
    const sq = query.toLowerCase();
    const svcMatches = services.filter((s) => s.nameEn.toLowerCase().includes(sq) || s.nameTa.toLowerCase().includes(sq)).length;
    const schMatches = schemes.filter((s) => s.nameEn.toLowerCase().includes(sq) || s.nameTa.toLowerCase().includes(sq)).length;
    if (schMatches > svcMatches) navigate(`/schemes?q=${encodeURIComponent(query)}`);
    else navigate(`/services?q=${encodeURIComponent(query)}`);
  };

  const categoryColors: Record<string, string> = {
    Education: 'var(--sky)',
    Business: 'var(--saffron)',
    Financial: 'var(--mint)',
    Health: '#ec4899',
    Agriculture: '#84cc16',
  };

  return (
    <div className="space-y-12">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-14 md:py-20 text-white"
        style={{
          background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-light) 100%)',
        }}
      >
        {/* decorative circles */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-10"
          style={{ background: 'var(--saffron)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full opacity-10"
          style={{ background: 'var(--sky)' }}
        />

        <div className="relative z-10 max-w-2xl">
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--saffron-light)' }}
          >
            <TrendingUp size={12} />
            {ta ? 'இந்திய அரசு சேவைகள்' : 'Indian Government Services'}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            {t('hero')}
          </h1>
          <p className="mt-3 text-lg opacity-80">
            {ta
              ? 'எளிய படிகள் — ஒவ்வொரு குடிமகனுக்கும்'
              : 'Simple steps for every citizen — documents, schemes & offices'}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
                style={{ color: 'var(--navy)' }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search')}
                autoComplete="off"
                className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none"
                style={{ color: 'var(--navy-dark)', background: '#fff' }}
              />
              {/* Live dropdown */}
              {showDropdown && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ background: '#fff', border: '1px solid #e2e8f0' }}
                >
                  {matchedServices.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--navy)', background: '#f0f4fd' }}>
                        <FileText size={11} className="inline mr-1" />
                        {ta ? 'ஆவண சேவைகள்' : 'Document Services'}
                      </p>
                      {matchedServices.slice(0, 4).map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => { setSearch(''); navigate(`/services/${s._id}`); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                          style={{ color: 'var(--navy-dark)' }}
                        >
                          <span className="text-base">{s.icon}</span>
                          {ta ? s.nameTa : s.nameEn}
                        </button>
                      ))}
                    </>
                  )}
                  {matchedSchemes.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--saffron)', background: '#f0f4fd' }}>
                        <Landmark size={11} className="inline mr-1" />
                        {ta ? 'அரசு திட்டங்கள்' : 'Government Schemes'}
                      </p>
                      {matchedSchemes.slice(0, 4).map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => { setSearch(''); navigate(`/schemes/${s._id}`); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                          style={{ color: 'var(--navy-dark)' }}
                        >
                          <Landmark size={14} style={{ color: 'var(--saffron)', flexShrink: 0 }} />
                          {ta ? s.nameTa : s.nameEn}
                        </button>
                      ))}
                    </>
                  )}
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold border-t"
                    style={{ color: 'var(--navy)', borderColor: '#f1f5f9' }}
                  >
                    <Search size={13} />
                    {ta ? `"${search}" க்கு அனைத்து முடிவுகளும்` : `See all results for "${search}"`}
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary px-5">
              <Search size={16} />
              <span className="hidden sm:inline">{ta ? 'தேடு' : 'Search'}</span>
            </button>
            <button
              type="button"
              onClick={startVoice}
              disabled={listening}
              title={listening ? (ta ? 'கேட்கிறது...' : 'Listening...') : (ta ? 'குரல் தேடல்' : 'Voice search')}
              className="rounded-xl px-4 transition-all relative flex items-center justify-center"
              style={{
                background: listening ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: `2px solid ${listening ? '#ef4444' : 'rgba(255,255,255,0.25)'}`,
                minWidth: '52px',
              }}
            >
              {/* Pulsing rings when listening */}
              {listening && (
                <>
                  <span className="absolute inset-0 rounded-xl animate-ping" style={{ background: 'rgba(239,68,68,0.25)' }} />
                  <span className="absolute inset-[-6px] rounded-xl animate-ping" style={{ background: 'rgba(239,68,68,0.15)', animationDelay: '0.3s' }} />
                </>
              )}
              <Mic
                size={20}
                className="relative z-10"
                color={listening ? '#ef4444' : '#fff'}
              />
            </button>
          </form>
          {voiceError && (
            <p className="mt-2 text-xs font-medium" style={{ color: '#fca5a5' }}>
              {voiceError}
            </p>
          )}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: FileText, label: ta ? 'ஆவண சேவைகள்' : 'Document Services', value: services.length || '20+', color: 'var(--navy)' },
          { icon: Landmark, label: ta ? 'அரசு திட்டங்கள்' : 'Govt Schemes', value: schemes.length || '15+', color: 'var(--saffron)' },
          { icon: MapPin, label: ta ? 'அலுவலகங்கள்' : 'Offices Mapped', value: '50+', color: 'var(--mint)' },
          { icon: Users, label: ta ? 'பயனர்கள்' : 'Citizens Helped', value: '10K+', color: 'var(--sky)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${color}18` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--navy-dark)' }}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Popular Services ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--navy-dark)' }}>
              {ta ? 'பிரபலமான சேவைகள்' : 'Popular Services'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {ta ? 'அடிக்கடி பயன்படுத்தப்படும் ஆவண சேவைகள்' : 'Most accessed document services'}
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: 'var(--navy)' }}
          >
            {ta ? 'அனைத்தும்' : 'View all'} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <button
              key={s._id}
              onClick={() => navigate(`/services/${s._id}`)}
              className="card group flex items-start gap-4 p-5 text-left w-full"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: 'var(--bg)' }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy-dark)' }}>
                  {ta ? s.nameTa : s.nameEn}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {ta ? s.descriptionTa : s.descriptionEn}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--saffron)' }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ── Government Schemes ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--navy-dark)' }}>
              {ta ? 'அரசு திட்டங்கள்' : 'Government Schemes'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {ta ? 'உங்களுக்கான நலத்திட்டங்கள்' : 'Welfare schemes you may be eligible for'}
            </p>
          </div>
          <button
            onClick={() => navigate('/schemes')}
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--navy)' }}
          >
            {ta ? 'அனைத்தும்' : 'View all'} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.slice(0, 6).map((s) => (
            <button
              key={s._id}
              onClick={() => navigate(`/schemes/${s._id}`)}
              className="card group flex flex-col gap-3 p-5 text-left w-full"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy-dark)' }}>
                  {ta ? s.nameTa : s.nameEn}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: `${categoryColors[s.category] ?? 'var(--navy)'}18`,
                    color: categoryColors[s.category] ?? 'var(--navy)',
                  }}
                >
                  {s.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                {ta ? s.eligibilityTa : s.eligibilityEn}
              </p>
              <span
                className="flex items-center gap-1 text-xs font-semibold mt-auto"
                style={{ color: 'var(--saffron)' }}
              >
                {ta ? 'மேலும் அறிக' : 'Check eligibility'} <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section
        className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, var(--saffron) 0%, var(--gold) 100%)' }}
      >
        <div className="text-white">
          <h2 className="text-2xl font-extrabold">
            {ta ? 'அருகிலுள்ள அலுவலகங்களை கண்டறியுங்கள்' : 'Find Nearby Government Offices'}
          </h2>
          <p className="mt-1 opacity-85 text-sm">
            {ta ? 'உங்கள் இருப்பிடத்தை பயன்படுத்தி அருகிலுள்ள அலுவலகங்களை கண்டறியுங்கள்' : 'Use your location to find the nearest offices and get directions'}
          </p>
        </div>
        <button
          onClick={() => navigate('/offices')}
          className="shrink-0 rounded-xl bg-white px-6 py-3 font-bold transition-all hover:shadow-lg flex items-center gap-2"
          style={{ color: 'var(--saffron)' }}
        >
          <MapPin size={18} />
          {ta ? 'அலுவலகங்கள் காண்க' : 'Find Offices'}
        </button>
      </section>
    </div>
  );
}
