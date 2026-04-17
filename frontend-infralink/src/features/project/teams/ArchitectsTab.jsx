import { Upload, FileText, CheckCircle } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';
import { Link } from 'react-router-dom';

export default function ArchitectsTab() {
  const { architects } = useProjectDashboardStore();
  const active = architects[0]; // Assuming one main firm

  if (!active) {
    return <div className="p-8 text-center text-gray-500">No architect assigned to this project.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="dash-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link to={`/directory/professional/${active.id}`} className="text-lg font-bold text-gray-900 hover:text-orange-600 transition-colors underline-offset-2 hover:underline">
              {active.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">Lead Architect: {active.role || 'Design Head'} • {active.phone || 'Verified'}</p>
          </div>
          <div className="dash-badge success">Active Consultant</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{active.drawingsSubmitted || 0}</div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">Drawings Submitted</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-bold text-green-700">{active.approved || 0}</div>
            <div className="text-xs text-green-600 uppercase font-semibold tracking-wider mt-1">Drawings Approved</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-2xl font-bold text-orange-700">{(active.drawingsSubmitted || 0) - (active.approved || 0)}</div>
            <div className="text-xs text-orange-600 uppercase font-semibold tracking-wider mt-1">Pending Review</div>
          </div>
        </div>

        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="mx-auto text-gray-400 mb-3" size={24} />
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Upload New Drawing Revision</h4>
          <p className="text-xs text-gray-500 mb-4">PDF, DWG, or RVT files up to 50MB</p>
          <button className="bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-800">
            Select Files
          </button>
        </div>
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title mb-4">Recent Drawings</h3>
        <div className="overflow-x-auto">
          <table className="dash-table w-full">
            <thead>
              <tr>
                <th>Drawing Name</th>
                <th>Version</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-orange-500" />
                    <span className="font-medium text-gray-900">HVAC Layout - Level 1</span>
                  </div>
                </td>
                <td className="text-sm text-gray-600">v2.1</td>
                <td className="text-sm text-gray-600">Today, 10:30 AM</td>
                <td><span className="dash-badge warning">Pending</span></td>
                <td className="text-right">
                  <button className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200">
                    Review
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    <span className="font-medium text-gray-900">Structural Column Grid</span>
                  </div>
                </td>
                <td className="text-sm text-gray-600">v1.4</td>
                <td className="text-sm text-gray-600">Apr 04, 2026</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Approved
                  </span>
                </td>
                <td className="text-right">
                  <button className="text-xs font-medium text-gray-500 hover:text-gray-900">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
