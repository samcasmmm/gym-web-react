import React, { useState, useEffect } from 'react';
import { db, DbWorkout, DbWorkoutSet } from '../db/database';
import { useWorkout } from '../context/WorkoutContext';
import {
  History as HistoryIcon,
  Calendar,
  Clock,
  Zap,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '../utils/calculations';

const History: React.FC = () => {
  const { unit } = useWorkout();
  const [workouts, setWorkouts] = useState<DbWorkout[]>([]);
  const [workoutSets, setWorkoutSets] = useState<DbWorkoutSet[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const loadHistory = async () => {
    const list = await db.workouts.orderBy('date').reverse().toArray();
    setWorkouts(list);
    const sets = await db.workoutSets.toArray();
    setWorkoutSets(sets);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (workoutId: string) => {
    if (confirm('Delete this workout session from history?')) {
      await db.workouts.delete(workoutId);
      await db.workoutSets.where('workoutId').equals(workoutId).delete();
      loadHistory();
    }
  };

  return (
    <div className='max-w-5xl mx-auto py-8 px-4 space-y-8'>
      {/* Header */}
      <div className='bg-white p-6 sm:p-8 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between'>
        <div>
          <span className='text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5'>
            <HistoryIcon className='w-4 h-4' /> Training Log
          </span>
          <h1 className='text-3xl sm:text-4xl font-black text-gray-900 mt-1'>Workout History</h1>
          <p className='text-gray-500 text-sm mt-1'>Review past workouts, sets, volume, and performance trends.</p>
        </div>
      </div>

      {/* History List */}
      {workouts.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200/80 p-12 text-center space-y-4 shadow-xs'>
          <Dumbbell className='w-16 h-16 text-gray-300 mx-auto' />
          <h3 className='text-2xl font-bold text-gray-800'>No workouts logged yet</h3>
          <p className='text-gray-500 text-sm max-w-sm mx-auto'>
            When you complete active workouts, your sets and volume logs will appear here.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {workouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const setsForThisWorkout = workoutSets.filter((s) => s.workoutId === workout.id);

            // Group sets by exercise
            const exerciseGroups: { [name: string]: DbWorkoutSet[] } = {};
            setsForThisWorkout.forEach((s) => {
              if (!exerciseGroups[s.exerciseName]) exerciseGroups[s.exerciseName] = [];
              exerciseGroups[s.exerciseName].push(s);
            });

            return (
              <div
                key={workout.id}
                className='bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden transition-all'
              >
                {/* Workout Card Top Banner */}
                <div
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                  className='p-6 cursor-pointer hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4'
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-2 text-xs font-bold text-gray-400'>
                      <Calendar className='w-3.5 h-3.5 text-[#FF2625]' />
                      {formatDate(workout.date)}
                      {workout.routineName && (
                        <span className='bg-red-50 text-[#FF2625] px-2 py-0.5 rounded-sm text-[10px] uppercase font-black'>
                          {workout.routineName}
                        </span>
                      )}
                    </div>
                    <h3 className='text-xl font-bold text-gray-900'>{workout.name}</h3>
                    {workout.notes && <p className='text-xs text-gray-500 italic'>{workout.notes}</p>}
                  </div>

                  <div className='flex items-center gap-6 justify-between sm:justify-end'>
                    <div className='flex items-center gap-4 text-xs font-bold'>
                      <span className='flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md'>
                        <Clock className='w-3.5 h-3.5 text-gray-400' />
                        {workout.durationMinutes} mins
                      </span>
                      <span className='flex items-center gap-1 text-gray-900 bg-[#FFF3F4] px-3 py-1.5 rounded-md'>
                        <Zap className='w-3.5 h-3.5' />
                        {workout.totalVolume} {unit}
                      </span>
                      <span className='text-gray-500'>{workout.totalSets} sets</span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(workout.id);
                        }}
                        className='p-2 text-gray-300 hover:text-red-500 transition-colors'
                        title='Delete workout'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                      <div className='p-1 text-gray-400'>
                        {isExpanded ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Sets Breakdown */}
                {isExpanded && (
                  <div className='px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50 space-y-4'>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-gray-400'>Exercise Breakdown</h4>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {Object.entries(exerciseGroups).map(([exName, sets]) => (
                        <div key={exName} className='p-4 rounded-lg bg-white border border-gray-200/80 shadow-xs'>
                          <h5 className='font-bold text-gray-900 text-sm capitalize mb-2'>{exName}</h5>
                          <div className='space-y-1 text-xs text-gray-600'>
                            {sets.map((s) => (
                              <div
                                key={s.id}
                                className='flex items-center justify-between py-1 border-b border-gray-50 last:border-0'
                              >
                                <span className='font-semibold text-gray-500'>Set {s.setNumber}:</span>
                                <span className='font-mono font-bold text-gray-800'>
                                  {s.weight} {unit} × {s.reps} reps
                                </span>
                                <CheckCircle className='w-3.5 h-3.5 text-emerald-500' />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
