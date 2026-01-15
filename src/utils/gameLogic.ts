import type { WordPair } from '../types';
import { allWords } from '../data/words';
import { storage } from './storage';

export const gameUtils = {
  selectGameWords: (): WordPair[] => {
    const stats = storage.getWordStats();
    const now = Date.now();

    // Filter words based on spaced repetition logic
    const words = allWords.filter((word) => {
      const stat = stats.get(word.id);

      // Always include words never seen
      if (!stat) return true;

      // Include words ready for review
      if (stat.nextReviewAt <= now) return true;

      // Exclude words not ready for review
      return false;
    });

    // If we don't have enough words for a game, include all words
    if (words.length < 5) {
      return selectRandomWords(allWords, 5);
    }

    return selectRandomWords(words, 5);
  },

  shuffleArray: <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  checkMatch: (englishId: string, spanishId: string, wordPairs: WordPair[]): boolean => {
    const englishWord = wordPairs.find((w) => w.id === englishId);
    const spanishWord = wordPairs.find((w) => w.id === spanishId);

    if (!englishWord || !spanishWord) return false;
    return englishWord.id === spanishWord.id;
  },
};

function selectRandomWords(words: WordPair[], count: number): WordPair[] {
  const selected: WordPair[] = [];
  const copy = [...words];

  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    selected.push(copy[randomIndex]);
    copy.splice(randomIndex, 1);
  }

  return selected;
}
