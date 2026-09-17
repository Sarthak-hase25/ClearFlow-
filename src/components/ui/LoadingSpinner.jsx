import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8', xl: 'w-12 h-12' }[size] || 'w-5 h-5';
  return <Loader2 className={`animate-spin text-blue-600 ${sz} ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );
}

const ANALYSIS_STEPS = [
  'Analyzing communication...',
  'Understanding project context...',
  'Identifying actions...',
  'Checking for decisions...',
  'Looking for potential risks...',
];

export function AnalyzingLoader({ onComplete: _onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto">
      {/* Central animated pulse */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
          <Sparkles className="w-7 h-7 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-blue-500/10 animate-ping pointer-events-none" />
      </div>

      {/* Main status header */}
      <h3 className="text-base font-bold text-gray-900 mb-1 text-center">
        {ANALYSIS_STEPS[currentStepIndex]}
      </h3>
      <p className="text-xs text-gray-400 mb-6 text-center">
        ArchFlow is extracting actionable project intelligence
      </p>

      {/* Progress Steps List */}
      <div className="w-full space-y-2 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                isCurrent
                  ? 'text-blue-700 font-semibold'
                  : isDone
                  ? 'text-gray-500 font-medium'
                  : 'text-gray-300'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                </div>
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

