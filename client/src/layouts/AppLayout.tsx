import { useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Home, FileText, Landmark, MapPin, Bookmark, LogIn,
  Menu, X, Shield, LogOut, ClipboardList, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { EligibilityProfile } from '../types';

// Always visible
const publicLinks = [
  { to: '/', labelKey: 'home', icon: Home },
  { to: '/services', labelKey: 'services', icon: FileText },
  { to: '/schemes', labelKey: 'schemes', icon: Landmark },
  { to: '/offices', labelKey: 'offices', icon: MapPin },
];

// Only shown when logged in
const protectedLinks = [
  { to: '/saved', labelKey: 'saves', icon: Bookmark },
];

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();

  const { data: eligibility } = useQuery({
    queryKey: ['eligibility-status'],
    enabled: isAuthenticated,
    queryFn: async () => (await api.get<EligibilityProfile | null>('/eligibility')).data,
  });
  const eligibilityPath = eligibility ? '/eligible-schemes' : '/eligibility-form';

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const allDesktopLinks = [
    ...publicLinks,
    ...(isAuthenticated ? protectedLinks : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav className="sticky top-0 z-30 shadow-lg" style={{ background: 'var(--navy-dark)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--saffron)' }}>
              <Shield size={18} color="#fff" />
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: '#fff' }}>
              Legal<span style={{ color: 'var(--saffron)' }}>Ease</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {allDesktopLinks.map(({ to, labelKey, icon: Icon }) => (
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

            {/* My Eligibility — only when logged in */}
            {isAuthenticated && (
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
            )}

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--saffron)' }}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  {user?.name}
                  <ChevronDown size={14} style={{ opacity: 0.7, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 shadow-xl"
                    style={{ background: '#fff', border: '1px solid #e2e8f0' }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: '#f1f5f9' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--navy-dark)' }}>{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ color: '#ef4444' }}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all no-underline"
                style={{ background: 'var(--saffron)', color: '#fff' }}
              >
                <LogIn size={15} />
                {t('login')}
              </Link>
            )}

            {/* Language toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}
              className="ml-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {i18n.language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden rounded-lg p-2" style={{ color: '#fff' }} onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 space-y-1" style={{ background: 'var(--navy)', borderColor: 'rgba(255,255,255,0.1)' }}>
            {allDesktopLinks.map(({ to, labelKey, icon: Icon }) => (
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

            {isAuthenticated && (
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
            )}

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--saffron)' }}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline"
                style={{ background: 'var(--saffron)', color: '#fff' }}
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

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mt-16 py-8 text-center text-sm" style={{ background: 'var(--navy-dark)', color: 'rgba(255,255,255,0.5)' }}>
        © {new Date().getFullYear()} LegalEase — Government Services Made Simple
      </footer>
    </div>
  );
}
