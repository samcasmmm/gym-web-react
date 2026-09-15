import React, { useState } from 'react';
import { Beef, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const ProteinCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [proteinWeightKg, setProteinWeightKg] = useState<number>(76);
  const [proteinGoal, setProteinGoal] = useState<'maintain' | 'hypertrophy' | 'cutting' | 'endurance'>('hypertrophy');
  const [proteinMealsCount, setProteinMealsCount] = useState<number>(4);
  const [copied, setCopied] = useState(false);

  const calculateProtein = () => {
    let multiplier = 2.0;
    if (proteinGoal === 'maintain') multiplier = 1.4;
    if (proteinGoal === 'hypertrophy') multiplier = 2.0;
    if (proteinGoal === 'cutting') multiplier = 2.4;
    if (proteinGoal === 'endurance') multiplier = 1.6;

    const totalGrams = Math.round(proteinWeightKg * multiplier);
    const totalCals = totalGrams * 4;
    const perMealGrams = Math.round(totalGrams / proteinMealsCount);
    const leucineGrams = Number((perMealGrams * 0.085).toFixed(1));

    const chickenBreastG = Math.round((perMealGrams / 31) * 100);
    const wheyScoops = Number((perMealGrams / 25).toFixed(1));
    const wholeEggs = Math.round(perMealGrams / 6);
    const greekYogurtG = Math.round((perMealGrams / 10) * 100);
    const tofuG = Math.round((perMealGrams / 15) * 100);

    return {
      multiplier,
      totalGrams,
      totalCals,
      perMealGrams,
      leucineGrams,
      chickenBreastG,
      wheyScoops,
      wholeEggs,
      greekYogurtG,
      tofuG,
    };
  };

  const proteinResult = calculateProtein();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Daily Protein: ${proteinResult.totalGrams}g/day (${proteinResult.perMealGrams}g x ${proteinMealsCount} meals) | Leucine: ~${proteinResult.leucineGrams}g/meal`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Beef className='w-6 h-6 text-red-600' />
            Protein & Leucine MPS Optimizer
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Calculates optimal daily protein intake, per-meal leucine threshold (2.7g - 3.5g) to trigger Muscle Protein Synthesis (MPS), and food portions.
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
                {unitSystem === 'metric' ? `${proteinWeightKg} kg` : `${Math.round(proteinWeightKg * 2.20462)} lbs`}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={proteinWeightKg}
              onChange={(e) => setProteinWeightKg(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Training Objective</label>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              {[
                { id: 'hypertrophy', label: '💪 Hypertrophy (2.0 g/kg)', desc: 'Max muscle protein synthesis' },
                { id: 'cutting', label: '🔥 Cutting Deficit (2.4 g/kg)', desc: 'Preserves lean mass in deficit' },
                { id: 'endurance', label: '🏃 Endurance (1.6 g/kg)', desc: 'Tissue repair for runners' },
                { id: 'maintain', label: '⚖️ Maintenance (1.4 g/kg)', desc: 'General health balance' },
              ].map((g) => (
                <button
                  key={g.id}
                  type='button'
                  onClick={() => setProteinGoal(g.id as any)}
                  className={`p-2.5 rounded-md text-left border transition-all cursor-pointer ${
                    proteinGoal === g.id
                      ? 'bg-red-50 border-[#FF2625] text-red-950 font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className='block text-xs font-bold'>{g.label}</span>
                  <span className='text-[10px] text-gray-400 font-normal'>{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Meals / Feedings Per Day</span>
              <span className='font-mono text-[#FF2625]'>{proteinMealsCount} meals</span>
            </div>
            <input
              type='range'
              min='2'
              max='6'
              value={proteinMealsCount}
              onChange={(e) => setProteinMealsCount(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>
        </div>

        {/* Protein Results Display */}
        <div className='lg:col-span-7 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Daily Protein Target</span>
            <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30'>
              {proteinResult.multiplier} g / kg
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 text-center'>
            <div className='p-4 bg-white/5 rounded-xl border border-white/10'>
              <span className='text-[10px] text-gray-400 uppercase font-bold block'>Total Daily Protein</span>
              <strong className='text-3xl font-black text-red-400'>{proteinResult.totalGrams}g</strong>
              <span className='text-[10px] text-gray-500 block'>{proteinResult.totalCals} kcal</span>
            </div>
            <div className='p-4 bg-white/5 rounded-xl border border-white/10'>
              <span className='text-[10px] text-gray-400 uppercase font-bold block'>Per-Meal Bolus</span>
              <strong className='text-3xl font-black text-amber-400'>{proteinResult.perMealGrams}g</strong>
              <span className='text-[10px] text-emerald-400 block'>~{proteinResult.leucineGrams}g Leucine (MPS Hit)</span>
            </div>
          </div>

          {/* 1-Meal Equivalent Food Portions */}
          <div className='space-y-2 pt-2 border-t border-white/10'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
              Food Portions to Hit {proteinResult.perMealGrams}g in 1 Meal
            </span>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs'>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-gray-400 block text-[10px] font-bold'>🍗 Chicken Breast</span>
                <strong className='text-white font-mono text-sm'>{proteinResult.chickenBreastG} g</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-gray-400 block text-[10px] font-bold'>🥛 Whey Isolate</span>
                <strong className='text-white font-mono text-sm'>{proteinResult.wheyScoops} scoops</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-gray-400 block text-[10px] font-bold'>🍳 Whole Eggs</span>
                <strong className='text-white font-mono text-sm'>{proteinResult.wholeEggs} eggs</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-gray-400 block text-[10px] font-bold'>🥣 Greek Yogurt (0%)</span>
                <strong className='text-white font-mono text-sm'>{proteinResult.greekYogurtG} g</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-gray-400 block text-[10px] font-bold'>🌱 Firm Tofu</span>
                <strong className='text-white font-mono text-sm'>{proteinResult.tofuG} g</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
