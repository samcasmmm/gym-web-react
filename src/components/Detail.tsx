import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { db, DbPersonalRecord, DbWorkoutSet } from '../db/database';
import { Exercise } from '../api/exerciseApi';
import { calculate1RM, formatDate } from '../utils/calculations';
import {
  Dumbbell,
  Shield,
  Zap,
  Flame,
  Plus,
  Check,
  Award,
  Play,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Calculator,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import BodyPartImg from '../assets/icons/body-part.png';
import TargetImg from '../assets/icons/target.png';
import EquipmentImg from '../assets/icons/equipment.png';

interface DetailProps {
  exerciseDetail: Exercise;
}

const Detail: React.FC<DetailProps> = ({ exerciseDetail }) => {
  const navigate = useNavigate();
  const { addExerciseToWorkout, startWorkout, isActive, unit } = useWorkout();
  const [added, setAdded] = useState(false);

  // 1RM calculator state
  const [calcWeight, setCalcWeight] = useState<number>(60);
  const [calcReps, setCalcReps] = useState<number>(10);

  // User History & PR from IndexedDB
  const [personalRecord, setPersonalRecord] = useState<DbPersonalRecord | null>(null);
  const [historySets, setHistorySets] = useState<DbWorkoutSet[]>([]);

  const {
    bodyPart = 'general',
    gifUrl,
    name = '',
    target = 'muscle',
    equipment = 'body weight',
    instructions = [],
    secondaryMuscles = [],
  } = exerciseDetail;

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!name) return;
      const pr = await db.personalRecords.where('exerciseName').equalsIgnoreCase(name).first();
      if (pr) setPersonalRecord(pr);

      const sets = await db.workoutSets.where('exerciseName').equalsIgnoreCase(name).toArray();
      setHistorySets(sets);
    };
    fetchUserHistory();
  }, [name]);

  const handleQuickAdd = () => {
    addExerciseToWorkout(exerciseDetail);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleStartWorkoutWithThis = () => {
    if (!isActive) {
      startWorkout(`${name.charAt(0).toUpperCase() + name.slice(1)} Session`, [exerciseDetail]);
    } else {
      addExerciseToWorkout(exerciseDetail);
    }
    navigate('/workout');
  };

  const estimated1RM = calculate1RM(calcWeight, calcReps);

  // Infer movement pattern and difficulty
  const isCompound =
    equipment.toLowerCase().includes('barbell') ||
    equipment.toLowerCase().includes('body weight') ||
    ['pectorals', 'latissimus dorsi', 'quadriceps', 'glutes', 'hamstrings'].includes(target.toLowerCase());

  const movementPattern = target.toLowerCase().includes('chest') || target.toLowerCase().includes('triceps') || target.toLowerCase().includes('shoulder')
    ? 'Push Pattern'
    : target.toLowerCase().includes('back') || target.toLowerCase().includes('biceps') || target.toLowerCase().includes('lats')
    ? 'Pull Pattern'
    : target.toLowerCase().includes('quad') || target.toLowerCase().includes('glute') || target.toLowerCase().includes('calves')
    ? 'Legs / Knee & Hip Dominant'
    : 'Core & Stabilizer';

  return (
    <div className='flex flex-col gap-8 my-6'>
      {/* 1. HERO SHOWCASE CARD */}
      <section className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-6 sm:p-8 bg-white rounded-xl shadow-xs border border-gray-200/80'>
        {/* Animated GIF Canvas */}
        <div className='w-full lg:w-5/12 flex flex-col items-center justify-center bg-gray-50/70 rounded-lg p-4 sm:p-6 border border-gray-100 relative'>
          <div className='absolute top-3 left-3 z-10'>
            <span className='bg-gray-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm flex items-center gap-1.5'>
              <Flame className='w-3 h-3 text-[#FF2625]' />
              {bodyPart}
            </span>
          </div>

          <div className='w-full h-[320px] sm:h-[380px] flex items-center justify-center overflow-hidden'>
            {gifUrl ? (
              <img
                src={gifUrl}
                alt={name}
                loading='lazy'
                className='h-full w-full object-contain mix-blend-multiply drop-shadow-sm'
              />
            ) : (
              <Dumbbell className='w-20 h-20 text-gray-300' />
            )}
          </div>

          <div className='w-full pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500 font-medium'>
            <span>Animation speed: 1.0x</span>
            <span className='text-emerald-600 font-bold flex items-center gap-1'>
              <Activity className='w-3.5 h-3.5' /> Verified Form
            </span>
          </div>
        </div>

        {/* Overview & Quick Actions */}
        <div className='w-full lg:w-7/12 flex flex-col gap-5'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <span className='px-2.5 py-0.5 rounded-sm bg-red-50 border border-red-200/60 text-[#FF2625] text-xs font-bold uppercase tracking-wider'>
                {isCompound ? 'Compound Lift' : 'Isolation Movement'}
              </span>
              <span className='px-2.5 py-0.5 rounded-sm bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider'>
                {movementPattern}
              </span>
            </div>

            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black capitalize text-gray-950 leading-tight'>
              {name}
            </h1>

            <p className='text-gray-600 text-sm sm:text-base leading-relaxed mt-3'>
              Master the execution and biomechanics of <strong className='text-gray-900 capitalize'>{name}</strong>. Highly
              effective for activating the <span className='text-[#FF2625] font-bold capitalize'>{target}</span> and
              building functional muscular strength.
            </p>
          </div>

          {/* Key Attributes Pills */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='p-3 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center gap-3'>
              <div className='w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center shrink-0 text-amber-600'>
                <img src={TargetImg} alt={target} className='w-5 h-5 object-contain' />
              </div>
              <div className='overflow-hidden'>
                <p className='text-[10px] uppercase font-bold text-gray-400'>Primary Muscle</p>
                <p className='text-sm font-bold capitalize text-gray-900 truncate'>{target}</p>
              </div>
            </div>

            <div className='p-3 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center gap-3'>
              <div className='w-10 h-10 rounded-md bg-red-50 flex items-center justify-center shrink-0 text-[#FF2625]'>
                <img src={BodyPartImg} alt={bodyPart} className='w-5 h-5 object-contain' />
              </div>
              <div className='overflow-hidden'>
                <p className='text-[10px] uppercase font-bold text-gray-400'>Body Section</p>
                <p className='text-sm font-bold capitalize text-gray-900 truncate'>{bodyPart}</p>
              </div>
            </div>

            <div className='p-3 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center gap-3'>
              <div className='w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center shrink-0 text-blue-600'>
                <img src={EquipmentImg} alt={equipment} className='w-5 h-5 object-contain' />
              </div>
              <div className='overflow-hidden'>
                <p className='text-[10px] uppercase font-bold text-gray-400'>Equipment</p>
                <p className='text-sm font-bold capitalize text-gray-900 truncate'>{equipment}</p>
              </div>
            </div>
          </div>

          {/* Secondary Muscle Activations */}
          {secondaryMuscles && secondaryMuscles.length > 0 && (
            <div className='pt-1'>
              <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2'>
                Secondary & Synergist Muscles:
              </span>
              <div className='flex flex-wrap gap-1.5'>
                {secondaryMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className='bg-red-50/60 border border-red-100 text-[#FF2625] text-xs font-semibold px-2.5 py-1 rounded-sm capitalize'
                  >
                    + {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className='flex flex-wrap items-center gap-3 pt-2'>
            <button
              type='button'
              onClick={handleStartWorkoutWithThis}
              className='bg-[#FF2625] hover:bg-[#e0201f] text-white px-6 py-3 rounded-md font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer'
            >
              <Play className='w-4 h-4 fill-current' />
              {isActive ? 'Add & Resume Workout' : 'Start Workout with This'}
            </button>

            <button
              type='button'
              onClick={handleQuickAdd}
              className={`px-5 py-3 rounded-md font-bold text-sm border transition-colors cursor-pointer flex items-center gap-2 ${
                added
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {added ? <Check className='w-4 h-4 stroke-[3]' /> : <Plus className='w-4 h-4' />}
              {added ? 'Added to Workout!' : 'Add to Active Session'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SCIENCE-BASED TRAINING PROTOCOLS & GOALS */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='px-2.5 py-0.5 rounded-sm bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider'>
              Hypertrophy
            </span>
            <Sparkles className='w-4 h-4 text-purple-600' />
          </div>
          <h3 className='text-lg font-black text-gray-900'>Muscle Growth</h3>
          <ul className='text-xs space-y-1.5 text-gray-600 font-medium'>
            <li>• <strong>Sets & Reps:</strong> 3–4 Sets × 8–12 Reps</li>
            <li>• <strong>Intensity:</strong> 70–80% 1RM (1–2 RIR)</li>
            <li>• <strong>Rest Interval:</strong> 60–90 seconds</li>
            <li>• <strong>Tempo:</strong> 2s Eccentric / 1s Pause / 1s Drive</li>
          </ul>
        </div>

        <div className='bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='px-2.5 py-0.5 rounded-sm bg-red-50 text-[#FF2625] text-xs font-bold uppercase tracking-wider'>
              Strength
            </span>
            <Zap className='w-4 h-4 text-[#FF2625]' />
          </div>
          <h3 className='text-lg font-black text-gray-900'>Max Strength & Power</h3>
          <ul className='text-xs space-y-1.5 text-gray-600 font-medium'>
            <li>• <strong>Sets & Reps:</strong> 4–5 Sets × 3–6 Reps</li>
            <li>• <strong>Intensity:</strong> 82–90% 1RM (Heavy Load)</li>
            <li>• <strong>Rest Interval:</strong> 2.5–3 minutes</li>
            <li>• <strong>Focus:</strong> Explosive concentric drive</li>
          </ul>
        </div>

        <div className='bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='px-2.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider'>
              Endurance
            </span>
            <Activity className='w-4 h-4 text-emerald-600' />
          </div>
          <h3 className='text-lg font-black text-gray-900'>Muscular Endurance</h3>
          <ul className='text-xs space-y-1.5 text-gray-600 font-medium'>
            <li>• <strong>Sets & Reps:</strong> 2–3 Sets × 15–20 Reps</li>
            <li>• <strong>Intensity:</strong> 50–65% 1RM (High Volume)</li>
            <li>• <strong>Rest Interval:</strong> 30–45 seconds</li>
            <li>• <strong>Focus:</strong> Continuous tension & lactate threshold</li>
          </ul>
        </div>
      </section>

      {/* 3. STEP-BY-STEP INSTRUCTIONS & TECHNIQUE CHECKLIST */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Instructions */}
        <section className='lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-4'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2'>
              <Shield className='w-5 h-5 text-[#FF2625]' />
              Step-by-Step Instructions
            </h2>
            <span className='text-xs font-bold text-gray-400'>
              {instructions.length} {instructions.length === 1 ? 'Step' : 'Steps'}
            </span>
          </div>

          {instructions && instructions.length > 0 ? (
            <div className='space-y-3'>
              {instructions.map((step, index) => (
                <div key={index} className='flex items-start gap-3.5 p-3.5 rounded-lg bg-gray-50 border border-gray-100'>
                  <span className='flex items-center justify-center w-6 h-6 rounded-md bg-[#FF2625] text-white font-bold text-xs shrink-0 mt-0.5'>
                    {index + 1}
                  </span>
                  <p className='text-gray-700 text-sm sm:text-base leading-relaxed font-medium'>
                    {step.replace(/^Step:\s*\d+\s*/i, '')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-500 text-sm'>No specific text cues recorded for this movement.</p>
          )}

          {/* Biomechanical Cues */}
          <div className='pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
            <div className='p-3 rounded-md bg-blue-50/70 border border-blue-100 text-blue-900'>
              <strong className='font-bold block mb-1'>💨 Breathing Rhythm:</strong>
              Inhale and brace core on the lowering phase (eccentric); exhale forcefully through sticking point.
            </div>
            <div className='p-3 rounded-md bg-amber-50/70 border border-amber-100 text-amber-900'>
              <strong className='font-bold block mb-1'>⚖️ Range of Motion:</strong>
              Perform full muscle contraction with a 1-second squeeze at the peak; avoid bouncing at bottom.
            </div>
          </div>
        </section>

        {/* Right: Personal Record / History & 1RM Calculator */}
        <section className='lg:col-span-5 space-y-6'>
          {/* User's PR & Historical Stats for this exercise */}
          <div className='bg-white rounded-xl p-6 shadow-xs border border-gray-200/80 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                <Award className='w-5 h-5 text-yellow-500' />
                Your History for this Exercise
              </h3>
              <span className='text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-sm'>
                IndexedDB
              </span>
            </div>

            {personalRecord ? (
              <div className='p-4 rounded-lg bg-linear-to-r from-yellow-50/60 to-amber-50/40 border border-amber-200/80 space-y-1.5'>
                <span className='text-[10px] font-bold uppercase text-amber-700'>Current PR</span>
                <p className='text-2xl font-black text-gray-950'>
                  {personalRecord.weight} {unit}{' '}
                  <span className='text-xs font-semibold text-gray-500'>× {personalRecord.reps} reps</span>
                </p>
                <div className='flex items-center justify-between text-xs text-amber-800 pt-1 border-t border-amber-200/50'>
                  <span>Est 1RM: <strong>{personalRecord.estimated1RM} {unit}</strong></span>
                  <span>{formatDate(personalRecord.date)}</span>
                </div>
              </div>
            ) : (
              <div className='p-4 rounded-lg bg-gray-50 border border-gray-100 text-center text-xs text-gray-500'>
                No PR logged yet for this exercise. Complete a set in Active Workout to set your benchmark!
              </div>
            )}

            <div className='text-xs text-gray-500 flex items-center justify-between pt-1'>
              <span>Total sets recorded: <strong>{historySets.length}</strong></span>
              <button
                type='button'
                onClick={() => navigate('/history')}
                className='text-[#FF2625] font-bold hover:underline'
              >
                View History →
              </button>
            </div>
          </div>

          {/* Quick 1RM Calculator for this exercise */}
          <div className='bg-white rounded-xl p-6 shadow-xs border border-gray-200/80 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                <Calculator className='w-5 h-5 text-[#FF2625]' />
                1RM & Load Calculator
              </h3>
              <span className='text-xs font-mono font-bold text-[#FF2625]'>
                1RM ≈ {estimated1RM} {unit}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-[11px] font-bold uppercase text-gray-500 mb-1'>
                  Weight ({unit})
                </label>
                <input
                  type='number'
                  min='0'
                  step='2.5'
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className='w-full px-3 py-1.5 rounded-md border border-gray-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2625]'
                />
              </div>

              <div>
                <label className='block text-[11px] font-bold uppercase text-gray-500 mb-1'>
                  Reps Performed
                </label>
                <input
                  type='number'
                  min='1'
                  max='30'
                  value={calcReps}
                  onChange={(e) => setCalcReps(Number(e.target.value))}
                  className='w-full px-3 py-1.5 rounded-md border border-gray-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2625]'
                />
              </div>
            </div>

            {/* Target Percentage Grid */}
            <div className='grid grid-cols-4 gap-1.5 pt-2 text-center text-xs'>
              <div className='p-2 rounded-md bg-gray-50 border border-gray-100'>
                <span className='text-[10px] font-bold text-gray-400 block'>100% 1RM</span>
                <span className='font-bold text-gray-900'>{estimated1RM}</span>
              </div>
              <div className='p-2 rounded-md bg-gray-50 border border-gray-100'>
                <span className='text-[10px] font-bold text-gray-400 block'>85% 5RM</span>
                <span className='font-bold text-gray-900'>{Math.round(estimated1RM * 0.85)}</span>
              </div>
              <div className='p-2 rounded-md bg-gray-50 border border-gray-100'>
                <span className='text-[10px] font-bold text-gray-400 block'>75% 10RM</span>
                <span className='font-bold text-gray-900'>{Math.round(estimated1RM * 0.75)}</span>
              </div>
              <div className='p-2 rounded-md bg-gray-50 border border-gray-100'>
                <span className='text-[10px] font-bold text-gray-400 block'>65% 15RM</span>
                <span className='font-bold text-gray-900'>{Math.round(estimated1RM * 0.65)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. COMMON MISTAKES & PRO FORM TIPS */}
      <section className='bg-linear-to-r from-red-50/50 via-white to-amber-50/40 rounded-xl p-6 sm:p-8 shadow-xs border border-red-100/80 space-y-4'>
        <h3 className='text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2'>
          <AlertCircle className='w-5 h-5 text-[#FF2625]' />
          Critical Form Tips & Common Pitfalls
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-700'>
          <div className='p-4 rounded-lg bg-white border border-gray-200/80 space-y-1 shadow-xs'>
            <h4 className='font-bold text-gray-900 flex items-center gap-1.5'>
              <span className='text-red-500'>✗</span> Avoid Joint Overextension
            </h4>
            <p className='text-gray-600 text-xs leading-relaxed'>
              Do not lock out elbows or knees aggressively under load. Maintain slight micro-bend to keep continuous
              muscular tension.
            </p>
          </div>

          <div className='p-4 rounded-lg bg-white border border-gray-200/80 space-y-1 shadow-xs'>
            <h4 className='font-bold text-gray-900 flex items-center gap-1.5'>
              <span className='text-red-500'>✗</span> Cheating with Momentum
            </h4>
            <p className='text-gray-600 text-xs leading-relaxed'>
              Eliminate swinging or body sway. If you cannot hold the eccentric phase for at least 2 seconds, reduce the
              load.
            </p>
          </div>

          <div className='p-4 rounded-lg bg-white border border-gray-200/80 space-y-1 shadow-xs'>
            <h4 className='font-bold text-gray-900 flex items-center gap-1.5'>
              <span className='text-emerald-500'>✓</span> Progressive Overload Rule
            </h4>
            <p className='text-gray-600 text-xs leading-relaxed'>
              Aim to add 1 clean repetition each workout session before adding weight plates to avoid premature plateaus.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Detail;
