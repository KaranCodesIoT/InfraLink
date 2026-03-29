import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MissingUpdateAlert({ missingWorkers = [] }) {
  if (!missingWorkers.length) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Missing Daily Updates
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-1">The following workers have not submitted their update for today (-3 points penalty applies):</p>
            <ul className="list-disc pl-5 space-y-1">
              {missingWorkers.map((w, idx) => (
                <li key={idx} className="font-medium">
                  {w.user?.name || 'Unknown'} 
                  {w.workCategory && <span className="font-normal text-red-600 ml-1">({w.workCategory})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
