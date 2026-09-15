import React from 'react';
import { Flame, HeartPulse, Dumbbell, Shield, Zap, Activity, Layers } from 'lucide-react';

interface BodyPartProps {
  item: string;
  setBodyPart: (bodyPart: string) => void;
  bodyPart: string;
}

const getCategoryIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'all':
      return Flame;
    case 'chest':
      return Shield;
    case 'back':
      return Layers;
    case 'cardio':
      return HeartPulse;
    case 'upper arms':
    case 'lower arms':
      return Dumbbell;
    case 'upper legs':
    case 'lower legs':
      return Zap;
    case 'shoulders':
      return Activity;
    case 'waist':
      return Flame;
    default:
      return Dumbbell;
  }
};

const BodyPart: React.FC<BodyPartProps> = ({ item, setBodyPart, bodyPart }) => {
  const isSelected = bodyPart.toLowerCase() === item.toLowerCase();
  const Icon = getCategoryIcon(item);

  return (
    <button
      type='button'
      className={`group/pill inline-flex items-center gap-2 p-3 rounded-md text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-colors duration-150 cursor-pointer shrink-0 ${
        isSelected
          ? 'bg-[#FF2625] text-white shadow-xs'
          : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => {
        setBodyPart(item);
        const exercisesElem = document.getElementById('exercises');
        if (exercisesElem) {
          exercisesElem.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      <div
        className={`w-6 h-6 rounded-sm flex items-center justify-center transition-colors ${
          isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-[#FF2625]'
        }`}
      >
        <Icon className='w-4 h-4' />
      </div>
      <span className='mt-1'>{item}</span>
    </button>
  );
};

export default BodyPart;
