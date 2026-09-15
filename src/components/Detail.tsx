import React from 'react';
import BodyPartImg from '../assets/icons/body-part.png';
import TargetImg from '../assets/icons/target.png';
import EquipmentImg from '../assets/icons/equipment.png';
import { Exercise } from '../api/exerciseApi';

interface DetailProps {
  exerciseDetail: Exercise;
}

const Detail: React.FC<DetailProps> = ({ exerciseDetail }) => {
  const { bodyPart, gifUrl, name, target, equipment, instructions, secondaryMuscles } = exerciseDetail;

  const extraDetail = [
    {
      icon: BodyPartImg,
      name: bodyPart,
      label: 'Body Part',
    },
    {
      icon: TargetImg,
      name: target,
      label: 'Target Muscle',
    },
    {
      icon: EquipmentImg,
      name: equipment,
      label: 'Equipment',
    },
  ];

  return (
    <div className="flex flex-col gap-10 my-6">
      <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 p-5 sm:p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
        {/* Exercise Animated GIF */}
        <div className="w-full lg:w-1/2 flex justify-center items-center bg-gray-50 rounded-2xl p-4 overflow-hidden">
          <img
            src={gifUrl}
            alt={name}
            loading="lazy"
            className="w-full max-w-[480px] h-auto object-contain mix-blend-multiply rounded-xl shadow-inner"
          />
        </div>

        {/* Details & Description */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold capitalize text-gray-900 leading-tight">
            {name}
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Exercises keep you strong and energized. <span className="font-semibold text-gray-900 capitalize">{name}</span> is
            one of the best exercises to target your <span className="font-semibold text-[#FF2625] capitalize">{target}</span>.
          </p>

          {/* Badges / Metrics */}
          <div className="flex flex-col gap-4 mt-2">
            {extraDetail.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-5 p-3 rounded-2xl hover:bg-[#FFF3F4] transition-colors"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center rounded-full bg-[#FFF2DB] shadow-sm">
                  <img
                    src={item.icon}
                    alt={item.name || ''}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    {item.label}
                  </p>
                  <p className="text-lg sm:text-xl font-bold capitalize text-gray-800">
                    {item.name || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {secondaryMuscles && secondaryMuscles.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Secondary Muscles: </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {secondaryMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full capitalize"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Step-by-Step Instructions */}
      {instructions && instructions.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Step-by-Step Instructions
          </h2>
          <div className="flex flex-col gap-4">
            {instructions.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FF2625] text-white font-bold text-sm shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
                  {step.replace(/^Step:\s*\d+\s*/i, '')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Detail;
