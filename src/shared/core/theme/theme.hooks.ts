import { useTheme } from './theme-context'

export const useDarkMode = () => {
  const { mode } = useTheme()

  return mode === 'dark'
}
