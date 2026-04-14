import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Home, FileText, Landmark, MapPin, Bookmark, LogIn, Menu, X, Shield, LogOut, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { EligibilityProfile } from '../types';

const navLinks = [
  { to: '/', labelKey: 'home', icon: Home },
  { to: '/services', labelKey: 'services', icon: FileText },
  { to: '/schemes', labelKey: 'schemes', icon: Landmark },
  { to: '/offices', labelKey: 'offices', icon: MapPin },
  { to: '/saved', labelKey: 'saves', icon: Bookmark },
];

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { data: eligibility } = useQuery({
    queryKey: ['eligibility-status'],
    enabled: isAuthenticated,
    queryFn: async () => (await api.get<EligibilityProfile | null>('/eligibility')).data,
  });
  const eligibilityPath = !isAuthenticated ? '/login' : eligibility ? '/eligible-schemes' : '/eligibility-form';

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav
        className="sticky top-0 z-30 shadow-lg"
        style={{ background: 'var(--navy-dark)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: 'var(--saffron)' }}
            >
              <Shield size={18} color="#fff" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: '#fff' }}>
              Legal<span style={{ color: 'var(--saffron)' }}>Ease</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, labelKey, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all no-underline"
                style={{
                  color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.72)',
                  background: isActive(to) ? 'rgba(249,115,22,0.18)' : 'transparent',
                  borderBottom: isActive(to) ? '2px solid var(--saffron)' : '2px solid transparent',
                }}
              >
                <Icon size={15} />
                {t(labelKey)}
              </Link>
            ))}
            <Link
              to={eligibilityPath}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all no-underline"
              style={{
                color: isActive('/eligibility-form') || isActive('/eligible-schemes') ? '#fff' : 'rgba(255,255,255,0.72)',
                background: isActive('/eligibility-form') || isActive('/eligible-schemes') ? 'rgba(249,115,22,0.18)' : 'transparent',
                borderBottom: isActive('/eligibility-form') || isActive('/eligible-schemes') ? '2px solid var(--saffron)' : '2px solid transparent',
              }}
            >
              <ClipboardList size={15} />
              {t('myEligibility')}
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => void logout()}
                className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                <LogOut size={15} />
                {user?.name}
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all no-underline"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                <LogIn size={15} />
                {t('login')}
              </Link>
            )}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}
              className="ml-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {i18n.language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-lg p-2"
            style={{ color: '#fff' }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 pb-4 pt-2 space-y-1"
            style={{ background: 'var(--navy)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {navLinks.map(({ to, labelKey, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all"
                style={{
                  color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.75)',
                  background: isActive(to) ? 'var(--saffron)' : 'transparent',
                }}
              >
                <Icon size={16} />
                {t(labelKey)}
              </Link>
            ))}
            <Link
              to={eligibilityPath}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all"
              style={{
                color: isActive('/eligibility-form') || isActive('/eligible-schemes') ? '#fff' : 'rgba(255,255,255,0.75)',
                background: isActive('/eligibility-form') || isActive('/eligible-schemes') ? 'var(--saffron)' : 'transparent',
              }}
            >
              <ClipboardList size={16} />
              {t('myEligibility')}
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => { void logout(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                <LogOut size={16} />
                {user?.name}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                <LogIn size={16} />
                {t('login')}
              </Link>
            )}
            <button
              onClick={() => { i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en'); setMobileOpen(false); }}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-left"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {i18n.language === 'en' ? 'தமிழ் மொழியில் மாற்று' : 'Switch to English'}
            </button>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer
        className="mt-16 py-8 text-center text-sm"
        style={{ background: 'var(--navy-dark)', color: 'rgba(255,255,255,0.5)' }}
      >
        © {new Date().getFullYear()} LegalEase — Government Services Made Simple
      </footer>
    </div>
  );
}
