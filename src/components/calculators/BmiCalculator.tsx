import React, { useState } from 'react';
import { Scale, Share2, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const BmiCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem, onSaveWeight, onNavigateTab }) => {
  const [bmiAge, setBmiAge] = useState<number>(25);
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');
  const [bmiHeightCm, setBmiHeightCm] = useState<number>(178);
  const [bmiHeightFt, setBmiHeightFt] = useState<number>(5);
  const [bmiHeightIn, setBmiHeightIn] = useState<number>(10);
  const [bmiWeightKg, setBmiWeightKg] = useState<number>(75);
  const [bmiWeightLbs, setBmiWeightLbs] = useState<number>(165);
  const [copied, setCopied] = useState(false);

  const calculateBMI = () => {
    let heightM = bmiHeightCm / 100;
    let weightKg = bmiWeightKg;
    if (unitSystem === 'imperial') {
      const totalInches = bmiHeightFt * 12 + bmiHeightIn;
      heightM = totalInches * 0.0254;
      weightKg = bmiWeightLbs * 0.453592;
    }
    if (heightM <= 0)
      return { bmi: 0, category: 'Unknown', prime: 0, minHealthyKg: 0, maxHealthyKg: 0, color: '', deltaKg: 0, pct: 0 };
    const bmiVal = weightKg / (heightM * heightM);
    const primeVal = bmiVal / 25;
    const minHealthy = 18.5 * (heightM * heightM);
    const maxHealthy = 24.9 * (heightM * heightM);

    let cat = 'Normal Weight';
    let color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
    let gaugePct = ((bmiVal - 15) / (40 - 15)) * 100;
    gaugePct = Math.max(0, Math.min(100, gaugePct));

    let deltaKg = 0;
    if (bmiVal < 18.5) {
      cat = 'Underweight';
      color = 'text-sky-500 bg-sky-50 border-sky-200';
      deltaKg = Number((minHealthy - weightKg).toFixed(1));
    } else if (bmiVal >= 25 && bmiVal < 30) {
      cat = 'Overweight';
      color = 'text-amber-500 bg-amber-50 border-amber-200';
      deltaKg = Number((weightKg - maxHealthy).toFixed(1));
    } else if (bmiVal >= 30) {
      cat = 'Obese';
      color = 'text-red-500 bg-red-50 border-red-200';
      deltaKg = Number((weightKg - maxHealthy).toFixed(1));
    }

    return {
      bmi: Number(bmiVal.toFixed(1)),
      category: cat,
      color,
      prime: Number(primeVal.toFixed(2)),
      minHealthyKg: Number((unitSystem === 'metric' ? minHealthy : minHealthy * 2.20462).toFixed(1)),
      maxHealthyKg: Number((unitSystem === 'metric' ? maxHealthy : maxHealthy * 2.20462).toFixed(1)),
      deltaKg: Number((unitSystem === 'metric' ? deltaKg : deltaKg * 2.20462).toFixed(1)),
      pct: gaugePct,
    };
  };

  const bmiResult = calculateBMI();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `BMI Score: ${bmiResult.bmi} (${bmiResult.category}) | Healthy Weight: ${bmiResult.minHealthyKg}-${bmiResult.maxHealthyKg}${unitSystem === 'metric' ? 'kg' : 'lbs'}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Scale className='w-6 h-6 text-[#FF2625]' />
            Body Mass Index (BMI) Dial
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Clinical WHO body mass screening, healthy weight range boundary, and prime ratio score.
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

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
        {/* Controls */}
        <div className='lg:col-span-6 space-y-5 flex flex-col justify-between'>
          <div className='space-y-5'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => setBmiGender('male')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                      bmiGender === 'male'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type='button'
                    onClick={() => setBmiGender('female')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                      bmiGender === 'female'
                        ? 'bg-pink-50 border-pink-300 text-pink-700'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {bmiAge} yrs</label>
                <input
                  type='range'
                  min='10'
                  max='90'
                  value={bmiAge}
                  onChange={(e) => setBmiAge(Number(e.target.value))}
                  className='w-full accent-[#FF2625] cursor-pointer'
                />
              </div>
            </div>

            {/* Height Selector */}
            {unitSystem === 'metric' ? (
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-bold text-gray-700'>
                  <span>Height</span>
                  <span className='font-mono text-[#FF2625]'>{bmiHeightCm} cm</span>
                </div>
                <input
                  type='range'
                  min='120'
                  max='220'
                  value={bmiHeightCm}
                  onChange={(e) => setBmiHeightCm(Number(e.target.value))}
                  className='w-full accent-[#FF2625] cursor-pointer'
                />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Feet ({bmiHeightFt}')</label>
                  <input
                    type='range'
                    min='4'
                    max='7'
                    value={bmiHeightFt}
                    onChange={(e) => setBmiHeightFt(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
                    Inches ({bmiHeightIn}")
                  </label>
                  <input
                    type='range'
                    min='0'
                    max='11'
                    value={bmiHeightIn}
                    onChange={(e) => setBmiHeightIn(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>
              </div>
            )}

            {/* Weight Selector */}
            {unitSystem === 'metric' ? (
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-bold text-gray-700'>
                  <span>Weight</span>
                  <span className='font-mono text-[#FF2625]'>{bmiWeightKg} kg</span>
                </div>
                <input
                  type='range'
                  min='35'
                  max='180'
                  value={bmiWeightKg}
                  onChange={(e) => setBmiWeightKg(Number(e.target.value))}
                  className='w-full accent-[#FF2625] cursor-pointer'
                />
              </div>
            ) : (
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-bold text-gray-700'>
                  <span>Weight</span>
                  <span className='font-mono text-[#FF2625]'>{bmiWeightLbs} lbs</span>
                </div>
                <input
                  type='range'
                  min='80'
                  max='400'
                  value={bmiWeightLbs}
                  onChange={(e) => setBmiWeightLbs(Number(e.target.value))}
                  className='w-full accent-[#FF2625] cursor-pointer'
                />
              </div>
            )}
          </div>

          {/* Quick Stepper Bar */}
          <div className='p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs text-gray-600 mt-auto'>
            <span className='font-semibold'>Fine-tune Weight:</span>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() =>
                  unitSystem === 'metric'
                    ? setBmiWeightKg((w) => Math.max(30, w - 1))
                    : setBmiWeightLbs((w) => Math.max(70, w - 1))
                }
                className='w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer'
              >
                <Minus className='w-3 h-3' />
              </button>
              <button
                type='button'
                onClick={() => (unitSystem === 'metric' ? setBmiWeightKg((w) => w + 1) : setBmiWeightLbs((w) => w + 1))}
                className='w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer'
              >
                <Plus className='w-3 h-3' />
              </button>
              {onSaveWeight && (
                <button
                  type='button'
                  onClick={() =>
                    onSaveWeight(unitSystem === 'metric' ? bmiWeightKg : Math.round(bmiWeightLbs * 0.453592))
                  }
                  className='ml-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-xs'
                >
                  Save to History
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Interactive Gauge Display */}
        <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg flex flex-col justify-between min-h-121.25 h-full'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Live Biometric Readout</span>
            <span className={`px-2.5 py-0.5 rounded-sm text-xs font-bold border ${bmiResult.color}`}>
              {bmiResult.category}
            </span>
          </div>

          {/* SVG Gauge Graphic */}
          <div className='relative flex flex-col items-center justify-center py-1'>
            <svg className='w-64 h-36 overflow-visible' viewBox='0 0 240 135'>
              <defs>
                <linearGradient id='gaugeTrackGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#0ea5e9' />
                  <stop offset='25%' stopColor='#10b981' />
                  <stop offset='60%' stopColor='#f59e0b' />
                  <stop offset='100%' stopColor='#ef4444' />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <path
                d='M 35 115 A 85 85 0 0 1 205 115'
                fill='none'
                stroke='#1f2937'
                strokeWidth='14'
                strokeLinecap='round'
              />

              {/* Gradient Colored Arc */}
              <path
                d='M 35 115 A 85 85 0 0 1 205 115'
                fill='none'
                stroke='url(#gaugeTrackGrad)'
                strokeWidth='14'
                strokeLinecap='round'
                opacity='0.9'
              />

              {/* Tick Markers */}
              <circle cx='43' cy='79' r='2' fill='#ffffff' opacity='0.7' />
              <circle cx='94' cy='34' r='2' fill='#ffffff' opacity='0.7' />
              <circle cx='146' cy='34' r='2' fill='#ffffff' opacity='0.7' />

              {/* Animated Needle */}
              {(() => {
                const pct = Math.max(0, Math.min(100, ((bmiResult.bmi - 15) / 25) * 100));
                const rad = (pct / 100) * Math.PI;
                const x2 = 120 - 66 * Math.cos(rad);
                const y2 = 115 - 66 * Math.sin(rad);
                return (
                  <g>
                    <line x1='120' y1='115' x2={x2} y2={y2} stroke='#ffffff' strokeWidth='3.5' strokeLinecap='round' />
                    <circle cx='120' cy='115' r='6' fill='#FF2625' stroke='#111827' strokeWidth='2.5' />
                  </g>
                );
              })()}
            </svg>

            {/* Centered Readout Value */}
            <div className='text-center mt-2'>
              <span className='text-4xl font-black font-mono tracking-tight text-white'>{bmiResult.bmi}</span>
              <span className='block text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>
                kg / m²
              </span>
            </div>
          </div>

          {/* Healthy Weight Envelope & Delta */}
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>Healthy Weight Range</span>
              <strong className='text-sm font-bold text-emerald-400'>
                {bmiResult.minHealthyKg} – {bmiResult.maxHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </strong>
            </div>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>BMI Prime Ratio</span>
              <strong className='text-sm font-bold text-sky-400'>
                {bmiResult.prime} <span className='text-[10px] text-gray-400 font-normal'>(&lt;1.0 optimal)</span>
              </strong>
            </div>
          </div>

          {/* Target Weight & Delta Goal Card */}
          {bmiResult.category === 'Normal Weight' ? (
            <div className='min-h-20.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col justify-between'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold'>
                    ✓
                  </div>
                  <div>
                    <span className='font-bold text-emerald-300 block'>In Optimal Healthy Weight Zone</span>
                    <span className='text-[11px] text-gray-300'>
                      Your weight is within the healthy boundary ({bmiResult.minHealthyKg} – {bmiResult.maxHealthyKg}{' '}
                      {unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </span>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <span className='text-base font-black font-mono text-emerald-400'>0.0</span>
                  <span className='text-[10px] text-gray-400 block uppercase font-bold'>
                    {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>
              <div className='pt-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-400 border-t border-white/10'>
                <span>Suggested Strategy:</span>
                <button
                  type='button'
                  onClick={() => onNavigateTab?.('calorie')}
                  className='text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors'
                >
                  Plan Maintenance Diet →
                </button>
              </div>
            </div>
          ) : bmiResult.category === 'Underweight' ? (
            <div className='min-h-20.5 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs flex flex-col justify-between'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 text-xs font-bold'>
                    📈
                  </div>
                  <div>
                    <span className='font-bold text-sky-300 block'>Healthy Surplus Goal</span>
                    <span className='text-[11px] text-gray-300'>
                      Gain{' '}
                      <strong className='text-white font-bold'>
                        +{bmiResult.deltaKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                      </strong>{' '}
                      to reach Normal BMI (&ge; {bmiResult.minHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </span>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <span className='text-base font-black font-mono text-sky-400'>+{bmiResult.deltaKg}</span>
                  <span className='text-[10px] text-gray-400 block uppercase font-bold'>
                    {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>
              <div className='pt-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-400 border-t border-white/10'>
                <span>Suggested Strategy:</span>
                <button
                  type='button'
                  onClick={() => onNavigateTab?.('calorie')}
                  className='text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer transition-colors'
                >
                  Plan +300 kcal Surplus →
                </button>
              </div>
            </div>
          ) : (
            <div className='min-h-20.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col justify-between'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold'>
                    📉
                  </div>
                  <div>
                    <span className='font-bold text-amber-300 block'>Target Weight Reduction</span>
                    <span className='text-[11px] text-gray-300'>
                      Lose{' '}
                      <strong className='text-white font-bold'>
                        {bmiResult.deltaKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                      </strong>{' '}
                      to enter Normal BMI (&le; {bmiResult.maxHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </span>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <span className='text-base font-black font-mono text-amber-400'>-{bmiResult.deltaKg}</span>
                  <span className='text-[10px] text-gray-400 block uppercase font-bold'>
                    {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>
              <div className='pt-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-400 border-t border-white/10'>
                <span>Suggested Strategy:</span>
                <button
                  type='button'
                  onClick={() => onNavigateTab?.('calorie')}
                  className='text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors'
                >
                  Plan -500 kcal Deficit →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
