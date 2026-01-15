import { useState, useEffect, useCallback } from 'react';
import type { WordPair } from '../types';
import { storage } from '../utils/storage';
import { gameUtils } from '../utils/gameLogic';
import './Game.css';

export function Game() {
  const [currentRound, setCurrentRound] = useState<WordPair[]>([]);
  const [spanishWords, setSpanishWords] = useState<WordPair[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect';
    message: string;
  } | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(storage.getStats());
  const [masteryLevels, setMasteryLevels] = useState({
    easy: gameUtils.getMasteryPercentage('easy'),
    medium: gameUtils.getMasteryPercentage('medium'),
    hard: gameUtils.getMasteryPercentage('hard'),
  });

  // Generate a new round
  const generateRound = useCallback(() => {
    const selectedWords = gameUtils.selectGameWords();
    const shuffledSpanish = [...selectedWords].sort(() => Math.random() - 0.5);

    setCurrentRound(selectedWords);
    setSpanishWords(shuffledSpanish);
    setMatched(new Set());
    setFeedback(null);
    setRoundComplete(false);
    setSelectedEnglish(null);
  }, []);

  // Initialize first round
  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleEnglishClick = (englishId: string) => {
    if (matched.has(englishId)) return;
    setSelectedEnglish(englishId);
  };

  const handleSpanishClick = (spanishId: string) => {
    if (
      !selectedEnglish ||
      matched.has(selectedEnglish) ||
      matched.has(spanishId)
    )
      return;

    const englishWord = currentRound.find((w) => w.id === selectedEnglish);
    const spanishWord = spanishWords.find((w) => w.id === spanishId);

    if (!englishWord || !spanishWord) return;

    const isCorrect = englishWord.id === spanishWord.id;

    // Update stats in storage
    storage.updateWordStat(englishWord.id, isCorrect);

    if (isCorrect) {
      setMatched((prev) => new Set([...prev, englishWord.id]));
      setFeedback({ type: 'correct', message: '✓ Correct!' });

      // Check if round is complete
      const newMatched = new Set([...matched, englishWord.id]);
      if (newMatched.size === currentRound.length) {
        storage.incrementTotalPlays();
        storage.incrementTotalCorrect(newMatched.size);
        setRoundComplete(true);
        setStats(storage.getStats());
        // Update mastery levels
        setMasteryLevels({
          easy: gameUtils.getMasteryPercentage('easy'),
          medium: gameUtils.getMasteryPercentage('medium'),
          hard: gameUtils.getMasteryPercentage('hard'),
        });
      }
    } else {
      setFeedback({ type: 'incorrect', message: '✗ Try again' });
    }

    setSelectedEnglish(null);

    // Clear feedback after 1.5 seconds
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleNextRound = () => {
    generateRound();
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      storage.resetStats();
      setStats(storage.getStats());
      setMasteryLevels({
        easy: gameUtils.getMasteryPercentage('easy'),
        medium: gameUtils.getMasteryPercentage('medium'),
        hard: gameUtils.getMasteryPercentage('hard'),
      });
      generateRound();
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-top">
          <h1>Spanish Flashcards</h1>
          <button
            className="stats-button"
            onClick={() => setShowStats(!showStats)}
            title="View statistics"
          >
            📊
          </button>
        </div>
        {!roundComplete && currentRound.length > 0 && (
          <div className="progress">
            {matched.size}/{currentRound.length}
          </div>
        )}
      </div>

      {showStats && (
        <div className="stats-panel">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Plays</span>
              <span className="stat-value">{stats.totalPlays}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Answered</span>
              <span className="stat-value">{stats.totalAnswered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{stats.accuracy}%</span>
            </div>

          <h3>Mastery Levels</h3>
          <div className="mastery-grid">
            <div className="mastery-item">
              <span className="mastery-label">Easy Words</span>
              <div className="mastery-bar">
                <div className="mastery-progress" style={{ width: `${masteryLevels.easy}%` }}></div>
              </div>
              <span className="mastery-value">{Math.round(masteryLevels.easy)}%</span>
            </div>
            <div className="mastery-item">
              <span className="mastery-label">Medium Words</span>
              <div className="mastery-bar">
                <div className="mastery-progress" style={{ width: `${masteryLevels.medium}%` }}></div>
              </div>
              <span className="mastery-value">{Math.round(masteryLevels.medium)}%</span>
              {masteryLevels.easy < 30 && <span className="unlock-hint">Unlock at 30% Easy</span>}
            </div>
            <div className="mastery-item">
              <span className="mastery-label">Hard Words</span>
              <div className="mastery-bar">
                <div className="mastery-progress" style={{ width: `${masteryLevels.hard}%` }}></div>
              </div>
              <span className="mastery-value">{Math.round(masteryLevels.hard)}%</span>
              {masteryLevels.medium < 70 && <span className="unlock-hint">Unlock at 70% Medium</span>}
            </div>
          </div>

            <div className="stat-item">
              <span className="stat-label">Words Learned</span>
              <span className="stat-value">{stats.wordsLearned}</span>
            </div>
          </div>
          <button className="button button-secondary" onClick={handleResetProgress}>
            Reset Progress
          </button>
        </div>
      )}

      {feedback && (
        <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
      )}

      {roundComplete ? (
        <div className="round-complete">
          <h2>Round Complete! 🎉</h2>
          <p>All {currentRound.length} matches found!</p>
          <button className="button button-primary" onClick={handleNextRound}>
            Next Round
          </button>
        </div>
      ) : (
        <div className="game-board">
          <div className="word-column">
            <h3>English</h3>
            <div className="words-list">
              {currentRound.map((word) => (
                <button
                  key={word.id}
                  className={`word-button ${
                    selectedEnglish === word.id ? 'selected' : ''
                  } ${matched.has(word.id) ? 'matched' : ''}`}
                  onClick={() => handleEnglishClick(word.id)}
                  disabled={matched.has(word.id)}
                >
                  {word.english}
                </button>
              ))}
            </div>
          </div>

          <div className="word-column">
            <h3>Spanish</h3>
            <div className="words-list">
              {spanishWords.map((word) => (
                <button
                  key={`spanish-${word.id}`}
                  className={`word-button ${
                    matched.has(word.id) ? 'matched' : ''
                  }`}
                  onClick={() => handleSpanishClick(word.id)}
                  disabled={matched.has(word.id) || !selectedEnglish}
                >
                  {word.spanish}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
