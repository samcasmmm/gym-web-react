import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { db, DbWorkout, DbWorkoutSet, DbPersonalRecord } from '../db/database';
import { calculate1RM } from '../utils/calculations';

export interface ActiveSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  type: 'normal' | 'warmup' | 'drop';
  prevWeight?: number;
  prevReps?: number;
}

export interface ActiveExercise {
  id: string;
  name: string;
  gifUrl?: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  sets: ActiveSet[];
}

interface WorkoutContextType {
  isActive: boolean;
  workoutName: string;
  elapsedSeconds: number;
  exercises: ActiveExercise[];
  isResting: boolean;
  restTimeLeft: number;
  totalRestTime: number;
  unit: 'kg' | 'lbs';
  setUnit: (u: 'kg' | 'lbs') => void;
  startWorkout: (name?: string, initialExercises?: any[]) => void;
  addExerciseToWorkout: (exercise: any) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  finishWorkout: () => Promise<string | null>;
  cancelWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem('gym_active_workout') === 'true';
  });
  const [workoutName, setWorkoutName] = useState<string>(() => {
    return localStorage.getItem('gym_workout_name') || 'Daily Workout';
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    return Number(localStorage.getItem('gym_elapsed_seconds')) || 0;
  });
  const [exercises, setExercises] = useState<ActiveExercise[]>(() => {
    const saved = localStorage.getItem('gym_active_exercises');
    return saved ? JSON.parse(saved) : [];
  });

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [totalRestTime, setTotalRestTime] = useState(90);

  // Unit State
  const [unit, setUnitState] = useState<'kg' | 'lbs'>('kg');

  useEffect(() => {
    // Load unit from db
    db.settings.get('app_settings').then((settings) => {
      if (settings?.unit) setUnitState(settings.unit);
    });
  }, []);

  const setUnit = async (newUnit: 'kg' | 'lbs') => {
    setUnitState(newUnit);
    await db.settings.update('app_settings', { unit: newUnit });
  };

  // Persist Active Workout to localStorage
  useEffect(() => {
    localStorage.setItem('gym_active_workout', String(isActive));
    localStorage.setItem('gym_workout_name', workoutName);
    localStorage.setItem('gym_elapsed_seconds', String(elapsedSeconds));
    localStorage.setItem('gym_active_exercises', JSON.stringify(exercises));
  }, [isActive, workoutName, elapsedSeconds, exercises]);

  // Workout Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Rest Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            try {
              // Soft audio notification if supported
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              // Ignore audio context errors if browser blocks autoplay
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const startRestTimer = (seconds = 90) => {
    setTotalRestTime(seconds);
    setRestTimeLeft(seconds);
    setIsResting(true);
  };

  const stopRestTimer = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimeLeft((prev) => Math.max(0, prev + deltaSeconds));
  };

  const startWorkout = async (name = 'Daily Workout', initialExercises: any[] = []) => {
    setIsActive(true);
    setWorkoutName(name);
    setElapsedSeconds(0);

    // Prepare initial exercises with previous historical weights
    const preparedExercises: ActiveExercise[] = [];
    for (const ex of initialExercises) {
      const exId = ex.id || ex.exerciseId || ex.name;
      const prevSets = await db.workoutSets
        .where('exerciseName')
        .equals(ex.name)
        .reverse()
        .sortBy('date');

      const lastBestWeight = prevSets.length > 0 ? prevSets[0].weight : 20;
      const lastBestReps = prevSets.length > 0 ? prevSets[0].reps : 10;

      preparedExercises.push({
        id: exId,
        name: ex.name,
        gifUrl: ex.gifUrl,
        bodyPart: ex.bodyPart || (ex.bodyParts && ex.bodyParts[0]),
        target: ex.target || (ex.targetMuscles && ex.targetMuscles[0]),
        equipment: ex.equipment || (ex.equipments && ex.equipments[0]),
        sets: [
          {
            id: `set_${Date.now()}_1`,
            setNumber: 1,
            weight: lastBestWeight,
            reps: lastBestReps,
            completed: false,
            type: 'normal',
            prevWeight: lastBestWeight,
            prevReps: lastBestReps,
          },
          {
            id: `set_${Date.now()}_2`,
            setNumber: 2,
            weight: lastBestWeight,
            reps: lastBestReps,
            completed: false,
            type: 'normal',
            prevWeight: lastBestWeight,
            prevReps: lastBestReps,
          },
          {
            id: `set_${Date.now()}_3`,
            setNumber: 3,
            weight: lastBestWeight,
            reps: lastBestReps,
            completed: false,
            type: 'normal',
            prevWeight: lastBestWeight,
            prevReps: lastBestReps,
          },
        ],
      });
    }

    setExercises(preparedExercises);
  };

  const addExerciseToWorkout = async (exercise: any) => {
    const exId = exercise.id || exercise.exerciseId || exercise.name;
    const prevSets = await db.workoutSets
      .where('exerciseName')
      .equals(exercise.name)
      .reverse()
      .sortBy('date');

    const lastBestWeight = prevSets.length > 0 ? prevSets[0].weight : 20;
    const lastBestReps = prevSets.length > 0 ? prevSets[0].reps : 10;

    const newExercise: ActiveExercise = {
      id: exId,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      bodyPart: exercise.bodyPart || (exercise.bodyParts && exercise.bodyParts[0]),
      target: exercise.target || (exercise.targetMuscles && exercise.targetMuscles[0]),
      equipment: exercise.equipment || (exercise.equipments && exercise.equipments[0]),
      sets: [
        {
          id: `set_${Date.now()}_1`,
          setNumber: 1,
          weight: lastBestWeight,
          reps: lastBestReps,
          completed: false,
          type: 'normal',
          prevWeight: lastBestWeight,
          prevReps: lastBestReps,
        },
        {
          id: `set_${Date.now()}_2`,
          setNumber: 2,
          weight: lastBestWeight,
          reps: lastBestReps,
          completed: false,
          type: 'normal',
          prevWeight: lastBestWeight,
          prevReps: lastBestReps,
        },
        {
          id: `set_${Date.now()}_3`,
          setNumber: 3,
          weight: lastBestWeight,
          reps: lastBestReps,
          completed: false,
          type: 'normal',
          prevWeight: lastBestWeight,
          prevReps: lastBestReps,
        },
      ],
    };

    setExercises((prev) => [...prev, newExercise]);
    if (!isActive) {
      setIsActive(true);
      setWorkoutName('Workout Session');
    }
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: ActiveSet = {
            id: `set_${Date.now()}_${ex.sets.length + 1}`,
            setNumber: ex.sets.length + 1,
            weight: lastSet ? lastSet.weight : 20,
            reps: lastSet ? lastSet.reps : 10,
            completed: false,
            type: 'normal',
            prevWeight: lastSet?.prevWeight,
            prevReps: lastSet?.prevReps,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const filtered = ex.sets.filter((s) => s.id !== setId);
          return {
            ...ex,
            sets: filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
          };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          };
        }
        return ex;
      })
    );
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                const nextState = !s.completed;
                if (nextState) {
                  startRestTimer(90);
                }
                return { ...s, completed: nextState };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
  };

  const finishWorkout = async (): Promise<string | null> => {
    if (exercises.length === 0) return null;

    const workoutId = `w_${Date.now()}`;
    const nowIso = new Date().toISOString();
    let totalVolume = 0;
    let completedSetsCount = 0;
    const dbSets: DbWorkoutSet[] = [];
    const newPRs: DbPersonalRecord[] = [];

    for (const ex of exercises) {
      for (const set of ex.sets) {
        if (set.completed) {
          const volume = set.weight * set.reps;
          totalVolume += volume;
          completedSetsCount++;

          dbSets.push({
            id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            workoutId,
            exerciseId: ex.id,
            exerciseName: ex.name,
            bodyPart: ex.bodyPart,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            completed: true,
            type: set.type,
            date: nowIso,
          });

          // Check if Personal Record (PR)
          const est1RM = calculate1RM(set.weight, set.reps);
          const existingPR = await db.personalRecords
            .where('exerciseName')
            .equals(ex.name)
            .first();

          if (!existingPR || est1RM > existingPR.estimated1RM) {
            const prRecord: DbPersonalRecord = {
              id: `pr_${Date.now()}_${ex.id}`,
              exerciseId: ex.id,
              exerciseName: ex.name,
              weight: set.weight,
              reps: set.reps,
              estimated1RM: est1RM,
              date: nowIso,
            };
            if (existingPR) {
              await db.personalRecords.update(existingPR.id, prRecord);
            } else {
              newPRs.push(prRecord);
            }
          }
        }
      }
    }

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const workoutRecord: DbWorkout = {
      id: workoutId,
      name: workoutName,
      date: nowIso,
      durationMinutes,
      totalVolume,
      totalSets: completedSetsCount,
    };

    await db.workouts.add(workoutRecord);
    if (dbSets.length > 0) {
      await db.workoutSets.bulkAdd(dbSets);
    }
    if (newPRs.length > 0) {
      await db.personalRecords.bulkAdd(newPRs);
    }

    // Celebration Confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore confetti issues
    }

    // Reset Active Workout state
    setIsActive(false);
    setWorkoutName('Daily Workout');
    setElapsedSeconds(0);
    setExercises([]);
    stopRestTimer();

    localStorage.removeItem('gym_active_workout');
    localStorage.removeItem('gym_workout_name');
    localStorage.removeItem('gym_elapsed_seconds');
    localStorage.removeItem('gym_active_exercises');

    return workoutId;
  };

  const cancelWorkout = () => {
    setIsActive(false);
    setWorkoutName('Daily Workout');
    setElapsedSeconds(0);
    setExercises([]);
    stopRestTimer();

    localStorage.removeItem('gym_active_workout');
    localStorage.removeItem('gym_workout_name');
    localStorage.removeItem('gym_elapsed_seconds');
    localStorage.removeItem('gym_active_exercises');
  };

  return (
    <WorkoutContext.Provider
      value={{
        isActive,
        workoutName,
        elapsedSeconds,
        exercises,
        isResting,
        restTimeLeft,
        totalRestTime,
        unit,
        setUnit,
        startWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSet,
        removeSet,
        updateSet,
        toggleSetComplete,
        startRestTimer,
        stopRestTimer,
        adjustRestTimer,
        finishWorkout,
        cancelWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
