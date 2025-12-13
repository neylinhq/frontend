import * as React from 'react'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 500000

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
}

interface ToastState {
  toasts: Toast[]
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
} as const

type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: Toast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<Toast> }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: string }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: string }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach(toast => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        )
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId)
      }
  }
}

const listeners: Array<(state: ToastState) => void> = []

let memoryState: ToastState = { toasts: [] }

const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => {
    listener(memoryState)
  })
}

let count = 0

const genId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
}

const toast = (options: ToastOptions) => {
  const id = genId()

  const update = (props: Partial<Toast>) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id }
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...options,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          dismiss()
        }
      }
    } as Toast
  })

  return {
    id,
    dismiss,
    update
  }
}

toast.success = (title: string, options?: Omit<ToastOptions, 'variant' | 'title'>) => {
  return toast({ ...options, title, variant: 'success' })
}

toast.error = (title: string, options?: Omit<ToastOptions, 'variant' | 'title'>) => {
  return toast({ ...options, title, variant: 'error' })
}

toast.warning = (title: string, options?: Omit<ToastOptions, 'variant' | 'title'>) => {
  return toast({ ...options, title, variant: 'warning' })
}

const useToast = () => {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  }
}

export { useToast, toast }
