import React from 'react';
import GymIcon from '../assets/icons/gym.png';
import {
  Flame,
  HeartPulse,
  Dumbbell,
  Shield,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface BodyPartProps {
  item: string;
  setBodyPart: (bodyPart: string) => void;
  bodyPart: string;
}

const getCategoryDetails = (name: string) => {
  switch (name.toLowerCase()) {
    case 'all':
      return { icon: Flame, subtitle: 'Full Body & Compound', color: 'from-red-500 to-rose-600' };
    case 'chest':
      return { icon: Shield, subtitle: 'Pectorals & Push', color: 'from-amber-500 to-red-600' };
    case 'back':
      return { icon: Layers, subtitle: 'Lats, Rhomboids & Spine', color: 'from-blue-500 to-indigo-600' };
    case 'cardio':
      return { icon: HeartPulse, subtitle: 'Stamina & HIIT', color: 'from-rose-500 to-pink-600' };
    case 'upper arms':
    case 'lower arms':
      return { icon: Dumbbell, subtitle: 'Biceps, Triceps & Forearms', color: 'from-orange-500 to-amber-600' };
    case 'upper legs':
    case 'lower legs':
      return { icon: Zap, subtitle: 'Quads, Glutes & Calves', color: 'from-emerald-500 to-teal-600' };
    case 'shoulders':
      return { icon: Activity, subtitle: 'Deltoids & Traps', color: 'from-purple-500 to-indigo-600' };
    case 'waist':
      return { icon: Flame, subtitle: 'Core & Abdominals', color: 'from-yellow-500 to-orange-600' };
    default:
      return { icon: Dumbbell, subtitle: 'Target Muscle Group', color: 'from-red-500 to-rose-600' };
  }
};

const BodyPart: React.FC<BodyPartProps> = ({ item, setBodyPart, bodyPart }) => {
  const isSelected = bodyPart.toLowerCase() === item.toLowerCase();
  const { icon: CategoryIcon, subtitle } = getCategoryDetails(item);

  return (
    <button
      type="button"
      className={`group relative flex flex-col justify-between w-[220px] sm:w-[240px] h-[220px] rounded-3xl p-6 cursor-pointer text-left transition-all duration-300 shrink-0 ${
        isSelected
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-[#350d0d] text-white shadow-xl shadow-red-500/20 ring-2 ring-[#FF2625] scale-102'
          : 'bg-white hover:bg-gray-50/80 text-gray-900 border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1'
      }`}
      onClick={() => {
        setBodyPart(item);
        const exercisesElem = document.getElementById('exercises');
        if (exercisesElem) {
          exercisesElem.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {/* Top row: Icon and active indicator */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? 'bg-[#FF2625] text-white shadow-md shadow-red-500/40 scale-105'
              : 'bg-red-50 text-[#FF2625] group-hover:bg-[#FF2625] group-hover:text-white group-hover:scale-105'
          }`}
        >
          {item === 'all' ? (
            <img src={GymIcon} alt="all" className="w-7 h-7 object-contain filter brightness-0 invert" />
          ) : (
            <CategoryIcon className="w-7 h-7" />
          )}
        </div>

        {isSelected && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF2625] shadow-xs shadow-red-400 animate-pulse" />
        )}
      </div>

      {/* Bottom row: Category Name and Subtitle */}
      <div>
        <span
          className={`text-xs uppercase font-extrabold tracking-wider line-clamp-1 ${
            isSelected ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-500'
          }`}
        >
          {subtitle}
        </span>
        <h3
          className={`text-xl sm:text-2xl font-black capitalize mt-1 tracking-tight ${
            isSelected ? 'text-white' : 'text-gray-900'
          }`}
        >
          {item}
        </h3>
      </div>
    </button>
  );
};

export default BodyPart;
