/**
 * Calculate One-Rep Max (1RM) using Epley Formula
 * 1RM = Weight * (1 + Reps / 30)
 */
export const calculate1RM = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const oneRepMax = weight * (1 + reps / 30);
  return Math.round(oneRepMax * 10) / 10;
};

/**
 * Format date for display
 */
export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatTimeAgo = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) {
    if (diffHours <= 1) return 'Just now';
    return `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(isoString);
};

/**
 * Format seconds into mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Suggest progressive overload targets based on previous best set
 */
export const getOverloadSuggestion = (
  prevWeight: number,
  prevReps: number,
  unit: 'kg' | 'lbs' = 'kg'
): { targetWeight: number; targetReps: number; suggestion: string } => {
  if (!prevWeight || !prevReps) {
    return { targetWeight: 20, targetReps: 10, suggestion: 'Start with comfortable warmup weight.' };
  }

  const weightStep = unit === 'kg' ? 2.5 : 5;

  if (prevReps >= 12) {
    return {
      targetWeight: prevWeight + weightStep,
      targetReps: 8,
      suggestion: `+${weightStep}${unit} weight increase recommended (Reps exceeded 12).`,
    };
  } else if (prevReps >= 8) {
    return {
      targetWeight: prevWeight,
      targetReps: prevReps + 1,
      suggestion: `Target +1 rep (${prevReps + 1} reps) at ${prevWeight}${unit} to progress volume.`,
    };
  } else {
    return {
      targetWeight: prevWeight,
      targetReps: prevReps + 1,
      suggestion: `Aim for ${prevReps + 1} reps with clean form before adding weight.`,
    };
  }
};
