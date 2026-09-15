import React from 'react';
import { Link } from 'react-router-dom';
import { Exercise } from '../api/exerciseApi';
import { ArrowUpRight, Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const exerciseId = exercise.id || exercise.exerciseId;
  const bodyPartName = exercise.bodyPart || (exercise.bodyParts && exercise.bodyParts[0]) || 'General';
  const targetMuscle = exercise.target || (exercise.targetMuscles && exercise.targetMuscles[0]) || 'Muscle';
  const equipmentName = exercise.equipment || (exercise.equipments && exercise.equipments[0]);

  return (
    <Link
      to={`/exercise/${exerciseId}`}
      className="group flex flex-col justify-between bg-white w-full sm:w-[350px] lg:w-[370px] h-[480px] rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-red-100 transition-all duration-300 hover:-translate-y-1.5 p-5 overflow-hidden"
    >
      {/* Media Box */}
      <div className="relative w-full h-[300px] overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50/80 to-gray-100/50 flex items-center justify-center p-4 border border-gray-100/60">
        {exercise.gifUrl ? (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
          />
        ) : (
          <Dumbbell className="w-16 h-16 text-gray-300" />
        )}

        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#FF2625] group-hover:scale-110 transition-all duration-200">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="bg-red-50 text-[#FF2625] text-xs font-bold px-3 py-1 rounded-full capitalize">
          {bodyPartName}
        </span>
        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
          {targetMuscle}
        </span>
        {equipmentName && (
          <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">
            {equipmentName}
          </span>
        )}
      </div>

      {/* Exercise Name */}
      <div className="pt-1">
        <h3 className="text-gray-900 font-bold text-lg capitalize line-clamp-1 group-hover:text-[#FF2625] transition-colors">
          {exercise.name}
        </h3>
        <p className="text-xs text-gray-400 font-medium mt-0.5">
          View form cues & workout guide →
        </p>
      </div>
    </Link>
  );
};

export default ExerciseCard;
