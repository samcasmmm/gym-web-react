import React from 'react';
import { Link } from 'react-router-dom';
import { Exercise } from '../api/exerciseApi';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const exerciseId = exercise.id || exercise.exerciseId;

  return (
    <Link
      to={`/exercise/${exerciseId}`}
      className="flex flex-col justify-between bg-white w-full sm:w-[360px] md:w-[380px] h-[460px] rounded-bl-3xl border-t-4 border-[#FF2625] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden p-4 group"
    >
      <div className="w-full h-[320px] overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
        <img
          src={exercise.gifUrl}
          alt={exercise.name}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-row gap-3 mt-3 px-2">
        <span className="bg-[#FFA9A9] text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full capitalize">
          {exercise.bodyPart || (exercise.bodyParts && exercise.bodyParts[0])}
        </span>
        <span className="bg-[#FCC757] text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full capitalize">
          {exercise.target || (exercise.targetMuscles && exercise.targetMuscles[0])}
        </span>
      </div>

      <h3 className="text-gray-900 font-bold text-lg sm:text-xl capitalize px-2 pt-2 pb-1 truncate">
        {exercise.name}
      </h3>
    </Link>
  );
};

export default ExerciseCard;
