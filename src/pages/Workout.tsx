import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout, ActiveExercise } from '../context/WorkoutContext';
import { useBodyParts, useExercises } from '../hooks/useExercises';
import { Plus, Trash2, Check, Timer, Play, X, Dumbbell, Sparkles, Search, Zap, TrendingUp, Info } from 'lucide-react';
import { formatDuration, calculate1RM, getOverloadSuggestion } from '../utils/calculations';

const Workout: React.FC = () => {
  const navigate = useNavigate();
  const {
    isActive,
    workoutName,
    elapsedSeconds,
    exercises,
    unit,
    startWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    startRestTimer,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: bodyParts = ['all'] } = useBodyParts();
  const { data: searchResults, isLoading: isSearchLoading } = useExercises(selectedCategory, modalSearch, 20);

  const handleFinish = async () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise before completing.');
      return;
    }
    const completedCount = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
    if (completedCount === 0) {
      if (!confirm('You have not marked any sets as completed. Save anyway?')) {
        return;
      }
    }

    const savedId = await finishWorkout();
    if (savedId) {
      navigate('/history');
    }
  };

  if (!isActive) {
    return (
      <div className='max-w-4xl mx-auto py-16 px-4 text-center'>
        <div className='w-20 h-20 rounded-xl bg-red-50 text-[#FF2625] flex items-center justify-center mx-auto mb-6 shadow-inner'>
          <Dumbbell className='w-10 h-10' />
        </div>
        <h1 className='text-3xl sm:text-4xl font-black text-gray-900 mb-3'>No Active Workout</h1>
        <p className='text-gray-500 text-base max-w-md mx-auto mb-8'>
          Start a fresh workout session to track your sets, weights, reps, and progressive overload in real-time.
        </p>

        <div className='flex flex-wrap justify-center gap-4'>
          <button
            type='button'
            onClick={() => startWorkout('Full Body Strength')}
            className='bg-[#FF2625] hover:bg-[#e0201f] text-white px-7 py-3 rounded-md font-bold text-base shadow-md shadow-red-500/25 flex items-center gap-2 cursor-pointer transition-colors'
          >
            <Play className='w-5 h-5 fill-current' />
            Start Empty Workout
          </button>
          <button
            type='button'
            onClick={() => navigate('/plans')}
            className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-bold text-base transition-colors cursor-pointer'
          >
            Pick from Routines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto py-8 px-4 space-y-8'>
      {/* Top Header Bar */}
      <div className='bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <span className='text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-[#FF2625] animate-ping' /> Live Session
          </span>
          <h1 className='text-2xl sm:text-3xl font-black text-gray-900 mt-1'>{workoutName}</h1>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          {/* Workout Stopwatch */}
          <div className='flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-mono font-bold text-lg shadow-xs'>
            <Timer className='w-5 h-5 text-[#FF2625]' />
            {formatDuration(elapsedSeconds)}
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handleFinish}
              className='bg-[#FF2625] hover:bg-[#e0201f] text-white px-4.5 py-2 rounded-md font-bold text-sm shadow-sm shadow-red-500/20 flex items-center gap-1.5 cursor-pointer transition-colors'
            >
              <Check className='w-4 h-4' /> Finish
            </button>
            <button
              type='button'
              onClick={() => {
                if (confirm('Are you sure you want to discard this workout?')) cancelWorkout();
              }}
              className='p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors'
              title='Cancel Workout'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Rest Timer Presets Bar */}
      <div className='bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap'>
        <span className='text-sm font-bold flex items-center gap-2 text-gray-300'>
          <Timer className='w-4 h-4 text-[#FF2625]' /> Quick Rest Timer:
        </span>
        <div className='flex items-center gap-2 flex-wrap'>
          {[30, 60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              type='button'
              onClick={() => startRestTimer(sec)}
              className='px-3 py-1.5 rounded-md bg-gray-800 hover:bg-[#FF2625] text-xs font-bold font-mono transition-colors cursor-pointer'
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Section */}
      <div className='space-y-6'>
        {exercises.map((exercise, exIndex) => {
          const bestSet = exercise.sets.reduce((max, s) => (s.completed && s.weight > max.weight ? s : max), {
            weight: 0,
            reps: 0,
          });
          const suggestion = getOverloadSuggestion(
            exercise.sets[0]?.prevWeight || 0,
            exercise.sets[0]?.prevReps || 0,
            unit,
          );

          return (
            <div
              key={exercise.id || exIndex}
              className='bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 space-y-5'
            >
              {/* Exercise Header */}
              <div className='flex items-start justify-between gap-4 pb-4 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                  {exercise.gifUrl ? (
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className='w-14 h-14 object-cover rounded-xl bg-gray-50 border border-gray-100'
                    />
                  ) : (
                    <div className='w-14 h-14 rounded-xl bg-red-50 text-[#FF2625] flex items-center justify-center font-bold text-xl'>
                      {exIndex + 1}
                    </div>
                  )}
                  <div>
                    <h3 className='font-bold text-lg sm:text-xl text-gray-900 capitalize'>{exercise.name}</h3>
                    <div className='flex items-center gap-2 mt-1'>
                      {exercise.bodyPart && (
                        <span className='text-[11px] font-bold uppercase tracking-wider bg-red-50 text-[#FF2625] px-2.5 py-0.5 rounded-full'>
                          {exercise.bodyPart}
                        </span>
                      )}
                      {exercise.target && (
                        <span className='text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full'>
                          {exercise.target}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => removeExerciseFromWorkout(exercise.id)}
                  className='text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors'
                  title='Remove Exercise'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>

              {/* Progressive Overload Insight Pill */}
              <div className='flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/60'>
                <Zap className='w-4 h-4 text-amber-600 shrink-0' />
                <span>
                  <strong>Overload Goal:</strong> {suggestion.suggestion}
                </span>
              </div>

              {/* Set Table */}
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                  <thead>
                    <tr className='text-gray-400 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100 pb-2'>
                      <th className='py-2 w-14'>Set</th>
                      <th className='py-2'>Previous</th>
                      <th className='py-2 w-28'>{unit.toUpperCase()}</th>
                      <th className='py-2 w-24'>Reps</th>
                      <th className='py-2 w-24'>1RM Est</th>
                      <th className='py-2 w-16 text-center'>Done</th>
                      <th className='py-2 w-12'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {exercise.sets.map((set) => {
                      const est1RM = calculate1RM(set.weight, set.reps);
                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${set.completed ? 'bg-emerald-50/50' : 'hover:bg-gray-50/60'}`}
                        >
                          <td className='py-2.5 font-black text-gray-700'>{set.setNumber}</td>
                          <td className='py-2.5 text-gray-400 text-xs'>
                            {set.prevWeight ? `${set.prevWeight}${unit} × ${set.prevReps}` : '—'}
                          </td>
                          <td className='py-2.5'>
                            <input
                              type='number'
                              min='0'
                              step='0.5'
                              value={set.weight || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, { weight: Number(e.target.value) })}
                              className='w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF2625]'
                            />
                          </td>
                          <td className='py-2.5'>
                            <input
                              type='number'
                              min='0'
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, { reps: Number(e.target.value) })}
                              className='w-16 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF2625]'
                            />
                          </td>
                          <td className='py-2.5 text-xs font-mono font-bold text-gray-500'>
                            {est1RM > 0 ? `${est1RM} ${unit}` : '—'}
                          </td>
                          <td className='py-2.5 text-center'>
                            <button
                              type='button'
                              onClick={() => toggleSetComplete(exercise.id, set.id)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                set.completed
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              <Check className='w-5 h-5 stroke-3' />
                            </button>
                          </td>
                          <td className='py-2.5 text-right'>
                            <button
                              type='button'
                              onClick={() => removeSet(exercise.id, set.id)}
                              className='text-gray-300 hover:text-red-500 p-1'
                            >
                              <X className='w-4 h-4' />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <button
                type='button'
                onClick={() => addSet(exercise.id)}
                className='w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#FF2625] text-gray-600 hover:text-[#FF2625] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer'
              >
                <Plus className='w-4 h-4' /> Add Set
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Exercise CTA */}
      <div className='text-center pt-2'>
        <button
          type='button'
          onClick={() => setSearchModalOpen(true)}
          className='bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-md flex items-center gap-2 mx-auto cursor-pointer transition-all hover:scale-102'
        >
          <Plus className='w-5 h-5 text-[#FF2625]' /> Add Exercise to Workout
        </button>
      </div>

      {/* ADD EXERCISE MODAL */}
      {searchModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200'>
            {/* Modal Header */}
            <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
              <div>
                <h3 className='text-2xl font-bold text-gray-900'>Add Exercise</h3>
                <p className='text-xs text-gray-500 mt-0.5'>Search from 1,500+ exercises library</p>
              </div>
              <button
                type='button'
                onClick={() => setSearchModalOpen(false)}
                className='p-2 rounded-xl text-gray-400 hover:bg-gray-100'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className='p-6 space-y-4 border-b border-gray-100 bg-gray-50/50'>
              <div className='relative'>
                <Search className='w-5 h-5 absolute left-4 top-3.5 text-gray-400' />
                <input
                  type='text'
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder='Search by name, chest, dumbbell, squat...'
                  className='w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF2625]'
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className='flex gap-2 overflow-x-auto no-scrollbar py-1'>
                {bodyParts.map((bp) => (
                  <button
                    key={bp}
                    type='button'
                    onClick={() => setSelectedCategory(bp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                      selectedCategory === bp
                        ? 'bg-[#FF2625] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {bp}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className='grow overflow-y-auto p-6 divide-y divide-gray-100'>
              {isSearchLoading ? (
                <div className='py-12 text-center text-gray-400 font-semibold'>Loading exercises...</div>
              ) : searchResults?.exercises && searchResults.exercises.length > 0 ? (
                searchResults.exercises.map((ex) => (
                  <div
                    key={ex.id || ex.exerciseId}
                    className='py-3 flex items-center justify-between hover:bg-gray-50 p-2 rounded-xl transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      {ex.gifUrl ? (
                        <img src={ex.gifUrl} alt={ex.name} className='w-12 h-12 object-cover rounded-lg bg-gray-100' />
                      ) : (
                        <div className='w-12 h-12 rounded-lg bg-red-50 text-[#FF2625] flex items-center justify-center font-bold'>
                          <Dumbbell className='w-5 h-5' />
                        </div>
                      )}
                      <div>
                        <h4 className='font-bold text-gray-900 capitalize text-sm'>{ex.name}</h4>
                        <p className='text-xs text-gray-400 capitalize'>
                          {ex.bodyPart} • {ex.target} • {ex.equipment}
                        </p>
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => {
                        addExerciseToWorkout(ex);
                        setSearchModalOpen(false);
                      }}
                      className='bg-[#FF2625] hover:bg-[#e0201f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer'
                    >
                      Add +
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-500 font-semibold text-sm'>No exercises found.</p>
                  <button
                    type='button'
                    onClick={() => {
                      if (modalSearch.trim()) {
                        addExerciseToWorkout({ name: modalSearch.trim(), bodyPart: selectedCategory });
                        setSearchModalOpen(false);
                      }
                    }}
                    className='mt-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold'
                  >
                    Add "{modalSearch}" as Custom Exercise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;
