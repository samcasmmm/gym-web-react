import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Share2,
  Apple,
  Dumbbell,
  Droplets,
  Award,
  ChevronRight,
  RefreshCw,
  Info,
  Clock,
  ArrowUpRight,
  Minus,
  Plus,
  Compass,
} from 'lucide-react';

export type CalculatorTab =
  | 'bmi'
  | 'calorie'
  | 'bodyfat'
  | 'bmr'
  | 'idealweight'
  | 'onerm'
  | 'hydration'
  | 'pace'
  | 'pregnancy'
  | 'conception'
  | 'duedate';

interface CategoryGroup {
  name: string;
  tabs: { id: CalculatorTab; name: string; icon: React.ElementType; tag: string; desc: string }[];
}

const Calculators: React.FC = () => {
  const { unit } = useWorkout();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('bmi');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(unit === 'lbs' ? 'imperial' : 'metric');
  const [savedMessage, setSavedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------
  // GLOBAL AUTO-SYNC FROM DATABASE
  // ----------------------------------------------------
  const handleLoadFromProfile = async () => {
    try {
      const latest = await db.bodyMeasurements.orderBy('date').last();
      if (latest?.weight) {
        if (unitSystem === 'metric') {
          setBmiWeightKg(latest.weight);
          setCalWeightKg(latest.weight);
          setBfWeightKg(latest.weight);
          setBmrWeightKg(latest.weight);
          setHydrationWeightKg(latest.weight);
        } else {
          const lbs = Math.round(latest.weight * 2.20462);
          setBmiWeightLbs(lbs);
        }
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

  // ----------------------------------------------------
  // 1. BMI CALCULATOR STATE & LOGIC
  // ----------------------------------------------------
  const [bmiAge, setBmiAge] = useState<number>(25);
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');
  const [bmiHeightCm, setBmiHeightCm] = useState<number>(178);
  const [bmiHeightFt, setBmiHeightFt] = useState<number>(5);
  const [bmiHeightIn, setBmiHeightIn] = useState<number>(10);
  const [bmiWeightKg, setBmiWeightKg] = useState<number>(75);
  const [bmiWeightLbs, setBmiWeightLbs] = useState<number>(165);

  const calculateBMI = () => {
    let heightM = bmiHeightCm / 100;
    let weightKg = bmiWeightKg;
    if (unitSystem === 'imperial') {
      const totalInches = bmiHeightFt * 12 + bmiHeightIn;
      heightM = totalInches * 0.0254;
      weightKg = bmiWeightLbs * 0.453592;
    }
    if (heightM <= 0) return { bmi: 0, category: 'Unknown', prime: 0, minHealthyKg: 0, maxHealthyKg: 0, color: '', deltaKg: 0, pct: 0 };
    const bmiVal = weightKg / (heightM * heightM);
    const primeVal = bmiVal / 25;
    const minHealthy = 18.5 * (heightM * heightM);
    const maxHealthy = 24.9 * (heightM * heightM);

    let cat = 'Normal Weight';
    let color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
    let gaugePct = ((bmiVal - 15) / (40 - 15)) * 100;
    gaugePct = Math.max(0, Math.min(100, gaugePct));

    let deltaKg = 0;
    if (bmiVal < 18.5) {
      cat = 'Underweight';
      color = 'text-sky-500 bg-sky-50 border-sky-200';
      deltaKg = Number((minHealthy - weightKg).toFixed(1));
    } else if (bmiVal >= 25 && bmiVal < 30) {
      cat = 'Overweight';
      color = 'text-amber-500 bg-amber-50 border-amber-200';
      deltaKg = Number((weightKg - maxHealthy).toFixed(1));
    } else if (bmiVal >= 30) {
      cat = 'Obese';
      color = 'text-red-500 bg-red-50 border-red-200';
      deltaKg = Number((weightKg - maxHealthy).toFixed(1));
    }

    return {
      bmi: Number(bmiVal.toFixed(1)),
      category: cat,
      color,
      prime: Number(primeVal.toFixed(2)),
      minHealthyKg: Number((unitSystem === 'metric' ? minHealthy : minHealthy * 2.20462).toFixed(1)),
      maxHealthyKg: Number((unitSystem === 'metric' ? maxHealthy : maxHealthy * 2.20462).toFixed(1)),
      deltaKg: Number((unitSystem === 'metric' ? deltaKg : deltaKg * 2.20462).toFixed(1)),
      pct: gaugePct,
    };
  };

  // ----------------------------------------------------
  // 2. CALORIE & TDEE CALCULATOR
  // ----------------------------------------------------
  const [calAge, setCalAge] = useState<number>(26);
  const [calGender, setCalGender] = useState<'male' | 'female'>('male');
  const [calHeightCm, setCalHeightCm] = useState<number>(178);
  const [calWeightKg, setCalWeightKg] = useState<number>(76);
  const [calActivity, setCalActivity] = useState<number>(1.55);
  const [macroPreset, setMacroPreset] = useState<'balanced' | 'highprotein' | 'keto' | 'endurance'>('highprotein');
  const [targetGoal, setTargetGoal] = useState<'maintain' | 'cut500' | 'cut250' | 'bulk300' | 'bulk500'>('cut500');

  const calculateCalories = () => {
    let bmr = 10 * calWeightKg + 6.25 * calHeightCm - 5 * calAge;
    bmr += calGender === 'male' ? 5 : -161;
    const tdee = Math.round(bmr * calActivity);

    let goalDelta = 0;
    if (targetGoal === 'cut500') goalDelta = -500;
    if (targetGoal === 'cut250') goalDelta = -250;
    if (targetGoal === 'bulk300') goalDelta = 300;
    if (targetGoal === 'bulk500') goalDelta = 500;

    const targetCal = Math.max(1200, tdee + goalDelta);

    // Energy distribution components
    const bmrPortion = Math.round(bmr);
    const tefPortion = Math.round(targetCal * 0.1); // Thermic Effect of Food
    const neatPortion = Math.round((tdee - bmr) * 0.4);
    const eatPortion = Math.round((tdee - bmr) * 0.6);

    // Macro Ratios
    let pRatio = 0.35;
    let cRatio = 0.40;
    let fRatio = 0.25;

    if (macroPreset === 'balanced') {
      pRatio = 0.30;
      cRatio = 0.40;
      fRatio = 0.30;
    } else if (macroPreset === 'highprotein') {
      pRatio = 0.40;
      cRatio = 0.35;
      fRatio = 0.25;
    } else if (macroPreset === 'keto') {
      pRatio = 0.25;
      cRatio = 0.05;
      fRatio = 0.70;
    } else if (macroPreset === 'endurance') {
      pRatio = 0.20;
      cRatio = 0.60;
      fRatio = 0.20;
    }

    const proteinCals = targetCal * pRatio;
    const fatCals = targetCal * fRatio;
    const carbCals = targetCal * cRatio;

    const proteinGrams = Math.round(proteinCals / 4);
    const fatGrams = Math.round(fatCals / 9);
    const carbGrams = Math.round(carbCals / 4);

    // Weight shift timeline estimation (e.g. 1kg fat ~= 7700 kcal)
    const weeklyKgChange = Number(((goalDelta * 7) / 7700).toFixed(2));
    const weeklyLbsChange = Number((weeklyKgChange * 2.20462).toFixed(2));

    return {
      bmr,
      tdee,
      targetCal,
      goalDelta,
      bmrPortion,
      tefPortion,
      neatPortion,
      eatPortion,
      proteinGrams,
      fatGrams,
      carbGrams,
      pRatio: Math.round(pRatio * 100),
      cRatio: Math.round(cRatio * 100),
      fRatio: Math.round(fRatio * 100),
      weeklyKgChange,
      weeklyLbsChange,
    };
  };

  // ----------------------------------------------------
  // 3. BODY FAT CALCULATOR (US Navy Standard)
  // ----------------------------------------------------
  const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
  const [bfHeightCm, setBfHeightCm] = useState<number>(178);
  const [bfWeightKg, setBfWeightKg] = useState<number>(76);
  const [bfNeckCm, setBfNeckCm] = useState<number>(38);
  const [bfWaistCm, setBfWaistCm] = useState<number>(84);
  const [bfHipCm, setBfHipCm] = useState<number>(95);

  const calculateBodyFat = () => {
    let bfPercent = 0;
    if (bfGender === 'male') {
      const waistDiff = Math.max(1, bfWaistCm - bfNeckCm);
      const val = 1.0324 - 0.19077 * Math.log10(waistDiff) + 0.15456 * Math.log10(bfHeightCm);
      bfPercent = val > 0 ? 495 / val - 450 : 15;
    } else {
      const waistHipDiff = Math.max(1, bfWaistCm + bfHipCm - bfNeckCm);
      const val = 1.29579 - 0.35004 * Math.log10(waistHipDiff) + 0.221 * Math.log10(bfHeightCm);
      bfPercent = val > 0 ? 495 / val - 450 : 22;
    }
    const clampedBf = Math.max(3, Math.min(55, Number(bfPercent.toFixed(1))));
    const fatMass = Number(((bfWeightKg * clampedBf) / 100).toFixed(1));
    const leanMass = Number((bfWeightKg - fatMass).toFixed(1));

    let cat = 'Fitness';
    let color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (bfGender === 'male') {
      if (clampedBf < 6) cat = 'Essential Fat';
      else if (clampedBf <= 13) cat = 'Athletic (Six-Pack)';
      else if (clampedBf <= 17) cat = 'Fitness (Defined)';
      else if (clampedBf <= 24) cat = 'Average Health';
      else {
        cat = 'Elevated Fat';
        color = 'text-red-500 bg-red-50 border-red-200';
      }
    } else {
      if (clampedBf < 14) cat = 'Essential Fat';
      else if (clampedBf <= 20) cat = 'Athletic (Tone)';
      else if (clampedBf <= 24) cat = 'Fitness (Defined)';
      else if (clampedBf <= 31) cat = 'Average Health';
      else {
        cat = 'Elevated Fat';
        color = 'text-red-500 bg-red-50 border-red-200';
      }
    }

    return { bodyFat: clampedBf, fatMass, leanMass, category: cat, color };
  };

  // ----------------------------------------------------
  // 4. BMR MULTI-FORMULA CALCULATOR
  // ----------------------------------------------------
  const [bmrAge, setBmrAge] = useState<number>(25);
  const [bmrGender, setBmrGender] = useState<'male' | 'female'>('male');
  const [bmrHeightCm, setBmrHeightCm] = useState<number>(178);
  const [bmrWeightKg, setBmrWeightKg] = useState<number>(75);

  const calculateBMRs = () => {
    let mifflin = 10 * bmrWeightKg + 6.25 * bmrHeightCm - 5 * bmrAge;
    mifflin += bmrGender === 'male' ? 5 : -161;

    let harris =
      bmrGender === 'male'
        ? 13.397 * bmrWeightKg + 4.799 * bmrHeightCm - 5.677 * bmrAge + 88.362
        : 9.247 * bmrWeightKg + 3.098 * bmrHeightCm - 4.33 * bmrAge + 447.593;

    const lbm = bmrWeightKg * 0.85;
    const katch = 370 + 21.6 * lbm;

    const hourlySleeping = Math.round((mifflin / 24) * 0.9);
    const hourlyDesk = Math.round((mifflin / 24) * 1.2);
    const hourlyWalking = Math.round((mifflin / 24) * 2.5);
    const hourlyGym = Math.round((mifflin / 24) * 5.2);

    return {
      mifflin: Math.round(mifflin),
      harris: Math.round(harris),
      katch: Math.round(katch),
      hourlySleeping,
      hourlyDesk,
      hourlyWalking,
      hourlyGym,
    };
  };

  // ----------------------------------------------------
  // 5. IDEAL WEIGHT CALCULATOR (MULTI-CLINICAL FORMULAS)
  // ----------------------------------------------------
  const [iwGender, setIwGender] = useState<'male' | 'female'>('male');
  const [iwHeightCm, setIwHeightCm] = useState<number>(178);

  const calculateIdealWeight = () => {
    const inchesOver5Ft = Math.max(0, iwHeightCm / 2.54 - 60);
    let robinson = 0;
    let miller = 0;
    let devine = 0;
    let hamwi = 0;

    if (iwGender === 'male') {
      robinson = 52 + 1.9 * inchesOver5Ft;
      miller = 56.2 + 1.41 * inchesOver5Ft;
      devine = 50 + 2.3 * inchesOver5Ft;
      hamwi = 48 + 2.7 * inchesOver5Ft;
    } else {
      robinson = 49 + 1.7 * inchesOver5Ft;
      miller = 53.1 + 1.36 * inchesOver5Ft;
      devine = 45.5 + 2.3 * inchesOver5Ft;
      hamwi = 45.5 + 2.2 * inchesOver5Ft;
    }

    const heightM = iwHeightCm / 100;
    const healthyBmiMin = 18.5 * heightM * heightM;
    const healthyBmiMax = 24.9 * heightM * heightM;
    const avgIdeal = (robinson + miller + devine + hamwi) / 4;

    return {
      robinson: Number(robinson.toFixed(1)),
      miller: Number(miller.toFixed(1)),
      devine: Number(devine.toFixed(1)),
      hamwi: Number(hamwi.toFixed(1)),
      bmiMin: Number(healthyBmiMin.toFixed(1)),
      bmiMax: Number(healthyBmiMax.toFixed(1)),
      avgIdeal: Number(avgIdeal.toFixed(1)),
    };
  };

  // ----------------------------------------------------
  // 6. ONE-REP MAX (1RM) & STRENGTH LOAD MATRIX
  // ----------------------------------------------------
  const [liftWeight, setLiftWeight] = useState<number>(100);
  const [liftReps, setLiftReps] = useState<number>(5);
  const [selectedLift, setSelectedLift] = useState<'bench' | 'squat' | 'deadlift' | 'ohp'>('bench');

  const calculateOneRepMax = () => {
    // Epley Formula: 1RM = Weight * (1 + Reps/30)
    const epley = liftWeight * (1 + liftReps / 30);
    // Brzycki Formula: 1RM = Weight * (36 / (37 - Reps))
    const brzycki = liftReps < 37 ? liftWeight * (36 / (37 - liftReps)) : epley;
    // Lombardi Formula: 1RM = Weight * Reps^0.1
    const lombardi = liftWeight * Math.pow(liftReps, 0.1);

    const avg1RM = Math.round((epley + brzycki + lombardi) / 3);

    const percentages = [
      { pct: 100, reps: '1 rep', rpe: '10.0', weight: avg1RM, goal: 'Max Absolute Power' },
      { pct: 95, reps: '2 reps', rpe: '9.5', weight: Math.round(avg1RM * 0.95), goal: 'Peaking & Max Load' },
      { pct: 90, reps: '3-4 reps', rpe: '9.0', weight: Math.round(avg1RM * 0.90), goal: 'Pure Neuromuscular Strength' },
      { pct: 85, reps: '5-6 reps', rpe: '8.5', weight: Math.round(avg1RM * 0.85), goal: 'Heavy Strength-Hypertrophy' },
      { pct: 80, reps: '7-8 reps', rpe: '8.0', weight: Math.round(avg1RM * 0.80), goal: 'Hypertrophy Golden Zone' },
      { pct: 75, reps: '9-10 reps', rpe: '7.5', weight: Math.round(avg1RM * 0.75), goal: 'Hypertrophy & Work Capacity' },
      { pct: 70, reps: '11-12 reps', rpe: '7.0', weight: Math.round(avg1RM * 0.70), goal: 'Volume / Metcon' },
      { pct: 65, reps: '15+ reps', rpe: '6.5', weight: Math.round(avg1RM * 0.65), goal: 'Muscular Endurance / Pump' },
    ];

    return {
      avg1RM,
      epley: Math.round(epley),
      brzycki: Math.round(brzycki),
      lombardi: Math.round(lombardi),
      percentages,
    };
  };

  // ----------------------------------------------------
  // 7. HYDRATION & DAILY WATER INTAKE ENGINE
  // ----------------------------------------------------
  const [hydrationWeightKg, setHydrationWeightKg] = useState<number>(75);
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(60);
  const [climate, setClimate] = useState<'temperate' | 'hot' | 'humid'>('temperate');

  const calculateHydration = () => {
    // Base: 35ml per kg of body weight
    let baseMl = hydrationWeightKg * 35;
    // Exercise sweating: ~12ml per minute of active workout
    let sweatMl = workoutMinutes * 12;
    // Climate adjustment
    if (climate === 'hot') baseMl *= 1.15;
    if (climate === 'humid') baseMl *= 1.25;

    const totalMl = Math.round(baseMl + sweatMl);
    const totalOz = Math.round(totalMl * 0.033814);
    const glasses = Math.round(totalMl / 250); // 250ml glasses

    const schedule = [
      { time: 'Upon Waking', amount: '500 ml', desc: 'Kickstarts metabolism and clears sleep dehydration' },
      { time: 'Pre-Workout (60m prior)', amount: '400 ml', desc: 'Pre-hydrates muscular cells for pump and endurance' },
      { time: 'During Workout', amount: `${Math.round(sweatMl * 0.6)} ml`, desc: 'Sip every 15 mins to maintain electrolyte balance' },
      { time: 'Post-Workout', amount: '400 ml', desc: 'Replenishes lost intra-cellular glycogen volume' },
      { time: 'Throughout Evening', amount: `${Math.max(300, totalMl - 1300 - Math.round(sweatMl * 0.6))} ml`, desc: 'Steady hydration between meals' },
    ];

    return { totalMl, totalOz, glasses, schedule };
  };

  // ----------------------------------------------------
  // 8. CARDIO & PACE CALCULATOR
  // ----------------------------------------------------
  const [paceDistKm, setPaceDistKm] = useState<number>(10);
  const [paceHours, setPaceHours] = useState<number>(0);
  const [paceMins, setPaceMins] = useState<number>(50);
  const [paceSecs, setPaceSecs] = useState<number>(0);

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

  // ----------------------------------------------------
  // 9. PREGNANCY TRACKER (CLINICAL NAEGELE)
  // ----------------------------------------------------
  const [lmpDate, setLmpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);

  const calculatePregnancy = () => {
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const edd = new Date(lmp.getTime() + (280 + (cycleLength - 28)) * 24 * 60 * 60 * 1000);

    let trimester = '1st Trimester (Organogenesis)';
    let trimesterShort = '1st Trimester';
    if (weeks >= 28) {
      trimester = '3rd Trimester (Growth & Preparation)';
      trimesterShort = '3rd Trimester';
    } else if (weeks >= 13) {
      trimester = '2nd Trimester (Energy & Movement)';
      trimesterShort = '2nd Trimester';
    }

    const progressPct = Math.min(100, Math.round((diffDays / 280) * 100));

    let fruitSize = 'Poppy seed (0.1 cm, <1g)';
    let emoji = '🌱';
    if (weeks >= 38) {
      fruitSize = 'Watermelon (~50 cm, 3.2 kg)';
      emoji = '🍉';
    } else if (weeks >= 32) {
      fruitSize = 'Pineapple (~42 cm, 1.8 kg)';
      emoji = '🍍';
    } else if (weeks >= 26) {
      fruitSize = 'Eggplant (~35 cm, 900 g)';
      emoji = '🍆';
    } else if (weeks >= 20) {
      fruitSize = 'Banana (~25 cm, 300 g)';
      emoji = '🍌';
    } else if (weeks >= 16) {
      fruitSize = 'Avocado (~12 cm, 100 g)';
      emoji = '🥑';
    } else if (weeks >= 12) {
      fruitSize = 'Plum (~5 cm, 14 g)';
      emoji = '🍑';
    } else if (weeks >= 8) {
      fruitSize = 'Raspberry (~1.6 cm, 1 g)';
      emoji = '🫐';
    }

    return {
      weeks,
      days,
      trimester,
      trimesterShort,
      eddDate: edd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      daysRemaining: Math.max(0, 280 - diffDays),
      progressPct,
      fruitSize,
      emoji,
    };
  };

  // ----------------------------------------------------
  // 10. CONCEPTION CALCULATOR
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 11. DUE DATE CALCULATOR
  // ----------------------------------------------------
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

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculation Results
  const bmiResult = calculateBMI();
  const calorieResult = calculateCalories();
  const bfResult = calculateBodyFat();
  const bmrResult = calculateBMRs();
  const iwResult = calculateIdealWeight();
  const oneRmResult = calculateOneRepMax();
  const hydrationResult = calculateHydration();
  const paceResult = calculatePace();
  const pregResult = calculatePregnancy();
  const conceptionResult = calculateConception();
  const dueDateResult = calculateDueDate();

  // Categorized Hub Configuration
  const categoryGroups: CategoryGroup[] = [
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
      name: 'Nutrition & Energy Balance',
      tabs: [
        { id: 'calorie', name: 'Calorie & TDEE', icon: Flame, tag: 'Macro Dial', desc: 'Expenditure, deficit timeline & macro splits' },
        { id: 'bmr', name: 'BMR Engine', icon: Zap, tag: 'Basal Multi-Formula', desc: 'Mifflin, Harris-Benedict & Katch-McArdle' },
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
        {/* Subtle Ambient Glow */}
        <div className='absolute -right-20 -top-20 w-80 h-80 bg-[#FF2625]/15 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div className='space-y-2.5'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider'>
              <Sparkles className='w-3.5 h-3.5 text-[#FF2625]' />
              11 Precision Clinical & Performance Engines
            </div>
            <h1 className='text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3'>
              Calculators Hub
              <span className='text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-gray-300 border border-white/15'>
                Pro Suite
              </span>
            </h1>
            <p className='text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed'>
              Science-backed algorithms with live dials, macro proportion rings, race split matrices, 1RM load tables, and
              instant IndexedDB profile synchronization.
            </p>
          </div>

          {/* Quick Action Bar: Unit switcher & Profile Sync */}
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
              placeholder='Search calculators (e.g., 1RM, TDEE, Pace)...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-3.5 py-1.5 text-xs bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF2625]'
            />
          </div>
          <div className='flex flex-wrap items-center gap-2 text-xs text-gray-300'>
            <span className='text-[11px] uppercase tracking-wider font-bold text-gray-400'>Archetypes:</span>
            <button
              type='button'
              onClick={() => {
                setBmiWeightKg(82);
                setBmiHeightCm(180);
                setCalWeightKg(82);
                setCalHeightCm(180);
                setCalActivity(1.725);
                setTargetGoal('cut500');
                setMacroPreset('highprotein');
                setLiftWeight(110);
                setSavedMessage('Applied: Male Athlete (Hypertrophy Cut)');
                setTimeout(() => setSavedMessage(''), 2500);
              }}
              className='px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-colors cursor-pointer text-[11px] font-semibold'
            >
              🏋️ Male Lifter (82kg)
            </button>
            <button
              type='button'
              onClick={() => {
                setBmiWeightKg(58);
                setBmiHeightCm(165);
                setCalWeightKg(58);
                setCalHeightCm(165);
                setCalActivity(1.55);
                setTargetGoal('maintain');
                setMacroPreset('balanced');
                setPaceDistKm(10);
                setPaceMins(48);
                setSavedMessage('Applied: Female Runner (Endurance)');
                setTimeout(() => setSavedMessage(''), 2500);
              }}
              className='px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-colors cursor-pointer text-[11px] font-semibold'
            >
              🏃 Female Runner (58kg)
            </button>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className='p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2 animate-in fade-in shadow-xs'>
          <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* 2. CATEGORIZED CALCULATOR HUB */}
      <div className='space-y-4'>
        {filteredGroups.map((group) => (
          <div key={group.name} className='space-y-2'>
            <div className='flex items-center justify-between px-1'>
              <span className='text-[11px] font-black uppercase tracking-wider text-gray-400'>{group.name}</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'>
              {group.tabs.map((t) => {
                const Icon = t.icon;
                const isCurrent = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type='button'
                    onClick={() => setActiveTab(t.id)}
                    className={`p-3.5 rounded-lg text-left transition-all cursor-pointer border flex flex-col justify-between gap-2 group ${
                      isCurrent
                        ? 'bg-red-50/80 border-[#FF2625] shadow-xs ring-1 ring-[#FF2625]'
                        : 'bg-white hover:bg-gray-50/80 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-2.5'>
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            isCurrent ? 'bg-[#FF2625] text-white' : 'bg-red-50 text-[#FF2625] group-hover:bg-red-100'
                          }`}
                        >
                          <Icon className='w-4 h-4' />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              isCurrent ? 'text-gray-950' : 'text-gray-800 group-hover:text-gray-950'
                            }`}
                          >
                            {t.name}
                          </span>
                          <span className='text-[10px] text-gray-400 font-medium'>{t.tag}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isCurrent ? 'text-[#FF2625] translate-x-0.5' : 'text-gray-300 group-hover:text-gray-400'
                        }`}
                      />
                    </div>
                    <p className='text-[11px] text-gray-500 line-clamp-1'>{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. ACTIVE CALCULATOR WORKSPACE */}
      <div className='bg-white rounded-xl p-6 sm:p-8 border border-gray-200/80 shadow-xs'>
        {/* ==================================================== */}
        {/* TAB 1: BMI CALCULATOR (WITH DYNAMIC RADIAL SPEEDOMETER) */}
        {/* ==================================================== */}
        {activeTab === 'bmi' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Scale className='w-6 h-6 text-[#FF2625]' />
                  Body Mass Index (BMI) Dial
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Clinical WHO body mass screening, healthy weight range boundary, and prime ratio score.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `BMI Score: ${bmiResult.bmi} (${bmiResult.category}) | Healthy Weight: ${bmiResult.minHealthyKg}-${bmiResult.maxHealthyKg}${unitSystem === 'metric' ? 'kg' : 'lbs'}`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              {/* Controls */}
              <div className='lg:col-span-6 space-y-5'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => setBmiGender('male')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                          bmiGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type='button'
                        onClick={() => setBmiGender('female')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                          bmiGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {bmiAge} yrs</label>
                    <input
                      type='range'
                      min='10'
                      max='90'
                      value={bmiAge}
                      onChange={(e) => setBmiAge(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                {/* Height Selector */}
                {unitSystem === 'metric' ? (
                  <div className='space-y-1.5'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Height</span>
                      <span className='font-mono text-[#FF2625]'>{bmiHeightCm} cm</span>
                    </div>
                    <input
                      type='range'
                      min='120'
                      max='220'
                      value={bmiHeightCm}
                      onChange={(e) => setBmiHeightCm(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Feet ({bmiHeightFt}')</label>
                      <input
                        type='range'
                        min='4'
                        max='7'
                        value={bmiHeightFt}
                        onChange={(e) => setBmiHeightFt(Number(e.target.value))}
                        className='w-full accent-[#FF2625] cursor-pointer'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Inches ({bmiHeightIn}")</label>
                      <input
                        type='range'
                        min='0'
                        max='11'
                        value={bmiHeightIn}
                        onChange={(e) => setBmiHeightIn(Number(e.target.value))}
                        className='w-full accent-[#FF2625] cursor-pointer'
                      />
                    </div>
                  </div>
                )}

                {/* Weight Selector */}
                {unitSystem === 'metric' ? (
                  <div className='space-y-1.5'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Weight</span>
                      <span className='font-mono text-[#FF2625]'>{bmiWeightKg} kg</span>
                    </div>
                    <input
                      type='range'
                      min='35'
                      max='180'
                      value={bmiWeightKg}
                      onChange={(e) => setBmiWeightKg(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Weight</span>
                      <span className='font-mono text-[#FF2625]'>{bmiWeightLbs} lbs</span>
                    </div>
                    <input
                      type='range'
                      min='80'
                      max='400'
                      value={bmiWeightLbs}
                      onChange={(e) => setBmiWeightLbs(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                )}

                {/* Quick Stepper Bar */}
                <div className='p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs text-gray-600'>
                  <span className='font-semibold'>Fine-tune Weight:</span>
                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={() =>
                        unitSystem === 'metric' ? setBmiWeightKg((w) => Math.max(30, w - 1)) : setBmiWeightLbs((w) => Math.max(70, w - 1))
                      }
                      className='w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer'
                    >
                      <Minus className='w-3 h-3' />
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        unitSystem === 'metric' ? setBmiWeightKg((w) => w + 1) : setBmiWeightLbs((w) => w + 1)
                      }
                      className='w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer'
                    >
                      <Plus className='w-3 h-3' />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleSaveToTracker(unitSystem === 'metric' ? bmiWeightKg : Math.round(bmiWeightLbs * 0.453592))}
                      className='ml-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-xs'
                    >
                      Save to History
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Interactive Gauge Display */}
              <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-5'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Live Biometric Readout</span>
                  <span className={`px-2.5 py-0.5 rounded-sm text-xs font-bold border ${bmiResult.color}`}>
                    {bmiResult.category}
                  </span>
                </div>

                {/* SVG Gauge Graphic */}
                <div className='relative flex flex-col items-center justify-center pt-2'>
                  <svg className='w-64 h-36 overflow-visible' viewBox='0 0 240 135'>
                    <defs>
                      <linearGradient id='gaugeTrackGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
                        <stop offset='0%' stopColor='#0ea5e9' />
                        <stop offset='25%' stopColor='#10b981' />
                        <stop offset='60%' stopColor='#f59e0b' />
                        <stop offset='100%' stopColor='#ef4444' />
                      </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <path
                      d='M 35 115 A 85 85 0 0 1 205 115'
                      fill='none'
                      stroke='#1f2937'
                      strokeWidth='14'
                      strokeLinecap='round'
                    />

                    {/* Gradient Colored Arc */}
                    <path
                      d='M 35 115 A 85 85 0 0 1 205 115'
                      fill='none'
                      stroke='url(#gaugeTrackGrad)'
                      strokeWidth='14'
                      strokeLinecap='round'
                      opacity='0.9'
                    />

                    {/* Tick Markers */}
                    {/* 18.5 Marker */}
                    <circle cx='43' cy='79' r='2' fill='#ffffff' opacity='0.7' />
                    {/* 25.0 Marker */}
                    <circle cx='94' cy='34' r='2' fill='#ffffff' opacity='0.7' />
                    {/* 30.0 Marker */}
                    <circle cx='146' cy='34' r='2' fill='#ffffff' opacity='0.7' />

                    {/* Animated Needle */}
                    {(() => {
                      const pct = Math.max(0, Math.min(100, ((bmiResult.bmi - 15) / 25) * 100));
                      const rad = (pct / 100) * Math.PI;
                      const x2 = 120 - 66 * Math.cos(rad);
                      const y2 = 115 - 66 * Math.sin(rad);
                      return (
                        <g>
                          <line
                            x1='120'
                            y1='115'
                            x2={x2}
                            y2={y2}
                            stroke='#ffffff'
                            strokeWidth='3.5'
                            strokeLinecap='round'
                          />
                          <circle cx='120' cy='115' r='6' fill='#FF2625' stroke='#111827' strokeWidth='2.5' />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Centered Readout Value with Clean Spacing (No Overlap) */}
                  <div className='text-center mt-2'>
                    <span className='text-4xl font-black font-mono tracking-tight text-white'>{bmiResult.bmi}</span>
                    <span className='block text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>
                      kg / m²
                    </span>
                  </div>
                </div>

                {/* Healthy Weight Envelope & Delta */}
                <div className='grid grid-cols-2 gap-3 pt-2 text-xs'>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-gray-400 font-medium block text-[11px]'>Healthy Weight Range</span>
                    <strong className='text-sm font-bold text-emerald-400'>
                      {bmiResult.minHealthyKg} – {bmiResult.maxHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </strong>
                  </div>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-gray-400 font-medium block text-[11px]'>BMI Prime Ratio</span>
                    <strong className='text-sm font-bold text-sky-400'>
                      {bmiResult.prime} <span className='text-[10px] text-gray-400 font-normal'>(&lt;1.0 optimal)</span>
                    </strong>
                  </div>
                </div>

                {/* Intuitive Target Weight & Delta Goal Card */}
                {bmiResult.category === 'Normal Weight' ? (
                  <div className='p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-2.5'>
                      <div className='w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0'>
                        <CheckCircle2 className='w-4 h-4' />
                      </div>
                      <div>
                        <span className='font-bold text-emerald-300 block'>In Optimal Healthy Weight Zone</span>
                        <span className='text-[11px] text-gray-400'>
                          Your weight is within the healthy boundary ({bmiResult.minHealthyKg} – {bmiResult.maxHealthyKg}{' '}
                          {unitSystem === 'metric' ? 'kg' : 'lbs'})
                        </span>
                      </div>
                    </div>
                    <span className='px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0'>
                      ✓ Optimal
                    </span>
                  </div>
                ) : bmiResult.category === 'Underweight' ? (
                  <div className='p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs space-y-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-7 h-7 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 text-xs font-bold'>
                          📈
                        </div>
                        <div>
                          <span className='font-bold text-sky-300 block'>Healthy Surplus Goal</span>
                          <span className='text-[11px] text-gray-300'>
                            Gain <strong className='text-white font-bold'>+{bmiResult.deltaKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}</strong> to reach Normal BMI (&ge; {bmiResult.minHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'})
                          </span>
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <span className='text-base font-black font-mono text-sky-400'>+{bmiResult.deltaKg}</span>
                        <span className='text-[10px] text-gray-400 block uppercase font-bold'>{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                      </div>
                    </div>
                    <div className='pt-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-400 border-t border-white/10'>
                      <span>Suggested Strategy:</span>
                      <button
                        type='button'
                        onClick={() => {
                          setActiveTab('calorie');
                          setTargetGoal('bulk300');
                        }}
                        className='text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer transition-colors'
                      >
                        Plan +300 kcal Surplus →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold'>
                          📉
                        </div>
                        <div>
                          <span className='font-bold text-amber-300 block'>Target Weight Reduction</span>
                          <span className='text-[11px] text-gray-300'>
                            Lose <strong className='text-white font-bold'>{bmiResult.deltaKg} {unitSystem === 'metric' ? 'kg' : 'lbs'}</strong> to enter Normal BMI (&le; {bmiResult.maxHealthyKg} {unitSystem === 'metric' ? 'kg' : 'lbs'})
                          </span>
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <span className='text-base font-black font-mono text-amber-400'>-{bmiResult.deltaKg}</span>
                        <span className='text-[10px] text-gray-400 block uppercase font-bold'>{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                      </div>
                    </div>
                    <div className='pt-1.5 flex items-center justify-between gap-2 text-[11px] text-gray-400 border-t border-white/10'>
                      <span>Suggested Strategy:</span>
                      <button
                        type='button'
                        onClick={() => {
                          setActiveTab('calorie');
                          setTargetGoal('cut500');
                        }}
                        className='text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors'
                      >
                        Plan -500 kcal Deficit →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CALORIE & TDEE (WITH MACRO DONUT & DEFICIT SPEED) */}
        {/* ==================================================== */}
        {activeTab === 'calorie' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Flame className='w-6 h-6 text-[#FF2625]' />
                  Calorie & TDEE Metabolism Matrix
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Calculates Total Daily Energy Expenditure (TDEE), target deficit timeline, and customized macro split.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Target Calories: ${calorieResult.targetCal} kcal/day | P: ${calorieResult.proteinGrams}g, C: ${calorieResult.carbGrams}g, F: ${calorieResult.fatGrams}g`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              {/* Inputs */}
              <div className='lg:col-span-6 space-y-5'>
                {/* Gender & Age */}
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => setCalGender('male')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          calGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type='button'
                        onClick={() => setCalGender('female')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          calGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {calAge} yrs</label>
                    <input
                      type='range'
                      min='15'
                      max='80'
                      value={calAge}
                      onChange={(e) => setCalAge(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                {/* Height & Weight */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Height</span>
                      <span className='font-mono text-[#FF2625]'>{calHeightCm} cm</span>
                    </div>
                    <input
                      type='range'
                      min='130'
                      max='220'
                      value={calHeightCm}
                      onChange={(e) => setCalHeightCm(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Weight</span>
                      <span className='font-mono text-[#FF2625]'>{calWeightKg} kg</span>
                    </div>
                    <input
                      type='range'
                      min='40'
                      max='180'
                      value={calWeightKg}
                      onChange={(e) => setCalWeightKg(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Weekly Activity Level</label>
                  <select
                    value={calActivity}
                    onChange={(e) => setCalActivity(Number(e.target.value))}
                    className='w-full px-3 py-2 rounded-md border border-gray-300 text-xs font-semibold bg-white'
                  >
                    <option value={1.2}>Sedentary (Desk Job, little or no exercise)</option>
                    <option value={1.375}>Lightly Active (Training 1-3 days/week)</option>
                    <option value={1.55}>Moderately Active (Gym lifting 3-5 days/week)</option>
                    <option value={1.725}>Very Active (Intense training 6-7 days/week)</option>
                    <option value={1.9}>Extra Active (Athlete / physical job + double training)</option>
                  </select>
                </div>

                {/* Target Strategy Goal */}
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Nutrition Goal</label>
                  <div className='grid grid-cols-3 gap-2'>
                    <button
                      type='button'
                      onClick={() => setTargetGoal('cut500')}
                      className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                        targetGoal === 'cut500' ? 'bg-red-50 border-[#FF2625] text-[#FF2625]' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      🔥 Cut (-500)
                    </button>
                    <button
                      type='button'
                      onClick={() => setTargetGoal('maintain')}
                      className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                        targetGoal === 'maintain' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      ⚖️ Maintain
                    </button>
                    <button
                      type='button'
                      onClick={() => setTargetGoal('bulk300')}
                      className={`p-2 rounded-md text-xs font-bold border text-center transition-all cursor-pointer ${
                        targetGoal === 'bulk300' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      💪 Lean Bulk (+300)
                    </button>
                  </div>
                </div>

                {/* Macro Ratio Presets */}
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Macro Strategy Preset</label>
                  <div className='grid grid-cols-4 gap-1.5 text-xs'>
                    {[
                      { id: 'highprotein', label: 'High Protein' },
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'keto', label: 'Keto / Low Carb' },
                      { id: 'endurance', label: 'Endurance' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type='button'
                        onClick={() => setMacroPreset(p.id as any)}
                        className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors cursor-pointer text-center ${
                          macroPreset === p.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Results */}
              <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-6'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Target Calorie Target</span>
                  <span className='text-xs font-bold px-2.5 py-0.5 rounded-sm bg-red-500/20 text-red-400 border border-red-500/30'>
                    TDEE: {calorieResult.tdee} kcal
                  </span>
                </div>

                <div className='text-center py-2'>
                  <span className='text-5xl font-black font-mono tracking-tight text-white'>{calorieResult.targetCal}</span>
                  <span className='block text-xs text-gray-400 font-bold uppercase tracking-wider mt-1'>
                    Kilocalories / Day
                  </span>
                  {calorieResult.weeklyKgChange !== 0 && (
                    <span className='inline-block mt-2 text-xs font-bold px-3 py-1 rounded-md bg-white/10 text-amber-300'>
                      Estimated Shift: {calorieResult.weeklyKgChange > 0 ? '+' : ''}
                      {calorieResult.weeklyKgChange} kg / week ({calorieResult.weeklyLbsChange > 0 ? '+' : ''}
                      {calorieResult.weeklyLbsChange} lbs)
                    </span>
                  )}
                </div>

                {/* Macro Split Proportion Bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs font-bold'>
                    <span className='text-red-400'>🍗 Protein ({calorieResult.pRatio}%)</span>
                    <span className='text-amber-400'>🍚 Carbs ({calorieResult.cRatio}%)</span>
                    <span className='text-sky-400'>🥑 Fat ({calorieResult.fRatio}%)</span>
                  </div>
                  <div className='h-3 w-full bg-gray-800 rounded-sm overflow-hidden flex'>
                    <div style={{ width: `${calorieResult.pRatio}%` }} className='bg-[#FF2625] h-full' />
                    <div style={{ width: `${calorieResult.cRatio}%` }} className='bg-amber-500 h-full' />
                    <div style={{ width: `${calorieResult.fRatio}%` }} className='bg-sky-500 h-full' />
                  </div>
                </div>

                {/* Gram Target Cards */}
                <div className='grid grid-cols-3 gap-2.5 pt-1 text-center'>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-[10px] text-gray-400 uppercase font-bold block'>Protein</span>
                    <strong className='text-xl font-black text-red-400'>{calorieResult.proteinGrams}g</strong>
                    <span className='text-[10px] text-gray-500 block'>{calorieResult.proteinGrams * 4} kcal</span>
                  </div>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-[10px] text-gray-400 uppercase font-bold block'>Carbohydrates</span>
                    <strong className='text-xl font-black text-amber-400'>{calorieResult.carbGrams}g</strong>
                    <span className='text-[10px] text-gray-500 block'>{calorieResult.carbGrams * 4} kcal</span>
                  </div>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-[10px] text-gray-400 uppercase font-bold block'>Healthy Fats</span>
                    <strong className='text-xl font-black text-sky-400'>{calorieResult.fatGrams}g</strong>
                    <span className='text-[10px] text-gray-500 block'>{calorieResult.fatGrams * 9} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: BODY FAT % (US NAVY TAPE METHOD) */}
        {/* ==================================================== */}
        {activeTab === 'bodyfat' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Percent className='w-6 h-6 text-[#FF2625]' />
                  US Navy Body Fat % & Body Composition
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Clinical circumference method evaluating lean muscle mass vs subcutaneous & visceral adipose fat.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Body Fat: ${bfResult.bodyFat}% (${bfResult.category}) | Lean Mass: ${bfResult.leanMass}kg, Fat Mass: ${bfResult.fatMass}kg`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              {/* Tape Measurements Input */}
              <div className='lg:col-span-6 space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => setBfGender('male')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          bfGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type='button'
                        onClick={() => setBfGender('female')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          bfGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Body Weight</span>
                      <span className='font-mono text-[#FF2625]'>{bfWeightKg} kg</span>
                    </div>
                    <input
                      type='range'
                      min='40'
                      max='160'
                      value={bfWeightKg}
                      onChange={(e) => setBfWeightKg(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Height</span>
                      <span className='font-mono text-[#FF2625]'>{bfHeightCm} cm</span>
                    </div>
                    <input
                      type='range'
                      min='130'
                      max='220'
                      value={bfHeightCm}
                      onChange={(e) => setBfHeightCm(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Neck Circumference</span>
                      <span className='font-mono text-[#FF2625]'>{bfNeckCm} cm</span>
                    </div>
                    <input
                      type='range'
                      min='25'
                      max='60'
                      value={bfNeckCm}
                      onChange={(e) => setBfNeckCm(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-xs font-bold text-gray-700'>
                      <span>Waist (at Navel)</span>
                      <span className='font-mono text-[#FF2625]'>{bfWaistCm} cm</span>
                    </div>
                    <input
                      type='range'
                      min='50'
                      max='150'
                      value={bfWaistCm}
                      onChange={(e) => setBfWaistCm(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                  {bfGender === 'female' && (
                    <div className='space-y-1'>
                      <div className='flex justify-between text-xs font-bold text-gray-700'>
                        <span>Hips (Widest Point)</span>
                        <span className='font-mono text-[#FF2625]'>{bfHipCm} cm</span>
                      </div>
                      <input
                        type='range'
                        min='60'
                        max='160'
                        value={bfHipCm}
                        onChange={(e) => setBfHipCm(Number(e.target.value))}
                        className='w-full accent-[#FF2625] cursor-pointer'
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Body Composition Graphic */}
              <div className='lg:col-span-6 bg-linear-to-b from-gray-900 to-gray-950 rounded-xl p-6 text-white border border-gray-800 shadow-lg space-y-6'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>Body Composition Split</span>
                  <span className={`px-2.5 py-0.5 rounded-sm text-xs font-bold border ${bfResult.color}`}>
                    {bfResult.category}
                  </span>
                </div>

                <div className='text-center py-2'>
                  <span className='text-5xl font-black font-mono tracking-tight text-white'>{bfResult.bodyFat}%</span>
                  <span className='block text-xs text-gray-400 font-bold uppercase tracking-wider mt-1'>
                    Body Fat Percentage
                  </span>
                </div>

                {/* Lean vs Fat Mass Visual Bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs font-bold'>
                    <span className='text-emerald-400'>💪 Lean Body Mass: {bfResult.leanMass} kg</span>
                    <span className='text-amber-400'>🧈 Total Fat Mass: {bfResult.fatMass} kg</span>
                  </div>
                  <div className='h-3 w-full bg-gray-800 rounded-sm overflow-hidden flex'>
                    <div style={{ width: `${100 - bfResult.bodyFat}%` }} className='bg-emerald-500 h-full' />
                    <div style={{ width: `${bfResult.bodyFat}%` }} className='bg-amber-500 h-full' />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 text-xs'>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-gray-400 font-medium block text-[11px]'>Lean Muscle Mass</span>
                    <strong className='text-lg font-black text-emerald-400'>{bfResult.leanMass} kg</strong>
                    <span className='text-[10px] text-gray-500 block'>{Math.round(bfResult.leanMass * 2.20462)} lbs</span>
                  </div>
                  <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                    <span className='text-gray-400 font-medium block text-[11px]'>Stored Fat Mass</span>
                    <strong className='text-lg font-black text-amber-400'>{bfResult.fatMass} kg</strong>
                    <span className='text-[10px] text-gray-500 block'>{Math.round(bfResult.fatMass * 2.20462)} lbs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: 1RM (ONE REP MAX) & STRENGTH LOAD MATRIX */}
        {/* ==================================================== */}
        {activeTab === 'onerm' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Dumbbell className='w-6 h-6 text-[#FF2625]' />
                  One-Rep Max (1RM) & Strength Load Matrix
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Clinical Brzycki, Epley & Lombardi formulas predicting maximal lifting output and percentage loads.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Estimated 1RM (${selectedLift}): ${oneRmResult.avg1RM}${unitSystem === 'metric' ? 'kg' : 'lbs'} based on ${liftWeight} x ${liftReps} reps`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              {/* Lift Controls */}
              <div className='lg:col-span-5 space-y-5'>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Barbell Movement</label>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      { id: 'bench', name: 'Bench Press' },
                      { id: 'squat', name: 'Back Squat' },
                      { id: 'deadlift', name: 'Deadlift' },
                      { id: 'ohp', name: 'Overhead Press' },
                    ].map((lift) => (
                      <button
                        key={lift.id}
                        type='button'
                        onClick={() => setSelectedLift(lift.id as any)}
                        className={`py-2 px-3 rounded-md text-xs font-bold border transition-colors cursor-pointer text-center ${
                          selectedLift === lift.id
                            ? 'bg-[#FF2625] text-white border-[#FF2625]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {lift.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Lifted Weight</span>
                    <span className='font-mono text-[#FF2625]'>
                      {liftWeight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </span>
                  </div>
                  <input
                    type='range'
                    min='20'
                    max='350'
                    value={liftWeight}
                    onChange={(e) => setLiftWeight(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                <div className='space-y-1.5'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Repetitions Completed</span>
                    <span className='font-mono text-[#FF2625]'>{liftReps} reps</span>
                  </div>
                  <input
                    type='range'
                    min='1'
                    max='12'
                    value={liftReps}
                    onChange={(e) => setLiftReps(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                {/* 1RM Hero Card */}
                <div className='p-4 rounded-xl bg-linear-to-br from-gray-950 to-gray-900 text-white border border-gray-800 text-center space-y-1'>
                  <span className='text-[10px] uppercase font-bold tracking-widest text-red-400'>
                    Predicted Absolute 1RM
                  </span>
                  <div className='text-4xl font-black font-mono text-white'>
                    {oneRmResult.avg1RM}{' '}
                    <span className='text-base font-bold text-gray-400'>{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                  </div>
                  <div className='flex justify-center gap-3 text-[11px] text-gray-400 pt-1'>
                    <span>Epley: {oneRmResult.epley}</span>
                    <span>•</span>
                    <span>Brzycki: {oneRmResult.brzycki}</span>
                    <span>•</span>
                    <span>Lombardi: {oneRmResult.lombardi}</span>
                  </div>
                </div>
              </div>

              {/* Percentage Loading Matrix Table */}
              <div className='lg:col-span-7 bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-700'>Training Load Matrix</span>
                  <span className='text-[11px] text-gray-500 font-medium'>Recommended Reps & Target Zones</span>
                </div>

                <div className='divide-y divide-gray-200 text-xs'>
                  {oneRmResult.percentages.map((row) => (
                    <div key={row.pct} className='py-2 flex items-center justify-between gap-2 hover:bg-gray-100/60 px-1 rounded transition-colors'>
                      <div className='flex items-center gap-2'>
                        <span className='w-12 font-black text-gray-900 font-mono'>{row.pct}%</span>
                        <div>
                          <span className='font-bold text-gray-800 block'>{row.reps}</span>
                          <span className='text-[10px] text-gray-400'>{row.goal}</span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <span className='font-black font-mono text-sm text-[#FF2625]'>
                          {row.weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                        </span>
                        <span className='block text-[10px] text-gray-400'>RPE {row.rpe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: DAILY HYDRATION & WATER INTAKE */}
        {/* ==================================================== */}
        {activeTab === 'hydration' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Droplets className='w-6 h-6 text-sky-500' />
                  Daily Hydration & Fluid Optimization
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Calculates cellular water requirements based on body mass, sweat rate, workout intensity, and climate.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Daily Water Target: ${hydrationResult.totalMl}ml (${hydrationResult.glasses} glasses) | Sweating: +${workoutMinutes}m workout`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              <div className='lg:col-span-5 space-y-4'>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Body Weight</span>
                    <span className='font-mono text-[#FF2625]'>{hydrationWeightKg} kg</span>
                  </div>
                  <input
                    type='range'
                    min='40'
                    max='160'
                    value={hydrationWeightKg}
                    onChange={(e) => setHydrationWeightKg(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Daily Workout Duration</span>
                    <span className='font-mono text-[#FF2625]'>{workoutMinutes} mins</span>
                  </div>
                  <input
                    type='range'
                    min='0'
                    max='180'
                    step='15'
                    value={workoutMinutes}
                    onChange={(e) => setWorkoutMinutes(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1.5'>Climate / Ambient Heat</label>
                  <div className='grid grid-cols-3 gap-2'>
                    {[
                      { id: 'temperate', label: '🌤️ Moderate' },
                      { id: 'hot', label: '☀️ Hot / Dry' },
                      { id: 'humid', label: '🌴 Humid / Trop' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type='button'
                        onClick={() => setClimate(c.id as any)}
                        className={`py-2 px-2 rounded-md text-xs font-bold border transition-colors cursor-pointer text-center ${
                          climate === c.id ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Water Result Display */}
              <div className='lg:col-span-7 bg-linear-to-b from-sky-950 via-gray-900 to-gray-950 rounded-xl p-6 text-white border border-sky-900/50 shadow-lg space-y-5'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-sky-400'>Recommended Total Intake</span>
                  <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30'>
                    ~{hydrationResult.glasses} Standard Glasses (250ml)
                  </span>
                </div>

                <div className='text-center py-2'>
                  <span className='text-5xl font-black font-mono tracking-tight text-white'>{hydrationResult.totalMl}</span>
                  <span className='block text-xs text-sky-300 font-bold uppercase tracking-wider mt-1'>
                    Milliliters / Day ({hydrationResult.totalOz} oz)
                  </span>
                </div>

                {/* Timing Schedule */}
                <div className='space-y-2 pt-2 border-t border-white/10'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
                    Optimal Hydration Timing Protocol
                  </span>
                  <div className='space-y-2 text-xs'>
                    {hydrationResult.schedule.map((item, idx) => (
                      <div key={idx} className='p-2.5 bg-white/5 rounded-md border border-white/10 flex items-center justify-between gap-3'>
                        <div>
                          <strong className='text-white block font-bold'>{item.time}</strong>
                          <span className='text-[11px] text-gray-400'>{item.desc}</span>
                        </div>
                        <span className='font-mono font-bold text-sky-400 shrink-0'>{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: BMR CALCULATOR (MULTI-FORMULA ENGINE) */}
        {/* ==================================================== */}
        {activeTab === 'bmr' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Zap className='w-6 h-6 text-amber-500' />
                  Basal Metabolic Rate (BMR) Engine
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Compares Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle basal caloric requirements at full rest.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `BMR (Mifflin): ${bmrResult.mifflin} kcal/day | Harris: ${bmrResult.harris} kcal | Katch: ${bmrResult.katch} kcal`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              <div className='lg:col-span-5 space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => setBmrGender('male')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          bmrGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type='button'
                        onClick={() => setBmrGender('female')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                          bmrGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Age: {bmrAge} yrs</label>
                    <input
                      type='range'
                      min='15'
                      max='80'
                      value={bmrAge}
                      onChange={(e) => setBmrAge(Number(e.target.value))}
                      className='w-full accent-[#FF2625] cursor-pointer'
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Height</span>
                    <span className='font-mono text-[#FF2625]'>{bmrHeightCm} cm</span>
                  </div>
                  <input
                    type='range'
                    min='130'
                    max='220'
                    value={bmrHeightCm}
                    onChange={(e) => setBmrHeightCm(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Weight</span>
                    <span className='font-mono text-[#FF2625]'>{bmrWeightKg} kg</span>
                  </div>
                  <input
                    type='range'
                    min='40'
                    max='160'
                    value={bmrWeightKg}
                    onChange={(e) => setBmrWeightKg(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>
              </div>

              {/* BMR Comparison Visuals */}
              <div className='lg:col-span-7 space-y-4'>
                <div className='grid grid-cols-3 gap-3 text-center'>
                  <div className='p-4 bg-red-50/80 rounded-xl border border-red-200'>
                    <span className='text-[10px] text-red-600 uppercase font-bold block'>Mifflin-St Jeor</span>
                    <strong className='text-2xl font-black text-gray-900'>{bmrResult.mifflin}</strong>
                    <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
                  </div>
                  <div className='p-4 bg-blue-50/80 rounded-xl border border-blue-200'>
                    <span className='text-[10px] text-blue-600 uppercase font-bold block'>Harris-Benedict</span>
                    <strong className='text-2xl font-black text-gray-900'>{bmrResult.harris}</strong>
                    <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
                  </div>
                  <div className='p-4 bg-emerald-50/80 rounded-xl border border-emerald-200'>
                    <span className='text-[10px] text-emerald-600 uppercase font-bold block'>Katch-McArdle</span>
                    <strong className='text-2xl font-black text-gray-900'>{bmrResult.katch}</strong>
                    <span className='text-[10px] text-gray-500 block'>kcal / 24h</span>
                  </div>
                </div>

                <div className='p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs'>
                  <span className='font-bold uppercase tracking-wider text-gray-500 text-[11px] block'>
                    Hourly Basal Caloric Burn Rate
                  </span>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                    <div className='p-2 bg-white rounded border border-gray-200'>
                      <span className='text-gray-400 block text-[10px]'>Sleeping (0.9x)</span>
                      <strong className='font-mono text-gray-900'>{bmrResult.hourlySleeping} kcal/hr</strong>
                    </div>
                    <div className='p-2 bg-white rounded border border-gray-200'>
                      <span className='text-gray-400 block text-[10px]'>Desk Work (1.2x)</span>
                      <strong className='font-mono text-gray-900'>{bmrResult.hourlyDesk} kcal/hr</strong>
                    </div>
                    <div className='p-2 bg-white rounded border border-gray-200'>
                      <span className='text-gray-400 block text-[10px]'>Walking (2.5x)</span>
                      <strong className='font-mono text-gray-900'>{bmrResult.hourlyWalking} kcal/hr</strong>
                    </div>
                    <div className='p-2 bg-white rounded border border-gray-200'>
                      <span className='text-gray-400 block text-[10px]'>Gym Lifting (5.2x)</span>
                      <strong className='font-mono text-red-600'>{bmrResult.hourlyGym} kcal/hr</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: IDEAL WEIGHT (5-FORMULA COMPARISON ARRAY) */}
        {/* ==================================================== */}
        {activeTab === 'idealweight' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Activity className='w-6 h-6 text-emerald-600' />
                  Ideal Body Weight (IBW) Multi-Formula Array
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Comprehensive analysis comparing Robinson, Miller, Devine, Hamwi, and World Health Organization ranges.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Ideal Weight Average: ${iwResult.avgIdeal}kg | Robinson: ${iwResult.robinson}kg, Devine: ${iwResult.devine}kg, Miller: ${iwResult.miller}kg`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              <div className='lg:col-span-5 space-y-4'>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>Gender</label>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setIwGender('male')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                        iwGender === 'male' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type='button'
                      onClick={() => setIwGender('female')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold border cursor-pointer ${
                        iwGender === 'female' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between text-xs font-bold text-gray-700'>
                    <span>Height</span>
                    <span className='font-mono text-[#FF2625]'>{iwHeightCm} cm</span>
                  </div>
                  <input
                    type='range'
                    min='140'
                    max='215'
                    value={iwHeightCm}
                    onChange={(e) => setIwHeightCm(Number(e.target.value))}
                    className='w-full accent-[#FF2625] cursor-pointer'
                  />
                </div>

                <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1'>
                  <span className='text-[10px] uppercase font-bold text-emerald-800 tracking-wider'>
                    Consensus Clinical Average
                  </span>
                  <div className='text-3xl font-black font-mono text-emerald-950'>
                    {iwResult.avgIdeal} <span className='text-sm font-bold text-emerald-700'>kg</span>
                  </div>
                  <span className='text-[11px] text-emerald-700 block'>
                    ({Math.round(iwResult.avgIdeal * 2.20462)} lbs)
                  </span>
                </div>
              </div>

              {/* Comparative Table & Range Bars */}
              <div className='lg:col-span-7 space-y-3'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-400 block'>
                  Clinical Formula Comparison
                </span>
                <div className='divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-xs'>
                  {[
                    { name: 'Robinson Formula (1983)', val: iwResult.robinson, desc: 'Widely used clinical standard' },
                    { name: 'Miller Formula (1983)', val: iwResult.miller, desc: 'Modified for larger frame builds' },
                    { name: 'Devine Formula (1974)', val: iwResult.devine, desc: 'Gold standard for medication dosing' },
                    { name: 'Hamwi Formula (1964)', val: iwResult.hamwi, desc: 'Classic metabolic baseline' },
                    {
                      name: 'WHO Healthy BMI Range (18.5 - 24.9)',
                      val: `${iwResult.bmiMin} - ${iwResult.bmiMax}`,
                      desc: 'World Health Organization envelope',
                    },
                  ].map((f, i) => (
                    <div key={i} className='p-3 flex items-center justify-between hover:bg-gray-50 transition-colors'>
                      <div>
                        <strong className='text-gray-900 block font-bold'>{f.name}</strong>
                        <span className='text-[11px] text-gray-400'>{f.desc}</span>
                      </div>
                      <span className='font-mono font-bold text-sm text-emerald-700 shrink-0'>{f.val} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: CARDIO & RUNNING PACE CALCULATOR */}
        {/* ==================================================== */}
        {activeTab === 'pace' && (
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
                onClick={() =>
                  handleCopySummary(
                    `Pace: ${paceResult.paceKm} (${paceResult.speedKmh} km/h) | 5K: ${paceResult.predictions[1]?.time}, 10K: ${paceResult.predictions[2]?.time}`
                  )
                }
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
        )}

        {/* ==================================================== */}
        {/* TAB 9: PREGNANCY TRACKER */}
        {/* ==================================================== */}
        {activeTab === 'pregnancy' && (
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-2xl font-black text-gray-900 flex items-center gap-2'>
                  <Heart className='w-6 h-6 text-pink-500' />
                  Pregnancy Gestational Timeline & Developmental Milestones
                </h2>
                <p className='text-xs text-gray-500 mt-1'>
                  Clinical Naegele rule calculating fetal growth, fruit/object comparator size, and trimester checkpoints.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  handleCopySummary(
                    `Pregnancy Stage: ${pregResult.weeks}w ${pregResult.days}d (${pregResult.trimesterShort}) | Due Date: ${pregResult.eddDate} | Size: ${pregResult.fruitSize}`
                  )
                }
                className='text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer'
              >
                <Share2 className='w-3.5 h-3.5' /> {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              <div className='lg:col-span-5 space-y-4'>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
                    First Day of Last Menstrual Period (LMP)
                  </label>
                  <input
                    type='date'
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold uppercase text-gray-500 mb-1'>
                    Average Cycle Length ({cycleLength} days)
                  </label>
                  <input
                    type='number'
                    min='21'
                    max='40'
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className='w-full px-3.5 py-2 rounded-md border border-gray-300 text-sm font-semibold'
                  />
                </div>

                <div className='p-3.5 bg-pink-50 rounded-lg border border-pink-200 text-xs text-pink-950 space-y-1'>
                  <span className='font-bold uppercase tracking-wider text-[10px] text-pink-700 block'>
                    🛡️ Safe Prenatal Fitness Guidelines
                  </span>
                  <p className='text-pink-900 leading-relaxed text-[11px]'>
                    Maintain low-impact aerobic activity (walking, stationary cycling, swimming, pelvic floor strength). Avoid
                    valsalva breath-holding and contact sports.
                  </p>
                </div>
              </div>

              {/* Visual Gestational Age Display */}
              <div className='lg:col-span-7 bg-pink-50/70 rounded-xl p-6 border border-pink-200/80 space-y-4 shadow-xs'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase text-pink-700'>Current Gestational Age</span>
                  <span className='px-2.5 py-0.5 rounded-sm text-xs font-bold bg-pink-200 text-pink-900'>
                    {pregResult.trimesterShort}
                  </span>
                </div>

                <p className='text-4xl font-black text-gray-950 font-mono'>
                  {pregResult.weeks} Weeks, {pregResult.days} Days
                </p>

                <div className='space-y-1.5 pt-2'>
                  <div className='flex justify-between text-xs font-bold text-gray-600'>
                    <span>Expected Due Date: {pregResult.eddDate}</span>
                    <span className='text-pink-700'>{pregResult.daysRemaining} days remaining</span>
                  </div>
                  <div className='h-3 w-full bg-pink-200 rounded-sm overflow-hidden'>
                    <div className='h-full bg-pink-500 rounded-sm transition-all duration-500' style={{ width: `${pregResult.progressPct}%` }} />
                  </div>
                </div>

                <div className='p-4 bg-white rounded-lg border border-pink-200 text-xs text-gray-800 flex items-center gap-3 shadow-xs'>
                  <span className='text-3xl'>{pregResult.emoji}</span>
                  <div>
                    <span className='text-[10px] uppercase font-bold text-gray-400 block'>Baby Size Benchmark</span>
                    <strong className='text-sm text-pink-900 font-bold'>{pregResult.fruitSize}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 10: CONCEPTION DATE CALCULATOR */}
        {/* ==================================================== */}
        {activeTab === 'conception' && (
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
        )}

        {/* ==================================================== */}
        {/* TAB 11: DUE DATE (EDD) CALCULATOR */}
        {/* ==================================================== */}
        {activeTab === 'duedate' && (
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
        )}
      </div>
    </div>
  );
};

export default Calculators;
