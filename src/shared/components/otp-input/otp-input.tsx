import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, useRef } from 'react'
import { cn } from '@/shared/lib/cn'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
  className?: string
}

export const OtpInput = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error = false,
  autoFocus: _autoFocus = true,
  className
}: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow digits
    if (!/^\d*$/.test(inputValue)) {
      return
    }

    const newValue = value.split('')
    newValue[index] = inputValue.slice(-1) // Take only last character
    const result = newValue.join('').slice(0, length)
    onChange(result)

    // Move to next input if value entered
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (result.length === length && onComplete) {
      onComplete(result)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newValue = value.split('')
        newValue[index - 1] = ''
        onChange(newValue.join(''))
      } else {
        // Clear current input
        const newValue = value.split('')
        newValue[index] = ''
        onChange(newValue.join(''))
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      // Focus on the input after the last pasted character
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()

      // Auto-submit when all digits pasted
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      }
    }
  }

  const handleFocus = (index: number) => {
    // Select the input content on focus
    inputRefs.current[index]?.select()
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el
          }}
          type='text'
          inputMode='numeric'
          pattern='\d*'
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold rounded-md border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-border focus:border-primary focus:ring-primary/20',
            'bg-background text-foreground'
          )}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}
