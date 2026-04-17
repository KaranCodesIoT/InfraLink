import { useProjectDashboard } from '../context/ProjectDashboardContext.jsx';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';
import { UserCheck, UserX, Users, Pickaxe, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LabourTab() {
  const { role } = useProjectDashboard();
  const { 
    labourRequests, acceptLabourRequest, rejectLabourRequest, 
    workers, contractors, simulatorRole 
  } = useProjectDashboardStore();

  const isContractor = role === 'contractor';
  
  // If contractor is logged in, we assume they are 'c1' for mock testing.
  const myContractorId = 'c1'; 

  // Filter requests for the current contractor if contractor role, otherwise show all/none
  const pendingRequests = isContractor 
    ? labourRequests.filter(r => r.contractorId === myContractorId && r.status === 'pending')
    : [];

  const myWorkers = isContractor 
    ? workers.filter(w => w.contractorId === myContractorId)
    : workers; // Show all to builder

  const activeContractor = contractors.find(c => c.id === myContractorId);

  return (
    <div className="space-y-8">
      {/* Contractor's Incoming Labour Requests */}
      {isContractor && pendingRequests.length > 0 && (
        <section>
          <h3 className="dash-card-title flex items-center gap-2 mb-4">
            <Pickaxe className="text-orange-500" size={18} />
            Hire Labour (Job Seekers)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(r => (
              <div key={r.id} className="dash-card p-5 border border-orange-100 bg-orange-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link to={`/directory/professional/${r.id}`} className="font-semibold text-gray-900 hover:text-orange-600 transition-colors underline-offset-2 hover:underline">
                      {r.workerName || r.name}
                    </Link>
                    <p className="text-xs text-gray-500">{r.phone}</p>
                  </div>
                  <span className="dash-badge warning">Applying</span>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Skill</span>
                    <span className="font-medium text-gray-800">{r.skill}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium text-gray-800">{r.experience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expected Wage</span>
                    <span className="font-medium text-gray-800">₹{r.expectedWage}/day</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-gray-200 pt-4">
                  <button 
                    onClick={() => acceptLabourRequest(r.id)}
                    className="flex-1 bg-gray-900 text-white min-h-[36px] font-medium text-sm rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserCheck size={16} /> Hire
                  </button>
                  <button 
                    onClick={() => rejectLabourRequest(r.id)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 min-h-[36px] font-medium text-sm rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserX size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Workforce List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="dash-card-title flex items-center gap-2">
            <Users className="text-gray-700" size={18} />
            {isContractor ? `${activeContractor?.name || 'Your'} Workforce` : 'All Site Labour'}
          </h3>
          <div className="dash-search-container w-64">
            <Search className="dash-search-icon" size={16} />
            <input type="text" className="dash-search-input" placeholder="Search workers..." />
          </div>
        </div>

        <div className="dash-card p-0 overflow-hidden">
          <table className="dash-table w-full">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                {!isContractor && <th>Contractor</th>}
                <th>Attendance</th>
                <th>Performance</th>
                <th className="text-right">Daily Wage</th>
              </tr>
            </thead>
            <tbody>
              {myWorkers.map(w => {
                const contractorName = contractors.find(c => c.id === w.contractorId)?.name || 'Direct Hire';
                
                return (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/directory/professional/${w.id}`} className="font-medium text-gray-900 hover:text-orange-600 transition-colors underline-offset-2 hover:underline">
                            {w.name}
                          </Link>
                          <div className="text-xs text-gray-500">{w.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dash-badge neutral">{w.role}</span>
                    </td>
                    {!isContractor && (
                      <td className="text-sm text-gray-600">{contractorName}</td>
                    )}
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${w.attendance}%`, 
                              backgroundColor: w.attendance > 90 ? '#10b981' : w.attendance > 75 ? '#f59e0b' : '#ef4444' 
                            }} 
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{w.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        ⭐ <span className="font-medium text-sm">{w.performance}</span>
                      </div>
                    </td>
                    <td className="text-right text-sm font-medium text-gray-900">
                      ₹{w.dailyWage}
                    </td>
                  </tr>
                );
              })}
              {myWorkers.length === 0 && (
                <tr>
                  <td colSpan={isContractor ? 5 : 6} className="text-center py-8 text-gray-500 bg-gray-50">
                    No workers assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
