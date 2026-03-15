import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import useAuth from '../hooks/useAuth.js';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InfraLink</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to={ROUTES.JOBS} className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors">Jobs</Link>
              <Link to={ROUTES.MARKETPLACE} className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors">Marketplace</Link>
              <Link to={ROUTES.SERVICES} className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors">Services</Link>
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                    Sign in
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} InfraLink. Connecting construction professionals.
        </div>
      </footer>
    </div>
  );
}

