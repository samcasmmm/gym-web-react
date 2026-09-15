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
    <section className="mt-16 sm:mt-24 p-5 flex flex-col gap-12">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Exercises That Target The <span className="text-[#FF2625]">Same Muscle Group</span>
        </h2>
        {isLoading ? (
          <Loader />
        ) : targetMuscleVideo && targetMuscleVideo.length > 0 ? (
          <HorizontalScrollbar data={targetMuscleVideo} />
        ) : (
          <p className="text-gray-500 italic p-4">No similar muscle exercises found.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Exercises That Use The <span className="text-[#FF2625]">Same Equipment</span>
        </h2>
        {isLoading ? (
          <Loader />
        ) : equipmentExericses && equipmentExericses.length > 0 ? (
          <HorizontalScrollbar data={equipmentExericses} />
        ) : (
          <p className="text-gray-500 italic p-4">No similar equipment exercises found.</p>
        )}
      </div>
    </section>
  );
};

export default SimilarExercises;
