export type Difficulty = 'easy' | 'medium' | 'hard'

export type MarkColor = 0 | 1 | 2 | 3 | 4

export interface CellState {
  value: number
  isGiven: boolean
  isError: boolean
  notes: number[]
  markColor: MarkColor
}

export interface GameState {
  board: CellState[][]
  solution: number[][]
  selectedCell: [number, number] | null
  difficulty: Difficulty
  isComplete: boolean
  elapsedSeconds: number
  history: CellState[][][]
  future: CellState[][][]
  lastInputCell: [number, number] | null
}
