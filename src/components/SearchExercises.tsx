import React, { useState } from 'react';
import { Search, X, Sparkles, Dumbbell, Compass, Flame } from 'lucide-react';
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

const SearchExercises: React.FC<SearchExercisesProps> = ({ bodyPart, setBodyPart, onSearch }) => {
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
    <section className='flex flex-col items-center justify-center w-full space-y-6 py-4'>
      {/* 1. SECTION BADGE & TITLE */}
      <div className='text-center space-y-3 max-w-3xl mx-auto'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-200/60 text-[#FF2625] text-xs font-bold tracking-wide uppercase'>
          <Sparkles className='w-3.5 h-3.5 text-[#FF2625]' />
          1,500+ Animated Movements & Techniques
        </div>

        <h2 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 leading-tight'>
          Awesome Exercises You <br />
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FF2625] via-red-500 to-amber-500'>
            Should Know
          </span>
        </h2>

        <p className='text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-normal'>
          Discover target muscle activations, proper form GIF animations, and step-by-step cues for every gym movement.
        </p>
      </div>

      {/* 2. SEARCH INPUT */}
      <div className='w-full max-w-3xl space-y-2.5'>
        <form
          onSubmit={handleSearchSubmit}
          className='relative flex items-center w-full rounded-lg overflow-hidden bg-white border border-gray-300 focus-within:border-[#FF2625] focus-within:ring-2 focus-within:ring-[#FF2625]/20 transition-all shadow-xs'
        >
          <div className='pl-4 text-gray-400'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search exercises by name, body part, equipment...'
            className='w-full py-3.5 px-3 text-gray-900 placeholder-gray-400 font-semibold focus:outline-none text-sm sm:text-base bg-transparent'
          />
          {searchInput && (
            <button
              type='button'
              onClick={handleClear}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mr-1'
              title='Clear search'
            >
              <X className='w-4 h-4' />
            </button>
          )}
          <button
            type='submit'
            className='bg-[#FF2625] hover:bg-[#e0201f] text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 transition-colors cursor-pointer shrink-0'
          >
            Search
          </button>
        </form>

        {/* Popular Search Suggestion Tags */}
        <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1'>
          <span className='text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1'>
            <Flame className='w-3.5 h-3.5 text-[#FF2625]' /> Popular:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type='button'
              onClick={() => handleQuickTagClick(tag)}
              className='px-2.5 py-1 rounded-md bg-gray-100 hover:bg-red-50 hover:text-[#FF2625] border border-transparent text-xs font-semibold text-gray-600 whitespace-nowrap transition-colors cursor-pointer'
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CATEGORY SELECTOR TABS */}
      <div className='w-full space-y-2 pt-2'>
        <div className='flex items-center justify-between px-1 text-xs'>
          <span className='font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1'>
            <Compass className='w-3.5 h-3.5 text-[#FF2625]' /> Target Muscle Categories
          </span>
          <span className='font-semibold text-gray-500'>
            Selected: <strong className='text-[#FF2625] capitalize'>{bodyPart}</strong>
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
