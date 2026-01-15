export interface WordPair {
  id: string;
  english: string;
  spanish: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WordStats {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastSeenAt: number;
  nextReviewAt: number;
}

export interface GameState {
  selectedEnglish: string | null;
  matched: Set<string>;
  wordStats: Map<string, WordStats>;
}
