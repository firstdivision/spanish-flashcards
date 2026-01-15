import type { WordStats } from '../types';

const INITIAL_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
const INTERVAL_MULTIPLIER = 2;
const MAX_INTERVAL = 1000 * 60 * 60 * 24 * 30; // 30 days

export function initializeWordStats(wordId: string): WordStats {
  return {
    wordId,
    correctCount: 0,
    incorrectCount: 0,
    lastSeenAt: Date.now(),
    nextReviewAt: Date.now(),
  };
}

export function updateStats(
  stats: WordStats,
  isCorrect: boolean
): WordStats {
  const updated = { ...stats };
  updated.lastSeenAt = Date.now();

  if (isCorrect) {
    updated.correctCount++;
    // Increase interval for correct answers
    const interval = Math.min(
      INITIAL_INTERVAL * Math.pow(INTERVAL_MULTIPLIER, updated.correctCount - 1),
      MAX_INTERVAL
    );
    updated.nextReviewAt = Date.now() + interval;
  } else {
    updated.incorrectCount++;
    // Reset to be tested sooner for incorrect answers
    updated.nextReviewAt = Date.now() + INITIAL_INTERVAL * 0.5;
  }

  return updated;
}

export function shouldIncludeWord(stats: WordStats | undefined): boolean {
  if (!stats) return true;
  return Date.now() >= stats.nextReviewAt;
}

export function getWordPriority(stats: WordStats | undefined): number {
  if (!stats) return 1;
  
  // Words that are due for review get higher priority
  const timeSinceDue = Date.now() - stats.nextReviewAt;
  const correctRatio = stats.correctCount / Math.max(stats.correctCount + stats.incorrectCount, 1);
  
  // More overdue = higher priority, lower correct ratio = higher priority
  return timeSinceDue + (1 - correctRatio) * 1000;
}
