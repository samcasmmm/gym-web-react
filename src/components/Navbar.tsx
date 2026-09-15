import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';
import { useWorkout } from '../context/WorkoutContext';
import {
  Dumbbell,
  History,
  TrendingUp,
  BookOpen,
  Calendar,
  Settings,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { formatDuration } from '../utils/calculations';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isActive, elapsedSeconds, unit, setUnit } = useWorkout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Flame },
    {
      name: 'Workout',
      path: '/workout',
      icon: Dumbbell,
      badge: isActive ? formatDuration(elapsedSeconds) : null,
    },
    { name: 'Exercises', path: '/exercises', icon: BookOpen },
    { name: 'History', path: '/history', icon: History },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Plans', path: '/plans', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-[1488px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF2625] to-[#ff6b6a] p-2 flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
            <img src={Logo} alt="Golds Gym" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-gray-950 flex items-center gap-1.5">
              IRON<span className="text-[#FF2625]">TRACK</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Pro Gym Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isCurrent = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-red-50 text-[#FF2625] font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#FF2625]' : 'text-gray-400'}`} />
                {link.name}
                {link.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#FF2625] text-white rounded-full animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Unit Switcher */}
          <button
            type="button"
            onClick={() => setUnit(unit === 'kg' ? 'lbs' : 'kg')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer border border-gray-200/60"
            title="Toggle measurement unit"
          >
            Unit: <span className="text-[#FF2625] font-black">{unit}</span>
          </button>

          {/* Quick Action Button */}
          {isActive ? (
            <Link
              to="/workout"
              className="bg-[#FF2625] hover:bg-[#e0201f] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-red-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer animate-pulse"
            >
              <Dumbbell className="w-4 h-4" />
              Active Session ({formatDuration(elapsedSeconds)})
            </Link>
          ) : (
            <Link
              to="/workout"
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-[#FF2625]" />
              Start Workout
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {isActive && (
            <Link
              to="/workout"
              className="px-3 py-1.5 rounded-lg bg-[#FF2625] text-white text-xs font-mono font-bold animate-pulse"
            >
              {formatDuration(elapsedSeconds)}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 flex flex-col gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isCurrent = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-semibold text-base flex items-center justify-between ${
                  isCurrent ? 'bg-red-50 text-[#FF2625] font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  {link.name}
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FF2625] text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setUnit(unit === 'kg' ? 'lbs' : 'kg')}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700"
            >
              Unit: <span className="text-[#FF2625]">{unit}</span>
            </button>

            <Link
              to="/workout"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#FF2625] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md"
            >
              {isActive ? 'Resume Workout' : 'Start Workout'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
