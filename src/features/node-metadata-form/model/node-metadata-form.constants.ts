export interface ComplexityOption {
  value: 'basic' | 'intermediate' | 'advanced'
  labelKey: string
}

export const COMPLEXITY_OPTIONS: ComplexityOption[] = [
  {
    value: 'basic',
    labelKey: 'form.complexity.basic'
  },
  {
    value: 'intermediate',
    labelKey: 'form.complexity.intermediate'
  },
  {
    value: 'advanced',
    labelKey: 'form.complexity.advanced'
  }
]
