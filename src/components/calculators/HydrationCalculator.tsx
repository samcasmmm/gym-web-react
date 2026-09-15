import React, { useState } from 'react';
import { Droplets, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const HydrationCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [hydrationWeightKg, setHydrationWeightKg] = useState<number>(75);
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(60);
  const [climate, setClimate] = useState<'temperate' | 'hot' | 'humid'>('temperate');
  const [copied, setCopied] = useState(false);

  const calculateHydration = () => {
    let baseMl = hydrationWeightKg * 35;
    let sweatMl = workoutMinutes * 12;
    if (climate === 'hot') baseMl *= 1.15;
    if (climate === 'humid') baseMl *= 1.25;

    const totalMl = Math.round(baseMl + sweatMl);
    const totalOz = Math.round(totalMl * 0.033814);
    const glasses = Math.round(totalMl / 250);

    const schedule = [
      { time: 'Upon Waking', amount: '500 ml', desc: 'Kickstarts metabolism and clears sleep dehydration' },
      { time: 'Pre-Workout (60m prior)', amount: '400 ml', desc: 'Pre-hydrates muscular cells for pump and endurance' },
      { time: 'During Workout', amount: `${Math.round(sweatMl * 0.6)} ml`, desc: 'Sip every 15 mins to maintain electrolyte balance' },
      { time: 'Post-Workout', amount: '400 ml', desc: 'Replenishes lost intra-cellular glycogen volume' },
      { time: 'Throughout Evening', amount: `${Math.max(300, totalMl - 1300 - Math.round(sweatMl * 0.6))} ml`, desc: 'Steady hydration between meals' },
    ];

    return { totalMl, totalOz, glasses, schedule };
  };

  const hydrationResult = calculateHydration();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Daily Water Target: ${hydrationResult.totalMl}ml (${hydrationResult.glasses} glasses) | Sweating: +${workoutMinutes}m workout`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Droplets className='w-6 h-6 text-sky-500' />
            Daily Hydration & Fluid Optimization
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Calculates cellular water requirements based on body mass, sweat rate, workout intensity, and climate.
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
          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Body Weight</span>
              <span className='font-mono text-[#FF2625]'>
                {unitSystem === 'metric' ? `${hydrationWeightKg} kg` : `${Math.round(hydrationWeightKg * 2.20462)} lbs`}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={hydrationWeightKg}
              onChange={(e) => setHydrationWeightKg(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Daily Workout Duration</span>
              <span className='font-mono text-[#FF2625]'>{workoutMinutes} mins</span>
            </div>
            <input
              type='range'
              min='0'
              max='180'
              step='15'
              value={workoutMinutes}
              onChange={(e) => setWorkoutMinutes(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Climate / Ambient Heat</label>
            <div className='grid grid-cols-3 gap-2'>
              {[
                { id: 'temperate', label: '🌤️ Moderate' },
                { id: 'hot', label: '☀️ Hot / Dry' },
                { id: 'humid', label: '🌴 Humid / Trop' },
              ].map((c) => (
                <button
                  key={c.id}
                  type='button'
                  onClick={() => setClimate(c.id as any)}
                  className={`py-2 px-2 rounded-md text-xs font-bold border transition-colors cursor-pointer text-center ${
                    climate === c.id ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Water Result Display */}
        <div className='lg:col-span-7 bg-linear-to-b from-sky-950 via-gray-900 to-gray-950 rounded-xl p-6 text-white border border-sky-900/50 shadow-lg space-y-5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-sky-400'>Recommended Total Intake</span>
            <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30'>
              ~{hydrationResult.glasses} Standard Glasses (250ml)
            </span>
          </div>

          <div className='text-center py-2'>
            <span className='text-5xl font-black font-mono tracking-tight text-white'>{hydrationResult.totalMl}</span>
            <span className='block text-xs text-sky-300 font-bold uppercase tracking-wider mt-1'>
              Milliliters / Day ({hydrationResult.totalOz} oz)
            </span>
          </div>

          <div className='space-y-2 pt-2 border-t border-white/10'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
              Optimal Hydration Timing Protocol
            </span>
            <div className='space-y-2 text-xs'>
              {hydrationResult.schedule.map((item, idx) => (
                <div key={idx} className='p-2.5 bg-white/5 rounded-md border border-white/10 flex items-center justify-between gap-3'>
                  <div>
                    <strong className='text-white block font-bold'>{item.time}</strong>
                    <span className='text-[11px] text-gray-400'>{item.desc}</span>
                  </div>
                  <span className='font-mono font-bold text-sky-400 shrink-0'>{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
