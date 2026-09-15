import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, DbRoutine } from '../db/database';
import { useWorkout } from '../context/WorkoutContext';
import { Calendar, Play, Plus, X, Sparkles, Dumbbell } from 'lucide-react';

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();
  const [routines, setRoutines] = useState<DbRoutine[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [routineName, setRoutineName] = useState('');
  const [routineCategory, setRoutineCategory] = useState<'PPL' | 'Upper/Lower' | 'Full Body' | 'Custom'>('Custom');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineExercises, setRoutineExercises] = useState('');

  const loadRoutines = async () => {
    const list = await db.routines.toArray();
    setRoutines(list);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleStart = (routine: DbRoutine) => {
    startWorkout(
      routine.name,
      routine.exerciseNames.map((name) => ({ name }))
    );
    navigate('/workout');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) return;

    const names = routineExercises
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newRoutine: DbRoutine = {
      id: `rt_${Date.now()}`,
      name: routineName.trim(),
      category: routineCategory,
      description: routineDescription.trim() || 'Custom training split.',
      exerciseNames: names.length > 0 ? names : ['Barbell Bench Press', 'Squat', 'Deadlift'],
    };

    await db.routines.add(newRoutine);
    setCreateModalOpen(false);
    setRoutineName('');
    setRoutineDescription('');
    setRoutineExercises('');
    loadRoutines();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Training Programs
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">Workout Plans & Splits</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pick from proven templates or craft your custom training splits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-md font-bold text-sm shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF2625]" /> Create Routine
        </button>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-6"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-red-50 text-[#FF2625]">
                  {routine.category}
                </span>
                <span className="text-xs text-gray-400 font-semibold">
                  {routine.exerciseNames.length} Exercises
                </span>
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">{routine.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{routine.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-gray-50">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Exercise Lineup:
                </p>
                <div className="flex flex-wrap gap-2">
                  {routine.exerciseNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 text-xs font-semibold capitalize border border-gray-100 flex items-center gap-1.5"
                    >
                      <Dumbbell className="w-3 h-3 text-[#FF2625]" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStart(routine)}
              className="w-full bg-[#FF2625] hover:bg-[#e0201f] text-white py-3 rounded-md font-bold text-sm shadow-sm shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 fill-current" /> Start This Routine
            </button>
          </div>
        ))}
      </div>

      {/* CREATE ROUTINE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Create Custom Routine</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Routine Name
                </label>
                <input
                  type="text"
                  required
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Upper Body Hypertrophy"
                  className="w-full px-4 py-2 rounded-md border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Category
                </label>
                <select
                  value={routineCategory}
                  onChange={(e) => setRoutineCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm font-semibold"
                >
                  <option value="PPL">Push / Pull / Legs (PPL)</option>
                  <option value="Upper/Lower">Upper / Lower</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Custom">Custom Routine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={routineDescription}
                  onChange={(e) => setRoutineDescription(e.target.value)}
                  placeholder="Goals, target muscle groups, tempo..."
                  className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Exercises (one per line)
                </label>
                <textarea
                  rows={4}
                  value={routineExercises}
                  onChange={(e) => setRoutineExercises(e.target.value)}
                  placeholder="Barbell Bench Press&#10;Incline Dumbbell Press&#10;Triceps Pushdown"
                  className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-600 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF2625] hover:bg-[#e0201f] text-white px-5 py-2 rounded-md font-bold text-sm shadow-xs"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
