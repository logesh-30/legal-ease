import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Service } from '../types';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const { data: s } = useQuery({ queryKey: ['service', id], queryFn: async () => (await api.get<Service>(`/services/${id}`)).data });
  if (!s) return <p>Loading...</p>;
  const ta = i18n.language === 'ta';
  return <div className="space-y-4 rounded-2xl bg-white p-6 shadow"><h1 className="text-3xl font-bold">{s.icon} {ta ? s.nameTa : s.nameEn}</h1><p>{ta ? s.descriptionTa : s.descriptionEn}</p><h2 className="text-xl font-semibold">Steps</h2><ol className="list-decimal pl-6">{(ta ? s.stepsTa : s.stepsEn).map((x) => <li key={x}>{x}</li>)}</ol><h2 className="text-xl font-semibold">Documents</h2><ul className="list-disc pl-6">{(ta ? s.documentsTa : s.documentsEn).map((x) => <li key={x}>{x}</li>)}</ul><p>{ta ? s.legalDetailsTa : s.legalDetailsEn}</p><a className="font-semibold text-[#1a3c8f] underline" href={s.officialPortalUrl} target="_blank">Open Official Portal</a></div>;
}
