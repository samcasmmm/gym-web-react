import React, { useState } from 'react';
import { Activity, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const IdealWeightCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [iwGender, setIwGender] = useState<'male' | 'female'>('male');
  const [iwHeightCm, setIwHeightCm] = useState<number>(178);
  const [copied, setCopied] = useState(false);

  const calculateIdealWeight = () => {
    const inchesOver5Ft = Math.max(0, iwHeightCm / 2.54 - 60);
    let robinson = 0;
    let miller = 0;
    let devine = 0;
    let hamwi = 0;

    if (iwGender === 'male') {
      robinson = 52 + 1.9 * inchesOver5Ft;
      miller = 56.2 + 1.41 * inchesOver5Ft;
      devine = 50 + 2.3 * inchesOver5Ft;
      hamwi = 48 + 2.7 * inchesOver5Ft;
    } else {
      robinson = 49 + 1.7 * inchesOver5Ft;
      miller = 53.1 + 1.36 * inchesOver5Ft;
      devine = 45.5 + 2.3 * inchesOver5Ft;
      hamwi = 45.5 + 2.2 * inchesOver5Ft;
    }

    const heightM = iwHeightCm / 100;
    const healthyBmiMin = 18.5 * heightM * heightM;
    const healthyBmiMax = 24.9 * heightM * heightM;
    const avgIdeal = (robinson + miller + devine + hamwi) / 4;

    return {
      robinson: Number(robinson.toFixed(1)),
      miller: Number(miller.toFixed(1)),
      devine: Number(devine.toFixed(1)),
      hamwi: Number(hamwi.toFixed(1)),
      bmiMin: Number(healthyBmiMin.toFixed(1)),
      bmiMax: Number(healthyBmiMax.toFixed(1)),
      avgIdeal: Number(avgIdeal.toFixed(1)),
    };
  };

  const iwResult = calculateIdealWeight();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Ideal Weight Average: ${iwResult.avgIdeal}kg | Robinson: ${iwResult.robinson}kg, Devine: ${iwResult.devine}kg, Miller: ${iwResult.miller}kg`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Activity className='w-6 h-6 text-emerald-600' />
            Ideal Body Weight (IBW) Multi-Formula Array
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Comprehensive analysis comparing Robinson, Miller, Devine, Hamwi, and World Health Organization ranges.
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
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setIwGender('male')}
                className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                  iwGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                }`}
              >
                Male
              </button>
              <button
                type='button'
                onClick={() => setIwGender('female')}
                className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                  iwGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Height</span>
              <span className='font-mono text-[#FF2625]'>{iwHeightCm} cm</span>
            </div>
            <input
              type='range'
              min='140'
              max='215'
              value={iwHeightCm}
              onChange={(e) => setIwHeightCm(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1'>
            <span className='text-[10px] uppercase font-bold text-emerald-800 tracking-wider'>
              Consensus Clinical Average
            </span>
            <div className='text-3xl font-black font-mono text-emerald-950'>
              {unitSystem === 'metric' ? iwResult.avgIdeal : Math.round(iwResult.avgIdeal * 2.20462)}{' '}
              <span className='text-sm font-bold text-emerald-700'>{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
            </div>
            <span className='text-[11px] text-emerald-700 block'>
              ({unitSystem === 'metric' ? `${Math.round(iwResult.avgIdeal * 2.20462)} lbs` : `${iwResult.avgIdeal} kg`})
            </span>
          </div>
        </div>

        {/* Comparative Table & Range Bars */}
        <div className='lg:col-span-7 space-y-3'>
          <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
            Clinical Formula Comparison
          </span>
          <div className='divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-xs'>
            {[
              { name: 'Robinson Formula (1983)', val: iwResult.robinson, desc: 'Widely used clinical standard' },
              { name: 'Miller Formula (1983)', val: iwResult.miller, desc: 'Modified for larger frame builds' },
              { name: 'Devine Formula (1974)', val: iwResult.devine, desc: 'Gold standard for medication dosing' },
              { name: 'Hamwi Formula (1964)', val: iwResult.hamwi, desc: 'Classic metabolic baseline' },
              {
                name: 'WHO Healthy BMI Range (18.5 - 24.9)',
                val: `${iwResult.bmiMin} - ${iwResult.bmiMax}`,
                desc: 'World Health Organization envelope',
              },
            ].map((f, i) => (
              <div key={i} className='p-3 flex items-center justify-between hover:bg-gray-50 transition-colors'>
                <div>
                  <strong className='text-gray-900 block font-bold'>{f.name}</strong>
                  <span className='text-[11px] text-gray-400'>{f.desc}</span>
                </div>
                <span className='font-mono font-bold text-sm text-emerald-700 shrink-0'>
                  {typeof f.val === 'number'
                    ? unitSystem === 'metric'
                      ? `${f.val} kg`
                      : `${Math.round(f.val * 2.20462)} lbs`
                    : `${f.val} kg`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
