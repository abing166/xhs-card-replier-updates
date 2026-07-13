import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  right,
}: {
  title: string
  description?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b bg-surface px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted text-pretty">{description}</p>
        )}
      </div>
      {right && (
        <div className="flex shrink-0 items-center gap-2">{right}</div>
      )}
    </div>
  )
}
