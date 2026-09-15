import React from 'react';
import HorizontalScrollbar from './HorizontalScollbar';
import Loader from './Loader';
import { Exercise } from '../api/exerciseApi';

interface SimilarExercisesProps {
  targetMuscleVideo: Exercise[];
  equipmentExericses: Exercise[];
  isLoading?: boolean;
}

const SimilarExercises: React.FC<SimilarExercisesProps> = ({
  targetMuscleVideo,
  equipmentExericses,
  isLoading,
}) => {
  return (
    <section className="mt-12 sm:mt-16 flex flex-col gap-10">
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
          Exercises That Target The <span className="text-[#FF2625] capitalize">Same Muscle Group</span>
        </h2>
        {isLoading ? (
          <Loader />
        ) : targetMuscleVideo && targetMuscleVideo.length > 0 ? (
          <HorizontalScrollbar data={targetMuscleVideo} />
        ) : (
          <p className="text-gray-500 italic p-4 text-xs">No similar muscle exercises found.</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
          Exercises That Use The <span className="text-[#FF2625] capitalize">Same Equipment</span>
        </h2>
        {isLoading ? (
          <Loader />
        ) : equipmentExericses && equipmentExericses.length > 0 ? (
          <HorizontalScrollbar data={equipmentExericses} />
        ) : (
          <p className="text-gray-500 italic p-4 text-xs">No similar equipment exercises found.</p>
        )}
      </div>
    </section>
  );
};

export default SimilarExercises;
