import React from 'react';
import { Link } from 'react-router-dom';
import { Exercise } from '../api/exerciseApi';
import { useWorkout } from '../context/WorkoutContext';
import { ArrowUpRight, Dumbbell, Plus, Check, Flame } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { addExerciseToWorkout } = useWorkout();
  const [added, setAdded] = React.useState(false);

  const exerciseId = exercise.id || exercise.exerciseId;
  const bodyPartName = exercise.bodyPart || (exercise.bodyParts && exercise.bodyParts[0]) || 'General';
  const targetMuscle = exercise.target || (exercise.targetMuscles && exercise.targetMuscles[0]) || 'Muscle';
  const equipmentName = exercise.equipment || (exercise.equipments && exercise.equipments[0]) || 'Bodyweight';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addExerciseToWorkout(exercise);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className='group relative flex flex-col justify-between bg-white w-full max-w-[380px] h-[450px] rounded-lg border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-colors duration-200 overflow-hidden p-3.5'>
      {/* 1. MEDIA CANVAS */}
      <Link to={`/exercise/${exerciseId}`} className='relative block w-full'>
        <div className='relative w-full h-[260px] overflow-hidden rounded-md bg-gray-50/70 border border-gray-100 flex items-center justify-center p-2.5'>
          {exercise.gifUrl ? (
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              loading='lazy'
              className='h-full w-full object-contain mix-blend-multiply'
            />
          ) : (
            <Dumbbell className='w-14 h-14 text-gray-300' />
          )}

          {/* Body Part Badge */}
          <div className='absolute top-2 left-2 z-10'>
            <span className='bg-gray-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1'>
              <Flame className='w-3 h-3 text-[#FF2625]' />
              {bodyPartName}
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            type='button'
            onClick={handleQuickAdd}
            className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-md flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-700 hover:bg-[#FF2625] hover:text-white border border-gray-200'
            }`}
            title='Add to Workout'
          >
            {added ? <Check className='w-3.5 h-3.5 stroke-[3]' /> : <Plus className='w-3.5 h-3.5 stroke-[2.5]' />}
          </button>
        </div>
      </Link>

      {/* 2. CONTENT */}
      <div className='flex flex-col justify-between flex-grow pt-2.5 space-y-2'>
        <div>
          {/* Target & Equipment Chips */}
          <div className='flex flex-wrap items-center gap-1.5 mb-1.5'>
            <span className='bg-red-50 text-[#FF2625] text-[10px] font-semibold px-2 py-0.5 rounded-xs capitalize'>
              {targetMuscle}
            </span>
            <span className='bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-xs capitalize'>
              {equipmentName}
            </span>
          </div>

          {/* Title */}
          <Link to={`/exercise/${exerciseId}`}>
            <h3 className='text-gray-900 font-bold text-sm capitalize line-clamp-1 group-hover:text-[#FF2625] transition-colors'>
              {exercise.name}
            </h3>
          </Link>
        </div>

        {/* 3. FOOTER */}
        <div className='pt-2 border-t border-gray-100 flex items-center justify-between text-xs'>
          <Link
            to={`/exercise/${exerciseId}`}
            className='font-medium text-gray-500 hover:text-[#FF2625] flex items-center gap-1 transition-colors'
          >
            Form Guide <ArrowUpRight className='w-3 h-3' />
          </Link>

          <button
            type='button'
            onClick={handleQuickAdd}
            className='text-[10px] font-bold text-gray-500 hover:text-gray-900 transition-colors'
          >
            {added ? '✓ Added' : '+ Add to Workout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
