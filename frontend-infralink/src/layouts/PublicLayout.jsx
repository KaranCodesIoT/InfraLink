import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import useAuth from '../hooks/useAuth.js';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Sticky Navbar ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.04)] border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-4">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isScrolled
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/20'
                  : 'bg-white/15 backdrop-blur-md border border-white/20'
              }`}>
                <Building2 className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                InfraLink
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'Jobs', to: ROUTES.JOBS },
                { label: 'Marketplace', to: ROUTES.MARKETPLACE },
                { label: 'Services', to: ROUTES.SERVICES },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled
                      ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isScrolled
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slideDown">
            <div className="px-4 py-4 space-y-1">
              {[
                { label: 'Jobs', to: ROUTES.JOBS },
                { label: 'Marketplace', to: ROUTES.MARKETPLACE },
                { label: 'Services', to: ROUTES.SERVICES },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { navigate(ROUTES.DASHBOARD); setMobileOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-center"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-medium text-center hover:bg-gray-50">Sign in</Link>
                    <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold">InfraLink</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                India's premier construction network connecting professionals, managing projects, and building futures.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Platform', links: ['Jobs', 'Marketplace', 'Services', 'AI Assistant'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Compliance'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} InfraLink. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-orange-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-orange-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
