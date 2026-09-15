import React, { useState, useEffect } from 'react';
import { db, DbBodyMeasurement, DbPersonalRecord, DbWorkoutSet } from '../db/database';
import { useWorkout } from '../context/WorkoutContext';
import {
  TrendingUp,
  Award,
  Scale,
  Plus,
  Calendar,
  X,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDate } from '../utils/calculations';

const Progress: React.FC = () => {
  const { unit } = useWorkout();
  const [measurements, setMeasurements] = useState<DbBodyMeasurement[]>([]);
  const [prs, setPrs] = useState<DbPersonalRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('Barbell Bench Press');
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [strengthProgression, setStrengthProgression] = useState<any[]>([]);

  // Modal State
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(75);
  const [newChest, setNewChest] = useState<number>(100);
  const [newWaist, setNewWaist] = useState<number>(82);
  const [newArms, setNewArms] = useState<number>(37);

  const loadData = async () => {
    const list = await db.bodyMeasurements.orderBy('date').toArray();
    setMeasurements(list);

    const personalRecords = await db.personalRecords.toArray();
    setPrs(personalRecords);

    // Get unique exercise names from sets
    const sets = await db.workoutSets.toArray();
    const uniqueExercises = Array.from(new Set(sets.map((s) => s.exerciseName))).filter(Boolean);
    setExerciseOptions(uniqueExercises);
    if (uniqueExercises.length > 0 && !uniqueExercises.includes(selectedExercise)) {
      setSelectedExercise(uniqueExercises[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute strength progression for selected exercise
  useEffect(() => {
    const fetchExerciseHistory = async () => {
      if (!selectedExercise) return;
      const sets = await db.workoutSets
        .where('exerciseName')
        .equals(selectedExercise)
        .sortBy('date');

      // Group by date, get max weight
      const dateMap: { [dateStr: string]: { weight: number; reps: number } } = {};
      sets.forEach((s) => {
        const dateKey = s.date.split('T')[0];
        if (!dateMap[dateKey] || s.weight > dateMap[dateKey].weight) {
          dateMap[dateKey] = { weight: s.weight, reps: s.reps };
        }
      });

      const progData = Object.entries(dateMap).map(([d, val]) => ({
        date: formatDate(d),
        weight: val.weight,
        reps: val.reps,
      }));
      setStrengthProgression(progData);
    };

    fetchExerciseHistory();
  }, [selectedExercise]);

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DbBodyMeasurement = {
      id: `bm_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: Number(newWeight),
      chest: Number(newChest) || undefined,
      waist: Number(newWaist) || undefined,
      arms: Number(newArms) || undefined,
    };
    await db.bodyMeasurements.add(newEntry);
    setLogModalOpen(false);
    loadData();
  };

  const weightChartData = measurements.map((m) => ({
    date: formatDate(m.date),
    weight: m.weight,
  }));

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2625] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Analytics & Goals
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">Progress Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track weight trends, body measurements, and 1RM strength progression.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLogModalOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Scale className="w-4 h-4 text-[#FF2625]" /> Log Body Stats
        </button>
      </div>

      {/* 1. BODY WEIGHT PROGRESSION CHART */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#FF2625]" />
              Body Weight Trend ({unit})
            </h2>
            <p className="text-xs text-gray-500">Historical weigh-ins</p>
          </div>
          {measurements.length > 0 && (
            <span className="text-2xl font-black text-gray-900">
              {measurements[measurements.length - 1]?.weight} {unit}
            </span>
          )}
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF2625"
                strokeWidth={3}
                dot={{ fill: '#FF2625', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. STRENGTH PROGRESSION CHART PER EXERCISE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#FF2625]" />
              Strength Progression Over Time
            </h2>
            <p className="text-xs text-gray-500">Max load lifted per session</p>
          </div>

          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 capitalize"
          >
            {exerciseOptions.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        <div className="h-64 w-full pt-4">
          {strengthProgression.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-semibold text-sm">
              Log workouts with {selectedExercise} to populate progression charts!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthProgression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name={`Weight (${unit})`}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. PERSONAL RECORDS TROPHY ROOM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Personal Records (PR) Wall
        </h2>

        {prs.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No personal records registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {prs.map((pr) => (
              <div
                key={pr.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50/70 via-white to-amber-50/40 border border-amber-200/60 shadow-xs space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {formatDate(pr.date)}
                  </span>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <h4 className="font-black text-gray-900 text-base capitalize pt-1">{pr.exerciseName}</h4>
                <p className="text-2xl font-black text-gray-950">
                  {pr.weight} {unit}{' '}
                  <span className="text-xs font-semibold text-gray-500">× {pr.reps} reps</span>
                </p>
                <p className="text-xs font-bold text-amber-700 pt-1 border-t border-amber-100">
                  Estimated 1RM: {pr.estimated1RM} {unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOG MEASUREMENTS MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Log Body Measurements</h3>
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Body Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#FF2625]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Arms (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArms}
                    onChange={(e) => setNewArms(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF2625] hover:bg-[#e0201f] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
