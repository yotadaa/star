export const MAX_ACTIVE_READ_MS = 60 * 60 * 1_000;
export const ENGAGED_READ_MS = 30_000;
export const ENGAGED_PROGRESS_BPS = 2_500;
export const COMPLETED_PROGRESS_BPS = 9_000;

export function advanceReadingWindow(existingWindow, activeMsDelta, progressBps) {
  const previousActiveReadMs = existingWindow?.activeReadMs ?? 0;
  const activeReadMs = Math.min(MAX_ACTIVE_READ_MS, previousActiveReadMs + activeMsDelta);
  const acceptedActiveMs = Math.max(0, activeReadMs - previousActiveReadMs);
  const maxProgressBps = Math.max(existingWindow?.maxProgressBps ?? 0, progressBps);
  const becameEngaged = !existingWindow?.engagedAt
    && activeReadMs >= ENGAGED_READ_MS
    && maxProgressBps >= ENGAGED_PROGRESS_BPS;
  const becameCompleted = !existingWindow?.completedAt
    && maxProgressBps >= COMPLETED_PROGRESS_BPS;

  return {
    activeReadMs,
    acceptedActiveMs,
    maxProgressBps,
    becameEngaged,
    becameCompleted,
    viewCountDelta: existingWindow ? 0 : 1,
    engagedReadCountDelta: becameEngaged ? 1 : 0,
    completionCountDelta: becameCompleted ? 1 : 0,
    engagedTimeDelta: becameEngaged
      ? activeReadMs
      : existingWindow?.engagedAt
        ? acceptedActiveMs
        : 0,
  };
}
