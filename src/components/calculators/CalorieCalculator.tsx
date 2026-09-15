import React, { useState } from 'react';
import { Flame, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const CalorieCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem, onNavigateTab }) => {
  const [calAge, setCalAge] = useState<number>(26);
  const [calGender, setCalGender] = useState<'male' | 'female'>('male');
  const [calHeightCm, setCalHeightCm] = useState<number>(178);
  const [calWeightKg, setCalWeightKg] = useState<number>(76);
  const [calActivity, setCalActivity] = useState<number>(1.55);
  const [macroPreset, setMacroPreset] = useState<'balanced' | 'highprotein' | 'keto' | 'endurance'>('highprotein');
  const [targetGoal, setTargetGoal] = useState<'maintain' | 'cut500' | 'cut250' | 'bulk300' | 'bulk500'>('cut500');
  const [copied, setCopied] = useState(false);

  const calculateCalories = () => {
    let bmr = 10 * calWeightKg + 6.25 * calHeightCm - 5 * calAge;
    bmr += calGender === 'male' ? 5 : -161;
    const tdee = Math.round(bmr * calActivity);

    let goalDelta = 0;
    if (targetGoal === 'cut500') goalDelta = -500;
    if (targetGoal === 'cut250') goalDelta = -250;
    if (targetGoal === 'bulk300') goalDelta = 300;
    if (targetGoal === 'bulk500') goalDelta = 500;

    const targetCal = Math.max(1200, tdee + goalDelta);

    const bmrPortion = Math.round(bmr);
    const tefPortion = Math.round(targetCal * 0.1);
    const neatPortion = Math.round((tdee - bmr) * 0.4);
    const eatPortion = Math.round((tdee - bmr) * 0.6);

    let pRatio = 0.35;
    let cRatio = 0.4;
    let fRatio = 0.25;

    if (macroPreset === 'balanced') {
      pRatio = 0.3;
      cRatio = 0.4;
      fRatio = 0.3;
    } else if (macroPreset === 'highprotein') {
      pRatio = 0.4;
      cRatio = 0.35;
      fRatio = 0.25;
    } else if (macroPreset === 'keto') {
      pRatio = 0.25;
      cRatio = 0.05;
      fRatio = 0.7;
    } else if (macroPreset === 'endurance') {
      pRatio = 0.2;
      cRatio = 0.6;
      fRatio = 0.2;
    }

    const proteinCals = targetCal * pRatio;
    const fatCals = targetCal * fRatio;
    const carbCals = targetCal * cRatio;

    const proteinGrams = Math.round(proteinCals / 4);
    const fatGrams = Math.round(fatCals / 9);
    const carbGrams = Math.round(carbCals / 4);

    const weeklyKgChange = Number(((goalDelta * 7) / 7700).toFixed(2));
    const weeklyLbsChange = Number((weeklyKgChange * 2.20462).toFixed(2));

    return {
      bmr,
      tdee,
      targetCal,
      goalDelta,
      bmrPortion,
      tefPortion,
      neatPortion,
      eatPortion,
      proteinGrams,
      fatGrams,
      carbGrams,
      pRatio: Math.round(pRatio * 100),
      cRatio: Math.round(cRatio * 100),
      fRatio: Math.round(fRatio * 100),
      weeklyKgChange,
      weeklyLbsChange,
    };
  };

  const calorieResult = calculateCalories();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Target Calories: ${calorieResult.targetCal} kcal/day | P: ${calorieResult.proteinGrams}g, C: ${calorieResult.carbGrams}g, F: ${calorieResult.fatGrams}g`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Flame className='w-6 h-6 text-[#FF2625]' />
            Calorie & TDEE Metabolism Matrix
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Calculates Total Daily Energy Expenditure (TDEE), target deficit timeline, and customized macro split.
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
        {/* Inputs */}
        <div className='lg:col-span-6 space-y-5'>
          {/* Gender & Age */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setCalGender('male')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    calGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Male
                </button>
                <button
                  type='button'
                  onClick={() => setCalGender('female')}
                  className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    calGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {calAge} yrs</label>
              <input
                type='range'
                min='15'
                max='80'
                value={calAge}
                onChange={(e) => setCalAge(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
          </div>

          {/* Height & Weight */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Height</span>
                <span className='font-mono text-[#FF2625]'>{calHeightCm} cm</span>
              </div>
              <input
                type='range'
                min='130'
                max='220'
                value={calHeightCm}
                onChange={(e) => setCalHeightCm(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-bold text-gray-700'>
                <span>Weight</span>
                <span className='font-mono text-[#FF2625]'>
                  {unitSystem === 'metric' ? `${calWeightKg} kg` : `${Math.round(calWeightKg * 2.20462)} lbs`}
                </span>
              </div>
              <input
                type='range'
                min='40'
                max='180'
                value={calWeightKg}
                onChange={(e) => setCalWeightKg(Number(e.target.value))}
                className='w-full accent-[#FF2625] cursor-pointer'
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Weekly Activity Level</label>
            <select
              value={calActivity}
              onChange={(e) => setCalActivity(Number(e.target.value))}
              className='w-full px-3 py-2 rounded-md border border-gray-300 text-xs font-semibold bg-white'
            >
              <option value={1.2}>Sedentary (Desk Job, little or no exercise)</option>
              <option value={1.375}>Lightly Active (Training 1-3 days/week)</option>
              <option value={1.55}>Moderately Active (Gym lifting 3-5 days/week)</option>
              <option value={1.725}>Very Active (Intense training 6-7 days/week)</option>
              <option value={1.9}>Extra Active (Athlete / physical job + double training)</option>
            </select>
          </div>

          {/* Target Strategy Goal */}
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Nutrition Goal</label>
            <div className='grid grid-cols-3 gap-2'>
              <button
                type='button'
                onClick={() => setTargetGoal('cut500')}
                className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                  targetGoal === 'cut500' ? 'bg-red-50 border-[#FF2625] text-[#FF2625]' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                🔥 Cut (-500)
              </button>
              <button
                type='button'
                onClick={() => setTargetGoal('maintain')}
                className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                  targetGoal === 'maintain' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                ⚖️ Maintain
              </button>
              <button
                type='button'
                onClick={() => setTargetGoal('bulk300')}
                className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                  targetGoal === 'bulk300' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                💪 Lean Bulk (+300)
              </button>
            </div>
          </div>

          {/* Macro Ratio Presets */}
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Macro Strategy Preset</label>
            <div className='grid grid-cols-4 gap-1.5 text-xs'>
              {[
                { id: 'highprotein', label: 'High Protein' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'keto', label: 'Keto / Low Carb' },
                { id: 'endurance', label: 'Endurance' },
              ].map((p) => (
                <button
                  key={p.id}
                  type='button'
                  onClick={() => setMacroPreset(p.id as any)}
                  className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors cursor-pointer text-center ${
                    macroPreset === p.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Breakdown Results */}
        <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-6'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Target Calorie Target</span>
            <span className='text-xs font-bold px-2.5 py-0.5 rounded-sm bg-red-500/20 text-red-400 border border-red-500/30'>
              TDEE: {calorieResult.tdee} kcal
            </span>
          </div>

          <div className='text-center py-2'>
            <span className='text-5xl font-black font-mono tracking-tight text-white'>{calorieResult.targetCal}</span>
            <span className='block text-xs text-gray-400 font-bold uppercase tracking-wider mt-1'>
              Kilocalories / Day
            </span>
            {calorieResult.weeklyKgChange !== 0 && (
              <span className='inline-block mt-2 text-xs font-bold px-3 py-1 rounded-md bg-white/10 text-amber-300'>
                Estimated Shift: {calorieResult.weeklyKgChange > 0 ? '+' : ''}
                {calorieResult.weeklyKgChange} kg / week ({calorieResult.weeklyLbsChange > 0 ? '+' : ''}
                {calorieResult.weeklyLbsChange} lbs)
              </span>
            )}
          </div>

          {/* Macro Split Proportion Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-xs font-bold'>
              <span className='text-red-400'>🍗 Protein ({calorieResult.pRatio}%)</span>
              <span className='text-amber-400'>🍚 Carbs ({calorieResult.cRatio}%)</span>
              <span className='text-sky-400'>🥑 Fat ({calorieResult.fRatio}%)</span>
            </div>
            <div className='h-3 w-full bg-gray-800 rounded-sm overflow-hidden flex'>
              <div style={{ width: `${calorieResult.pRatio}%` }} className='bg-[#FF2625] h-full' />
              <div style={{ width: `${calorieResult.cRatio}%` }} className='bg-amber-500 h-full' />
              <div style={{ width: `${calorieResult.fRatio}%` }} className='bg-sky-500 h-full' />
            </div>
          </div>

          {/* Gram Target Cards */}
          <div className='grid grid-cols-3 gap-2.5 pt-1 text-center'>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-[10px] text-gray-400 uppercase font-bold block'>Protein</span>
              <strong className='text-xl font-black text-red-400'>{calorieResult.proteinGrams}g</strong>
              <span className='text-[10px] text-gray-500 block'>{calorieResult.proteinGrams * 4} kcal</span>
            </div>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-[10px] text-gray-400 uppercase font-bold block'>Carbohydrates</span>
              <strong className='text-xl font-black text-amber-400'>{calorieResult.carbGrams}g</strong>
              <span className='text-[10px] text-gray-500 block'>{calorieResult.carbGrams * 4} kcal</span>
            </div>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-[10px] text-gray-400 uppercase font-bold block'>Healthy Fats</span>
              <strong className='text-xl font-black text-sky-400'>{calorieResult.fatGrams}g</strong>
              <span className='text-[10px] text-gray-500 block'>{calorieResult.fatGrams * 9} kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
