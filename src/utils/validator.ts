/**
 * Check if placing `num` at (row, col) on `board` is valid
 * (does not conflict with existing values in the same row, column, or 3x3 box).
 * The cell at (row, col) is treated as empty for this check.
 */
export function isValidPlacement(
  board: number[][],
  row: number,
  col: number,
  num: number,
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false
    }
  }

  return true
}

/**
 * Check if the current board matches the solution and is fully filled.
 */
export function isBoardComplete(
  board: number[][],
  solution: number[][],
): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0 || board[r][c] !== solution[r][c]) return false
    }
  }
  return true
}
