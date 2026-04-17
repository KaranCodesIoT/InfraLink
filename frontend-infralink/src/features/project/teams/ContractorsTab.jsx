import { useProjectDashboard } from '../context/ProjectDashboardContext.jsx';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';
import { ShieldAlert, UserCheck, Search, Users, Activity, Briefcase, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContractorDetailView from './ContractorDetailView.jsx';

export default function ContractorsTab() {
  const { role } = useProjectDashboard();
  const { 
    contractors, 
    acceptContractor, 
    rejectContractor,
    selectedContractorId,
    setSelectedContractorId
  } = useProjectDashboardStore();

  if (selectedContractorId) {
    return <ContractorDetailView />;
  }

  const pending = contractors.filter(c => c.status === 'pending_request' || c.status === 'pending');
  const active = contractors.filter(c => c.status === 'active' || c.status === 'accepted');

  const isBuilder = role === 'builder';

  return (
    <div className="space-y-8">
      {/* Pending Requests (Only visible to Builder) */}
      {isBuilder && pending.length > 0 && (
        <section>
          <h3 className="dash-card-title flex items-center gap-2 mb-4">
            <ShieldAlert className="text-orange-500" size={18} />
            Incoming Contractor Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(c => (
              <div key={c.id} className="dash-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/directory/contractor/${c.id}`} className="font-semibold text-gray-800 hover:text-orange-600 transition-colors underline-offset-2 hover:underline">
                      {c.name}
                    </Link>
                    <span className="dash-badge neutral">{c.type}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4 items-center flex gap-1">
                    <Briefcase size={14} /> Applying for: {c.type} Contract
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>Rating: ⭐ {c.rating}</span>
                    <span>Team: {c.workersCount} allowed</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptContractor(c.id)}
                    className="flex-1 bg-gray-900 text-white min-h-[36px] px-4 font-medium text-sm rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserCheck size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => rejectContractor(c.id)}
                    className="flex-1 bg-red-50 text-red-600 min-h-[36px] px-4 font-medium text-sm rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserX size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Contractors */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="dash-card-title flex items-center gap-2">
            <Users className="text-gray-700" size={18} />
            Active Contractors
          </h3>
          <div className="dash-search-container w-64">
            <Search className="dash-search-icon" size={16} />
            <input type="text" className="dash-search-input" placeholder="Search contractors..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map(c => (
            <div key={c.id} className="dash-card p-5 border-t-2" style={{ borderTopColor: c.delayed ? '#ef4444' : '#10b981' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link to={`/directory/contractor/${c.id}`} className="font-semibold text-gray-800 hover:text-orange-600 transition-colors underline-offset-2 hover:underline flex items-center justify-between w-full">
                    {c.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{c.phone || c.type || 'Verified Contractor'}</p>
                </div>
                <span className={`dash-badge ${c.delayed ? 'danger' : 'success'}`}>
                  {c.delayed ? 'Behind Schedule' : 'On Track'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Contract Progress</span>
                    <span className="font-medium">{c.progress || 0}%</span>
                  </div>
                  <div className="dash-progress-track">
                    <div className="dash-progress-fill" style={{ width: `${c.progress || 0}%`, background: c.delayed ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase size={14} />
                    <span>{c.assignedTasks?.length || 0} Tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users size={14} />
                    <span>{c.workersCount || 0} Workers</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedContractorId(c.id)}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center justify-between w-full"
                >
                  <span>View Details & Payments</span>
                  <Activity size={14} />
                </button>
              </div>
            </div>
          ))}
          {active.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No active contractors found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
