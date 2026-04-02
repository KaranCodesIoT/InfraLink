import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useDirectoryStore } from '../../../store/index.js';
import { ROUTES } from '../../../constants/routes.js';
import { ROLES } from '../../../constants/roles.js';
import { 
  Building2, 
  Ruler, 
  Users, 
  Truck, 
  FileText, 
  Construction,
  PlusCircle,
  Briefcase,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  ShoppingBag
} from 'lucide-react';

export default function ClientDashboard() {

  const { user } = useAuthStore();
  const { categoryStats, fetchDirectoryStats } = useDirectoryStore();

  useEffect(() => {
    fetchDirectoryStats();
  }, [fetchDirectoryStats]);

  const stats = [
    { label: 'Active Projects', value: 3, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Proposals', value: 5, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed Jobs', value: 12, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Recent Messages', value: 2, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const categories = [
    {
      id: 1,
      title: 'Builder & Developer',
      role: ROLES.BUILDER,
      path: '/directory/builders',
      icon: Building2,
      description: 'Find real estate developers and construction firms.',
      color: 'bg-blue-500',
      count: categoryStats[ROLES.BUILDER] || 0,
    },
    {
      id: 2,
      title: 'Architecture & Engineering',
      role: ROLES.ARCHITECT,
      icon: Ruler,
      description: 'Professional design and structural solutions.',
      color: 'bg-purple-500',
      count: categoryStats[ROLES.ARCHITECT] || 0,
    },
    {
      id: 3,
      title: 'Contractor',
      role: ROLES.CONTRACTOR,
      icon: Construction,
      description: 'Specialized contractors for all construction needs.',
      color: 'bg-orange-500',
      count: categoryStats[ROLES.CONTRACTOR] || 0,
    },
    {
      id: 4,
      title: 'Skilled Labour',
      role: ROLES.LABOUR,
      icon: Users,
      description: 'Reliable skilled workers and masons.',
      color: 'bg-green-500',
      count: (categoryStats[ROLES.LABOUR] || 0) + (categoryStats[ROLES.WORKER] || 0),
    },
    {
      id: 5,
      title: 'Suppliers & Marketplace',
      path: ROUTES.MARKETPLACE,
      icon: ShoppingBag,
      description: 'Wholesale materials, tools, and construction equipment.',
      color: 'bg-cyan-500',
      count: 'Live',
    },
    {
      id: 7,
      title: 'Industry Events',
      path: '#',
      icon: Calendar,
      description: 'Stay updated with the latest construction and infrastructure events.',
      color: 'bg-emerald-500',
      count: 'Upcoming',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Hello {user?.name}, manage your infrastructure projects and professional network.</p>
        </div>
        <Link
          to={ROUTES.JOB_POST}
          className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Post New Project</span>
        </Link>
      </div>

      {/* Legacy Stats (kept for context) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards Grid (The Main Request) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Find Construction Professionals</h2>
          <Link to={ROUTES.DIRECTORY} className="text-orange-600 text-sm font-semibold hover:underline">View All Directory</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path || `/directory/browse?role=${category.role}`}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all group overflow-hidden relative"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${category.color} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="flex items-start justify-between mb-5">
                <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center text-white shadow-lg shadow-${category.color.split('-')[1]}-100`}>
                  <category.icon className="w-7 h-7" />
                </div>
                {category.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {category.count === 'Live' ? 'Live' : `${category.count} Profiles`}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {category.description}
              </p>
              
              <div className="flex items-center text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                Explore Listings
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Active Industry Projects</h2>
          <Link to={ROUTES.JOBS} className="text-orange-600 hover:text-orange-700 text-sm font-bold">Manage All</Link>
        </div>
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Briefcase className="w-10 h-10" />
          </div>
          <p className="text-gray-900 font-bold text-lg">No active projects yet</p>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">Post your first construction job to receive bids from contractors and skilled workers.</p>
          <button className="mt-8 text-orange-600 font-bold border-2 border-orange-600 px-8 py-2 rounded-full hover:bg-orange-600 hover:text-white transition-all">
            Browse Job Board
          </button>
        </div>
      </div>
    </div>
  );
}

