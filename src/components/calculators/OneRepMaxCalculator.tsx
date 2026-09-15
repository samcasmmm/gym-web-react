import React, { useState } from 'react';
import { Dumbbell, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const OneRepMaxCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [liftWeight, setLiftWeight] = useState<number>(100);
  const [liftReps, setLiftReps] = useState<number>(5);
  const [selectedLift, setSelectedLift] = useState<'bench' | 'squat' | 'deadlift' | 'ohp'>('bench');
  const [copied, setCopied] = useState(false);

  const calculateOneRepMax = () => {
    const epley = liftWeight * (1 + liftReps / 30);
    const brzycki = liftReps < 37 ? liftWeight * (36 / (37 - liftReps)) : epley;
    const lombardi = liftWeight * Math.pow(liftReps, 0.1);

    const avg1RM = Math.round((epley + brzycki + lombardi) / 3);

    const percentages = [
      { pct: 100, reps: '1 rep', rpe: '10.0', weight: avg1RM, goal: 'Max Absolute Power' },
      { pct: 95, reps: '2 reps', rpe: '9.5', weight: Math.round(avg1RM * 0.95), goal: 'Peaking & Max Load' },
      { pct: 90, reps: '3-4 reps', rpe: '9.0', weight: Math.round(avg1RM * 0.9), goal: 'Pure Neuromuscular Strength' },
      { pct: 85, reps: '5-6 reps', rpe: '8.5', weight: Math.round(avg1RM * 0.85), goal: 'Heavy Strength-Hypertrophy' },
      { pct: 80, reps: '7-8 reps', rpe: '8.0', weight: Math.round(avg1RM * 0.8), goal: 'Hypertrophy Golden Zone' },
      { pct: 75, reps: '9-10 reps', rpe: '7.5', weight: Math.round(avg1RM * 0.75), goal: 'Hypertrophy & Work Capacity' },
      { pct: 70, reps: '11-12 reps', rpe: '7.0', weight: Math.round(avg1RM * 0.7), goal: 'Volume / Metcon' },
      { pct: 65, reps: '15+ reps', rpe: '6.5', weight: Math.round(avg1RM * 0.65), goal: 'Muscular Endurance / Pump' },
    ];

    return {
      avg1RM,
      epley: Math.round(epley),
      brzycki: Math.round(brzycki),
      lombardi: Math.round(lombardi),
      percentages,
    };
  };

  const oneRmResult = calculateOneRepMax();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Estimated 1RM (${selectedLift}): ${oneRmResult.avg1RM}${unitSystem === 'metric' ? 'kg' : 'lbs'} based on ${liftWeight} x ${liftReps} reps`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Dumbbell className='w-6 h-6 text-[#FF2625]' />
            One-Rep Max (1RM) & Strength Load Matrix
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Clinical Brzycki, Epley & Lombardi formulas predicting maximal lifting output and percentage loads.
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
        <div className='lg:col-span-5 space-y-5'>
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Barbell Movement</label>
            <div className='grid grid-cols-2 gap-2'>
              {[
                { id: 'bench', name: 'Bench Press' },
                { id: 'squat', name: 'Back Squat' },
                { id: 'deadlift', name: 'Deadlift' },
                { id: 'ohp', name: 'Overhead Press' },
              ].map((lift) => (
                <button
                  key={lift.id}
                  type='button'
                  onClick={() => setSelectedLift(lift.id as any)}
                  className={`py-2 px-3 rounded-md text-xs font-bold border transition-colors cursor-pointer text-center ${
                    selectedLift === lift.id
                      ? 'bg-[#FF2625] text-white border-[#FF2625]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {lift.name}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Lifted Weight</span>
              <span className='font-mono text-[#FF2625]'>
                {liftWeight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            <input
              type='range'
              min='20'
              max='350'
              value={liftWeight}
              onChange={(e) => setLiftWeight(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Repetitions Completed</span>
              <span className='font-mono text-[#FF2625]'>{liftReps} reps</span>
            </div>
            <input
              type='range'
              min='1'
              max='12'
              value={liftReps}
              onChange={(e) => setLiftReps(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='p-4 rounded-xl bg-linear-to-br from-gray-950 to-gray-900 text-white border border-gray-800 text-center space-y-1'>
            <span className='text-[10px] uppercase font-bold tracking-widest text-red-400'>
              Predicted Absolute 1RM
            </span>
            <div className='text-4xl font-black font-mono text-white'>
              {oneRmResult.avg1RM}{' '}
              <span className='text-base font-bold text-gray-400'>{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
            </div>
            <div className='flex justify-center gap-3 text-[11px] text-gray-400 pt-1'>
              <span>Epley: {oneRmResult.epley}</span>
              <span>•</span>
              <span>Brzycki: {oneRmResult.brzycki}</span>
              <span>•</span>
              <span>Lombardi: {oneRmResult.lombardi}</span>
            </div>
          </div>
        </div>

        {/* Percentage Loading Matrix Table */}
        <div className='lg:col-span-7 bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-700'>Training Load Matrix</span>
            <span className='text-[11px] text-gray-500 font-medium'>Recommended Reps & Target Zones</span>
          </div>

          <div className='divide-y divide-gray-200 text-xs'>
            {oneRmResult.percentages.map((row) => (
              <div key={row.pct} className='py-2 flex items-center justify-between gap-2 hover:bg-gray-100/60 px-1 rounded transition-colors'>
                <div className='flex items-center gap-2'>
                  <span className='w-12 font-black text-gray-900 font-mono'>{row.pct}%</span>
                  <div>
                    <span className='font-bold text-gray-800 block'>{row.reps}</span>
                    <span className='text-[10px] text-gray-400'>{row.goal}</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='font-black font-mono text-sm text-[#FF2625]'>
                    {row.weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </span>
                  <span className='block text-[10px] text-gray-400'>RPE {row.rpe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
