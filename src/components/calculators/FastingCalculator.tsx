import React, { useState } from 'react';
import { Hourglass, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const FastingCalculator: React.FC<BaseCalculatorProps> = () => {
  const [fastingProtocol, setFastingProtocol] = useState<'16_8' | '18_6' | '20_4' | '14_10' | '12_12'>('16_8');
  const [firstMealHour, setFirstMealHour] = useState<number>(12);
  const [copied, setCopied] = useState(false);

  const calculateFasting = () => {
    let fastHours = 16;
    let eatHours = 8;
    if (fastingProtocol === '14_10') {
      fastHours = 14;
      eatHours = 10;
    } else if (fastingProtocol === '18_6') {
      fastHours = 18;
      eatHours = 6;
    } else if (fastingProtocol === '20_4') {
      fastHours = 20;
      eatHours = 4;
    } else if (fastingProtocol === '12_12') {
      fastHours = 12;
      eatHours = 12;
    }

    const endHour = (firstMealHour + eatHours) % 24;
    const formatHour = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:00 ${ampm}`;
    };

    const eatingWindowStr = `${formatHour(firstMealHour)} – ${formatHour(endHour)}`;
    const fastingWindowStr = `${formatHour(endHour)} – ${formatHour(firstMealHour)} (Next Day)`;

    const milestones = [
      { hr: '0–4h', label: 'Anabolic / Digestion', desc: 'Blood glucose rises, insulin shuttles nutrients to tissues' },
      { hr: '4–8h', label: 'Post-Absorptive Phase', desc: 'Blood sugar normalizes, liver glycogen utilization begins' },
      { hr: '12–14h', label: 'Fat Oxidation & Ketosis', desc: 'Free fatty acid mobilization ramps up significantly' },
      { hr: '16–18h', label: 'Autophagy Activation', desc: 'Cellular cleanup, damaged mitochondria recycling peaks' },
      { hr: '20h+', label: 'HGH & Deep Repair', desc: 'Human Growth Hormone surges to preserve lean muscle' },
    ];

    return {
      fastHours,
      eatHours,
      eatingWindowStr,
      fastingWindowStr,
      startStr: formatHour(firstMealHour),
      endStr: formatHour(endHour),
      milestones,
    };
  };

  const fastingResult = calculateFasting();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Fasting Protocol: ${fastingResult.fastHours}:${fastingResult.eatHours} | Eating Window: ${fastingResult.eatingWindowStr} | Fasting: ${fastingResult.fastingWindowStr}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Hourglass className='w-6 h-6 text-purple-600' />
            Intermittent Fasting & Circadian Window
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Maps your daily feeding & fasting windows, autophagy timeline, and metabolic shifts.
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
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Fasting Protocol</label>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              {[
                { id: '16_8', name: '16:8 LeanGains', desc: 'Standard & most popular protocol' },
                { id: '18_6', name: '18:6 Fat Burn', desc: 'Accelerated autophagy window' },
                { id: '20_4', name: '20:4 Warrior Diet', desc: 'Single main feast window' },
                { id: '14_10', name: '14:10 Gentle', desc: 'Great for beginners & active women' },
              ].map((p) => (
                <button
                  key={p.id}
                  type='button'
                  onClick={() => setFastingProtocol(p.id as any)}
                  className={`p-2.5 rounded-md text-left border transition-all cursor-pointer ${
                    fastingProtocol === p.id
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className='block text-xs font-bold'>{p.name}</span>
                  <span className='text-[10px] text-gray-400 font-normal'>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='flex justify-between text-xs font-bold text-gray-700'>
              <span>First Meal Time (Break-Fast)</span>
              <span className='font-mono text-purple-600 font-bold'>{fastingResult.startStr}</span>
            </div>
            <input
              type='range'
              min='6'
              max='18'
              value={firstMealHour}
              onChange={(e) => setFirstMealHour(Number(e.target.value))}
              className='w-full accent-purple-600 cursor-pointer'
            />
          </div>
        </div>

        {/* Fasting Schedule & Milestones */}
        <div className='lg:col-span-7 bg-linear-to-b from-purple-950 via-gray-900 to-gray-950 rounded-xl p-6 text-white border border-purple-900/50 shadow-lg space-y-5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-purple-400'>Daily Schedule</span>
            <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30'>
              {fastingResult.fastHours}h Fast / {fastingResult.eatHours}h Feed
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 text-center'>
            <div className='p-3.5 bg-white/5 rounded-xl border border-emerald-500/30'>
              <span className='text-[10px] text-emerald-400 uppercase font-bold block'>🍽️ Eating Window ({fastingResult.eatHours}h)</span>
              <strong className='text-base font-black text-white font-mono'>{fastingResult.eatingWindowStr}</strong>
            </div>
            <div className='p-3.5 bg-white/5 rounded-xl border border-purple-500/30'>
              <span className='text-[10px] text-purple-400 uppercase font-bold block'>⏳ Fasting Window ({fastingResult.fastHours}h)</span>
              <strong className='text-base font-black text-white font-mono'>{fastingResult.fastingWindowStr}</strong>
            </div>
          </div>

          {/* Metabolic Shifts Timeline */}
          <div className='space-y-2 pt-1'>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
              Fasting Metabolic Timeline
            </span>
            <div className='divide-y divide-white/10 text-xs'>
              {fastingResult.milestones.map((m, idx) => (
                <div key={idx} className='py-2 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <span className='w-12 font-bold font-mono text-purple-300'>{m.hr}</span>
                    <div>
                      <strong className='text-white block font-bold'>{m.label}</strong>
                      <span className='text-[10px] text-gray-400'>{m.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
