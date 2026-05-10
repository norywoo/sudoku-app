import { memo } from 'react'
import { CellState } from '../../types'
import styles from './Cell.module.css'

// Cycles: 黒 → Red → Green → Purple → Amber → 黒
const MARK_COLORS = ['#111827', '#dc2626', '#16a34a', '#9333ea', '#d97706']

interface CellProps {
  cell: CellState
  row: number
  col: number
  isSelected: boolean
  isRelated: boolean
  isSameValue: boolean
  isLastInput: boolean
  onClick: (row: number, col: number) => void
}

export const Cell = memo(function Cell({
  cell,
  row,
  col,
  isSelected,
  isRelated,
  isSameValue,
  isLastInput,
  onClick,
}: CellProps) {
  const handleClick = () => onClick(row, col)

  const isUserFilled = !cell.isGiven && cell.value !== 0

  const className = [
    styles.cell,
    isSelected ? styles.selected : '',
    isRelated && !isSelected ? styles.related : '',
    isSameValue && !isSelected ? styles.sameValue : '',
    cell.isError ? styles.error : '',
    cell.isGiven ? styles.given : '',
    isUserFilled ? styles.userInput : '',
    isLastInput && isUserFilled ? styles.lastInput : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Apply markColor as inline color only when not in a state that overrides it
  const valueColor =
    isUserFilled && !cell.isError && !isSelected
      ? MARK_COLORS[cell.markColor]
      : undefined

  return (
    <div
      className={className}
      onClick={handleClick}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`}
      aria-selected={isSelected}
    >
      {cell.value !== 0 ? (
        <span className={styles.value} style={{ color: valueColor }}>
          {cell.value}
        </span>
      ) : cell.notes.length > 0 ? (
        <div className={styles.notes}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span key={n} className={styles.note}>
              {cell.notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
      {isLastInput && isUserFilled && (
        <span
          className={styles.markDot}
          style={{ background: MARK_COLORS[cell.markColor] }}
          aria-hidden="true"
        />
      )}
    </div>
  )
})
