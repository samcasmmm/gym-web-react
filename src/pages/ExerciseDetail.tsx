import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Detail from '../components/Detail';
import ExercisesVideo from '../components/ExercisesVideo';
import SimilarExercises from '../components/SimilairExercises';
import Loader from '../components/Loader';
import {
  useExerciseDetail,
  useExerciseVideos,
  useSimilarMuscleExercises,
  useSimilarEquipmentExercises,
} from '../hooks/useExercises';

const ExerciseDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const {
    data: exerciseDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useExerciseDetail(id);

  const { data: exerciseVideos = [], isLoading: isVideosLoading } = useExerciseVideos(
    exerciseDetail?.name || ''
  );

  const { data: targetMuscleExercises = [], isLoading: isMusclesLoading } = useSimilarMuscleExercises(
    exerciseDetail?.target || ''
  );

  const { data: equipmentExercises = [], isLoading: isEquipLoading } = useSimilarEquipmentExercises(
    exerciseDetail?.equipment || ''
  );

  if (isDetailLoading) {
    return <Loader />;
  }

  if (isDetailError || !exerciseDetail) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-2xl p-8 my-10 border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Exercise Not Found</h2>
        <p className="text-gray-600">{(detailError as Error)?.message || 'Unable to retrieve exercise details.'}</p>
        <a
          href="/"
          className="inline-block mt-6 bg-[#FF2625] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#e0201f] transition-colors"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 pt-2">
        <a href="/" className="hover:text-gray-900 transition-colors">
          Home
        </a>
        <span>/</span>
        <a href="/exercises" className="hover:text-gray-900 transition-colors">
          Exercises
        </a>
        <span>/</span>
        <span className="text-[#FF2625] capitalize font-bold">{exerciseDetail.name}</span>
      </div>

      <Detail exerciseDetail={exerciseDetail} />
      <ExercisesVideo
        exerciseVideo={exerciseVideos}
        name={exerciseDetail.name}
        isLoading={isVideosLoading}
      />
      <SimilarExercises
        targetMuscleVideo={targetMuscleExercises}
        equipmentExericses={equipmentExercises}
        isLoading={isMusclesLoading || isEquipLoading}
      />
    </div>
  );
};

export default ExerciseDetail;