import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { formatDuration } from '../utils/calculations';

const RestTimerFloating: React.FC = () => {
  const { isResting, restTimeLeft, totalRestTime, stopRestTimer, adjustRestTimer } = useWorkout();

  if (!isResting) return null;

  const progressPercent = Math.max(0, Math.min(100, (restTimeLeft / totalRestTime) * 100));

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-700"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            className="text-[#FF2625] transition-all duration-300"
            fill="transparent"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
            strokeLinecap="round"
          />
        </svg>
        <Timer className="w-5 h-5 absolute text-white" />
      </div>

      <div className="flex flex-col">
        <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Rest Timer</span>
        <span className="text-2xl font-black tracking-tight text-white font-mono">
          {formatDuration(restTimeLeft)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 ml-2">
        <button
          type="button"
          onClick={() => adjustRestTimer(-15)}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="-15s"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => adjustRestTimer(30)}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="+30s"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={stopRestTimer}
          className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 hover:text-red-100 transition-colors ml-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RestTimerFloating;
