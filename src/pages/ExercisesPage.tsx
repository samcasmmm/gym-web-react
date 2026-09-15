import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useBodyParts, useExercises } from '../hooks/useExercises';
import ExerciseCard from '../components/ExerciseCard';
import Loader from '../components/Loader';
import { Search, Plus, Dumbbell, Filter, Sparkles } from 'lucide-react';
import { db } from '../db/database';

const ExercisesPage: React.FC = () => {
  const { addExerciseToWorkout } = useWorkout();
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Custom exercise form state
  const [customName, setCustomName] = useState('');
  const [customBodyPart, setCustomBodyPart] = useState('chest');
  const [customTarget, setCustomTarget] = useState('pectorals');
  const [customEquipment, setCustomEquipment] = useState('dumbbell');
  const [customInstructions, setCustomInstructions] = useState('');

  const { data: bodyParts = ['all'] } = useBodyParts();
  const { data, isLoading, isError, error } = useExercises(selectedBodyPart, search, 50);

  const exercises = data?.exercises || [];

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      bodyPart: customBodyPart,
      target: customTarget,
      equipment: customEquipment,
      instructions: customInstructions ? [customInstructions] : ['Perform with controlled tempo.'],
    };

    await db.customExercises.add(newEx);
    addExerciseToWorkout(newEx);
    setCustomModalOpen(false);
    setCustomName('');
    setCustomInstructions('');
    alert(`Custom exercise "${newEx.name}" created and added to workout!`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" /> Exercise Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">Exercise Library</h1>
          <p className="text-gray-500 text-sm mt-1">
            Explore 1,500+ animated gym exercises and workout instructions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCustomModalOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FF2625]" /> Create Custom Exercise
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises by name, body part, equipment..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
          />
        </div>

        {/* Body Part Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {bodyParts.map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setSelectedBodyPart(bp)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedBodyPart === bp
                  ? 'bg-[#FF2625] text-white shadow-md shadow-red-500/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 rounded-2xl p-6 border border-red-200">
          <p className="text-red-600 font-bold">Failed to load exercises.</p>
          <p className="text-gray-500 text-sm mt-1">{(error as Error)?.message}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <p className="text-gray-700 font-bold text-xl">No exercises matched your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedBodyPart('all');
            }}
            className="mt-4 bg-[#FF2625] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {exercises.map((exercise) => (
            <div key={exercise.id || exercise.exerciseId} className="w-full relative group">
              <ExerciseCard exercise={exercise} />
              <button
                type="button"
                onClick={() => {
                  addExerciseToWorkout(exercise);
                  alert(`Added "${exercise.name}" to your active workout!`);
                }}
                className="absolute top-4 right-4 z-20 bg-gray-900/90 hover:bg-[#FF2625] text-white p-2.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
                title="Add to Active Workout"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CUSTOM EXERCISE MODAL */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Custom Exercise</h3>
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Body Part
                  </label>
                  <select
                    value={customBodyPart}
                    onChange={(e) => setCustomBodyPart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold capitalize"
                  >
                    {['chest', 'back', 'legs', 'shoulders', 'arms', 'waist', 'cardio'].map((bp) => (
                      <option key={bp} value={bp}>
                        {bp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Equipment
                  </label>
                  <select
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold capitalize"
                  >
                    {['barbell', 'dumbbell', 'cable', 'body weight', 'machine'].map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Instructions / Form Cues
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  placeholder="Keep chest up, control the eccentric phase..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF2625] hover:bg-[#e0201f] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
