import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CardStatus } from "@/lib/types"

const MAP: Record<
  CardStatus,
  { label: string; className: string; loading?: boolean }
> = {
  pending: {
    label: "待发卡",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  reply_off: {
    label: "回复关闭中",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  sending: {
    label: "发卡中",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    loading: true,
  },
  sent: {
    label: "已发卡",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "发卡失败",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  review: {
    label: "需人工查看",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  not_qualified: {
    label: "不符合发卡",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  cancelled: {
    label: "已取消",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

export function StatusBadge({ status }: { status: CardStatus }) {
  const cfg = MAP[status] ?? MAP.pending
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        cfg.className,
      )}
    >
      {cfg.loading && <Loader2 className="size-3 animate-spin" />}
      {cfg.label}
    </span>
  )
}
