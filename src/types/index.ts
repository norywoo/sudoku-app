export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CellState {
  value: number
  isGiven: boolean
  isError: boolean
  notes: number[]
}

export interface GameState {
  board: CellState[][]
  solution: number[][]
  selectedCell: [number, number] | null
  difficulty: Difficulty
  isComplete: boolean
  elapsedSeconds: number
}
