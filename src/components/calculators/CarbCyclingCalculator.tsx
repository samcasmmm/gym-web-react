import React, { useState } from 'react';
import { Layers, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const CarbCyclingCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [carbWeightKg, setCarbWeightKg] = useState<number>(76);
  const [carbTdee, setCarbTdee] = useState<number>(2400);
  const [copied, setCopied] = useState(false);

  const calculateCarbCycling = () => {
    const highCals = Math.round(carbTdee * 1.1);
    const highProteinG = Math.round(carbWeightKg * 2.0);
    const highFatG = Math.round(carbWeightKg * 0.6);
    const highCarbG = Math.round((highCals - highProteinG * 4 - highFatG * 9) / 4);

    const modCals = Math.round(carbTdee * 0.9);
    const modProteinG = Math.round(carbWeightKg * 2.0);
    const modFatG = Math.round(carbWeightKg * 0.8);
    const modCarbG = Math.round((modCals - modProteinG * 4 - modFatG * 9) / 4);

    const lowCals = Math.round(carbTdee * 0.75);
    const lowProteinG = Math.round(carbWeightKg * 2.2);
    const lowFatG = Math.round(carbWeightKg * 1.0);
    const lowCarbG = Math.max(30, Math.round((lowCals - lowProteinG * 4 - lowFatG * 9) / 4));

    const weeklyAvgCals = Math.round((highCals * 2 + modCals * 3 + lowCals * 2) / 7);
    const weeklyDeficit = Math.round((carbTdee - weeklyAvgCals) * 7);

    return {
      highCals,
      highProteinG,
      highFatG,
      highCarbG,
      modCals,
      modProteinG,
      modFatG,
      modCarbG,
      lowCals,
      lowProteinG,
      lowFatG,
      lowCarbG,
      weeklyAvgCals,
      weeklyDeficit,
    };
  };

  const carbCyclingResult = calculateCarbCycling();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Carb Cycling Split: High Carb (${carbCyclingResult.highCals} kcal / ${carbCyclingResult.highCarbG}g C) | Mod (${carbCyclingResult.modCals} kcal / ${carbCyclingResult.modCarbG}g C) | Low (${carbCyclingResult.lowCals} kcal / ${carbCyclingResult.lowCarbG}g C)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Layers className='w-6 h-6 text-amber-500' />
            Carb Cycling & Glycogen Refeed Planner
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Optimizes insulin sensitivity and leptin levels by cycling High Carb (leg/back days), Moderate Carb (push/pull), and Low Carb (rest days).
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
                {unitSystem === 'metric' ? `${carbWeightKg} kg` : `${Math.round(carbWeightKg * 2.20462)} lbs`}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={carbWeightKg}
              onChange={(e) => setCarbWeightKg(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Base TDEE Maintenance</span>
              <span className='font-mono text-[#FF2625]'>{carbTdee} kcal</span>
            </div>
            <input
              type='range'
              min='1500'
              max='4000'
              step='50'
              value={carbTdee}
              onChange={(e) => setCarbTdee(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>
        </div>

        {/* 3-Tier Cycling Cards */}
        <div className='lg:col-span-7 space-y-3'>
          <div className='p-4 rounded-xl bg-red-50/80 border border-red-200 space-y-2 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='font-bold text-red-700 uppercase'>⚡ High Carb Days (2x/week: Leg / Back Day)</span>
              <strong className='text-sm font-black text-gray-950 font-mono'>{carbCyclingResult.highCals} kcal</strong>
            </div>
            <div className='grid grid-cols-3 gap-2 text-center text-gray-800'>
              <div className='bg-white p-2 rounded border border-red-200'>
                <span className='text-[10px] text-gray-400 block'>Carbs</span>
                <strong className='text-red-600'>{carbCyclingResult.highCarbG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-red-200'>
                <span className='text-[10px] text-gray-400 block'>Protein</span>
                <strong>{carbCyclingResult.highProteinG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-red-200'>
                <span className='text-[10px] text-gray-400 block'>Fat (Low)</span>
                <strong>{carbCyclingResult.highFatG}g</strong>
              </div>
            </div>
          </div>

          <div className='p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='font-bold text-amber-800 uppercase'>⚖️ Moderate Carb Days (3x/week: Push / Pull)</span>
              <strong className='text-sm font-black text-gray-950 font-mono'>{carbCyclingResult.modCals} kcal</strong>
            </div>
            <div className='grid grid-cols-3 gap-2 text-center text-gray-800'>
              <div className='bg-white p-2 rounded border border-amber-200'>
                <span className='text-[10px] text-gray-400 block'>Carbs</span>
                <strong className='text-amber-600'>{carbCyclingResult.modCarbG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-amber-200'>
                <span className='text-[10px] text-gray-400 block'>Protein</span>
                <strong>{carbCyclingResult.modProteinG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-amber-200'>
                <span className='text-[10px] text-gray-400 block'>Fat</span>
                <strong>{carbCyclingResult.modFatG}g</strong>
              </div>
            </div>
          </div>

          <div className='p-4 rounded-xl bg-sky-50/80 border border-sky-200 space-y-2 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='font-bold text-sky-800 uppercase'>💤 Low Carb Days (2x/week: Rest Days)</span>
              <strong className='text-sm font-black text-gray-950 font-mono'>{carbCyclingResult.lowCals} kcal</strong>
            </div>
            <div className='grid grid-cols-3 gap-2 text-center text-gray-800'>
              <div className='bg-white p-2 rounded border border-sky-200'>
                <span className='text-[10px] text-gray-400 block'>Carbs (Low)</span>
                <strong className='text-sky-600'>{carbCyclingResult.lowCarbG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-sky-200'>
                <span className='text-[10px] text-gray-400 block'>Protein (High)</span>
                <strong>{carbCyclingResult.lowProteinG}g</strong>
              </div>
              <div className='bg-white p-2 rounded border border-sky-200'>
                <span className='text-[10px] text-gray-400 block'>Fat (High)</span>
                <strong>{carbCyclingResult.lowFatG}g</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
