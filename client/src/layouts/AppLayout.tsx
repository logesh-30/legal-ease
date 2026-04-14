import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-20 bg-[#1a3c8f] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link className="text-2xl font-bold text-[#f97316]" to="/">LegalEase</Link>
          <div className="flex gap-4 text-sm md:text-base">
            <Link to="/">{t('home')}</Link><Link to="/services">{t('services')}</Link><Link to="/schemes">{t('schemes')}</Link><Link to="/offices">{t('offices')}</Link><Link to="/saved">{t('saves')}</Link><Link to="/login">{t('login')}</Link>
            <button className="rounded bg-white px-2 text-[#1a3c8f]" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    </div>
  );
}
