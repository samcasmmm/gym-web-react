import React, { useState } from 'react';
import { Target, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const GoalTimelineCalculator: React.FC<BaseCalculatorProps> = ({ unitSystem }) => {
  const [goalCurrentWeightKg, setGoalCurrentWeightKg] = useState<number>(80);
  const [goalTargetWeightKg, setGoalTargetWeightKg] = useState<number>(72);
  const [goalDailyDeficit, setGoalDailyDeficit] = useState<number>(500);
  const [copied, setCopied] = useState(false);

  const calculateGoalTimeline = () => {
    const deltaKg = Math.abs(goalCurrentWeightKg - goalTargetWeightKg);
    const isLoss = goalCurrentWeightKg >= goalTargetWeightKg;
    const totalKcalNeeded = Math.round(deltaKg * 7700);
    const totalDays = Math.max(1, Math.round(totalKcalNeeded / Math.max(100, goalDailyDeficit)));
    const totalWeeks = Number((totalDays / 7).toFixed(1));
    const weeklyKgRate = Number(((goalDailyDeficit * 7) / 7700).toFixed(2));
    const weeklyLbsRate = Number((weeklyKgRate * 2.20462).toFixed(2));

    const targetDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const m25 = new Date(Date.now() + totalDays * 0.25 * 86400000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const m50 = new Date(Date.now() + totalDays * 0.5 * 86400000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const m75 = new Date(Date.now() + totalDays * 0.75 * 86400000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    let safeRating = 'Optimal & Sustainable Rate';
    let safeColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (goalDailyDeficit > 750) {
      safeRating = 'Aggressive / Rapid Pace';
      safeColor = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    } else if (goalDailyDeficit < 350) {
      safeRating = 'Gentle / Gradual Pace';
      safeColor = 'text-sky-400 bg-sky-500/20 border-sky-500/30';
    }

    return {
      deltaKg: Number(deltaKg.toFixed(1)),
      deltaDisplay: Number((unitSystem === 'metric' ? deltaKg : deltaKg * 2.20462).toFixed(1)),
      isLoss,
      totalKcalNeeded,
      totalDays,
      totalWeeks,
      weeklyKgRate,
      weeklyLbsRate,
      targetDateStr,
      safeRating,
      safeColor,
      m25,
      m50,
      m75,
    };
  };

  const goalTimelineResult = calculateGoalTimeline();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Goal Timeline: ${goalTimelineResult.deltaDisplay}${unitSystem === 'metric' ? 'kg' : 'lbs'} shift by ${goalTimelineResult.targetDateStr} (${goalTimelineResult.totalWeeks} weeks at ${goalDailyDeficit} kcal/day deficit)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Target className='w-6 h-6 text-[#FF2625]' />
            Weight Goal Timeline & Target Date Predictor
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Calculates exact calendar completion date, total metabolic energy shift, and weekly fat loss velocity based on daily caloric deficit.
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
              <span>Current Weight</span>
              <span className='font-mono text-[#FF2625]'>
                {goalCurrentWeightKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={goalCurrentWeightKg}
              onChange={(e) => setGoalCurrentWeightKg(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Target Goal Weight</span>
              <span className='font-mono text-emerald-600 font-bold'>
                {goalTargetWeightKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            <input
              type='range'
              min='40'
              max='160'
              value={goalTargetWeightKg}
              onChange={(e) => setGoalTargetWeightKg(Number(e.target.value))}
              className='w-full accent-emerald-600 cursor-pointer'
            />
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>Planned Daily Caloric Deficit</span>
              <span className='font-mono text-[#FF2625] font-bold'>-{goalDailyDeficit} kcal/day</span>
            </div>
            <input
              type='range'
              min='200'
              max='1000'
              step='50'
              value={goalDailyDeficit}
              onChange={(e) => setGoalDailyDeficit(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
            <div className='flex gap-1.5 pt-1 text-xs'>
              {[
                { l: 'Gentle (-350)', val: 350 },
                { l: 'Standard (-500)', val: 500 },
                { l: 'Aggressive (-750)', val: 750 },
                { l: 'Max (-1000)', val: 1000 },
              ].map((btn) => (
                <button
                  key={btn.l}
                  type='button'
                  onClick={() => setGoalDailyDeficit(btn.val)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    goalDailyDeficit === btn.val ? 'bg-[#FF2625] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {btn.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Results Hero Card */}
        <div className='lg:col-span-7 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Projected Target Goal Day</span>
            <span className={`px-2.5 py-0.5 rounded-sm text-xs font-bold border ${goalTimelineResult.safeColor}`}>
              {goalTimelineResult.safeRating}
            </span>
          </div>

          <div className='text-center py-2'>
            <span className='text-3xl sm:text-4xl font-black font-mono tracking-tight text-white block'>
              {goalTimelineResult.targetDateStr}
            </span>
            <span className='inline-block mt-2 text-xs font-bold px-3 py-1 rounded-md bg-white/10 text-emerald-300'>
              ⏳ {goalTimelineResult.totalWeeks} Weeks ({goalTimelineResult.totalDays} Days) to reach {goalTargetWeightKg}{' '}
              {unitSystem === 'metric' ? 'kg' : 'lbs'}
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>Total Caloric Shift Required</span>
              <strong className='text-base font-black text-amber-400 font-mono'>
                {goalTimelineResult.totalKcalNeeded.toLocaleString()} kcal
              </strong>
            </div>
            <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
              <span className='text-gray-400 font-medium block text-[11px]'>Weekly Weight Loss Velocity</span>
              <strong className='text-base font-black text-sky-400 font-mono'>
                -{goalTimelineResult.weeklyKgRate} kg/wk{' '}
                <span className='text-[10px] text-gray-400 font-normal'>(-{goalTimelineResult.weeklyLbsRate} lbs)</span>
              </strong>
            </div>
          </div>

          {/* Milestones Road Map */}
          <div className='space-y-2 pt-1 border-t border-white/10'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
              Target Milestone Progressions
            </span>
            <div className='grid grid-cols-3 gap-2 text-center text-xs'>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-[10px] text-gray-400 uppercase block font-bold'>25% Milestone</span>
                <strong className='text-white block font-mono'>{goalTimelineResult.m25}</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-[10px] text-emerald-400 uppercase block font-bold'>50% Halfway</span>
                <strong className='text-white block font-mono'>{goalTimelineResult.m50}</strong>
              </div>
              <div className='p-2.5 bg-white/5 rounded border border-white/10'>
                <span className='text-[10px] text-amber-400 uppercase block font-bold'>75% Final Push</span>
                <strong className='text-white block font-mono'>{goalTimelineResult.m75}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
