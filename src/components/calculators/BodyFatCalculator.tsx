import React, { useState } from 'react';
import { Percent, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const BodyFatCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
  const [bfHeightCm, setBfHeightCm] = useState<number>(178);
  const [bfWeightKg, setBfWeightKg] = useState<number>(76);
  const [bfNeckCm, setBfNeckCm] = useState<number>(38);
  const [bfWaistCm, setBfWaistCm] = useState<number>(84);
  const [bfHipCm, setBfHipCm] = useState<number>(95);
  const [copied, setCopied] = useState(false);

  const calculateBodyFat = () => {
    let bfPercent = 0;
    if (bfGender === 'male') {
      const waistDiff = Math.max(1, bfWaistCm - bfNeckCm);
      const val = 1.0324 - 0.19077 * Math.log10(waistDiff) + 0.15456 * Math.log10(bfHeightCm);
      bfPercent = val > 0 ? 495 / val - 450 : 15;
    } else {
      const waistHipDiff = Math.max(1, bfWaistCm + bfHipCm - bfNeckCm);
      const val = 1.29579 - 0.35004 * Math.log10(waistHipDiff) + 0.221 * Math.log10(bfHeightCm);
      bfPercent = val > 0 ? 495 / val - 450 : 22;
    }
    const clampedBf = Math.max(3, Math.min(55, Number(bfPercent.toFixed(1))));
    const fatMass = Number(((bfWeightKg * clampedBf) / 100).toFixed(1));
    const leanMass = Number((bfWeightKg - fatMass).toFixed(1));

    let cat = 'Fitness';
    let color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (bfGender === 'male') {
      if (clampedBf < 6) cat = 'Essential Fat';
      else if (clampedBf <= 13) cat = 'Athletic (Six-Pack)';
      else if (clampedBf <= 17) cat = 'Fitness (Defined)';
      else if (clampedBf <= 24) cat = 'Average Health';
      else {
        cat = 'Elevated Fat';
        color = 'text-red-500 bg-red-50 border-red-200';
      }
    } else {
      if (clampedBf < 14) cat = 'Essential Fat';
      else if (clampedBf <= 20) cat = 'Athletic (Tone)';
      else if (clampedBf <= 24) cat = 'Fitness (Defined)';
      else if (clampedBf <= 31) cat = 'Average Health';
      else {
        cat = 'Elevated Fat';
        color = 'text-red-500 bg-red-50 border-red-200';
      }
    }

    return { bodyFat: clampedBf, fatMass, leanMass, category: cat, color };
  };

  const bfResult = calculateBodyFat();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Body Fat: ${bfResult.bodyFat}% (${bfResult.category}) | Lean Mass: ${bfResult.leanMass}kg, Fat Mass: ${bfResult.fatMass}kg`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Percent className='w-6 h-6 text-[#FF2625]' />
            US Navy Body Fat % & Body Composition
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Clinical circumference method evaluating lean muscle mass vs subcutaneous & visceral adipose fat.
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
        <div className='lg:col-span-6 space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setBfGender('male')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    bfGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Male
                </button>
                <button
                  type='button'
                  onClick={() => setBfGender('female')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    bfGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Body Weight</span>
                <span className='font-mono text-[#FF2625]'>
                  {unitSystem === 'metric' ? `${bfWeightKg} kg` : `${Math.round(bfWeightKg * 2.20462)} lbs`}
                </span>
              </div>
              <input
                type='range'
                min='40'
                max='160'
                value={bfWeightKg}
                onChange={(e) => setBfWeightKg(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Height</span>
                <span className='font-mono text-[#FF2625]'>{bfHeightCm} cm</span>
              </div>
              <input
                type='range'
                min='130'
                max='220'
                value={bfHeightCm}
                onChange={(e) => setBfHeightCm(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Neck Circumference</span>
                <span className='font-mono text-[#FF2625]'>{bfNeckCm} cm</span>
              </div>
              <input
                type='range'
                min='25'
                max='60'
                value={bfNeckCm}
                onChange={(e) => setBfNeckCm(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Waist (at Navel)</span>
                <span className='font-mono text-[#FF2625]'>{bfWaistCm} cm</span>
              </div>
              <input
                type='range'
                min='50'
                max='150'
                value={bfWaistCm}
                onChange={(e) => setBfWaistCm(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
            {bfGender === 'female' && (
              <div className='space-y-1'>
                <div className='flex justify-between text-xs font-bold text-gray-700'>
                  <span>Hips (Widest Point)</span>
                  <span className='font-mono text-[#FF2625]'>{bfHipCm} cm</span>
                </div>
                <input
                  type='range'
                  min='60'
                  max='160'
                  value={bfHipCm}
                  onChange={(e) => setBfHipCm(Number(e.target.value))}
                  className='w-full accent-[#FF2625] cursor-pointer'
                />
              </div>
            )}
          </div>
        </div>

        {/* Visual Body Composition Graphic */}
        <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-6'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Body Composition Split</span>
            <span className={`px-2.5 py-0.5 rounded-sm text-xs font-bold border ${bfResult.color}`}>
              {bfResult.category}
            </span>
          </div>

          <div className='text-center py-2'>
            <span className='text-5xl font-black font-mono tracking-tight text-white'>{bfResult.bodyFat}%</span>
            <span className='block text-xs text-gray-400 font-bold uppercase tracking-wider mt-1'>
              Body Fat Percentage
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between text-xs font-bold'>
              <span className='text-emerald-400'>💪 Lean Body Mass: {bfResult.leanMass} kg</span>
              <span className='text-amber-400'>🧈 Total Fat Mass: {bfResult.fatMass} kg</span>
            </div>
            <div className='h-3 w-full bg-gray-800 rounded-sm overflow-hidden flex'>
              <div style={{ width: `${100 - bfResult.bodyFat}%` }} className='bg-emerald-500 h-full' />
              <div style={{ width: `${bfResult.bodyFat}%` }} className='bg-amber-500 h-full' />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>Lean Muscle Mass</span>
              <strong className='text-lg font-black text-emerald-400'>{bfResult.leanMass} kg</strong>
              <span className='text-[10px] text-gray-500 block'>{Math.round(bfResult.leanMass * 2.20462)} lbs</span>
            </div>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>Stored Fat Mass</span>
              <strong className='text-lg font-black text-amber-400'>{bfResult.fatMass} kg</strong>
              <span className='text-[10px] text-gray-500 block'>{Math.round(bfResult.fatMass * 2.20462)} lbs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
