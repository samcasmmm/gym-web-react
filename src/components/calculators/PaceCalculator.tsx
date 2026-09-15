import React, { useState } from 'react';
import { Timer, Share2 } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const PaceCalculator: React.FC<BaseCalculatorProps> = () => {
  const [paceDistKm, setPaceDistKm] = useState<number>(10);
  const [paceHours, setPaceHours] = useState<number>(0);
  const [paceMins, setPaceMins] = useState<number>(50);
  const [paceSecs, setPaceSecs] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const calculatePace = () => {
    const totalSecs = paceHours * 3600 + paceMins * 60 + paceSecs;
    if (paceDistKm <= 0 || totalSecs <= 0)
      return { paceKm: '0:00', paceMile: '0:00', speedKmh: 0, speedMph: 0, predictions: [], zones: [] };

    const secPerKm = totalSecs / paceDistKm;
    const secPerMile = secPerKm * 1.60934;

    const formatP = (s: number) => {
      const m = Math.floor(s / 60);
      const remS = Math.round(s % 60);
      return `${m}:${remS < 10 ? '0' : ''}${remS}`;
    };

    const speedKmh = Number((paceDistKm / (totalSecs / 3600)).toFixed(1));
    const speedMph = Number((speedKmh / 1.60934).toFixed(1));

    const predictions = [
      { name: '1 Mile (1.61 km)', dist: '1.61 km', time: formatP(secPerMile) },
      { name: '5K Classic', dist: '5.0 km', time: formatP(secPerKm * 5) },
      { name: '10K Road Race', dist: '10.0 km', time: formatP(secPerKm * 10) },
      { name: 'Half Marathon', dist: '21.1 km', time: formatP(secPerKm * 21.0975) },
      { name: 'Full Marathon', dist: '42.2 km', time: formatP(secPerKm * 42.195) },
    ];

    const zones = [
      { name: 'Zone 1: Active Recovery', hr: '50-60%', desc: 'Easy breathing, builds capillary vascular network' },
      { name: 'Zone 2: Aerobic Base', hr: '60-70%', desc: 'Maximum fat oxidation, sustainable all day' },
      { name: 'Zone 3: Tempo / Aerobic Power', hr: '70-80%', desc: 'Improves aerobic capacity and race endurance' },
      { name: 'Zone 4: Lactate Threshold', hr: '80-90%', desc: 'High burn, pushes fatigue barrier upward' },
      { name: 'Zone 5: VO2 Max Sprints', hr: '90-100%', desc: 'Peak anaerobic output in short intervals' },
    ];

    return {
      paceKm: `${formatP(secPerKm)} /km`,
      paceMile: `${formatP(secPerMile)} /mi`,
      speedKmh,
      speedMph,
      predictions,
      zones,
    };
  };

  const paceResult = calculatePace();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Pace: ${paceResult.paceKm} (${paceResult.speedKmh} km/h) | 5K: ${paceResult.predictions[1]?.time}, 10K: ${paceResult.predictions[2]?.time}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
            <Timer className='w-6 h-6 text-[#FF2625]' />
            Cardio, Running Pace & Race Predictor
          </h2>
          <p className='text-xs text-gray-500 mt-1'>
            Computes split times per kilometer/mile, finish predictions for standard race distances, and aerobic HR zones.
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
              <span>Distance</span>
              <span className='font-mono text-[#FF2625]'>{paceDistKm} km</span>
            </div>
            <input
              type='range'
              min='1'
              max='42.2'
              step='0.5'
              value={paceDistKm}
              onChange={(e) => setPaceDistKm(Number(e.target.value))}
              className='w-full accent-[#FF2625] cursor-pointer'
            />
            <div className='flex gap-1.5 pt-1 text-xs'>
              {[
                { l: '1 Mile', d: 1.61 },
                { l: '5K', d: 5 },
                { l: '10K', d: 10 },
                { l: 'Half (21.1)', d: 21.1 },
                { l: 'Full (42.2)', d: 42.2 },
              ].map((btn) => (
                <button
                  key={btn.l}
                  type='button'
                  onClick={() => setPaceDistKm(btn.d)}
                  className='px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold cursor-pointer'
                >
                  {btn.l}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2'>
            <div>
              <label className='block text-[11px] font-bold uppercase text-gray-500 mb-1'>Hours</label>
              <input
                type='number'
                min='0'
                max='24'
                value={paceHours}
                onChange={(e) => setPaceHours(Number(e.target.value))}
                className='w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm font-semibold'
              />
            </div>
            <div>
              <label className='block text-[11px] font-bold uppercase text-gray-500 mb-1'>Minutes</label>
              <input
                type='number'
                min='0'
                max='59'
                value={paceMins}
                onChange={(e) => setPaceMins(Number(e.target.value))}
                className='w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm font-semibold'
              />
            </div>
            <div>
              <label className='block text-[11px] font-bold uppercase text-gray-500 mb-1'>Seconds</label>
              <input
                type='number'
                min='0'
                max='59'
                value={paceSecs}
                onChange={(e) => setPaceSecs(Number(e.target.value))}
                className='w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm font-semibold'
              />
            </div>
          </div>

          <div className='p-4 bg-linear-to-br from-gray-950 to-gray-900 rounded-xl border border-gray-800 text-white text-center space-y-2'>
            <span className='text-[10px] uppercase font-bold tracking-widest text-red-400'>
              Target Running Pace
            </span>
            <div className='text-3xl font-black font-mono text-white'>{paceResult.paceKm}</div>
            <div className='flex justify-center gap-3 text-xs text-gray-400'>
              <span>{paceResult.paceMile}</span>
              <span>•</span>
              <span>{paceResult.speedKmh} km/h</span>
              <span>•</span>
              <span>{paceResult.speedMph} mph</span>
            </div>
          </div>
        </div>

        {/* Race Predictions & Heart Rate Zones */}
        <div className='lg:col-span-7 space-y-4'>
          <div>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2'>
              Race Distance Time Predictions
            </span>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs'>
              {paceResult.predictions.map((p, i) => (
                <div key={i} className='p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1'>
                  <span className='text-[11px] text-gray-500 font-bold block'>{p.name}</span>
                  <strong className='text-base font-black text-gray-950 font-mono'>{p.time}</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2'>
              Heart Rate Training Zones
            </span>
            <div className='divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-xs'>
              {paceResult.zones.map((z, i) => (
                <div key={i} className='p-2.5 flex items-center justify-between hover:bg-gray-50'>
                  <div>
                    <strong className='text-gray-900 block font-bold'>{z.name}</strong>
                    <span className='text-[10px] text-gray-400'>{z.desc}</span>
                  </div>
                  <span className='font-mono font-bold text-red-600 shrink-0'>{z.hr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
