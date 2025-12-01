import katex from 'katex'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface MathInputDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (latex: string) => void
  initialValue?: string
  mode?: 'block' | 'inline'
}

// Comprehensive math symbols organized by category
const MATH_SYMBOLS = {
  basic: [
    { label: '+', value: '+', title: 'Plus' },
    { label: '−', value: '-', title: 'Minus' },
    { label: '×', value: '\\times', title: 'Multiply' },
    { label: '÷', value: '\\div', title: 'Divide' },
    { label: '±', value: '\\pm', title: 'Plus-minus' },
    { label: '∓', value: '\\mp', title: 'Minus-plus' },
    { label: '=', value: '=', title: 'Equals' },
    { label: '≠', value: '\\neq', title: 'Not equal' },
    { label: '<', value: '<', title: 'Less than' },
    { label: '>', value: '>', title: 'Greater than' },
    { label: '≤', value: '\\leq', title: 'Less or equal' },
    { label: '≥', value: '\\geq', title: 'Greater or equal' },
    { label: '≈', value: '\\approx', title: 'Approximately' },
    { label: '≡', value: '\\equiv', title: 'Equivalent' },
    { label: '∝', value: '\\propto', title: 'Proportional' },
    { label: '∞', value: '\\infty', title: 'Infinity' }
  ],
  fractions: [
    { label: 'a/b', value: '\\frac{a}{b}', title: 'Fraction' },
    { label: 'ⁿ√', value: '\\sqrt[n]{x}', title: 'Nth root' },
    { label: '√', value: '\\sqrt{x}', title: 'Square root' },
    { label: 'x²', value: 'x^{2}', title: 'Square' },
    { label: 'xⁿ', value: 'x^{n}', title: 'Power' },
    { label: 'xₙ', value: 'x_{n}', title: 'Subscript' },
    { label: 'x⁺ₙ', value: 'x^{a}_{b}', title: 'Super and subscript' },
    { label: '|x|', value: '|x|', title: 'Absolute value' }
  ],
  greek: [
    { label: 'α', value: '\\alpha', title: 'Alpha' },
    { label: 'β', value: '\\beta', title: 'Beta' },
    { label: 'γ', value: '\\gamma', title: 'Gamma' },
    { label: 'δ', value: '\\delta', title: 'Delta' },
    { label: 'ε', value: '\\epsilon', title: 'Epsilon' },
    { label: 'ζ', value: '\\zeta', title: 'Zeta' },
    { label: 'η', value: '\\eta', title: 'Eta' },
    { label: 'θ', value: '\\theta', title: 'Theta' },
    { label: 'λ', value: '\\lambda', title: 'Lambda' },
    { label: 'μ', value: '\\mu', title: 'Mu' },
    { label: 'π', value: '\\pi', title: 'Pi' },
    { label: 'ρ', value: '\\rho', title: 'Rho' },
    { label: 'σ', value: '\\sigma', title: 'Sigma' },
    { label: 'τ', value: '\\tau', title: 'Tau' },
    { label: 'φ', value: '\\phi', title: 'Phi' },
    { label: 'ω', value: '\\omega', title: 'Omega' },
    { label: 'Δ', value: '\\Delta', title: 'Delta (capital)' },
    { label: 'Σ', value: '\\Sigma', title: 'Sigma (capital)' },
    { label: 'Π', value: '\\Pi', title: 'Pi (capital)' },
    { label: 'Ω', value: '\\Omega', title: 'Omega (capital)' }
  ],
  calculus: [
    { label: '∫', value: '\\int', title: 'Integral' },
    { label: '∫ₐᵇ', value: '\\int_{a}^{b}', title: 'Definite integral' },
    { label: '∬', value: '\\iint', title: 'Double integral' },
    { label: '∭', value: '\\iiint', title: 'Triple integral' },
    { label: '∮', value: '\\oint', title: 'Contour integral' },
    { label: '∂', value: '\\partial', title: 'Partial derivative' },
    { label: '∇', value: '\\nabla', title: 'Nabla/Del' },
    { label: 'd/dx', value: '\\frac{d}{dx}', title: 'Derivative' },
    { label: '∂/∂x', value: '\\frac{\\partial}{\\partial x}', title: 'Partial' },
    { label: 'lim', value: '\\lim_{x \\to a}', title: 'Limit' },
    { label: 'Σ', value: '\\sum_{i=1}^{n}', title: 'Sum' },
    { label: 'Π', value: '\\prod_{i=1}^{n}', title: 'Product' }
  ],
  sets: [
    { label: '∈', value: '\\in', title: 'Element of' },
    { label: '∉', value: '\\notin', title: 'Not element of' },
    { label: '⊂', value: '\\subset', title: 'Subset' },
    { label: '⊃', value: '\\supset', title: 'Superset' },
    { label: '⊆', value: '\\subseteq', title: 'Subset or equal' },
    { label: '⊇', value: '\\supseteq', title: 'Superset or equal' },
    { label: '∪', value: '\\cup', title: 'Union' },
    { label: '∩', value: '\\cap', title: 'Intersection' },
    { label: '∅', value: '\\emptyset', title: 'Empty set' },
    { label: 'ℕ', value: '\\mathbb{N}', title: 'Natural numbers' },
    { label: 'ℤ', value: '\\mathbb{Z}', title: 'Integers' },
    { label: 'ℚ', value: '\\mathbb{Q}', title: 'Rationals' },
    { label: 'ℝ', value: '\\mathbb{R}', title: 'Real numbers' },
    { label: 'ℂ', value: '\\mathbb{C}', title: 'Complex numbers' }
  ],
  logic: [
    { label: '∧', value: '\\land', title: 'And' },
    { label: '∨', value: '\\lor', title: 'Or' },
    { label: '¬', value: '\\neg', title: 'Not' },
    { label: '⇒', value: '\\Rightarrow', title: 'Implies' },
    { label: '⇔', value: '\\Leftrightarrow', title: 'If and only if' },
    { label: '∀', value: '\\forall', title: 'For all' },
    { label: '∃', value: '\\exists', title: 'Exists' },
    { label: '∄', value: '\\nexists', title: 'Not exists' },
    { label: '→', value: '\\to', title: 'Arrow right' },
    { label: '←', value: '\\leftarrow', title: 'Arrow left' },
    { label: '↔', value: '\\leftrightarrow', title: 'Arrow both' },
    { label: '∴', value: '\\therefore', title: 'Therefore' }
  ],
  brackets: [
    { label: '()', value: '\\left( \\right)', title: 'Parentheses' },
    { label: '[]', value: '\\left[ \\right]', title: 'Brackets' },
    { label: '{}', value: '\\left\\{ \\right\\}', title: 'Braces' },
    { label: '⟨⟩', value: '\\langle \\rangle', title: 'Angle brackets' },
    { label: '|.|', value: '\\left| \\right|', title: 'Absolute' },
    { label: '‖.‖', value: '\\left\\| \\right\\|', title: 'Norm' },
    { label: '⌊.⌋', value: '\\lfloor \\rfloor', title: 'Floor' },
    { label: '⌈.⌉', value: '\\lceil \\rceil', title: 'Ceiling' }
  ],
  functions: [
    { label: 'sin', value: '\\sin', title: 'Sine' },
    { label: 'cos', value: '\\cos', title: 'Cosine' },
    { label: 'tan', value: '\\tan', title: 'Tangent' },
    { label: 'cot', value: '\\cot', title: 'Cotangent' },
    { label: 'sec', value: '\\sec', title: 'Secant' },
    { label: 'csc', value: '\\csc', title: 'Cosecant' },
    { label: 'arcsin', value: '\\arcsin', title: 'Arcsine' },
    { label: 'arccos', value: '\\arccos', title: 'Arccosine' },
    { label: 'arctan', value: '\\arctan', title: 'Arctangent' },
    { label: 'ln', value: '\\ln', title: 'Natural log' },
    { label: 'log', value: '\\log', title: 'Logarithm' },
    { label: 'logₐ', value: '\\log_{a}', title: 'Log base a' },
    { label: 'exp', value: '\\exp', title: 'Exponential' },
    { label: 'eˣ', value: 'e^{x}', title: 'E to the x' }
  ],
  matrices: [
    {
      label: '2×2',
      value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      title: '2x2 matrix'
    },
    {
      label: '3×3',
      value: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}',
      title: '3x3 matrix'
    },
    {
      label: '[2×2]',
      value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      title: '2x2 bracket matrix'
    },
    {
      label: 'det',
      value: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
      title: 'Determinant'
    },
    { label: '...', value: '\\cdots', title: 'Horizontal dots' },
    { label: '⋮', value: '\\vdots', title: 'Vertical dots' },
    { label: '⋱', value: '\\ddots', title: 'Diagonal dots' }
  ],
  misc: [
    { label: '°', value: '^{\\circ}', title: 'Degree' },
    { label: '′', value: "'", title: 'Prime' },
    { label: '″', value: "''", title: 'Double prime' },
    { label: '…', value: '\\ldots', title: 'Ellipsis' },
    { label: '·', value: '\\cdot', title: 'Dot product' },
    { label: '⊗', value: '\\otimes', title: 'Tensor product' },
    { label: '⊕', value: '\\oplus', title: 'Direct sum' },
    { label: 'ℏ', value: '\\hbar', title: 'H-bar' },
    { label: '†', value: '\\dagger', title: 'Dagger' },
    { label: 'ℓ', value: '\\ell', title: 'Script l' },
    { label: '→', value: '\\vec{x}', title: 'Vector' },
    { label: 'x̄', value: '\\bar{x}', title: 'Bar' },
    { label: 'x̂', value: '\\hat{x}', title: 'Hat' },
    { label: 'x̃', value: '\\tilde{x}', title: 'Tilde' },
    { label: 'ẋ', value: '\\dot{x}', title: 'Dot' },
    { label: 'ẍ', value: '\\ddot{x}', title: 'Double dot' }
  ]
}

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'editor.math.categories.basic',
  fractions: 'editor.math.categories.fractions',
  greek: 'editor.math.categories.greek',
  calculus: 'editor.math.categories.calculus',
  sets: 'editor.math.categories.sets',
  logic: 'editor.math.categories.logic',
  brackets: 'editor.math.categories.brackets',
  functions: 'editor.math.categories.functions',
  matrices: 'editor.math.categories.matrices',
  misc: 'editor.math.categories.misc'
}

export const MathInputDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = '',
  mode = 'block'
}: MathInputDialogProps) => {
  const { t } = useTranslation()
  const [latex, setLatex] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const focusTimeoutRef = useRef<number | null>(null)
  const insertTimeoutRef = useRef<number | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
      if (insertTimeoutRef.current) {
        clearTimeout(insertTimeoutRef.current)
      }
    }
  }, [])

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLatex(initialValue)
      setError(null)
      // Focus input after a small delay to ensure dialog is rendered
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
      focusTimeoutRef.current = window.setTimeout(() => inputRef.current?.focus(), 100)
    }
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [isOpen, initialValue])

  // Render preview with race condition protection
  useEffect(() => {
    let isMounted = true

    if (!previewRef.current || !latex.trim()) {
      if (previewRef.current && isMounted) {
        previewRef.current.innerHTML = `<span class="text-muted-foreground text-sm">${t('editor.math.previewPlaceholder')}</span>`
      }
      if (isMounted) {
        setError(null)
      }
      return () => {
        isMounted = false
      }
    }

    try {
      katex.render(latex, previewRef.current, {
        displayMode: mode === 'block',
        throwOnError: true,
        errorColor: '#ef4444'
      })
      if (isMounted) {
        setError(null)
      }
    } catch (err) {
      if (isMounted && err instanceof Error) {
        setError(err.message)
        // FIX: Escape error message to prevent XSS
        if (previewRef.current) {
          previewRef.current.innerHTML = `<span class="text-destructive text-sm">${escapeHtml(err.message)}</span>`
        }
      }
    }

    return () => {
      isMounted = false
    }
  }, [latex, mode, t])

  const handleSubmit = useCallback(() => {
    if (!latex.trim()) {
      return
    }
    if (error) {
      return
    }
    onSubmit(latex)
    onClose()
  }, [latex, error, onSubmit, onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const insertSymbol = useCallback((value: string) => {
    setLatex(prev => {
      const textarea = inputRef.current
      if (!textarea) {
        return prev + value
      }

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = prev.substring(0, start) + value + prev.substring(end)

      // Set cursor position after inserted text (tracked for cleanup)
      if (insertTimeoutRef.current) {
        clearTimeout(insertTimeoutRef.current)
      }
      insertTimeoutRef.current = window.setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = start + value.length
          inputRef.current.focus()
        }
      }, 0)

      return newValue
    })
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-lg max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'block' ? t('editor.math.blockTitle') : t('editor.math.inlineTitle')}
          </DialogTitle>
          <DialogDescription>{t('editor.math.hint')}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col gap-4'>
          {/* Input */}
          <div>
            <label
              htmlFor='math-latex-input'
              className='mb-1.5 block text-sm font-medium text-foreground'
            >
              {t('editor.math.inputLabel')}
            </label>
            <textarea
              id='math-latex-input'
              ref={inputRef}
              value={latex}
              onChange={e => setLatex(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('editor.math.inputPlaceholder')}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm font-mono',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                'resize-none min-h-[80px]',
                error ? 'border-destructive' : 'border-input'
              )}
              rows={3}
            />
          </div>

          {/* Preview */}
          <div>
            <div className='mb-1.5 text-sm font-medium text-foreground'>
              {t('editor.math.preview')}
            </div>
            <div
              ref={previewRef}
              className={cn(
                'min-h-[60px] rounded-md border border-input bg-muted/30 p-4',
                'flex items-center justify-center overflow-x-auto',
                mode === 'block' ? 'text-xl' : 'text-base'
              )}
            />
          </div>

          {/* Symbol Categories */}
          <div className='flex-1 overflow-hidden'>
            <div className='mb-1.5 text-sm font-medium text-foreground'>
              {t('editor.math.symbols')}
            </div>
            <div className='h-[200px] overflow-y-auto rounded-md border border-input p-2'>
              <div className='space-y-3'>
                {Object.entries(MATH_SYMBOLS).map(([category, symbols]) => (
                  <div key={category}>
                    <div className='mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t(CATEGORY_LABELS[category])}
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {symbols.map(symbol => (
                        <button
                          key={symbol.value}
                          type='button'
                          onClick={() => insertSymbol(symbol.value)}
                          title={symbol.title}
                          className='min-w-[32px] h-8 px-2 rounded border border-input bg-background text-sm hover:bg-accent transition-colors font-mono'
                        >
                          {symbol.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!latex.trim() || !!error}>
            {t('editor.math.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
