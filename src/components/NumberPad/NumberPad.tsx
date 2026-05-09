import { memo } from 'react'
import styles from './NumberPad.module.css'

interface NumberPadProps {
  onNumber: (num: number) => void
  onErase: () => void
  disabled: boolean
}

export const NumberPad = memo(function NumberPad({ onNumber, onErase, disabled }: NumberPadProps) {
  return (
    <div className={styles.pad} role="group" aria-label="Number input pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          className={styles.numBtn}
          onClick={() => onNumber(n)}
          disabled={disabled}
          aria-label={`Enter ${n}`}
        >
          {n}
        </button>
      ))}
      <button
        className={[styles.numBtn, styles.eraseBtn].join(' ')}
        onClick={onErase}
        disabled={disabled}
        aria-label="Erase cell"
      >
        ✕
      </button>
    </div>
  )
})
