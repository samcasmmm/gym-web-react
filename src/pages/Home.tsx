import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { db, DbWorkout, DbPersonalRecord, DbBodyMeasurement } from '../db/database';
import {
  Dumbbell,
  Flame,
  TrendingUp,
  Award,
  Play,
  ArrowRight,
  Sparkles,
  Calendar,
  Activity,
  Plus,
  Scale,
  Zap,
} from 'lucide-react';
import SearchExercises from '../components/SearchExercises';
import Exercises from '../components/Exercises';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isActive, startWorkout, unit } = useWorkout();

  // State for IndexedDB metrics
  const [workouts, setWorkouts] = useState<DbWorkout[]>([]);
  const [prs, setPrs] = useState<DbPersonalRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<number>(76.0);
  const [bodyPart, setBodyPart] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      const recentWorkouts = await db.workouts.orderBy('date').reverse().limit(10).toArray();
      setWorkouts(recentWorkouts);

      const topPRs = await db.personalRecords.orderBy('weight').reverse().limit(4).toArray();
      setPrs(topPRs);

      const measurements = await db.bodyMeasurements.orderBy('date').reverse().first();
      if (measurements?.weight) {
        setLatestWeight(measurements.weight);
      }
    };
    loadDashboardData();
  }, []);

  // Compute stats
  const totalVolumeLifted = workouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0);
  const totalSetsLogged = workouts.reduce((acc, w) => acc + (w.totalSets || 0), 0);
  const workoutsThisWeek = workouts.filter((w) => {
    const diff = (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // Chart data for last 7 days
  const chartData = [
    { day: 'Mon', volume: 0, sets: 0 },
    { day: 'Tue', volume: 0, sets: 0 },
    { day: 'Wed', volume: 0, sets: 0 },
    { day: 'Thu', volume: 0, sets: 0 },
    { day: 'Fri', volume: 0, sets: 0 },
    { day: 'Sat', volume: 0, sets: 0 },
    { day: 'Sun', volume: 0, sets: 0 },
  ];

  workouts.slice(0, 7).forEach((w, idx) => {
    const dayIndex = new Date(w.date).getDay();
    const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    if (chartData[mappedIndex]) {
      chartData[mappedIndex].volume += Math.round(w.totalVolume / 100);
      chartData[mappedIndex].sets += w.totalSets;
    }
  });

  const handleStartRoutine = async (routineName: string, exercisesList: string[]) => {
    startWorkout(
      routineName,
      exercisesList.map((name) => ({ name })),
    );
    navigate('/workout');
  };

  return (
    <div className='w-full space-y-12 py-6 px-2 sm:px-4'>
      {/* 1. HERO BANNER & QUICK STATS */}
      <section className='relative overflow-hidden rounded-xl bg-linear-to-br from-gray-950 via-gray-900 to-[#2A0808] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-gray-800'>
        {/* Background ambient accents */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-[#FF2625]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20'></div>
        <div className='absolute bottom-0 left-1/3 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none'></div>

        <div className='relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center'>
          {/* Left Column: Heading & CTAs */}
          <div className='lg:col-span-7 space-y-6'>
            <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-xs sm:text-sm font-bold tracking-wide uppercase'>
              <Flame className='w-4 h-4 text-[#FF2625]' />
              Track Every Lift • Build True Strength
            </div>

            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none'>
              PUSH PAST <br />
              <span className='text-transparent bg-clip-text bg-linear-to-r from-[#FF2625] via-red-400 to-amber-300'>
                YOUR LIMITS.
              </span>
            </h1>

            <p className='text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed font-normal'>
              Log your sets, calculate 1RMs in real-time, leverage progressive overload suggestions, and explore 1,500+
              exercises completely offline with IndexedDB.
            </p>

            <div className='flex flex-wrap items-center gap-4 pt-2'>
              <button
                type='button'
                onClick={() => {
                  if (!isActive) startWorkout('Full Body Strength');
                  navigate('/workout');
                }}
                className='bg-[#FF2625] hover:bg-[#e0201f] text-white px-7 py-3.5 rounded-lg font-bold text-base shadow-lg shadow-red-500/20 flex items-center gap-3 transition-colors cursor-pointer'
              >
                <Play className='w-5 h-5 fill-current' />
                {isActive ? 'Resume Active Workout' : 'Start Empty Workout'}
              </button>

              <Link
                to='/plans'
                className='bg-white/10 hover:bg-white/20 text-white border border-white/15 px-5 py-3.5 rounded-lg font-semibold text-base backdrop-blur-sm flex items-center gap-2 transition-colors cursor-pointer'
              >
                <Calendar className='w-4 h-4 text-red-400' />
                Routines
              </Link>

              <Link
                to='/calculators'
                className='bg-white/10 hover:bg-white/20 text-white border border-white/15 px-5 py-3.5 rounded-lg font-semibold text-base backdrop-blur-sm flex items-center gap-2 transition-colors cursor-pointer'
              >
                <Scale className='w-4 h-4 text-amber-300' />
                Calculators (BMI, TDEE, Pace...)
              </Link>
            </div>
          </div>

          {/* Right Column: Key Dashboard Metrics Box */}
          <div className='lg:col-span-5 grid grid-cols-2 gap-4'>
            <div className='bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-md hover:bg-white/10 transition-colors'>
              <div className='flex items-center justify-between text-gray-400 mb-3'>
                <span className='text-xs font-bold uppercase tracking-wider'>This Week</span>
                <Activity className='w-5 h-5 text-[#FF2625]' />
              </div>
              <p className='text-3xl sm:text-4xl font-black text-white'>
                {workoutsThisWeek} <span className='text-sm font-semibold text-gray-400'>sessions</span>
              </p>
              <p className='text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1'>
                <TrendingUp className='w-3.5 h-3.5' /> Consistent streak
              </p>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-md hover:bg-white/10 transition-colors'>
              <div className='flex items-center justify-between text-gray-400 mb-3'>
                <span className='text-xs font-bold uppercase tracking-wider'>Volume Lifted</span>
                <Zap className='w-5 h-5 text-amber-400' />
              </div>
              <p className='text-3xl sm:text-4xl font-black text-white'>
                {(totalVolumeLifted / 1000).toFixed(1)}k{' '}
                <span className='text-sm font-semibold text-gray-400'>{unit}</span>
              </p>
              <p className='text-xs text-gray-400 font-medium mt-2'>{totalSetsLogged} total sets</p>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-md hover:bg-white/10 transition-colors'>
              <div className='flex items-center justify-between text-gray-400 mb-3'>
                <span className='text-xs font-bold uppercase tracking-wider'>Body Weight</span>
                <Scale className='w-5 h-5 text-sky-400' />
              </div>
              <p className='text-3xl sm:text-4xl font-black text-white'>
                {latestWeight} <span className='text-sm font-semibold text-gray-400'>{unit}</span>
              </p>
              <Link to='/progress' className='text-xs text-sky-400 font-semibold mt-2 block hover:underline'>
                Log weight →
              </Link>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-md hover:bg-white/10 transition-colors'>
              <div className='flex items-center justify-between text-gray-400 mb-3'>
                <span className='text-xs font-bold uppercase tracking-wider'>PRs Set</span>
                <Award className='w-5 h-5 text-yellow-400' />
              </div>
              <p className='text-3xl sm:text-4xl font-black text-white'>
                {prs.length} <span className='text-sm font-semibold text-gray-400'>records</span>
              </p>
              <Link to='/progress' className='text-xs text-yellow-400 font-semibold mt-2 block hover:underline'>
                View trophies →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ROUTINE LAUNCHERS & PR SHOWCASE */}
      <section className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left: Quick Routine Templates */}
        <div className='lg:col-span-8 bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-gray-200/80 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2'>
                  <Sparkles className='w-6 h-6 text-[#FF2625]' />
                  Quick Workout Routines
                </h2>
                <p className='text-gray-500 text-sm mt-1'>
                  Launch proven training splits directly into your active tracker.
                </p>
              </div>
              <Link
                to='/plans'
                className='text-sm font-bold text-[#FF2625] hover:text-[#d41e1d] flex items-center gap-1 shrink-0'
              >
                All Routines <ArrowRight className='w-4 h-4' />
              </Link>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='p-5 rounded-lg bg-linear-to-b from-red-50/60 to-white border border-red-100 hover:shadow-xs transition-colors flex flex-col justify-between'>
                <div>
                  <span className='px-2.5 py-0.5 rounded bg-[#FF2625] text-white text-[11px] font-black uppercase tracking-wider'>
                    Push Day
                  </span>
                  <h3 className='font-bold text-lg text-gray-900 mt-3'>Chest & Shoulders</h3>
                  <p className='text-xs text-gray-500 mt-1'>Bench, OHP, Incline Dumbbell, Triceps</p>
                </div>
                <button
                  type='button'
                  onClick={() =>
                    handleStartRoutine('Push Workout', [
                      'barbell bench press',
                      'dumbbell shoulder press',
                      'triceps pushdown',
                    ])
                  }
                  className='mt-6 w-full py-2.5 bg-[#FF2625] hover:bg-[#e0201f] text-white font-bold text-sm rounded-md transition-colors cursor-pointer'
                >
                  Start Push
                </button>
              </div>

              <div className='p-5 rounded-lg bg-linear-to-b from-blue-50/60 to-white border border-blue-100 hover:shadow-xs transition-colors flex flex-col justify-between'>
                <div>
                  <span className='px-2.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider'>
                    Pull Day
                  </span>
                  <h3 className='font-bold text-lg text-gray-900 mt-3'>Back & Biceps</h3>
                  <p className='text-xs text-gray-500 mt-1'>Deadlift, Pull-ups, Rows, Curls</p>
                </div>
                <button
                  type='button'
                  onClick={() =>
                    handleStartRoutine('Pull Workout', ['barbell deadlift', 'pull-up', 'dumbbell bicep curl'])
                  }
                  className='mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-md transition-colors cursor-pointer'
                >
                  Start Pull
                </button>
              </div>

              <div className='p-5 rounded-lg bg-linear-to-b from-emerald-50/60 to-white border border-emerald-100 hover:shadow-xs transition-colors flex flex-col justify-between'>
                <div>
                  <span className='px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider'>
                    Leg Day
                  </span>
                  <h3 className='font-bold text-lg text-gray-900 mt-3'>Quads & Posterior</h3>
                  <p className='text-xs text-gray-500 mt-1'>Squats, RDL, Leg Press, Calves</p>
                </div>
                <button
                  type='button'
                  onClick={() =>
                    handleStartRoutine('Legs Workout', ['barbell squat', 'romanian deadlift', 'leg press'])
                  }
                  className='mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-md transition-colors cursor-pointer'
                >
                  Start Legs
                </button>
              </div>
            </div>
          </div>

          {/* Activity Mini Chart */}
          <div className='mt-8 pt-6 border-t border-gray-100'>
            <h4 className='text-sm font-bold uppercase tracking-wider text-gray-500 mb-3'>
              Weekly Volume Progression (hundreds of {unit})
            </h4>
            <div className='h-44 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                  <XAxis dataKey='day' stroke='#94a3b8' fontSize={12} tickLine={false} />
                  <YAxis stroke='#94a3b8' fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey='volume' fill='#FF2625' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Personal Records Trophy Showcase */}
        <div className='lg:col-span-4 bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-gray-200/80 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                <Award className='w-6 h-6 text-yellow-500' />
                Recent PRs
              </h2>
              <Link to='/progress' className='text-xs font-bold text-[#FF2625] hover:underline'>
                View All
              </Link>
            </div>

            {prs.length === 0 ? (
              <div className='text-center py-10 bg-gray-50 rounded-lg p-4'>
                <Award className='w-10 h-10 text-gray-300 mx-auto mb-2' />
                <p className='text-gray-600 font-semibold text-sm'>No PRs recorded yet</p>
                <p className='text-gray-400 text-xs mt-1'>Complete your first workout to log records!</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {prs.map((pr) => (
                  <div
                    key={pr.id}
                    className='p-4 rounded-lg bg-gray-50 hover:bg-[#FFF3F4] border border-gray-100 transition-colors flex items-center justify-between'
                  >
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm capitalize'>{pr.exerciseName}</h4>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {pr.weight} {unit} × {pr.reps} reps
                      </p>
                    </div>
                    <div className='text-right'>
                      <span className='text-xs uppercase font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded'>
                        1RM: {pr.estimated1RM} {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='mt-8 p-4 rounded-lg bg-linear-to-r from-gray-900 to-gray-800 text-white'>
            <h4 className='font-bold text-sm text-amber-300 flex items-center gap-1.5'>
              <Zap className='w-4 h-4 text-amber-400' /> Overload Tip
            </h4>
            <p className='text-xs text-gray-300 mt-1 leading-relaxed'>
              Target 1 additional rep each week or +2.5{unit} once you can hit 12 reps with strict form.
            </p>
          </div>
        </div>
      </section>

      {/* 3. EXERCISE EXPLORER & CATEGORIES (POWERED BY EXERCISEDB OSS API) */}
      <section className='bg-white rounded-xl p-6 sm:p-10 shadow-xs border border-gray-200/80'>
        <SearchExercises bodyPart={bodyPart} setBodyPart={setBodyPart} onSearch={setSearch} />
        <Exercises bodyPart={bodyPart} search={search} />
      </section>
    </div>
  );
};

export default Home;
