import { memo } from 'react'
import { CellState } from '../../types'
import { HighlightMap } from '../../hooks/useSudoku'
import { Cell } from '../Cell/Cell'
import styles from './Board.module.css'

interface BoardProps {
  board: CellState[][]
  highlights: HighlightMap
  onCellClick: (row: number, col: number) => void
}

export const Board = memo(function Board({ board, highlights, onCellClick }: BoardProps) {
  return (
    <div className={styles.board} role="grid" aria-label="Sudoku board">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`
          return (
            <div
              key={key}
              className={[
                styles.cellWrapper,
                c % 3 === 2 && c !== 8 ? styles.boxBorderRight : '',
                r % 3 === 2 && r !== 8 ? styles.boxBorderBottom : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Cell
                cell={cell}
                row={r}
                col={c}
                isSelected={highlights.selected === key}
                isRelated={highlights.related.has(key) && highlights.selected !== key}
                isSameValue={highlights.sameValue.has(key) && highlights.selected !== key}
                onClick={onCellClick}
              />
            </div>
          )
        }),
      )}
    </div>
  )
})
