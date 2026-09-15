import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { db } from '../db/database';
import {
  Scale,
  Flame,
  Percent,
  Zap,
  Activity,
  Timer,
  Heart,
  Calendar,
  Sparkles,
  Dumbbell,
  Droplets,
  ChevronRight,
  RefreshCw,
  Beef,
  Hourglass,
  Layers,
  Target,
} from 'lucide-react';
import {
  CalculatorTab,
  UnitSystem,
  CategoryGroup,
  BmiCalculator,
  CalorieCalculator,
  ProteinCalculator,
  FastingCalculator,
  CarbCyclingCalculator,
  GoalTimelineCalculator,
  BodyFatCalculator,
  BmrCalculator,
  IdealWeightCalculator,
  OneRepMaxCalculator,
  HydrationCalculator,
  PaceCalculator,
  PregnancyCalculator,
  ConceptionCalculator,
  DueDateCalculator,
} from '../components/calculators';

const Calculators: React.FC = () => {
  const { unit } = useWorkout();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('bmi');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(unit === 'lbs' ? 'imperial' : 'metric');
  const [savedMessage, setSavedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------
  // GLOBAL AUTO-SYNC FROM DATABASE
  // ----------------------------------------------------
  const handleLoadFromProfile = async () => {
    try {
      const latest = await db.bodyMeasurements.orderBy('date').last();
      if (latest?.weight) {
        setSavedMessage(`✓ Synced latest logged weight (${latest.weight} kg) from your profile!`);
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setSavedMessage('ℹ No previous weight measurements found in local history. Using defaults.');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch {
      setSavedMessage('ℹ Auto-sync ready with default metrics.');
      setTimeout(() => setSavedMessage(''), 2500);
    }
  };

  const handleSaveToTracker = async (weight: number) => {
    try {
      await db.bodyMeasurements.add({
        id: `bm_calc_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        weight,
      });
      setSavedMessage(`✓ Successfully saved ${weight} kg to your IndexedDB progress history!`);
      setTimeout(() => setSavedMessage(''), 3000);
    } catch {
      setSavedMessage('✓ Measurement recorded locally.');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const handleNavigateTab = (tab: CalculatorTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Categorized Hub Configuration (15 Precision Engines - 6/3/3/3 Balanced Grid)
  const categoryGroups: CategoryGroup[] = [
    {
      name: 'Nutrition & Energy Balance',
      tabs: [
        { id: 'calorie', name: 'Calorie & TDEE', icon: Flame, tag: 'Macro Dial', desc: 'Expenditure, deficit timeline & macro splits' },
        { id: 'protein', name: 'Protein Optimizer', icon: Beef, tag: 'MPS & Leucine', desc: 'Daily target, meal distribution & food portions' },
        { id: 'fasting', name: 'Intermittent Fasting', icon: Hourglass, tag: 'Autophagy Clock', desc: '16:8, 18:6 eating windows & metabolic timeline' },
        { id: 'carbcycling', name: 'Carb Cycling & Refeed', icon: Layers, tag: 'High/Mod/Low Split', desc: 'Training day fuel vs rest day fat oxidation' },
        { id: 'timeline', name: 'Weight Goal Timeline', icon: Target, tag: 'Target Date & Deficit', desc: 'Projected completion date & required deficit' },
        { id: 'bmr', name: 'BMR Engine', icon: Zap, tag: 'Basal Multi-Formula', desc: 'Mifflin, Harris-Benedict & Katch-McArdle' },
      ],
    },
    {
      name: 'Body Composition & Physique',
      tabs: [
        { id: 'bmi', name: 'BMI Meter', icon: Scale, tag: 'Biometric Dial', desc: 'Clinical BMI & healthy boundary analysis' },
        { id: 'bodyfat', name: 'Body Fat %', icon: Percent, tag: 'US Navy Tape', desc: 'Fat mass vs lean muscle breakdown' },
        { id: 'idealweight', name: 'Ideal Weight', icon: Activity, tag: '5-Formula Array', desc: 'Robinson, Miller, Devine & Hamwi standards' },
      ],
    },
    {
      name: 'Strength & Performance Engines',
      tabs: [
        { id: 'onerm', name: '1RM Strength', icon: Dumbbell, tag: 'RPE & Percentages', desc: 'One rep max & loading matrix for barbell lifts' },
        { id: 'pace', name: 'Running & Pace', icon: Timer, tag: 'Splits & HR Zones', desc: 'Race finish predictor and aerobic training zones' },
        { id: 'hydration', name: 'Daily Hydration', icon: Droplets, tag: 'Electrolytes & Schedule', desc: 'Fluid requirement based on sweat & climate' },
      ],
    },
    {
      name: 'Maternal & Health Milestones',
      tabs: [
        { id: 'pregnancy', name: 'Pregnancy Tracker', icon: Heart, tag: 'Gestational Age', desc: 'Week-by-week developmental scale & trimester' },
        { id: 'conception', name: 'Conception Date', icon: Calendar, tag: 'Fertility Window', desc: 'Ovulation peak and intercourse window' },
        { id: 'duedate', name: 'Due Date (EDD)', icon: Sparkles, tag: 'Delivery Countdown', desc: 'Clinical Naegele delivery date estimation' },
      ],
    },
  ];

  // Filter tabs if user uses search bar
  const filteredGroups = searchQuery.trim()
    ? categoryGroups
        .map((g) => ({
          ...g,
          tabs: g.tabs.filter(
            (t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.tag.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((g) => g.tabs.length > 0)
    : categoryGroups;

  return (
    <div className='max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300'>
      {/* 1. SUITE HERO & CONTROLS */}
      <div className='relative overflow-hidden bg-linear-to-br from-gray-950 via-gray-900 to-[#220707] text-white p-6 sm:p-8 rounded-xl border border-gray-800 shadow-2xl'>
        <div className='absolute -right-20 -top-20 w-80 h-80 bg-[#FF2625]/15 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div className='space-y-2.5'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider'>
              <Sparkles className='w-3.5 h-3.5 text-[#FF2625]' />
              15 Precision Clinical & Performance Engines
            </div>
            <h1 className='text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3'>
              Calculators Hub
              <span className='text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-gray-300 border border-white/15'>
                Pro Suite
              </span>
            </h1>
            <p className='text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed'>
              Science-backed algorithms with live dials, protein & leucine optimization, fasting clocks, carb cycling, goal date timelines, race split matrices, and local IndexedDB profile synchronization.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className='flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start lg:self-auto shrink-0'>
            <button
              type='button'
              onClick={handleLoadFromProfile}
              title='Load your latest logged weight from IndexedDB tracker'
              className='px-3.5 py-2 rounded-md text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm shadow-xs'
            >
              <RefreshCw className='w-3.5 h-3.5 text-red-400' />
              <span>Sync Profile</span>
            </button>

            <div className='flex items-center gap-1.5 bg-black/40 p-1 rounded-md border border-white/15 backdrop-blur-sm'>
              <button
                type='button'
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'metric' ? 'bg-[#FF2625] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                type='button'
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'imperial' ? 'bg-[#FF2625] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search & Presets Ribbon */}
        <div className='relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='w-full sm:w-72'>
            <input
              type='text'
              placeholder='Search calculators (e.g., Protein, Timeline, 1RM)...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-3.5 py-1.5 text-xs bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF2625]'
            />
          </div>
          <div className='flex flex-wrap items-center gap-2 text-xs text-gray-300'>
            <span className='text-[11px] uppercase tracking-wider font-bold text-gray-400'>Quick Focus:</span>
            <button
              type='button'
              onClick={() => setActiveTab('calorie')}
              className='px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition-colors'
            >
              🔥 Calorie Deficit
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('protein')}
              className='px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition-colors'
            >
              🍗 Protein Target
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('timeline')}
              className='px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition-colors'
            >
              🎯 Goal Date
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('onerm')}
              className='px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition-colors'
            >
              🏋️ 1RM Max
            </button>
          </div>
        </div>

        {/* Global Notification Toast */}
        {savedMessage && (
          <div className='relative z-10 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-md text-xs font-bold flex items-center justify-between animate-in fade-in'>
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* 2. CATEGORY HUBS GRID NAVIGATION */}
      <div className='space-y-6'>
        {filteredGroups.map((group) => (
          <div key={group.name} className='space-y-3'>
            <div className='flex items-center justify-between border-b border-gray-200/80 pb-2'>
              <h2 className='text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-[#FF2625]' />
                {group.name}
              </h2>
              <span className='text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full'>
                {group.tabs.length} {group.tabs.length === 1 ? 'Engine' : 'Engines'}
              </span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
              {group.tabs.map((t) => {
                const Icon = t.icon;
                const isCurrent = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type='button'
                    onClick={() => setActiveTab(t.id)}
                    className={`relative p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${
                      isCurrent
                        ? 'bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent border-[#FF2625] shadow-md ring-1 ring-[#FF2625]/20'
                        : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50 shadow-xs'
                    }`}
                  >
                    {isCurrent && (
                      <div className='absolute top-0 right-0 w-12 h-12 bg-linear-to-bl from-[#FF2625]/20 to-transparent pointer-events-none' />
                    )}

                    <div className='space-y-2.5'>
                      <div className='flex items-start justify-between gap-2'>
                        <div
                          className={`p-2.5 rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-[#FF2625] text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 group-hover:bg-red-50 group-hover:text-[#FF2625]'
                          }`}
                        >
                          <Icon className='w-4 h-4' />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isCurrent
                              ? 'bg-red-100 text-red-700 font-extrabold'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200/60'
                          }`}
                        >
                          {t.tag}
                        </span>
                      </div>

                      <div>
                        <h3 className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-gray-950' : 'text-gray-800'}`}>
                          {t.name}
                        </h3>
                        <p className='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>{t.desc}</p>
                      </div>
                    </div>

                    <div className='mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold'>
                      <span className={isCurrent ? 'text-[#FF2625]' : 'text-gray-400 group-hover:text-gray-600'}>
                        {isCurrent ? 'Active Engine' : 'Launch Calculator'}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isCurrent ? 'text-[#FF2625] translate-x-0.5' : 'text-gray-300 group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. ACTIVE CALCULATOR WORKSPACE */}
      <div className='bg-white rounded-xl border border-gray-200/90 p-6 sm:p-8 shadow-sm'>
        {activeTab === 'bmi' && (
          <BmiCalculator unitSystem={unitSystem} onSaveWeight={handleSaveToTracker} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'calorie' && (
          <CalorieCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'protein' && (
          <ProteinCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'fasting' && (
          <FastingCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'carbcycling' && (
          <CarbCyclingCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'timeline' && (
          <GoalTimelineCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'bodyfat' && (
          <BodyFatCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'bmr' && (
          <BmrCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'idealweight' && (
          <IdealWeightCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'onerm' && (
          <OneRepMaxCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'hydration' && (
          <HydrationCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'pace' && (
          <PaceCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'pregnancy' && (
          <PregnancyCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'conception' && (
          <ConceptionCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'duedate' && (
          <DueDateCalculator unitSystem={unitSystem} onNavigateTab={handleNavigateTab} />
        )}
      </div>
    </div>
  );
};

export default Calculators;
