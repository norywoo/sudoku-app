import { memo } from 'react'
import { CellState } from '../../types'
import styles from './Cell.module.css'

interface CellProps {
  cell: CellState
  row: number
  col: number
  isSelected: boolean
  isRelated: boolean
  isSameValue: boolean
  onClick: (row: number, col: number) => void
}

export const Cell = memo(function Cell({
  cell,
  row,
  col,
  isSelected,
  isRelated,
  isSameValue,
  onClick,
}: CellProps) {
  const handleClick = () => onClick(row, col)

  const className = [
    styles.cell,
    isSelected ? styles.selected : '',
    isRelated && !isSelected ? styles.related : '',
    isSameValue && !isSelected ? styles.sameValue : '',
    cell.isError ? styles.error : '',
    cell.isGiven ? styles.given : '',
    !cell.isGiven && cell.value !== 0 ? styles.userInput : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      onClick={handleClick}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`}
      aria-selected={isSelected}
    >
      {cell.value !== 0 ? (
        <span className={styles.value}>{cell.value}</span>
      ) : cell.notes.length > 0 ? (
        <div className={styles.notes}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span key={n} className={styles.note}>
              {cell.notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
})
