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

// Axios client for open-source ExerciseDB API (No API key needed)
export const exerciseDbClient = axios.create({
  baseURL: EXERCISE_API_BASE,
  timeout: 15000,
});

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

// API Functions
export const fetchBodyParts = async (): Promise<string[]> => {
  const response = await exerciseDbClient.get<ApiResponse<BodyPartItem[]>>('/bodyparts');
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return ['all', ...response.data.data.map((item) => item.name)];
  }
  return ['all'];
};

export const fetchExercises = async ({
  bodyPart = 'all',
  search = '',
  limit = 25,
  cursor,
}: {
  bodyPart?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ exercises: Exercise[]; meta?: any }> => {
  let url = '/exercises';
  const params: Record<string, any> = { limit };
  if (cursor) params.after = cursor;

  if (search.trim()) {
    url = '/exercises/search';
    params.name = search.trim();
  } else if (bodyPart && bodyPart !== 'all') {
    url = '/exercises/bodyparts';
    params.bodyParts = bodyPart;
  }

  const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>(url, { params });
  const rawList = response.data?.data || [];
  return {
    exercises: rawList.map(normalizeExercise),
    meta: response.data?.meta,
  };
};

export const fetchExerciseById = async (exerciseId: string): Promise<Exercise> => {
  const response = await exerciseDbClient.get<ApiResponse<RawExercise>>(`/exercises/${exerciseId}`);
  if (response.data && response.data.data) {
    return normalizeExercise(response.data.data);
  }
  throw new Error(`Exercise ${exerciseId} not found`);
};

export const fetchSimilarExercisesByMuscle = async (targetMuscle: string): Promise<Exercise[]> => {
  if (!targetMuscle) return [];
  const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/muscles', {
    params: { targetMuscles: targetMuscle, limit: 15 },
  });
  return (response.data?.data || []).map(normalizeExercise);
};

export const fetchSimilarExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
  if (!equipment) return [];
  const response = await exerciseDbClient.get<ApiResponse<RawExercise[]>>('/exercises/equipments', {
    params: { equipments: equipment, limit: 15 },
  });
  return (response.data?.data || []).map(normalizeExercise);
};

// Generates exercise workout video recommendations without external third-party API keys
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
