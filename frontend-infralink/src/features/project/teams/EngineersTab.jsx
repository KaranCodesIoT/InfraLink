import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

export default function EngineersTab() {
  const { engineers } = useProjectDashboardStore();

  return (
    <div className="dash-card">
      <h3 className="dash-card-title mb-4">Internal Engineering Team</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engineers.map(e => (
          <div key={e.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg shadow-sm">
              {e.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{e.name}</div>
              <div className="text-xs text-orange-600 font-medium">{e.specialization}</div>
              <div className="text-xs text-gray-500 mt-1">{e.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
