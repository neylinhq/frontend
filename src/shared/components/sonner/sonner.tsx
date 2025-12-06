import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '@/app/theme'

export const Toaster = () => {
  const { mode } = useTheme()

  return (
    <SonnerToaster
      theme={mode}
      position='top-right'
      toastOptions={{
        classNames: {
          toast: 'group shadow-lg !bg-background/95 !text-foreground',
          title: 'font-medium !text-foreground',
          description: 'text-sm opacity-90 !text-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'toast-error',
          success: 'toast-success',
          warning: 'toast-warning',
          info: 'toast-info'
        }
      }}
    />
  )
}
