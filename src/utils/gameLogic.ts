import type { WordPair } from '../types';
import { allWords } from '../data/words';
import { storage } from './storage';

// Calculate mastery percentage for a specific difficulty
function getMasteryPercentage(difficulty: 'easy' | 'medium' | 'hard'): number {
  const stats = storage.getWordStats();
  const wordsOfDifficulty = allWords.filter((w) => w.difficulty === difficulty);

  if (wordsOfDifficulty.length === 0) return 0;

  let masteredCount = 0;
  for (const word of wordsOfDifficulty) {
    const stat = stats.get(word.id);
    if (stat && stat.correctCount > 0 && stat.correctCount >= stat.incorrectCount) {
      masteredCount++;
    }
  }

  return (masteredCount / wordsOfDifficulty.length) * 100;
}

// Determine which difficulties should be available
function getAvailableDifficulties(): ('easy' | 'medium' | 'hard')[] {
  const easyMastery = getMasteryPercentage('easy');
  const mediumMastery = getMasteryPercentage('medium');

  const available: ('easy' | 'medium' | 'hard')[] = ['easy'];

  // Unlock medium words at 30% easy mastery
  if (easyMastery >= 30) {
    available.push('medium');
  }

  // Unlock hard words at 70% medium mastery AND 50% easy mastery
  if (mediumMastery >= 70 && easyMastery >= 50) {
    available.push('hard');
  }

  return available;
}

function selectRandomWords(words: WordPair[], count: number): WordPair[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}

export const gameUtils = {
  selectGameWords: (): WordPair[] => {
    const stats = storage.getWordStats();
    const now = Date.now();
    const availableDifficulties = getAvailableDifficulties();

    // Filter words based on spaced repetition logic AND available difficulties
    const words = allWords.filter((word) => {
      // Only include words of available difficulty
      if (!availableDifficulties.includes(word.difficulty)) return false;

      const stat = stats.get(word.id);

      // Always include words never seen
      if (!stat) return true;

      // Include words ready for review
      if (stat.nextReviewAt <= now) return true;

      // Exclude words not ready for review
      return false;
    });

    // If we don't have enough words for a game, include all words of available difficulties
    if (words.length < 5) {
      const availableWords = allWords.filter((w) =>
        availableDifficulties.includes(w.difficulty)
      );
      return selectRandomWords(availableWords, 5);
    }

    return selectRandomWords(words, 5);
  },

  getMasteryPercentage,
  getAvailableDifficulties,
};
