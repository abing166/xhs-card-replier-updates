import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number | string
  icon?: LucideIcon
  tone?: "default" | "primary" | "success" | "danger" | "warning"
}) {
  const toneMap = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
  }
  return (
    <div className="flex items-center justify-between rounded-lg border bg-surface px-4 py-3">
      <div className="flex flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className={cn("mt-0.5 text-xl font-semibold", toneMap[tone])}>
          {value}
        </span>
      </div>
      {Icon && <Icon className="size-5 text-slate-300" />}
    </div>
  )
}
