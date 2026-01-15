import type { WordStats } from '../types';

const STATS_KEY = 'spanish_flashcards_stats';
const TOTAL_PLAYS_KEY = 'spanish_flashcards_total_plays';
const TOTAL_CORRECT_KEY = 'spanish_flashcards_total_correct';

export const storage = {
  getWordStats: (): Map<string, WordStats> => {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (!data) return new Map();
      const parsed = JSON.parse(data);
      return new Map(parsed);
    } catch {
      return new Map();
    }
  },

  setWordStats: (stats: Map<string, WordStats>): void => {
    try {
      const data = Array.from(stats.entries());
      localStorage.setItem(STATS_KEY, JSON.stringify(data));
    } catch {
      console.error('Failed to save word stats');
    }
  },

  updateWordStat: (wordId: string, correct: boolean): WordStats => {
    const stats = storage.getWordStats();
    const current = stats.get(wordId) || {
      wordId,
      correctCount: 0,
      incorrectCount: 0,
      lastSeenAt: 0,
      nextReviewAt: 0,
    };

    if (correct) {
      current.correctCount++;
      // Increase interval based on correct count
      current.nextReviewAt =
        Date.now() + getReviewInterval(current.correctCount);
    } else {
      current.incorrectCount++;
      // Reset to review soon if incorrect
      current.nextReviewAt = Date.now() + 60000; // 1 minute
    }

    current.lastSeenAt = Date.now();
    stats.set(wordId, current);
    storage.setWordStats(stats);
    return current;
  },

  getTotalPlays: (): number => {
    try {
      return parseInt(localStorage.getItem(TOTAL_PLAYS_KEY) || '0', 10);
    } catch {
      return 0;
    }
  },

  incrementTotalPlays: (): void => {
    const plays = storage.getTotalPlays();
    localStorage.setItem(TOTAL_PLAYS_KEY, String(plays + 1));
  },

  getTotalCorrect: (): number => {
    try {
      return parseInt(localStorage.getItem(TOTAL_CORRECT_KEY) || '0', 10);
    } catch {
      return 0;
    }
  },

  incrementTotalCorrect: (count: number): void => {
    const total = storage.getTotalCorrect();
    localStorage.setItem(TOTAL_CORRECT_KEY, String(total + count));
  },

  getStats: () => {
    const wordStats = storage.getWordStats();
    const totalCorrect = Array.from(wordStats.values()).reduce(
      (sum, stat) => sum + stat.correctCount,
      0
    );
    const totalIncorrect = Array.from(wordStats.values()).reduce(
      (sum, stat) => sum + stat.incorrectCount,
      0
    );
    const totalAnswered = totalCorrect + totalIncorrect;
    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalPlays: storage.getTotalPlays(),
      totalAnswered,
      totalCorrect,
      totalIncorrect,
      accuracy,
      wordsLearned: Array.from(wordStats.values()).filter(
        (stat) => stat.correctCount >= 3
      ).length,
    };
  },

  resetStats: (): void => {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(TOTAL_PLAYS_KEY);
    localStorage.removeItem(TOTAL_CORRECT_KEY);
  },
};

function getReviewInterval(correctCount: number): number {
  // Spaced repetition intervals (in milliseconds)
  // First review: 1 day
  // Second: 3 days
  // Third: 7 days
  // Fourth+: 14 days
  const intervals = [
    86400000, // 1 day
    259200000, // 3 days
    604800000, // 7 days
    1209600000, // 14 days
  ];
  return intervals[Math.min(correctCount - 1, intervals.length - 1)];
}
