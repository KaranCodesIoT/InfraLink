import React from 'react';
import { XCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkerAssignmentList({ assignments = [], isOwner, onRemoveWorker }) {
  if (!assignments.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 border border-dashed border-gray-200">
        No workers assigned to this project yet.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3.5 w-3.5" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {assignments.map((assignment) => (
        <li key={assignment._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={assignment.user?.avatar || 'https://via.placeholder.com/40'} 
              alt={assignment.user?.name || 'Worker'} 
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{assignment.user?.name || 'Unknown Worker'}</p>
              <p className="text-xs text-gray-500">Assigned {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end sm:items-center sm:flex-row gap-4">
            {/* Contribution Stats */}
            {assignment.status === 'accepted' && (
              <div className="bg-orange-50 px-3 py-1 rounded-md border border-orange-100 text-center sm:mr-4">
                <span className="block text-sm font-bold text-orange-700">{assignment.updatesCount || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-orange-600 font-medium">Updates</span>
              </div>
            )}
            
            {getStatusBadge(assignment.status)}
            
            {isOwner && (
              <button 
                onClick={() => onRemoveWorker && onRemoveWorker(assignment.user?._id)}
                className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-md"
                title="Remove worker"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
