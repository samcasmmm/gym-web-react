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

  return (
    <div className="relative w-full group py-4">
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-row overflow-x-auto gap-6 no-scrollbar scroll-smooth py-2 px-1"
      >
        {data.map((item, index) => (
          <div key={item.id || item.exerciseId || item || index} className="shrink-0">
            {isBodyPart ? (
              <BodyPart
                item={typeof item === 'string' ? item : item.name}
                bodyPart={bodyPart}
                setBodyPart={setBodyPart}
              />
            ) : (
              <ExerciseCard exercise={item as Exercise} />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-end gap-4 mt-4 pr-4">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg hover:bg-[#FF2625] text-[#FF2625] hover:text-white border border-gray-100 transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg hover:bg-[#FF2625] text-[#FF2625] hover:text-white border border-gray-100 transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollbar;
