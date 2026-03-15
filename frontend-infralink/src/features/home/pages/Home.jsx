import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { Building2, Users, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The Ultimate Construction Network
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-10 text-orange-100">
            Connect with top-tier contractors, builders, and skilled workers. Manage projects, payments, and equipment—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to={ROUTES.REGISTER}
              className="bg-white text-orange-600 px-8 py-3 rounded-lg text-lg font-bold hover:bg-orange-50 transition-colors shadow-lg"
            >
              Get Started for Free
            </Link>
            <Link
              to={ROUTES.JOBS}
              className="bg-orange-700 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-orange-800 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Professionals</h3>
              <p className="text-gray-600">Hire trusted contractors and skilled labor with verified portfolios and reviews.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Contracts</h3>
              <p className="text-gray-600">Milestone-based payments and built-in dispute resolution protect your money.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Seamless Management</h3>
              <p className="text-gray-600">Track progress, manage equipment rentals, and communicate in real-time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
