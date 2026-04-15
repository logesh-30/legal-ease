import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, CheckCircle, XCircle, ClipboardCheck, X, Bookmark, BookmarkCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Scheme } from '../types';

type Answers = Record<string, string>;

const incomeOptions = [
  { id: 'lt1',    en: 'Below ₹1 Lakh',    ta: '₹1 லட்சத்திற்குக் கீழ்',  max: 100000 },
  { id: '1to2_5', en: '₹1 – 2.5 Lakhs',   ta: '₹1–2.5 லட்சம்',           max: 250000 },
  { id: '2_5to5', en: '₹2.5 – 5 Lakhs',   ta: '₹2.5–5 லட்சம்',           max: 500000 },
  { id: 'gt5',    en: 'Above ₹5 Lakhs',    ta: '₹5 லட்சத்திற்கு மேல்',    max: Infinity },
];

const categoryMeta: Record<string, { color: string; bg: string }> = {
  Education:   { color: 'var(--sky)',     bg: '#0ea5e918' },
  Business:    { color: 'var(--saffron)', bg: '#f9731618' },
  Financial:   { color: 'var(--mint)',    bg: '#10b98118' },
  Health:      { color: '#ec4899',        bg: '#ec489918' },
  Agriculture: { color: '#84cc16',        bg: '#84cc1618' },
};

const T = {
  en: {
    back: 'Back to Schemes', eligibility: 'Eligibility', benefits: 'Benefits',
    howToApply: 'How to Apply', officialLink: 'Official Link',
    check: 'Check Your Eligibility', title: 'Eligibility Checker',
    submit: 'Check Eligibility', close: 'Close',
    pass: 'You are likely eligible for this scheme!',
    fail: 'You may not meet all eligibility criteria. Please visit the official portal to confirm.',
    portal: 'Open Official Portal',
    answerAll: 'Please answer all questions before checking.',
    q_age: 'What is your age?',
    q_income: 'What is your annual family income?',
    q_gender: 'Are you female?',
    q_category: 'Do you belong to SC / ST / OBC category?',
    q_farmer: 'Are you a farmer or engaged in agriculture?',
    q_student: 'Are you currently a student?',
    q_senior: 'Are you a senior citizen (60 years or above)?',
    q_disabled: 'Do you have a disability?',
    q_state: 'Are you a resident of Tamil Nadu?',
    yes: 'Yes', no: 'No',
  },
  ta: {
    back: 'திட்டங்களுக்கு திரும்பு', eligibility: 'தகுதி', benefits: 'நன்மைகள்',
    howToApply: 'எப்படி விண்ணப்பிப்பது', officialLink: 'அதிகாரப்பூர்வ இணைப்பு',
    check: 'உங்கள் தகுதியை சரிபார்க்கவும்', title: 'தகுதி சரிபார்ப்பு',
    submit: 'தகுதி சரிபார்க்க', close: 'மூடு',
    pass: 'இந்த திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு அதிகம்!',
    fail: 'நீங்கள் தகுதி பெறாமல் இருக்கலாம். உறுதிப்படுத்த அதிகாரப்பூர்வ தளத்தை பார்க்கவும்.',
    portal: 'அதிகாரப்பூர்வ தளம் திறக்க',
    answerAll: 'அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும்.',
    q_age: 'உங்கள் வயது என்ன?',
    q_income: 'உங்கள் குடும்ப ஆண்டு வருமானம் எவ்வளவு?',
    q_gender: 'நீங்கள் பெண்ணா?',
    q_category: 'நீங்கள் SC / ST / OBC பிரிவைச் சேர்ந்தவரா?',
    q_farmer: 'நீங்கள் விவசாயத்தில் ஈடுபட்டவரா?',
    q_student: 'நீங்கள் தற்போது மாணவரா?',
    q_senior: 'நீங்கள் மூத்த குடிமகன் (60 வயது அல்லது அதற்கு மேல்)?',
    q_disabled: 'உங்களுக்கு மாற்றுத்திறன் உள்ளதா?',
    q_state: 'நீங்கள் தமிழ்நாடு குடியிருப்பாளரா?',
    yes: 'ஆம்', no: 'இல்லை',
  },
};

type QuestionDef = { key: string; type: 'number' | 'income' | 'yesno'; labelKey: keyof typeof T.en };

function buildQuestions(scheme: Scheme): QuestionDef[] {
  const r = scheme.eligibilityRules;
  const qs: QuestionDef[] = [];

  if (r?.ageMin !== undefined || r?.ageMax !== undefined) {
    qs.push({ key: 'age', type: 'number', labelKey: 'q_age' });
  }
  if (r?.incomeMax !== undefined) {
    qs.push({ key: 'income', type: 'income', labelKey: 'q_income' });
  }
  if (r?.genders?.includes('female')) {
    qs.push({ key: 'gender', type: 'yesno', labelKey: 'q_gender' });
  }
  if (r?.categories?.length) {
    qs.push({ key: 'category', type: 'yesno', labelKey: 'q_category' });
  }
  if (r?.tags?.includes('farmer')) {
    qs.push({ key: 'farmer', type: 'yesno', labelKey: 'q_farmer' });
  }
  if (r?.tags?.includes('student')) {
    qs.push({ key: 'student', type: 'yesno', labelKey: 'q_student' });
  }
  if (r?.tags?.includes('seniorCitizen')) {
    qs.push({ key: 'senior', type: 'yesno', labelKey: 'q_senior' });
  }
  if (r?.tags?.includes('differentlyAbled')) {
    qs.push({ key: 'disabled', type: 'yesno', labelKey: 'q_disabled' });
  }
  if (r?.states?.length) {
    qs.push({ key: 'state', type: 'yesno', labelKey: 'q_state' });
  }

  // Fallback: if no structured rules exist, ask age and income generically
  if (qs.length === 0) {
    qs.push({ key: 'age', type: 'number', labelKey: 'q_age' });
    qs.push({ key: 'income', type: 'income', labelKey: 'q_income' });
  }

  return qs;
}

function evaluate(scheme: Scheme, answers: Answers): boolean {
  const r = scheme.eligibilityRules;
  if (!r) return true;

  if (r.ageMin !== undefined || r.ageMax !== undefined) {
    const age = Number(answers.age);
    if (isNaN(age) || age <= 0) return false;
    if (r.ageMin !== undefined && age < r.ageMin) return false;
    if (r.ageMax !== undefined && age > r.ageMax) return false;
  }

  if (r.incomeMax !== undefined) {
    const selected = incomeOptions.find((o) => o.id === answers.income);
    if (!selected) return false;
    // Use the lower bound of the selected bracket to check against incomeMax
    const bracketMin = incomeOptions[incomeOptions.indexOf(selected) - 1]?.max ?? 0;
    if (bracketMin >= r.incomeMax) return false;
  }

  if (r.genders?.includes('female') && answers.gender !== 'yes') return false;
  if (r.categories?.length && answers.category !== 'yes') return false;
  if (r.tags?.includes('farmer') && answers.farmer !== 'yes') return false;
  if (r.tags?.includes('student') && answers.student !== 'yes') return false;
  if (r.tags?.includes('seniorCitizen') && answers.senior !== 'yes') return false;
  if (r.tags?.includes('differentlyAbled') && answers.disabled !== 'yes') return false;
  if (r.states?.length && answers.state !== 'yes') return false;

  return true;
}

export default function SchemeDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';
  const tx = T[lang];
  const { isAuthenticated } = useAuth();

  const { data: s, isLoading } = useQuery({
    queryKey: ['scheme', id],
    queryFn: async () => (await api.get<Scheme>(`/schemes/${id}`)).data,
  });

  const { data: savedData } = useQuery({
    queryKey: ['saved-ids'],
    enabled: isAuthenticated,
    queryFn: async () => (await api.get<{ schemeIds: string[] }>('/saves')).data,
  });

  const [open, setOpen]               = useState(false);
  const [answers, setAnswers]         = useState<Answers>({});
  const [result, setResult]           = useState<'pass' | 'fail' | null>(null);
  const [formError, setFormError]     = useState('');
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const isSaved = savedOverride ?? Boolean(s && savedData?.schemeIds.includes(s._id));

  const openModal = () => { setOpen(true); setAnswers({}); setResult(null); setFormError(''); };

  const handleCheck = () => {
    if (!s) return;
    const questions = buildQuestions(s);
    const unanswered = questions.filter((q) => !answers[q.key]);
    if (unanswered.length) {
      setFormError(tx.answerAll);
      return;
    }
    setFormError('');
    setResult(evaluate(s, answers) ? 'pass' : 'fail');
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
  const questions = buildQuestions(s);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/schemes')} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--navy)' }}>
        <ArrowLeft size={16} /> {tx.back}
      </button>

      {/* Header */}
      <div className="rounded-2xl px-8 py-8 text-white" style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: meta?.bg ?? '#ffffff18', color: meta?.color ?? '#fff' }}>
              {s.category}
            </span>
            <h1 className="text-2xl font-extrabold">{lang === 'ta' ? s.nameTa : s.nameEn}</h1>
          </div>
          <button
            onClick={async () => {
              if (!isAuthenticated) { setSaveMessage('Please login to save items'); return; }
              if (isSaved) {
                await api.delete('/save', { data: { type: 'scheme', itemId: s._id } });
                setSavedOverride(false); setSaveMessage('');
              } else {
                await api.post('/save', { type: 'scheme', itemId: s._id });
                setSavedOverride(true); setSaveMessage('');
              }
            }}
            disabled={!isAuthenticated}
            className="shrink-0 rounded-xl p-2.5 transition-all"
            style={{ background: isSaved ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.15)', opacity: !isAuthenticated ? 0.7 : 1, cursor: !isAuthenticated ? 'not-allowed' : 'pointer' }}
          >
            {isSaved ? <BookmarkCheck size={18} color="#fff" /> : <Bookmark size={18} color="#fff" />}
          </button>
        </div>
      </div>
      {saveMessage && <p className="text-sm text-amber-600 font-medium">{saveMessage}</p>}

      {/* Info cards */}
      {[
        { label: tx.eligibility, content: lang === 'ta' ? s.eligibilityTa : s.eligibilityEn, color: 'var(--sky)' },
        { label: tx.benefits,    content: lang === 'ta' ? s.benefitsTa    : s.benefitsEn,    color: 'var(--mint)' },
        { label: tx.howToApply,  content: lang === 'ta' ? s.howToApplyTa  : s.howToApplyEn,  color: 'var(--gold)' },
      ].map(({ label, content, color }) => (
        <div key={label} className="card p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color }}>{label}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
        </div>
      ))}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={openModal} className="btn-primary">
          <ClipboardCheck size={16} /> {tx.check}
        </button>
        <a href={s.officialLink} target="_blank" rel="noreferrer" className="btn-navy no-underline">
          <ExternalLink size={16} /> {tx.officialLink}
        </a>
      </div>

      {/* Eligibility modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--navy-dark)' }}>{tx.title}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.key}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{tx[q.labelKey]}</label>

                  {q.type === 'number' && (
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                      style={{ borderColor: '#e2e8f0' }}
                      value={answers[q.key] ?? ''}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                    />
                  )}

                  {q.type === 'income' && (
                    <select
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e2e8f0' }}
                      value={answers[q.key] ?? ''}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                    >
                      <option value="" disabled>{lang === 'ta' ? 'வருமானத்தை தேர்வு செய்யவும்' : 'Select income range'}</option>
                      {incomeOptions.map((o) => (
                        <option key={o.id} value={o.id}>{lang === 'ta' ? o.ta : o.en}</option>
                      ))}
                    </select>
                  )}

                  {q.type === 'yesno' && (
                    <div className="flex gap-6">
                      {(['yes', 'no'] as const).map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name={q.key}
                            value={v}
                            checked={answers[q.key] === v}
                            onChange={() => setAnswers((p) => ({ ...p, [q.key]: v }))}
                          />
                          {v === 'yes' ? tx.yes : tx.no}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {formError && <p className="mt-4 text-sm font-medium" style={{ color: '#ef4444' }}>{formError}</p>}

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={handleCheck} className="btn-primary">{tx.submit}</button>
              <button onClick={() => setOpen(false)} className="btn-navy">{tx.close}</button>
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
                    : <XCircle    size={20} style={{ color: '#ef4444' }}      className="shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold" style={{ color: result === 'pass' ? 'var(--mint)' : '#ef4444' }}>
                    {result === 'pass' ? tx.pass : tx.fail}
                  </p>
                </div>
                <a
                  href={s.officialLink} target="_blank" rel="noreferrer"
                  className="btn-navy mt-3 no-underline text-sm"
                  style={{ display: 'inline-flex' }}
                >
                  <ExternalLink size={14} /> {tx.portal}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
