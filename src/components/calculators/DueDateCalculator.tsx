import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BaseCalculatorProps } from './types';

export const DueDateCalculator: React.FC<BaseCalculatorProps> = () => {
  const [dueDateLmp, setDueDateLmp] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const calculateDueDate = () => {
    const lmp = new Date(dueDateLmp);
    const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((edd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      dueDate: edd.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      daysLeft,
      weeksLeft: Math.ceil(daysLeft / 7),
    };
  };

  const dueDateResult = calculateDueDate();

  return (
    <div className='space-y-6'>
      <div className='border-b border-gray-100 pb-4'>
        <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
          <Sparkles className='w-6 h-6 text-amber-500' />
          Estimated Due Date (EDD) Calculator
        </h2>
        <p className='text-xs text-gray-500 mt-1'>
          Naegele clinical rule calculating precise expected delivery timeline.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        <div className='lg:col-span-5 space-y-4'>
          <div>
            <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
              First Day of Last Period (LMP)
            </label>
            <input
              type='date'
              value={dueDateLmp}
              onChange={(e) => setDueDateLmp(e.target.value)}
              className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
            />
          </div>
        </div>

        <div className='lg:col-span-7 bg-amber-50/70 rounded-xl p-6 border border-amber-200/80 space-y-4 shadow-xs'>
          <span className='text-xs font-bold uppercase text-amber-700'>Estimated Delivery Date</span>
          <p className='text-3xl font-black text-gray-950'>{dueDateResult.dueDate}</p>

          <div className='grid grid-cols-2 gap-3 pt-2 text-xs'>
            <div className='p-3 bg-white rounded-md border border-amber-200 shadow-xs'>
              <span className='text-gray-400 font-bold block'>Days Remaining</span>
              <strong className='text-2xl font-black text-amber-700'>{dueDateResult.daysLeft}</strong>
            </div>
            <div className='p-3 bg-white rounded-md border border-amber-200 shadow-xs'>
              <span className='text-gray-400 font-bold block'>Weeks Remaining</span>
              <strong className='text-2xl font-black text-amber-700'>{dueDateResult.weeksLeft}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
