import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useBodyParts } from '../hooks/useExercises';
import HorizontalScrollbar from './HorizontalScollbar';
import Loader from './Loader';

interface SearchExercisesProps {
  bodyPart: string;
  setBodyPart: (bodyPart: string) => void;
  onSearch: (searchTerm: string) => void;
}

const SearchExercises: React.FC<SearchExercisesProps> = ({
  bodyPart,
  setBodyPart,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const { data: bodyParts = ['all'], isLoading } = useBodyParts();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      const exercisesElem = document.getElementById('exercises');
      if (exercisesElem) {
        exercisesElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <section className="flex flex-col items-center justify-center mt-10 p-5 w-full">
      <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-center text-gray-900 mb-12 leading-snug">
        Awesome Exercises You <br /> Should Know
      </h2>

      {/* Search Input Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center w-full max-w-3xl mb-12 shadow-md rounded-full overflow-hidden bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-[#FF2625]/50 transition-all"
      >
        <div className="pl-6 text-gray-400">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search Exercises by name, muscle, or equipment..."
          className="w-full py-4 px-4 text-gray-800 placeholder-gray-400 font-semibold focus:outline-none text-base sm:text-lg bg-transparent"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 text-gray-400 hover:text-gray-600 font-semibold text-sm cursor-pointer"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          className="bg-[#FF2625] hover:bg-[#e0201f] text-white font-semibold text-base sm:text-lg px-6 sm:px-10 py-4 transition-colors cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>

      {/* Body Part Categories */}
      <div className="relative w-full px-2 sm:px-6">
        {isLoading ? (
          <Loader />
        ) : (
          <HorizontalScrollbar
            data={bodyParts}
            bodyPart={bodyPart}
            setBodyPart={(selected) => {
              setBodyPart(selected);
              setSearchInput('');
              onSearch('');
            }}
            isBodyPart
          />
        )}
      </div>
    </section>
  );
};

export default SearchExercises;
