import React from 'react';
import GymIcon from '../assets/icons/gym.png';

interface BodyPartProps {
  item: string;
  setBodyPart: (bodyPart: string) => void;
  bodyPart: string;
}

const BodyPart: React.FC<BodyPartProps> = ({ item, setBodyPart, bodyPart }) => {
  const isSelected = bodyPart === item;

  return (
    <button
      type="button"
      className={`flex flex-col items-center justify-center bg-white rounded-bl-3xl w-[250px] sm:w-[270px] h-[260px] sm:h-[280px] cursor-pointer gap-10 m-2.5 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 shrink-0 ${
        isSelected ? 'border-t-4 border-[#FF2625] shadow-lg ring-2 ring-[#ff2625]/20' : 'border border-gray-100'
      }`}
      onClick={() => {
        setBodyPart(item);
        const exercisesElem = document.getElementById('exercises');
        if (exercisesElem) {
          exercisesElem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 1800, left: 100, behavior: 'smooth' });
        }
      }}
    >
      <img
        src={GymIcon}
        alt="dumbbell"
        className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
      />
      <span className="text-2xl font-bold text-[#3A1212] capitalize tracking-wide">
        {item}
      </span>
    </button>
  );
};

export default BodyPart;
