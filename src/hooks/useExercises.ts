import { useQuery } from '@tanstack/react-query';
import {
  fetchBodyParts,
  fetchExercises,
  fetchExerciseById,
  fetchSimilarExercisesByMuscle,
  fetchSimilarExercisesByEquipment,
  fetchExerciseVideos,
  Exercise,
} from '../api/exerciseApi';

export const useBodyParts = () => {
  return useQuery({
    queryKey: ['bodyparts'],
    queryFn: fetchBodyParts,
  });
};

export const useExercises = (bodyPart: string, search: string, limit = 25) => {
  return useQuery({
    queryKey: ['exercises', { bodyPart, search, limit }],
    queryFn: () => fetchExercises({ bodyPart, search, limit }),
  });
};

export const useExerciseDetail = (exerciseId: string) => {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => fetchExerciseById(exerciseId),
    enabled: Boolean(exerciseId),
  });
};

export const useSimilarMuscleExercises = (targetMuscle: string) => {
  return useQuery({
    queryKey: ['similarMuscles', targetMuscle],
    queryFn: () => fetchSimilarExercisesByMuscle(targetMuscle),
    enabled: Boolean(targetMuscle),
  });
};

export const useSimilarEquipmentExercises = (equipment: string) => {
  return useQuery({
    queryKey: ['similarEquipment', equipment],
    queryFn: () => fetchSimilarExercisesByEquipment(equipment),
    enabled: Boolean(equipment),
  });
};

export const useExerciseVideos = (exerciseName: string) => {
  return useQuery({
    queryKey: ['exerciseVideos', exerciseName],
    queryFn: () => fetchExerciseVideos(exerciseName),
    enabled: Boolean(exerciseName),
  });
};
