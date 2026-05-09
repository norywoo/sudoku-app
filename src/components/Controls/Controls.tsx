import { memo } from 'react'
import { Difficulty } from '../../types'
import styles from './Controls.module.css'

interface ControlsProps {
  difficulty: Difficulty
  elapsedSeconds: number
  isComplete: boolean
  onNewGame: (difficulty: Difficulty) => void
  onSetDifficulty: (difficulty: Difficulty) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const Controls = memo(function Controls({
  difficulty,
  elapsedSeconds,
  isComplete,
  onNewGame,
  onSetDifficulty,
}: ControlsProps) {
  const handleNewGame = () => onNewGame(difficulty)
  const handleDifficulty = (d: Difficulty) => {
    onSetDifficulty(d)
  }

  return (
    <div className={styles.controls}>
      <div className={styles.topRow}>
        <div className={styles.difficultyGroup} role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={[styles.diffBtn, difficulty === d ? styles.active : ''].join(' ')}
              onClick={() => handleDifficulty(d)}
              aria-pressed={difficulty === d}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        <div className={styles.timerGroup}>
          <span className={styles.timerLabel}>Time</span>
          <span className={[styles.timer, isComplete ? styles.timerComplete : ''].join(' ')}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      <button className={styles.newGameBtn} onClick={handleNewGame}>
        New Game
      </button>

      {isComplete && (
        <div className={styles.successBanner} role="alert">
          Congratulations! Puzzle solved!
        </div>
      )}
    </div>
  )
})
