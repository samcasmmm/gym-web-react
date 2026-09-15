import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BodyPart from './BodyPart';
import ExerciseCard from './ExerciseCard';
import { Exercise } from '../api/exerciseApi';

interface HorizontalScrollbarProps {
  data: any[];
  bodyPart?: string;
  setBodyPart?: (bodyPart: string) => void;
  isBodyPart?: boolean;
}

const HorizontalScrollbar: React.FC<HorizontalScrollbarProps> = ({
  data,
  bodyPart = '',
  setBodyPart = () => {},
  isBodyPart = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isBodyPart) {
    return (
      <div className="relative w-full py-1">
        <div className="flex items-center gap-2">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 shrink-0 hidden sm:flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Pills Container */}
          <div
            ref={scrollContainerRef}
            className="flex flex-row overflow-x-auto gap-2 no-scrollbar scroll-smooth py-1 px-0.5 flex-grow"
          >
            {data.map((item, index) => (
              <div key={item.id || item.exerciseId || item || index} className="shrink-0">
                <BodyPart
                  item={typeof item === 'string' ? item : item.name}
                  bodyPart={bodyPart}
                  setBodyPart={setBodyPart}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 shrink-0 hidden sm:flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-4">
      {/* Scrollable Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-row overflow-x-auto gap-4 sm:gap-6 no-scrollbar scroll-smooth py-2 px-1"
      >
        {data.map((item, index) => (
          <div key={item.id || item.exerciseId || item || index} className="shrink-0">
            <ExerciseCard exercise={item as Exercise} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-end gap-3 mt-4 pr-2">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="w-9 h-9 flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-[#FF2625] text-gray-700 hover:text-white border border-gray-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="w-9 h-9 flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-[#FF2625] text-gray-700 hover:text-white border border-gray-200 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollbar;
