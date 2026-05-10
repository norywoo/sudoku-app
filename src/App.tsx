import { useCallback, useEffect } from 'react'
import { Board } from './components/Board/Board'
import { Controls } from './components/Controls/Controls'
import { NumberPad } from './components/NumberPad/NumberPad'
import { useSudoku } from './hooks/useSudoku'
import styles from './App.module.css'

export default function App() {
  const {
    state,
    highlights,
    selectCell,
    inputNumber,
    clearCell,
    newGame,
    setDifficulty,
    revert,
    canRevert,
    cycleMarkColor,
    lastInputCell,
  } = useSudoku()

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.isComplete) return

      const keyNum = parseInt(e.key)
      if (keyNum >= 1 && keyNum <= 9) {
        inputNumber(keyNum)
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        clearCell()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        revert()
        return
      }

      // Arrow key navigation
      if (!state.selectedCell) return
      const [r, c] = state.selectedCell
      const moves: Record<string, [number, number]> = {
        ArrowUp: [r - 1, c],
        ArrowDown: [r + 1, c],
        ArrowLeft: [r, c - 1],
        ArrowRight: [r, c + 1],
      }
      if (e.key in moves) {
        e.preventDefault()
        const [nr, nc] = moves[e.key]
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
          selectCell(nr, nc)
        }
      }
    },
    [state.isComplete, state.selectedCell, inputNumber, clearCell, selectCell, revert],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const padDisabled = !state.selectedCell || state.isComplete

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sudoku</h1>
      </header>

      <main className={styles.main}>
        <Controls
          difficulty={state.difficulty}
          elapsedSeconds={state.elapsedSeconds}
          isComplete={state.isComplete}
          canRevert={canRevert}
          onNewGame={newGame}
          onSetDifficulty={setDifficulty}
          onRevert={revert}
        />

        <Board
          board={state.board}
          highlights={highlights}
          lastInputCell={lastInputCell}
          onCellClick={selectCell}
          onCycleMarkColor={cycleMarkColor}
        />

        <NumberPad
          onNumber={inputNumber}
          onErase={clearCell}
          disabled={padDisabled}
        />
      </main>
    </div>
  )
}
