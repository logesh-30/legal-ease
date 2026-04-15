import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, CheckCircle, XCircle, ClipboardCheck, X, Bookmark, BookmarkCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Scheme } from '../types';

type QuestionType = 'number' | 'yesno' | 'income';
type QuestionKey = 'age' | 'income' | 'farmer' | 'student' | 'female' | 'category' | 'resident' | 'business' | 'bpl' | 'disability';
type Question = { key: QuestionKey; type: QuestionType };

const keywordMap: Array<{ key: QuestionKey; type: QuestionType; patterns: RegExp[] }> = [
  { key: 'age', type: 'number', patterns: [/\bage\b/i, /years old/i, /\babove\b/i, /\bbelow\b/i, /\bbetween\b/i] },
  { key: 'income', type: 'income', patterns: [/\bincome\b/i, /\bsalary\b/i, /\blakh\b/i, /\bannual\b/i] },
  { key: 'farmer', type: 'yesno', patterns: [/\bfarmer\b/i, /\bagriculture\b/i, /\bcultivator\b/i] },
  { key: 'student', type: 'yesno', patterns: [/\bstudent\b/i, /\beducation\b/i, /\bschool\b/i, /\bcollege\b/i] },
  { key: 'female', type: 'yesno', patterns: [/\bwoman\b/i, /\bwomen\b/i, /\bfemale\b/i, /\bgirl\b/i] },
  { key: 'category', type: 'yesno', patterns: [/\bsc\b/i, /\bst\b/i, /\bobc\b/i, /\bcaste\b/i, /\bcommunity\b/i, /\bbackward\b/i] },
  { key: 'resident', type: 'yesno', patterns: [/tamil nadu/i, /\bstate\b/i, /\bresident\b/i, /\bdomicile\b/i] },
  { key: 'business', type: 'yesno', patterns: [/\bbusiness\b/i, /\bmsme\b/i, /\bentrepreneur\b/i, /self employed/i] },
  { key: 'bpl', type: 'yesno', patterns: [/\bbpl\b/i, /\bpoverty\b/i, /ration card/i] },
  { key: 'disability', type: 'yesno', patterns: [/\bdisabled\b/i, /\bdisability\b/i, /differently abled/i] },
];

const text = {
  en: {
    eligibility: 'Eligibility', benefits: 'Benefits', howToApply: 'How to Apply',
    officialLink: 'Official Link', check: 'Check Your Eligibility', title: 'Eligibility Checker',
    submit: 'Check Eligibility', close: 'Close',
    pass: 'You are likely eligible for this scheme!',
    fail: 'You may not be eligible. Please visit the official portal to confirm.',
    portal: 'Open Official Portal',
    age: 'What is your age?', income: 'What is your annual family income?',
    farmer: 'Are you a farmer or engaged in agriculture?', student: 'Are you currently a student?',
    female: 'Are you female?', category: 'Do you belong to SC/ST/OBC category?',
    resident: 'Are you a resident of Tamil Nadu?', business: 'Do you own or plan to start a business?',
    bpl: 'Do you have a BPL ration card?', disability: 'Do you have a disability?',
  },
  ta: {
    eligibility: 'தகுதி', benefits: 'நன்மைகள்', howToApply: 'எப்படி விண்ணப்பிப்பது',
    officialLink: 'அதிகாரப்பூர்வ இணைப்பு', check: 'உங்கள் தகுதியை சரிபார்க்கவும்',
    title: 'தகுதி சரிபார்ப்பு', submit: 'தகுதி சரிபார்க்க', close: 'மூடு',
    pass: 'இந்த திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு அதிகம்!',
    fail: 'நீங்கள் தகுதி பெறாமல் இருக்கலாம். உறுதிப்படுத்த அதிகாரப்பூர்வ தளத்தை பார்க்கவும்.',
    portal: 'அதிகாரப்பூர்வ தளம் திறக்க',
    age: 'உங்கள் வயது என்ன?', income: 'உங்கள் குடும்ப ஆண்டு வருமானம் எவ்வளவு?',
    farmer: 'நீங்கள் விவசாயத்தில் ஈடுபட்டவரா?', student: 'நீங்கள் தற்போது மாணவரா?',
    female: 'நீங்கள் பெண்ணா?', category: 'நீங்கள் SC/ST/OBC பிரிவைச் சேர்ந்தவரா?',
    resident: 'நீங்கள் தமிழ்நாடு குடியிருப்பாளரா?', business: 'நீங்கள் தொழில் தொடங்கியவரா?',
    bpl: 'உங்களிடம் BPL ரேஷன் கார்டு உள்ளதா?', disability: 'உங்களுக்கு மாற்றுத்திறன் உள்ளதா?',
  },
};

const incomeOptions = [
  { id: 'lt1', en: 'Below 1 Lakh', ta: '1 லட்சத்திற்குக் கீழ்', min: 0, max: 100000 },
  { id: '1to2_5', en: '1–2.5 Lakhs', ta: '1-2.5 லட்சம்', min: 100000, max: 250000 },
  { id: '2_5to5', en: '2.5–5 Lakhs', ta: '2.5-5 லட்சம்', min: 250000, max: 500000 },
  { id: 'gt5', en: 'Above 5 Lakhs', ta: '5 லட்சத்திற்கு மேல்', min: 500000, max: Number.POSITIVE_INFINITY },
];

const categoryMeta: Record<string, { color: string; bg: string }> = {
  Education: { color: 'var(--sky)', bg: '#0ea5e918' },
  Business:  { color: 'var(--saffron)', bg: '#f9731618' },
  Financial: { color: 'var(--mint)', bg: '#10b98118' },
  Health:    { color: '#ec4899', bg: '#ec489918' },
  Agriculture: { color: '#84cc16', bg: '#84cc1618' },
};

export default function SchemeDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const ta = i18n.language === 'ta';
  const { isAuthenticated } = useAuth();
  const T = ta ? text.ta : text.en;

  const { data: s, isLoading } = useQuery({
    queryKey: ['scheme', id],
    queryFn: async () => (await api.get<Scheme>(`/schemes/${id}`)).data,
  });

  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const { data: savedData } = useQuery({
    queryKey: ['saved-ids'],
    enabled: isAuthenticated,
    queryFn: async () => (await api.get<{ schemeIds: string[] }>('/saves')).data,
  });

  const isSaved = savedOverride ?? Boolean(s && savedData?.schemeIds.includes(s._id));

  const questions = useMemo(() => {
    if (!s) return [];
    const eligibility = s.eligibilityEn.toLowerCase();
    const generated: Question[] = [];
    keywordMap.forEach((rule) => {
      if (rule.patterns.some((p) => p.test(eligibility))) generated.push({ key: rule.key, type: rule.type });
    });
    return generated;
  }, [s?.eligibilityEn]);

  const parseAgeRule = (eligibility: string) => {
    const between = eligibility.match(/between\s+(\d{1,3})\s*(?:and|-)\s*(\d{1,3})/i);
    if (between) return { min: Number(between[1]), max: Number(between[2]) };
    const range = eligibility.match(/(\d{1,3})\s*-\s*(\d{1,3})\s*(?:years|yrs|year)/i);
    if (range) return { min: Number(range[1]), max: Number(range[2]) };
    const above = eligibility.match(/(?:above|greater than|at least)\s+(\d{1,3})/i);
    if (above) return { min: Number(above[1]), max: Number.POSITIVE_INFINITY };
    const below = eligibility.match(/(?:below|under|less than)\s+(\d{1,3})/i);
    if (below) return { min: 0, max: Number(below[1]) };
    return null;
  };

  const isIncomeEligible = (selectedId: string, eligibility: string) => {
    const selected = incomeOptions.find((x) => x.id === selectedId);
    if (!selected) return false;
    const upper = eligibility.match(/(?:below|under|less than)\s*([\d.]+)\s*lakh/i);
    if (upper) return selected.min < Number(upper[1]) * 100000;
    const lower = eligibility.match(/(?:above|greater than|more than)\s*([\d.]+)\s*lakh/i);
    if (lower) return selected.max > Number(lower[1]) * 100000;
    const between = eligibility.match(/between\s*([\d.]+)\s*(?:and|-)\s*([\d.]+)\s*lakh/i);
    if (between) {
      const min = Number(between[1]) * 100000;
      const max = Number(between[2]) * 100000;
      return selected.max > min && selected.min < max;
    }
    return true;
  };

  const evaluate = () => {
    let eligible = true;
    questions.forEach((q) => {
      if (q.type === 'yesno' && answers[q.key] !== 'yes') eligible = false;
      if (q.key === 'age') {
        const rule = parseAgeRule(s!.eligibilityEn);
        if (rule) {
          const age = Number(answers.age);
          if (Number.isNaN(age) || age < rule.min || age > rule.max) eligible = false;
        }
      }
      if (q.key === 'income' && !isIncomeEligible(answers.income, s!.eligibilityEn)) eligible = false;
    });
    setResult(eligible ? 'pass' : 'fail');
  };

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-24 animate-pulse" style={{ background: '#e2e8f0' }} />
      ))}
    </div>
  );
  if (!s) return null;

  const meta = categoryMeta[s.category];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/schemes')}
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: 'var(--navy)' }}
      >
        <ArrowLeft size={16} /> {ta ? 'திட்டங்களுக்கு திரும்பு' : 'Back to Schemes'}
      </button>

      {/* Header */}
      <div
        className="rounded-2xl px-8 py-8 text-white"
        style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: meta?.bg ?? '#ffffff18', color: meta?.color ?? '#fff' }}
            >
              {s.category}
            </span>
            <h1 className="text-2xl font-extrabold">{ta ? s.nameTa : s.nameEn}</h1>
          </div>
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                setSaveMessage('Please login to save items');
                return;
              }
              if (isSaved) {
                await api.delete('/save', { data: { type: 'scheme', itemId: s._id } });
                setSavedOverride(false);
                setSaveMessage('');
                return;
              }
              await api.post('/save', { type: 'scheme', itemId: s._id });
              setSavedOverride(true);
              setSaveMessage('');
            }}
            title={!isAuthenticated ? 'Please login to save items' : isSaved ? 'Saved!' : 'Save this scheme'}
            disabled={!isAuthenticated}
            className="shrink-0 rounded-xl p-2.5 transition-all"
            style={{
              background: isSaved ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.15)',
              opacity: !isAuthenticated ? 0.7 : 1,
              cursor: !isAuthenticated ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaved
              ? <BookmarkCheck size={18} color="#fff" />
              : <Bookmark size={18} color="#fff" />
            }
          </button>
        </div>
      </div>
      {saveMessage && <p className="text-sm text-amber-600 font-medium">{saveMessage}</p>}

      {/* Eligibility & Benefits */}
      {[
        { label: T.eligibility, content: ta ? s.eligibilityTa : s.eligibilityEn, color: 'var(--sky)' },
        { label: T.benefits, content: ta ? s.benefitsTa : s.benefitsEn, color: 'var(--mint)' },
      ].map(({ label, content, color }) => (
        <div key={label} className="card p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color }}>
            {label}
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
        </div>
      ))}

      {/* How to Apply — numbered steps */}
      <div className="card p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
          {T.howToApply}
        </h2>
        <ol className="space-y-3">
          {(ta ? s.howToApplyTa : s.howToApplyEn)
            .split('\n')
            .filter((step: string) => step.trim())
            .map((step: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5"
                  style={{ background: 'var(--navy)', minWidth: '1.25rem' }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">{step.trim()}</span>
              </li>
            ))}
        </ol>
      </div>

      {/* Documents Required */}
      {((ta ? s.documentsTa : s.documentsEn) ?? []).length > 0 && (
        <div className="card p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--saffron)' }}>
            {ta ? 'தேவையான ஆவணங்கள்' : 'Documents Required'}
          </h2>
          <ul className="space-y-2">
            {(ta ? s.documentsTa : s.documentsEn).map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--saffron)' }} />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setOpen(true); setResult(null); setAnswers({}); }}
          className="btn-primary"
        >
          <ClipboardCheck size={16} />
          {T.check}
        </button>
        <a
          href={s.officialLink}
          target="_blank"
          rel="noreferrer"
          className="btn-navy no-underline"
        >
          <ExternalLink size={16} />
          {T.officialLink}
        </a>
      </div>

      {/* Eligibility modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--navy-dark)' }}>{T.title}</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{T[q.key]}</label>
                  {q.type === 'number' && (
                    <input
                      type="number"
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                      style={{ borderColor: '#e2e8f0' }}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                    />
                  )}
                  {q.type === 'income' && (
                    <select
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e2e8f0' }}
                      defaultValue=""
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                    >
                      <option value="" disabled>{ta ? 'வருமானத்தை தேர்வு செய்யவும்' : 'Select income range'}</option>
                      {incomeOptions.map((o) => (
                        <option key={o.id} value={o.id}>{ta ? o.ta : o.en}</option>
                      ))}
                    </select>
                  )}
                  {q.type === 'yesno' && (
                    <div className="flex gap-4">
                      {['yes', 'no'].map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.key}
                            value={v}
                            onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                          />
                          <span className="text-sm">{v === 'yes' ? (ta ? 'ஆம்' : 'Yes') : (ta ? 'இல்லை' : 'No')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={evaluate} className="btn-primary">{T.submit}</button>
              <button onClick={() => setOpen(false)} className="btn-navy">{T.close}</button>
            </div>

            {result && (
              <div
                className="mt-5 rounded-xl p-4"
                style={{
                  background: result === 'pass' ? '#10b98115' : '#ef444415',
                  border: `1px solid ${result === 'pass' ? '#10b98140' : '#ef444440'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  {result === 'pass'
                    ? <CheckCircle size={20} style={{ color: 'var(--mint)' }} className="shrink-0 mt-0.5" />
                    : <XCircle size={20} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold" style={{ color: result === 'pass' ? 'var(--mint)' : '#ef4444' }}>
                    {result === 'pass' ? T.pass : T.fail}
                  </p>
                </div>
                <a
                  href={s.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-navy mt-3 no-underline text-sm"
                  style={{ display: 'inline-flex' }}
                >
                  <ExternalLink size={14} />
                  {T.portal}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
