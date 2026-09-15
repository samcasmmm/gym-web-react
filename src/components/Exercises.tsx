import React, { useState, useEffect } from 'react';
import ExerciseCard from './ExerciseCard';
import Loader from './Loader';
import { useExercises } from '../hooks/useExercises';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExercisesProps {
  bodyPart: string;
  search: string;
}

const Exercises: React.FC<ExercisesProps> = ({ bodyPart, search }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 9;

  const { data, isLoading, isError, error } = useExercises(bodyPart, search, 25);
  const exercises = data?.exercises || [];

  const totalPages = Math.ceil(exercises.length / exercisesPerPage);
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(indexOfFirstExercise, indexOfLastExercise);

  useEffect(() => {
    setCurrentPage(1);
  }, [bodyPart, search]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const exercisesElem = document.getElementById('exercises');
      if (exercisesElem) {
        exercisesElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 1800, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="exercises" className="mt-16 lg:mt-24 p-5 scroll-mt-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="font-bold text-3xl sm:text-4xl text-gray-900">
            Showing Results
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            {search
              ? `Search results for "${search}" (${exercises.length} found)`
              : `Category: ${bodyPart.toUpperCase()} (${exercises.length} found)`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 rounded-2xl p-6 border border-red-200">
          <p className="text-red-600 font-semibold text-lg">
            Failed to load exercises. Please try again.
          </p>
          <p className="text-gray-500 text-sm mt-1">{(error as Error)?.message}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <p className="text-gray-700 font-bold text-xl">No exercises found.</p>
          <p className="text-gray-500 mt-2">Try searching for a different keyword or category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center">
            {currentExercises.map((exercise) => (
              <ExerciseCard key={exercise.id || exercise.exerciseId} exercise={exercise} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-16 flex-wrap">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, arr) => {
                  const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-gray-400 font-medium">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                          currentPage === page
                            ? 'bg-[#FF2625] text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Exercises;
