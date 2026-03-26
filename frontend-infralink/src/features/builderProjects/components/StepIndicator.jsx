import { Check } from 'lucide-react';

const STEP_LABELS = ['Basic Info', 'Pricing & Units', 'Media Upload', 'Trust & Details', 'Preview & Submit'];

export default function StepIndicator({ currentStep = 0 }) {
  return (
    <div className="w-full mb-8">
      {/* Desktop / Tablet */}
      <div className="hidden sm:flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive ? 'text-orange-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-orange-600">
          Step {currentStep + 1} of {STEP_LABELS.length}
        </span>
        <span className="text-sm text-gray-500">{STEP_LABELS[currentStep]}</span>
      </div>
      <div className="sm:hidden mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / STEP_LABELS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
