import React, { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const PregnancyCalculator: React.FC<BaseCalculatorProps> = () => {
  const [lmpDate, setLmpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [copied, setCopied] = useState(false);

  const calculatePregnancy = () => {
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const edd = new Date(lmp.getTime() + (280 + (cycleLength - 28)) * 24 * 60 * 60 * 1000);

    let trimester = '1st Trimester (Organogenesis)';
    let trimesterShort = '1st Trimester';
    if (weeks >= 28) {
      trimester = '3rd Trimester (Growth & Preparation)';
      trimesterShort = '3rd Trimester';
    } else if (weeks >= 13) {
      trimester = '2nd Trimester (Energy & Movement)';
      trimesterShort = '2nd Trimester';
    }

    const progressPct = Math.min(100, Math.round((diffDays / 280) * 100));

    let fruitSize = 'Poppy seed (0.1 cm, <1g)';
    let emoji = '🌱';
    if (weeks >= 38) {
      fruitSize = 'Watermelon (~50 cm, 3.2 kg)';
      emoji = '🍉';
    } else if (weeks >= 32) {
      fruitSize = 'Pineapple (~42 cm, 1.8 kg)';
      emoji = '🍍';
    } else if (weeks >= 26) {
      fruitSize = 'Eggplant (~35 cm, 900 g)';
      emoji = '🍆';
    } else if (weeks >= 20) {
      fruitSize = 'Banana (~25 cm, 300 g)';
      emoji = '🍌';
    } else if (weeks >= 16) {
      fruitSize = 'Avocado (~12 cm, 100 g)';
      emoji = '🥑';
    } else if (weeks >= 12) {
      fruitSize = 'Plum (~5 cm, 14 g)';
      emoji = '🍑';
    } else if (weeks >= 8) {
      fruitSize = 'Raspberry (~1.6 cm, 1 g)';
      emoji = '🫐';
    }

    return {
      weeks,
      days,
      trimester,
      trimesterShort,
      eddDate: edd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      daysRemaining: Math.max(0, 280 - diffDays),
      progressPct,
      fruitSize,
      emoji,
    };
  };

  const pregResult = calculatePregnancy();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Pregnancy Stage: ${pregResult.weeks}w ${pregResult.days}d (${pregResult.trimesterShort}) | Due Date: ${pregResult.eddDate} | Size: ${pregResult.fruitSize}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Heart className='w-6 h-6 text-pink-500' />
            Pregnancy Gestational Timeline & Developmental Milestones
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Clinical Naegele rule calculating fetal growth, fruit/object comparator size, and trimester checkpoints.
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
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
              First Day of Last Menstrual Period (LMP)
            </label>
            <input
              type='date'
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
            />
          </div>
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
              Average Cycle Length ({cycleLength} days)
            </label>
            <input
              type='number'
              min='21'
              max='40'
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
            />
          </div>

          <div className='p-3.5 bg-pink-50 rounded-lg border border-pink-200 text-xs text-pink-950 space-y-1'>
            <span className='font-bold uppercase tracking-wider text-[10px] text-pink-700 block'>
              🛡️ Safe Prenatal Fitness Guidelines
            </span>
            <p className='text-pink-900 leading-relaxed text-[11px]'>
              Maintain low-impact aerobic activity (walking, stationary cycling, swimming, pelvic floor strength). Avoid
              valsalva breath-holding and contact sports.
            </p>
          </div>
        </div>

        {/* Visual Gestational Age Display */}
        <div className='lg:col-span-7 bg-pink-50/70 rounded-xl p-6 border border-pink-200/80 space-y-4 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase text-pink-700'>Current Gestational Age</span>
            <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-pink-200 text-pink-900'>
              {pregResult.trimesterShort}
            </span>
          </div>

          <p className='text-4xl font-black text-gray-950 font-mono'>
            {pregResult.weeks} Weeks, {pregResult.days} Days
          </p>

          <div className='space-y-1.5 pt-2'>
            <div className='flex justify-between text-xs font-bold text-gray-600'>
              <span>Expected Due Date: {pregResult.eddDate}</span>
              <span className='text-pink-700'>{pregResult.daysRemaining} days remaining</span>
            </div>
            <div className='h-3 w-full bg-pink-200 rounded-sm overflow-hidden'>
              <div className='h-full bg-pink-500 rounded-sm transition-all duration-500' style={{ width: `${pregResult.progressPct}%` }} />
            </div>
          </div>

          <div className='p-4 bg-white rounded-lg border border-pink-200 text-xs text-gray-800 flex items-center gap-3 shadow-xs'>
            <span className='text-3xl'>{pregResult.emoji}</span>
            <div>
              <span className='text-[10px] uppercase font-bold text-gray-400 block'>Baby Size Benchmark</span>
              <strong className='text-sm text-pink-900 font-bold'>{pregResult.fruitSize}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
