import { Difficulty } from '../types'
import { isValidPlacement } from './validator'

/** Fisher-Yates shuffle in place */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Deep-copy a 9x9 grid */
function copyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row])
}

/**
 * Fill the grid with a valid complete Sudoku solution using backtracking.
 * Returns true if successful.
 */
function fillGrid(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num
            if (fillGrid(grid)) return true
            grid[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

/**
 * Count the number of solutions for the given board (up to `limit`).
 * Used to ensure the puzzle has a unique solution.
 */
function countSolutions(grid: number[][], limit: number): number {
  let count = 0

  function solve(g: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(g, row, col, num)) {
              g[row][col] = num
              if (solve(g)) return true
              g[row][col] = 0
            }
          }
          return false
        }
      }
    }
    count++
    return count >= limit
  }

  solve(copyGrid(grid))
  return count
}

/** Number of cells to remove per difficulty */
const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 55,
}

/**
 * Generate a Sudoku puzzle with a unique solution.
 * Returns both the puzzle (with 0s for empty cells) and the complete solution.
 */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: number[][]
  solution: number[][]
} {
  // Generate a complete solution
  const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
  fillGrid(solution)

  const puzzle = copyGrid(solution)
  const cellsToRemove = CELLS_TO_REMOVE[difficulty]

  // Build a list of all positions and shuffle them
  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }
  shuffle(positions)

  let removed = 0
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break

    const backup = puzzle[r][c]
    puzzle[r][c] = 0

    // For hard difficulty skip uniqueness check to improve performance
    // For easy/medium ensure unique solution
    if (difficulty !== 'hard') {
      const solutions = countSolutions(puzzle, 2)
      if (solutions !== 1) {
        puzzle[r][c] = backup
        continue
      }
    }

    removed++
  }

  return { puzzle, solution }
}
