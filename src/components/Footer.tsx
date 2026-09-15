import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/Logo-1.png';
import { Dumbbell, Heart, ShieldCheck, Zap, Flame, TrendingUp } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className='mt-24 border-t border-gray-200/80 bg-linear-to-b from-white via-gray-50/60 to-gray-100/80 text-gray-700'>
      <div className='max-w-372 mx-auto px-6 sm:px-10 pt-16 pb-12'>
        {/* Main 4-Column Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-200/80'>
          {/* Column 1: Brand & Bio (2 cols wide on LG) */}
          <div className='lg:col-span-2 space-y-4'>
            <Link to='/' className='flex items-center gap-3'>
              <img src={Logo} alt='IronTrack Gym' className='h-9 object-contain' />
            </Link>
            <p className='text-gray-500 text-sm max-w-sm leading-relaxed'>
              Your offline-first workout logger and progressive overload companion. Track lifts, calculate 1RMs, and
              explore 1,500+ animated exercises with zero subscription fees.
            </p>

            <div className='flex flex-wrap gap-2 pt-2'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60'>
                <ShieldCheck className='w-3.5 h-3.5' /> 100% Offline IndexedDB
              </span>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-red-50 text-[#FF2625] border border-red-200/60'>
                <Zap className='w-3.5 h-3.5' /> React 19 + Tailwind v4
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className='space-y-3'>
            <h4 className='text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5'>
              <Flame className='w-3.5 h-3.5 text-[#FF2625]' /> Navigation
            </h4>
            <ul className='space-y-2 text-sm font-semibold'>
              <li>
                <Link to='/' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to='/workout' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Active Workout
                </Link>
              </li>
              <li>
                <Link to='/exercises' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Exercise Directory
                </Link>
              </li>
              <li>
                <Link to='/history' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Workout History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Training & Analytics */}
          <div className='space-y-3'>
            <h4 className='text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5'>
              <TrendingUp className='w-3.5 h-3.5 text-[#FF2625]' /> Calculators & Analytics
            </h4>
            <ul className='space-y-2 text-sm font-semibold'>
              <li>
                <Link to='/calculators' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  BMI & Body Fat Calculators
                </Link>
              </li>
              <li>
                <Link to='/calculators' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Calorie & TDEE Calculator
                </Link>
              </li>
              <li>
                <Link to='/calculators' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Pace & Pregnancy Calculators
                </Link>
              </li>
              <li>
                <Link to='/progress' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Progress & PR Wall
                </Link>
              </li>
              <li>
                <Link to='/plans' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Training Routines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Muscle Groups */}
          <div className='space-y-3'>
            <h4 className='text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5'>
              <Dumbbell className='w-3.5 h-3.5 text-[#FF2625]' /> Target Groups
            </h4>
            <ul className='space-y-2 text-sm font-semibold'>
              <li>
                <Link to='/exercises' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Chest & Triceps
                </Link>
              </li>
              <li>
                <Link to='/exercises' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Back & Biceps
                </Link>
              </li>
              <li>
                <Link to='/exercises' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Legs & Calves
                </Link>
              </li>
              <li>
                <Link to='/exercises' className='text-gray-600 hover:text-[#FF2625] transition-colors'>
                  Shoulders & Abs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Area */}
        <div className='pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500'>
          <p>© {new Date().getFullYear()} IronTrack Gym. All rights reserved.</p>

          <p className='flex items-center gap-1 text-sm font-semibold text-gray-700'>
            Built by <span className='text-[#FF2625] font-black tracking-wide'>Sameer</span>. Backed by{' '}
            <span className='text-gray-900 font-black tracking-wide'>digitat</span>
          </p>

          <div className='flex items-center gap-4 text-xs font-semibold text-gray-500'>
            <span>Client-Side IndexedDB</span>
            <span>•</span>
            <span>No Cookies / No Ads</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
