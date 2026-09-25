import type { ClassifyStatus, EscapeStatus, ResolutionStatus } from '../types/rasterMission';

/**
 * A Raster sub-mission is considered attempted once it leaves the idle state.
 * A timeout/skip is an intentional outcome that still unlocks the final summary.
 */
export const isRasterMissionComplete = (
  escapeStatus: EscapeStatus,
  classifyStatus: ClassifyStatus,
  resolutionStatus: ResolutionStatus,
  quizAnswered: boolean[],
): boolean => (
  escapeStatus !== 'idle' &&
  classifyStatus !== 'idle' &&
  resolutionStatus !== 'idle' &&
  quizAnswered.every(Boolean)
);
