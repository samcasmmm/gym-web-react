import React, { useState } from 'react';
import { Search, X, Sparkles, Dumbbell, Compass, Flame, Filter } from 'lucide-react';
import { useBodyParts } from '../hooks/useExercises';
import HorizontalScrollbar from './HorizontalScollbar';
import Loader from './Loader';

interface SearchExercisesProps {
  bodyPart: string;
  setBodyPart: (bodyPart: string) => void;
  onSearch: (searchTerm: string) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-up',
  'Bicep Curl',
  'Shoulder Press',
  'Dumbbell',
  'Barbell',
];

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

  const handleQuickTagClick = (tag: string) => {
    setSearchInput(tag);
    onSearch(tag);
    const exercisesElem = document.getElementById('exercises');
    if (exercisesElem) {
      exercisesElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <section className="flex flex-col items-center justify-center w-full space-y-8 py-6">
      {/* 1. SECTION BADGE & TITLE */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-[#FF2625] text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs">
          <Sparkles className="w-4 h-4 text-[#FF2625]" />
          1,500+ Animated Movements & Techniques
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 leading-tight">
          Awesome Exercises You <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2625] via-red-500 to-amber-500">
            Should Know
          </span>
        </h2>

        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-normal">
          Discover target muscle activations, proper form GIF animations, and step-by-step cues for every gym movement.
        </p>
      </div>

      {/* 2. ELEVATED SEARCH INPUT */}
      <div className="w-full max-w-3xl space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center w-full shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white border border-gray-200 focus-within:border-[#FF2625] focus-within:ring-4 focus-within:ring-[#FF2625]/15 transition-all duration-200"
        >
          <div className="pl-5 text-gray-400">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search exercises by name, body part, equipment..."
            className="w-full py-4 px-4 text-gray-900 placeholder-gray-400 font-semibold focus:outline-none text-base sm:text-lg bg-transparent"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mr-1"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="bg-[#FF2625] hover:bg-[#e0201f] text-white font-bold text-base sm:text-lg px-7 sm:px-10 py-4 transition-all duration-200 cursor-pointer shrink-0 shadow-md shadow-red-500/25"
          >
            Search
          </button>
        </form>

        {/* Popular Search Suggestion Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FF2625]" /> Popular:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-[#FF2625] hover:border-red-200 border border-transparent text-xs font-bold text-gray-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CATEGORY SELECTOR CAROUSEL */}
      <div className="w-full space-y-3 pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#FF2625]" /> Target Muscle Categories
          </span>
          <span className="text-xs font-bold text-gray-500">
            Selected: <strong className="text-[#FF2625] capitalize">{bodyPart}</strong>
          </span>
        </div>

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
