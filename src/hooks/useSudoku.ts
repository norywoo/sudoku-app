import { useCallback, useEffect, useReducer, useRef } from 'react'
import { CellState, Difficulty, GameState } from '../types'
import { generatePuzzle } from '../utils/generator'
import { isBoardComplete, isValidPlacement } from '../utils/validator'

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------

function buildBoard(puzzle: number[][], solution: number[][]): CellState[][] {
  return puzzle.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      isGiven: val !== 0,
      isError: val !== 0 && val !== solution[r][c],
      notes: [],
    })),
  )
}

function buildInitialState(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty)
  return {
    board: buildBoard(puzzle, solution),
    solution,
    selectedCell: null,
    difficulty,
    isComplete: false,
    elapsedSeconds: 0,
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'INPUT_NUMBER'; num: number }
  | { type: 'CLEAR_CELL' }
  | { type: 'NEW_GAME'; difficulty: Difficulty }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'TICK' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_CELL': {
      const { row, col } = action
      // If clicking the same cell, deselect
      if (
        state.selectedCell &&
        state.selectedCell[0] === row &&
        state.selectedCell[1] === col
      ) {
        return { ...state, selectedCell: null }
      }
      return { ...state, selectedCell: [row, col] }
    }

    case 'INPUT_NUMBER': {
      if (!state.selectedCell || state.isComplete) return state
      const [row, col] = state.selectedCell
      const cell = state.board[row][col]
      if (cell.isGiven) return state

      // Build a raw number board reflecting the new value — used for all validation
      const rawBoard = state.board.map((r) => r.map((c) => c.value))
      rawBoard[row][col] = action.num

      const isError = !isValidPlacement(rawBoard, row, col, action.num)

      const newBoard = state.board.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return { ...c, value: action.num, isError, notes: [] }
          }
          // Re-check errors for every non-given, filled cell using the updated board
          if (c.isGiven || c.value === 0) return c
          const err = !isValidPlacement(rawBoard, ri, ci, c.value)
          return { ...c, isError: err }
        }),
      )

      const isComplete = isBoardComplete(rawBoard, state.solution)
      return { ...state, board: newBoard, isComplete }
    }

    case 'CLEAR_CELL': {
      if (!state.selectedCell || state.isComplete) return state
      const [row, col] = state.selectedCell
      const cell = state.board[row][col]
      if (cell.isGiven) return state

      // Build raw board with the cleared cell set to 0
      const rawBoard = state.board.map((r) => r.map((c) => c.value))
      rawBoard[row][col] = 0

      const newBoard = state.board.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return { ...c, value: 0, isError: false, notes: [] }
          }
          // Re-check other cells' errors now that this cell is cleared
          if (c.isGiven || c.value === 0) return c
          const err = !isValidPlacement(rawBoard, ri, ci, c.value)
          return { ...c, isError: err }
        }),
      )

      return { ...state, board: newBoard }
    }

    case 'NEW_GAME': {
      return buildInitialState(action.difficulty)
    }

    case 'SET_DIFFICULTY': {
      return { ...state, difficulty: action.difficulty }
    }

    case 'TICK': {
      if (state.isComplete) return state
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Derived: highlighted cells
// ---------------------------------------------------------------------------

export interface HighlightMap {
  /** cells in same row / col / box as selected */
  related: Set<string>
  /** cells with same value as selected */
  sameValue: Set<string>
  /** the selected cell itself */
  selected: string | null
}

function computeHighlights(state: GameState): HighlightMap {
  const result: HighlightMap = { related: new Set(), sameValue: new Set(), selected: null }
  if (!state.selectedCell) return result

  const [sr, sc] = state.selectedCell
  result.selected = `${sr},${sc}`
  const selectedValue = state.board[sr][sc].value

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const key = `${r},${c}`
      const isRelated =
        r === sr ||
        c === sc ||
        (Math.floor(r / 3) === Math.floor(sr / 3) &&
          Math.floor(c / 3) === Math.floor(sc / 3))

      if (isRelated) result.related.add(key)

      if (selectedValue !== 0 && state.board[r][c].value === selectedValue) {
        result.sameValue.add(key)
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSudoku() {
  const [state, dispatch] = useReducer(reducer, 'easy', buildInitialState)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Stop timer when complete
  useEffect(() => {
    if (state.isComplete && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [state.isComplete])

  const selectCell = useCallback((row: number, col: number) => {
    dispatch({ type: 'SELECT_CELL', row, col })
  }, [])

  const inputNumber = useCallback((num: number) => {
    dispatch({ type: 'INPUT_NUMBER', num })
  }, [])

  const clearCell = useCallback(() => {
    dispatch({ type: 'CLEAR_CELL' })
  }, [])

  const newGame = useCallback((difficulty: Difficulty) => {
    if (timerRef.current) clearInterval(timerRef.current)
    dispatch({ type: 'NEW_GAME', difficulty })
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
  }, [])

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty })
  }, [])

  const highlights = computeHighlights(state)

  return {
    state,
    highlights,
    selectCell,
    inputNumber,
    clearCell,
    newGame,
    setDifficulty,
  }
}
