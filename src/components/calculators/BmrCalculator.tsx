import React, { useState } from 'react';
import { Zap, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const BmrCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [bmrAge, setBmrAge] = useState<number>(25);
  const [bmrGender, setBmrGender] = useState<'male' | 'female'>('male');
  const [bmrHeightCm, setBmrHeightCm] = useState<number>(178);
  const [bmrWeightKg, setBmrWeightKg] = useState<number>(75);
  const [copied, setCopied] = useState(false);

  const calculateBMRs = () => {
    let mifflin = 10 * bmrWeightKg + 6.25 * bmrHeightCm - 5 * bmrAge;
    mifflin += bmrGender === 'male' ? 5 : -161;

    let harris =
      bmrGender === 'male'
        ? 13.397 * bmrWeightKg + 4.799 * bmrHeightCm - 5.677 * bmrAge + 88.362
        : 9.247 * bmrWeightKg + 3.098 * bmrHeightCm - 4.33 * bmrAge + 447.593;

    const lbm = bmrWeightKg * 0.85;
    const katch = 370 + 21.6 * lbm;

    const hourlySleeping = Math.round((mifflin / 24) * 0.9);
    const hourlyDesk = Math.round((mifflin / 24) * 1.2);
    const hourlyWalking = Math.round((mifflin / 24) * 2.5);
    const hourlyGym = Math.round((mifflin / 24) * 5.2);

    return {
      mifflin: Math.round(mifflin),
      harris: Math.round(harris),
      katch: Math.round(katch),
      hourlySleeping,
      hourlyDesk,
      hourlyWalking,
      hourlyGym,
    };
  };

  const bmrResult = calculateBMRs();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `BMR (Mifflin): ${bmrResult.mifflin} kcal/day | Harris: ${bmrResult.harris} kcal | Katch: ${bmrResult.katch} kcal`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Zap className='w-6 h-6 text-amber-500' />
            Basal Metabolic Rate (BMR) Engine
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Compares Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle basal caloric requirements at full rest.
          </p>
        </div>
        <button
          type='button'
          onClick={handleCopySummary}
          className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
        >
          <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        <div className='lg:col-span-5 space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setBmrGender('male')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    bmrGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Male
                </button>
                <button
                  type='button'
                  onClick={() => setBmrGender('female')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    bmrGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {bmrAge} yrs</label>
              <input
                type='range'
                min='15'
                max='80'
                value={bmrAge}
                onChange={(e) => setBmrAge(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Height</span>
              <span className='font-mono text-[#FF2625]'>{bmrHeightCm} cm</span>
            </div>
            <input
              type='range'
              min='130'
              max='220'
              value={bmrHeightCm}
              onChange={(e) => setBmrHeightCm(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Weight</span>
              <span className='font-mono text-[#FF2625]'>
                {unitSystem === 'metric' ? `${bmrWeightKg} kg` : `${Math.round(bmrWeightKg * 2.20462)} lbs`}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={bmrWeightKg}
              onChange={(e) => setBmrWeightKg(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>
        </div>

        {/* BMR Comparison Visuals */}
        <div className='lg:col-span-7 space-y-4'>
          <div className='grid grid-cols-3 gap-3 text-center'>
            <div className='p-4 bg-red-50/80 rounded-xl border border-red-200'>
              <span className='text-[10px] text-red-600 uppercase font-bold block'>Mifflin-St Jeor</span>
              <strong className='text-2xl font-black text-gray-900'>{bmrResult.mifflin}</strong>
              <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
            </div>
            <div className='p-4 bg-blue-50/80 rounded-xl border border-blue-200'>
              <span className='text-[10px] text-blue-600 uppercase font-bold block'>Harris-Benedict</span>
              <strong className='text-2xl font-black text-gray-900'>{bmrResult.harris}</strong>
              <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
            </div>
            <div className='p-4 bg-emerald-50/80 rounded-xl border border-emerald-200'>
              <span className='text-[10px] text-emerald-600 uppercase font-bold block'>Katch-McArdle</span>
              <strong className='text-2xl font-black text-gray-900'>{bmrResult.katch}</strong>
              <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
            </div>
          </div>

          <div className='p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs'>
            <span className='font-bold uppercase tracking-wider text-gray-500 text-[11px] block'>
              Hourly Basal Caloric Burn Rate
            </span>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
              <div className='p-2 bg-white rounded border border-gray-200'>
                <span className='text-gray-400 block text-[10px]'>Sleeping (0.9x)</span>
                <strong className='font-mono text-gray-900'>{bmrResult.hourlySleeping} kcal/hr</strong>
              </div>
              <div className='p-2 bg-white rounded border border-gray-200'>
                <span className='text-gray-400 block text-[10px]'>Desk Work (1.2x)</span>
                <strong className='font-mono text-gray-900'>{bmrResult.hourlyDesk} kcal/hr</strong>
              </div>
              <div className='p-2 bg-white rounded border border-gray-200'>
                <span className='text-gray-400 block text-[10px]'>Walking (2.5x)</span>
                <strong className='font-mono text-gray-900'>{bmrResult.hourlyWalking} kcal/hr</strong>
              </div>
              <div className='p-2 bg-white rounded border border-gray-200'>
                <span className='text-gray-400 block text-[10px]'>Gym Lifting (5.2x)</span>
                <strong className='font-mono text-red-600'>{bmrResult.hourlyGym} kcal/hr</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
