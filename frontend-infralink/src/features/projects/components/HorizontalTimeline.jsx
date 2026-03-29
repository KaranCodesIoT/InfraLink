import React from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';

export default function HorizontalTimeline({ project }) {
  const steps = [
    { id: 0, label: 'Project Created' },
    { id: 1, label: 'Workers Assigned' },
    { id: 2, label: 'Work Started' },
    { id: 3, label: 'In Progress' },
    { id: 4, label: 'Final Touch' },
    { id: 5, label: 'Completed' },
  ];

  const getCurrentStep = () => {
    if (project.status === 'completed') return 5;
    if (project.progress >= 80) return 4;
    if (project.progress > 0) return 3;
    
    const hasAcceptedWorker = project.assignedWorkers?.some(w => w.status === 'accepted');
    if (project.status === 'active' && hasAcceptedWorker) return 2;
    if (project.assignedWorkers?.length > 0) return 1;
    return 0;
  };

  const currentStepNum = getCurrentStep();

  return (
    <div className="w-full py-6 overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px] flex items-center justify-between relative px-2">
        {/* Background Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* Active Line Fill */}
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-700 rounded-full" 
          style={{ width: `calc(${(currentStepNum / (steps.length - 1)) * 100}% - 24px)` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepNum;
          const isCurrent = index === currentStepNum;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-white transition-colors duration-500
                ${isCompleted ? 'border-green-500 text-green-500 shadow-sm' 
                  : isCurrent ? 'border-yellow-400 text-yellow-500 shadow-md ring-4 ring-yellow-50' 
                  : 'border-gray-300 text-gray-300'}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 font-bold" />
                ) : isCurrent ? (
                  <CircleDot className="w-5 h-5 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              <span 
                className={`mt-3 text-xs md:text-sm font-semibold text-center leading-tight transition-colors duration-500
                ${isCompleted ? 'text-gray-900' 
                  : isCurrent ? 'text-yellow-700' 
                  : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
