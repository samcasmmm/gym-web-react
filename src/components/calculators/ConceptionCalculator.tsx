import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const ConceptionCalculator: React.FC<BaseCalculatorProps> = () => {
  const [conceptionLmpDate, setConceptionLmpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split('T')[0];
  });

  const calculateConception = () => {
    const lmp = new Date(conceptionLmpDate);
    const conceptionEst = new Date(lmp.getTime() + 14 * 24 * 60 * 60 * 1000);
    const fertileStart = new Date(lmp.getTime() + 10 * 24 * 60 * 60 * 1000);
    const fertileEnd = new Date(lmp.getTime() + 16 * 24 * 60 * 60 * 1000);

    return {
      conceptionDate: conceptionEst.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      fertileWindow: `${fertileStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${fertileEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
    };
  };

  const conceptionResult = calculateConception();

  return (
    <div className='space-y-6'>
      <div className='border-b border-gray-100 pb-4'>
        <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
          <Calendar className='w-6 h-6 text-purple-600' />
          Conception & Fertile Window Calculator
        </h2>
        <p className='text-xs text-gray-500 mt-1'>
          Identifies the highest-probability ovulation day and 6-day fertile intercourse window.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        <div className='lg:col-span-5 space-y-4'>
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
              First Day of Last Menstrual Period (LMP)
            </label>
            <input
              type='date'
              value={conceptionLmpDate}
              onChange={(e) => setConceptionLmpDate(e.target.value)}
              className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
            />
          </div>
        </div>

        <div className='lg:col-span-7 bg-purple-50/70 rounded-xl p-6 border border-purple-200 space-y-4 shadow-xs'>
          <span className='text-xs font-bold uppercase text-purple-700'>Estimated Conception Date</span>
          <p className='text-3xl font-black text-gray-900'>{conceptionResult.conceptionDate}</p>

          <div className='p-4 bg-white rounded-md border border-purple-200 text-xs text-purple-900 shadow-xs'>
            <strong className='block mb-1 font-bold text-purple-950'>🌸 Highest Probability Fertile Window:</strong>
            <span className='text-sm font-semibold text-purple-700'>{conceptionResult.fertileWindow}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
