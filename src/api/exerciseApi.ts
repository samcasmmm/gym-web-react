import axios from 'axios';

const EXERCISE_API_BASE = 'https://oss.exercisedb.dev/api/v1';

export interface RawExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
}

export interface Exercise extends RawExercise {
  id: string;
  bodyPart: string;
  target: string;
  equipment: string;
}

export interface ApiResponse<T> {
  success: boolean;
  meta?: {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
  data: T;
}

export interface BodyPartItem {
  name: string;
}

export interface VideoItem {
  title: string;
  channelName: string;
  url: string;
  thumbnail: string;
}

// Axios client for open-source ExerciseDB API
export const exerciseDbClient = axios.create({
  baseURL: EXERCISE_API_BASE,
  timeout: 15000,
});

// In-memory exercise cache for instant client-side searching
let exercisePoolCache: Exercise[] = [];
let isPreloading = false;

// Helper to normalize exercise data
export const normalizeExercise = (raw: any): Exercise => {
  const bodyParts = Array.isArray(raw.bodyParts) ? raw.bodyParts : raw.bodyPart ? [raw.bodyPart] : [];
  const targetMuscles = Array.isArray(raw.targetMuscles) ? raw.targetMuscles : raw.target ? [raw.target] : [];
  const equipments = Array.isArray(raw.equipments) ? raw.equipments : raw.equipment ? [raw.equipment] : [];

  return {
    exerciseId: raw.exerciseId || raw.id || '',
    id: raw.exerciseId || raw.id || '',
    name: raw.name || '',
    gifUrl: raw.gifUrl || '',
    bodyParts,
    bodyPart: bodyParts[0] || '',
    targetMuscles,
    target: targetMuscles[0] || '',
    equipments,
    equipment: equipments[0] || '',
    secondaryMuscles: raw.secondaryMuscles || [],
    instructions: raw.instructions || [],
  };
};

// Preload exercise database in background to empower lightning-fast search
export const preloadExercisePool = async (): Promise<Exercise[]> => {
  if (exercisePoolCache.length >= 100) return exercisePoolCache;
  if (isPreloading) return exercisePoolCache;

  isPreloading = true;
  try {
    const categories = ['chest', 'back', 'waist', 'upper arms', 'upper legs', 'shoulders', 'cardio', 'lower legs', 'lower arms', 'neck'];
    const responses = await Promise.allSettled(
      categories.map((cat) =>
        exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/bodyparts', {
          params: { bodyParts: cat, limit: 25 },
        })
      )
    );

    const allExercises: Exercise[] = [];
    responses.forEach((res) => {
      if (res.status === 'fulfilled' && res.value.data?.data) {
        res.value.data.data.forEach((raw) => {
          allExercises.push(normalizeExercise(raw));
        });
      }
    });

    // Also get standard general exercises
    try {
      const generalRes = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises', {
        params: { limit: 25 },
      });
      if (generalRes.data?.data) {
        generalRes.data.data.forEach((raw) => {
          allExercises.push(normalizeExercise(raw));
        });
      }
    } catch (e) {
      // Ignore general page error
    }

    // Deduplicate by exerciseId
    const uniqueMap = new Map<string, Exercise>();
    allExercises.forEach((ex) => {
      if (ex.exerciseId && !uniqueMap.has(ex.exerciseId)) {
        uniqueMap.set(ex.exerciseId, ex);
      }
    });

    exercisePoolCache = Array.from(uniqueMap.values());
  } catch (err) {
    console.warn('Exercise pool preloading note:', err);
  } finally {
    isPreloading = false;
  }

  return exercisePoolCache;
};

// Start background preload immediately
preloadExercisePool().catch(() => {});

// API Functions
export const fetchBodyParts = async (): Promise<string[]> => {
  try {
    const response = await exerciseDbClient.get<ApiResponse<BodyPartItem[]>>('/bodyparts');
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return ['all', ...response.data.data.map((item) => item.name)];
    }
  } catch (e) {
    console.warn('Failed to fetch body parts, using standard list:', e);
  }
  return ['all', 'chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio', 'neck'];
};

export const fetchExercises = async ({
  bodyPart = 'all',
  search = '',
  limit = 50,
  cursor,
}: {
  bodyPart?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ exercises: Exercise[]; meta?: any }> => {
  const queryTerm = search.trim().toLowerCase();

  // If user entered a search term, search across preloaded/fetched exercise pool
  if (queryTerm) {
    const pool = await preloadExercisePool();
    const matches = pool.filter((ex) => {
      const nameMatch = ex.name.toLowerCase().includes(queryTerm);
      const targetMatch = ex.targetMuscles.some((t) => t.toLowerCase().includes(queryTerm));
      const bodyPartMatch = ex.bodyParts.some((bp) => bp.toLowerCase().includes(queryTerm));
      const equipMatch = ex.equipments.some((eq) => eq.toLowerCase().includes(queryTerm));
      const secondaryMatch = (ex.secondaryMuscles || []).some((sm) => sm.toLowerCase().includes(queryTerm));
      return nameMatch || targetMatch || bodyPartMatch || equipMatch || secondaryMatch;
    });

    return {
      exercises: matches,
      meta: { total: matches.length },
    };
  }

  // If body part filter is active
  if (bodyPart && bodyPart.toLowerCase() !== 'all') {
    try {
      const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/bodyparts', {
        params: { bodyParts: bodyPart.toLowerCase(), limit: 25 },
      });
      const rawList = response.data?.data || [];
      const normalized = rawList.map(normalizeExercise);

      // Add to pool cache
      normalized.forEach((ex) => {
        if (!exercisePoolCache.some((c) => c.exerciseId === ex.exerciseId)) {
          exercisePoolCache.push(ex);
        }
      });

      return {
        exercises: normalized,
        meta: response.data?.meta,
      };
    } catch (e) {
      console.warn('Bodypart fetch fallback to pool:', e);
      const pool = await preloadExercisePool();
      const filtered = pool.filter((ex) =>
        ex.bodyParts.some((bp) => bp.toLowerCase() === bodyPart.toLowerCase())
      );
      return { exercises: filtered, meta: { total: filtered.length } };
    }
  }

  // Default / All
  try {
    const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises', {
      params: { limit: 25, after: cursor },
    });
    const rawList = response.data?.data || [];
    const normalized = rawList.map(normalizeExercise);

    normalized.forEach((ex) => {
      if (!exercisePoolCache.some((c) => c.exerciseId === ex.exerciseId)) {
        exercisePoolCache.push(ex);
      }
    });

    if (normalized.length > 0) {
      return {
        exercises: normalized,
        meta: response.data?.meta,
      };
    }
  } catch (e) {
    console.warn('All exercises fetch error, using pool cache:', e);
  }

  const pool = await preloadExercisePool();
  return { exercises: pool, meta: { total: pool.length } };
};

export const fetchExerciseById = async (exerciseId: string): Promise<Exercise> => {
  // Check local pool first
  const foundInPool = exercisePoolCache.find((ex) => ex.exerciseId === exerciseId || ex.id === exerciseId);
  if (foundInPool) return foundInPool;

  const response = await exerciseDbClient.get<ApiResponse<RawExercise>>(`/exercises/${exerciseId}`);
  if (response.data && response.data.data) {
    const normalized = normalizeExercise(response.data.data);
    exercisePoolCache.push(normalized);
    return normalized;
  }
  throw new Error(`Exercise ${exerciseId} not found`);
};

export const fetchSimilarExercisesByMuscle = async (targetMuscle: string): Promise<Exercise[]> => {
  if (!targetMuscle) return [];
  try {
    const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/muscles', {
      params: { targetMuscles: targetMuscle.toLowerCase(), limit: 15 },
    });
    return (response.data?.data || []).map(normalizeExercise);
  } catch (e) {
    const pool = await preloadExercisePool();
    return pool.filter((ex) =>
      ex.targetMuscles.some((tm) => tm.toLowerCase() === targetMuscle.toLowerCase())
    );
  }
};

export const fetchSimilarExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
  if (!equipment) return [];
  try {
    const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/equipments', {
      params: { equipments: equipment.toLowerCase(), limit: 15 },
    });
    return (response.data?.data || []).map(normalizeExercise);
  } catch (e) {
    const pool = await preloadExercisePool();
    return pool.filter((ex) =>
      ex.equipments.some((eq) => eq.toLowerCase() === equipment.toLowerCase())
    );
  }
};

export const fetchExerciseVideos = async (exerciseName: string): Promise<VideoItem[]> => {
  if (!exerciseName) return [];
  const encoded = encodeURIComponent(`${exerciseName} workout guide technique`);
  return [
    {
      title: `How to do ${exerciseName.toUpperCase()} - Form & Technique Guide`,
      channelName: 'Fitness & Workout Guide',
      url: `https://www.youtube.com/results?search_query=${encoded}`,
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    },
    {
      title: `${exerciseName.toUpperCase()} Common Mistakes & How to Fix Them`,
      channelName: 'Strength & Conditioning',
      url: `https://www.youtube.com/results?search_query=${encoded}+mistakes`,
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    },
    {
      title: `Best ${exerciseName.toUpperCase()} Variations for Muscle Growth`,
      channelName: 'Hypertrophy Training',
      url: `https://www.youtube.com/results?search_query=${encoded}+variations`,
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    },
  ];
};
