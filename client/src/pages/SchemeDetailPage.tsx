import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scheme } from '../types';

type QuestionType = 'number' | 'yesno' | 'income';
type QuestionKey =
  | 'age'
  | 'income'
  | 'farmer'
  | 'student'
  | 'female'
  | 'category'
  | 'resident'
  | 'business'
  | 'bpl'
  | 'disability';

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
  { key: 'disability', type: 'yesno', patterns: [/\bdisabled\b/i, /\bdisability\b/i, /differently abled/i] }
];

const text = {
  en: {
    eligibility: 'Eligibility:',
    benefits: 'Benefits:',
    howToApply: 'How to apply:',
    officialLink: 'Official Link',
    check: 'Check Your Eligibility',
    title: 'Eligibility Checker',
    submit: 'Check Eligibility',
    close: 'Close',
    pass: 'You are likely eligible for this scheme!',
    fail: 'You may not be eligible. Please visit the official portal to confirm.',
    portal: 'Open Official Portal',
    age: 'What is your age?',
    income: 'What is your annual family income?',
    farmer: 'Are you a farmer or engaged in agriculture?',
    student: 'Are you currently a student?',
    female: 'Are you female?',
    category: 'Do you belong to SC/ST/OBC category?',
    resident: 'Are you a resident of Tamil Nadu?',
    business: 'Do you own or plan to start a business?',
    bpl: 'Do you have a BPL ration card?',
    disability: 'Do you have a disability?'
  },
  ta: {
    eligibility: 'தகுதி:',
    benefits: 'நன்மைகள்:',
    howToApply: 'எப்படி விண்ணப்பிப்பது:',
    officialLink: 'அதிகாரப்பூர்வ இணைப்பு',
    check: 'உங்கள் தகுதியை சரிபார்க்கவும்',
    title: 'தகுதி சரிபார்ப்பு',
    submit: 'தகுதி சரிபார்க்க',
    close: 'மூடு',
    pass: 'இந்த திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு அதிகம்!',
    fail: 'நீங்கள் தகுதி பெறாமல் இருக்கலாம். உறுதிப்படுத்த அதிகாரப்பூர்வ தளத்தை பார்க்கவும்.',
    portal: 'அதிகாரப்பூர்வ தளம் திறக்க',
    age: 'உங்கள் வயது என்ன?',
    income: 'உங்கள் குடும்ப ஆண்டு வருமானம் எவ்வளவு?',
    farmer: 'நீங்கள் விவசாயத்தில் ஈடுபட்டவரா?',
    student: 'நீங்கள் தற்போது மாணவரா?',
    female: 'நீங்கள் பெண்ணா?',
    category: 'நீங்கள் SC/ST/OBC பிரிவைச் சேர்ந்தவரா?',
    resident: 'நீங்கள் தமிழ்நாடு குடியிருப்பாளரா?',
    business: 'நீங்கள் தொழில் தொடங்கியவரா அல்லது தொடங்க திட்டமிட்டுள்ளீர்களா?',
    bpl: 'உங்களிடம் BPL ரேஷன் கார்டு உள்ளதா?',
    disability: 'உங்களுக்கு மாற்றுத்திறன் உள்ளதா?'
  }
};

const incomeOptions = [
  { id: 'lt1', en: 'Below 1 Lakh', ta: '1 லட்சத்திற்குக் கீழ்', min: 0, max: 100000 },
  { id: '1to2_5', en: '1-2.5 Lakhs', ta: '1-2.5 லட்சம்', min: 100000, max: 250000 },
  { id: '2_5to5', en: '2.5-5 Lakhs', ta: '2.5-5 லட்சம்', min: 250000, max: 500000 },
  { id: 'gt5', en: 'Above 5 Lakhs', ta: '5 லட்சத்திற்கு மேல்', min: 500000, max: Number.POSITIVE_INFINITY }
];

export default function SchemeDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const { data: s } = useQuery({ queryKey: ['scheme', id], queryFn: async () => (await api.get<Scheme>(`/schemes/${id}`)).data });
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);

  if (!s) return <p>Loading...</p>;
  const ta = i18n.language === 'ta';
  const t = ta ? text.ta : text.en;

  const questions = useMemo(() => {
    const eligibility = s.eligibilityEn.toLowerCase();
    const generated: Question[] = [];
    keywordMap.forEach((rule) => {
      if (rule.patterns.some((pattern) => pattern.test(eligibility))) {
        generated.push({ key: rule.key, type: rule.type });
      }
    });
    return generated;
  }, [s.eligibilityEn]);

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
    const upperMatch = eligibility.match(/(?:below|under|less than)\s*(\d+(?:\.\d+)?)\s*lakh/i);
    if (upperMatch) {
      const upper = Number(upperMatch[1]) * 100000;
      return selected.min < upper;
    }
    const lowerMatch = eligibility.match(/(?:above|greater than|more than)\s*(\d+(?:\.\d+)?)\s*lakh/i);
    if (lowerMatch) {
      const lower = Number(lowerMatch[1]) * 100000;
      return selected.max > lower;
    }
    const betweenMatch = eligibility.match(/between\s*(\d+(?:\.\d+)?)\s*(?:and|-)\s*(\d+(?:\.\d+)?)\s*lakh/i);
    if (betweenMatch) {
      const min = Number(betweenMatch[1]) * 100000;
      const max = Number(betweenMatch[2]) * 100000;
      return selected.max > min && selected.min < max;
    }
    return true;
  };

  const evaluate = () => {
    let eligible = true;
    questions.forEach((q) => {
      if (q.type === 'yesno' && answers[q.key] !== 'yes') eligible = false;
      if (q.key === 'age') {
        const ageRule = parseAgeRule(s.eligibilityEn);
        if (ageRule) {
          const age = Number(answers.age);
          if (Number.isNaN(age) || age < ageRule.min || age > ageRule.max) eligible = false;
        }
      }
      if (q.key === 'income') {
        if (!isIncomeEligible(answers.income, s.eligibilityEn)) eligible = false;
      }
    });
    setResult(eligible ? 'pass' : 'fail');
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold">{ta ? s.nameTa : s.nameEn}</h1>
      <p><b>{t.eligibility}</b> {ta ? s.eligibilityTa : s.eligibilityEn}</p>
      <p><b>{t.benefits}</b> {ta ? s.benefitsTa : s.benefitsEn}</p>
      <p><b>{t.howToApply}</b> {ta ? s.howToApplyTa : s.howToApplyEn}</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setOpen(true); setResult(null); }}
          className="rounded-lg bg-[#f97316] px-4 py-2 font-semibold text-white transition hover:opacity-90"
        >
          {t.check}
        </button>
        <a className="underline text-[#1a3c8f]" href={s.officialLink} target="_blank" rel="noreferrer">{t.officialLink}</a>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-[#1a3c8f]">{t.title}</h2>
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.key}>
                  <label className="mb-1 block font-medium">{t[q.key]}</label>
                  {q.type === 'number' && (
                    <input
                      type="number"
                      className="w-full rounded-lg border p-2"
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    />
                  )}
                  {q.type === 'income' && (
                    <select
                      className="w-full rounded-lg border p-2"
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                      defaultValue=""
                    >
                      <option value="" disabled>{ta ? 'வருமானத்தை தேர்வு செய்யவும்' : 'Select income range'}</option>
                      {incomeOptions.map((option) => (
                        <option key={option.id} value={option.id}>{ta ? option.ta : option.en}</option>
                      ))}
                    </select>
                  )}
                  {q.type === 'yesno' && (
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1">
                        <input type="radio" name={q.key} value="yes" onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))} />
                        {ta ? 'ஆம்' : 'Yes'}
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="radio" name={q.key} value="no" onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))} />
                        {ta ? 'இல்லை' : 'No'}
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={evaluate} className="rounded-lg bg-[#f97316] px-4 py-2 font-semibold text-white">{t.submit}</button>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-[#1a3c8f] px-4 py-2 font-semibold text-white">{t.close}</button>
            </div>
            {result && (
              <div className={`mt-4 rounded-lg p-3 ${result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                <p className="font-semibold">{result === 'pass' ? `✅ ${t.pass}` : `❌ ${t.fail}`}</p>
                <a className="mt-2 inline-block rounded-lg bg-[#1a3c8f] px-3 py-2 text-white" href={s.officialLink} target="_blank" rel="noreferrer">
                  {t.portal}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
