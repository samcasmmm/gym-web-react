import Dexie, { Table } from 'dexie';

export interface DbWorkout {
  id: string;
  name: string;
  date: string; // ISO string
  durationMinutes: number;
  totalVolume: number; // in kg or lbs
  totalSets: number;
  notes?: string;
  routineName?: string;
}

export interface DbWorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  bodyPart?: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  type: 'normal' | 'warmup' | 'drop';
  date: string;
}

export interface DbBodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  chest?: number;
  waist?: number;
  arms?: number;
  bodyFat?: number;
  notes?: string;
}

export interface DbPersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
}

export interface DbCustomExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  instructions?: string[];
  gifUrl?: string;
}

export interface DbRoutine {
  id: string;
  name: string;
  category: 'PPL' | 'Upper/Lower' | 'Full Body' | 'Custom';
  description: string;
  exerciseNames: string[];
}

export interface DbSettings {
  id: string;
  unit: 'kg' | 'lbs';
  theme: 'light' | 'dark';
  defaultRestTime: number; // in seconds
  userName: string;
}

export class GymTrackerDB extends Dexie {
  workouts!: Table<DbWorkout, string>;
  workoutSets!: Table<DbWorkoutSet, string>;
  bodyMeasurements!: Table<DbBodyMeasurement, string>;
  personalRecords!: Table<DbPersonalRecord, string>;
  customExercises!: Table<DbCustomExercise, string>;
  routines!: Table<DbRoutine, string>;
  settings!: Table<DbSettings, string>;

  constructor() {
    super('GymTrackerDB');
    this.version(1).stores({
      workouts: 'id, date, name, totalVolume',
      workoutSets: 'id, workoutId, exerciseId, exerciseName, date',
      bodyMeasurements: 'id, date',
      personalRecords: 'id, exerciseId, exerciseName, weight, date',
      customExercises: 'id, name, bodyPart, target, equipment',
      routines: 'id, name, category',
      settings: 'id',
    });
  }
}

export const db = new GymTrackerDB();

// Initialize default settings and sample routines if empty
export const initializeDatabase = async () => {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'app_settings',
      unit: 'kg',
      theme: 'light',
      defaultRestTime: 90,
      userName: 'Athlete',
    });
  }

  const routinesCount = await db.routines.count();
  if (routinesCount === 0) {
    await db.routines.bulkAdd([
      {
        id: 'ppl-push',
        name: 'Push (Chest, Shoulders, Triceps)',
        category: 'PPL',
        description: 'Focus on horizontal and vertical pressing movements for upper body push power.',
        exerciseNames: ['barbell bench press', 'dumbbell shoulder press', 'incline dumbbell press', 'triceps pushdown', 'lateral raise'],
      },
      {
        id: 'ppl-pull',
        name: 'Pull (Back & Biceps)',
        category: 'PPL',
        description: 'Target lats, rhomboids, rear delts, and biceps with heavy pull patterns.',
        exerciseNames: ['barbell deadlift', 'pull-up', 'barbell bent over row', 'dumbbell bicep curl', 'face pull'],
      },
      {
        id: 'ppl-legs',
        name: 'Legs & Core',
        category: 'PPL',
        description: 'Build lower body strength with squats, hinges, and targeted quad/hamstring work.',
        exerciseNames: ['barbell squat', 'romanian deadlift', 'leg press', 'leg curl', 'standing calf raise'],
      },
      {
        id: 'upper-strength',
        name: 'Upper Body Power',
        category: 'Upper/Lower',
        description: 'Comprehensive upper body volume targeting chest, upper back, and shoulders.',
        exerciseNames: ['barbell bench press', 'lat pulldown', 'overhead press', 'seated cable row', 'dips'],
      },
    ]);
  }

  // Seed initial sample workout and measurements if brand new
  const workoutsCount = await db.workouts.count();
  if (workoutsCount === 0) {
    const today = new Date();
    const d1 = new Date(today); d1.setDate(d1.getDate() - 4);
    const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
    const d3 = new Date(today); d3.setDate(d3.getDate() - 1);

    const workout1Id = 'w_demo_1';
    const workout2Id = 'w_demo_2';
    const workout3Id = 'w_demo_3';

    await db.workouts.bulkAdd([
      {
        id: workout1Id,
        name: 'Push Strength Power',
        date: d1.toISOString(),
        durationMinutes: 52,
        totalVolume: 4250,
        totalSets: 12,
        notes: 'Felt strong on bench press! Hit a solid 85kg set.',
        routineName: 'Push (Chest, Shoulders, Triceps)',
      },
      {
        id: workout2Id,
        name: 'Pull & Upper Back',
        date: d2.toISOString(),
        durationMinutes: 58,
        totalVolume: 5120,
        totalSets: 14,
        notes: 'Great lat pump. Deadlifts felt smooth and controlled.',
        routineName: 'Pull (Back & Biceps)',
      },
      {
        id: workout3Id,
        name: 'Legs Hypertrophy',
        date: d3.toISOString(),
        durationMinutes: 48,
        totalVolume: 6400,
        totalSets: 12,
        notes: 'Deep squat reps. Great quad activation.',
        routineName: 'Legs & Core',
      },
    ]);

    await db.workoutSets.bulkAdd([
      { id: 's1', workoutId: workout1Id, exerciseId: 'ex_bench', exerciseName: 'Barbell Bench Press', setNumber: 1, weight: 70, reps: 10, completed: true, type: 'normal', date: d1.toISOString() },
      { id: 's2', workoutId: workout1Id, exerciseId: 'ex_bench', exerciseName: 'Barbell Bench Press', setNumber: 2, weight: 80, reps: 8, completed: true, type: 'normal', date: d1.toISOString() },
      { id: 's3', workoutId: workout1Id, exerciseId: 'ex_bench', exerciseName: 'Barbell Bench Press', setNumber: 3, weight: 85, reps: 6, completed: true, type: 'normal', date: d1.toISOString() },
      { id: 's4', workoutId: workout2Id, exerciseId: 'ex_deadlift', exerciseName: 'Barbell Deadlift', setNumber: 1, weight: 100, reps: 8, completed: true, type: 'normal', date: d2.toISOString() },
      { id: 's5', workoutId: workout2Id, exerciseId: 'ex_deadlift', exerciseName: 'Barbell Deadlift', setNumber: 2, weight: 120, reps: 5, completed: true, type: 'normal', date: d2.toISOString() },
      { id: 's6', workoutId: workout3Id, exerciseId: 'ex_squat', exerciseName: 'Barbell Squat', setNumber: 1, weight: 90, reps: 8, completed: true, type: 'normal', date: d3.toISOString() },
      { id: 's7', workoutId: workout3Id, exerciseId: 'ex_squat', exerciseName: 'Barbell Squat', setNumber: 2, weight: 105, reps: 6, completed: true, type: 'normal', date: d3.toISOString() },
    ]);

    await db.personalRecords.bulkAdd([
      { id: 'pr_1', exerciseId: 'ex_bench', exerciseName: 'Barbell Bench Press', weight: 85, reps: 6, estimated1RM: 100, date: d1.toISOString() },
      { id: 'pr_2', exerciseId: 'ex_deadlift', exerciseName: 'Barbell Deadlift', weight: 120, reps: 5, estimated1RM: 135, date: d2.toISOString() },
      { id: 'pr_3', exerciseId: 'ex_squat', exerciseName: 'Barbell Squat', weight: 105, reps: 6, estimated1RM: 122, date: d3.toISOString() },
    ]);

    await db.bodyMeasurements.bulkAdd([
      { id: 'm1', date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0], weight: 77.2, chest: 102, waist: 84, arms: 36.5 },
      { id: 'm2', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], weight: 76.8, chest: 102.5, waist: 83.5, arms: 37 },
      { id: 'm3', date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], weight: 76.4, chest: 103, waist: 82.5, arms: 37.2 },
      { id: 'm4', date: new Date().toISOString().split('T')[0], weight: 76.0, chest: 103.5, waist: 82.0, arms: 37.5 },
    ]);
  }
};
