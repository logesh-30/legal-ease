import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileCheck, AlertTriangle } from 'lucide-react';

interface Props {
  schemeId: string;
  documents: string[];
  lang: 'en' | 'ta';
}

const STORAGE_KEY = 'legalease_doc_checklist';

// Parse "Aadhaar Card — Proof of identity" → { name, desc }
function parse(raw: string) {
  const sep = raw.indexOf('—') !== -1 ? '—' : '–';
  const parts = raw.split(sep);
  return { name: parts[0].trim(), desc: parts[1]?.trim() ?? '' };
}

function load(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}

function save(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function DocumentChecklist({ schemeId, documents, lang }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const all = load();
    const init: Record<string, boolean> = {};
    documents.forEach((raw) => {
      const { name } = parse(raw);
      init[name] = all[`${schemeId}::${name}`] ?? false;
    });
    setChecked(init);
  }, [schemeId, documents]);

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      const all = load();
      Object.entries(next).forEach(([n, v]) => { all[`${schemeId}::${n}`] = v; });
      save(all);
      return next;
    });
  };

  if (!documents.length) return null;

  const total = documents.length;
  const have = Object.values(checked).filter(Boolean).length;
  const allReady = have === total;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck size={18} style={{ color: 'var(--navy)' }} />
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--navy-dark)' }}>
            {lang === 'ta' ? 'ஆவண சரிபார்ப்பு பட்டியல்' : 'Document Checklist'}
          </h2>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={allReady
            ? { background: '#10b98118', color: 'var(--mint)' }
            : { background: '#f9731618', color: 'var(--saffron)' }}
        >
          {allReady
            ? <><CheckCircle2 size={12} />{lang === 'ta' ? 'விண்ணப்பிக்க தயார்' : 'Ready to Apply'}</>
            : <><AlertTriangle size={12} />{lang === 'ta' ? `${total - have} இல்லை` : `${total - have} Missing`}</>}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(have / total) * 100}%`, background: allReady ? 'var(--mint)' : 'var(--saffron)' }}
        />
      </div>

      {/* Rows */}
      <ul className="space-y-2">
        {documents.map((raw) => {
          const { name, desc } = parse(raw);
          const has = checked[name] ?? false;
          return (
            <li
              key={name}
              onClick={() => toggle(name)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all select-none"
              style={{
                background: has ? '#10b98108' : '#f8fafc',
                border: `1px solid ${has ? '#10b98130' : '#e2e8f0'}`,
              }}
            >
              {has
                ? <CheckCircle2 size={17} className="shrink-0" style={{ color: 'var(--mint)' }} />
                : <XCircle      size={17} className="shrink-0" style={{ color: '#ef4444' }} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--navy-dark)' }}>{name}</p>
                {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                style={has
                  ? { background: '#10b98118', color: 'var(--mint)' }
                  : { background: '#ef444415', color: '#ef4444' }}
              >
                {has
                  ? (lang === 'ta' ? 'உள்ளது' : 'Available')
                  : (lang === 'ta' ? 'இல்லை' : 'Missing')}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-slate-400">
        {lang === 'ta'
          ? 'ஒவ்வொரு ஆவணத்தையும் கிளிக் செய்து நிலையை மாற்றவும்'
          : 'Click each document to toggle its availability'}
      </p>
    </div>
  );
}
