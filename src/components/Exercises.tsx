import React, { useState, useEffect } from 'react';
import ExerciseCard from './ExerciseCard';
import Loader from './Loader';
import { useExercises } from '../hooks/useExercises';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';

interface ExercisesProps {
  bodyPart: string;
  search: string;
}

const Exercises: React.FC<ExercisesProps> = ({ bodyPart, search }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 12;

  const { data, isLoading, isError, error } = useExercises(bodyPart, search, 50);
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
      }
    }
  };

  return (
    <section id="exercises" className="mt-10 pt-6 border-t border-gray-100 scroll-mt-20 space-y-6">
      {/* 1. SECTION HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/70 p-4 sm:p-5 rounded-lg border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF2625]" />
            <h2 className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
              Showing Results
            </h2>
            <span className="ml-1.5 px-2.5 py-0.5 rounded-sm bg-red-100/80 text-[#FF2625] text-xs font-bold font-mono">
              {exercises.length} found
            </span>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
            {search ? (
              <span>
                Filtered by keyword: <strong className="text-gray-900">"{search}"</strong>
              </span>
            ) : (
              <span>
                Category: <strong className="text-gray-900 capitalize">{bodyPart}</strong>
              </span>
            )}
          </p>
        </div>

        {totalPages > 1 && (
          <div className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-xs">
            Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}
          </div>
        )}
      </div>

      {/* 2. EXERCISES GRID (4 COLUMNS) */}
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="text-center py-10 bg-red-50 rounded-lg p-6 border border-red-200">
          <p className="text-red-600 font-bold">Failed to load exercises.</p>
          <p className="text-gray-500 text-xs mt-1">{(error as Error)?.message}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100 p-6 space-y-2 shadow-xs">
          <Dumbbell className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No exercises found</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            Try choosing a different muscle category or searching with another keyword.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 justify-items-center">
            {currentExercises.map((exercise) => (
              <ExerciseCard key={exercise.id || exercise.exerciseId} exercise={exercise} />
            ))}
          </div>

          {/* 3. PAGINATION BAR */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-8 pb-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
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
                        <span className="px-1.5 text-gray-400 font-bold text-xs">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[36px] h-9 px-3 rounded-md font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                          currentPage === page
                            ? 'bg-[#FF2625] text-white shadow-xs'
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
                className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Exercises;
