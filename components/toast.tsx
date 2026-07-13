"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"
interface Toast {
  id: number
  message: string
  type: ToastType
}

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-center gap-2 rounded-lg border bg-surface px-4 py-2.5 text-sm shadow-lg"
          >
            {t.type === "success" && (
              <CheckCircle2 className="size-4 text-success" />
            )}
            {t.type === "error" && (
              <AlertCircle className="size-4 text-danger" />
            )}
            {t.type === "info" && <Info className="size-4 text-primary" />}
            <span className="text-foreground">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-1 text-muted hover:text-foreground"
              aria-label="关闭提示"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return { toast: (_: string, __?: ToastType) => {} }
  }
  return ctx
}
