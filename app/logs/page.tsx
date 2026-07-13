"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/components/toast"
import { fetchLogs } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { LogEntry, LogLevel } from "@/lib/types"

const LEVEL: Record<LogLevel, { label: string; cls: string }> = {
  info: { label: "信息", cls: "bg-slate-100 text-slate-600" },
  success: { label: "成功", cls: "bg-green-50 text-green-700" },
  warn: { label: "提醒", cls: "bg-amber-50 text-amber-700" },
  error: { label: "错误", cls: "bg-red-50 text-red-700" },
}

const FILTERS: { key: "all" | LogLevel; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "success", label: "成功" },
  { key: "warn", label: "提醒" },
  { key: "error", label: "错误" },
]

export default function LogsPage() {
  const { data, isLoading, mutate, isValidating } = useSWR<LogEntry[]>(
    "logs",
    fetchLogs,
    { refreshInterval: 10000 },
  )
  const [filter, setFilter] = useState<"all" | LogLevel>("all")
  const { toast } = useToast()

  const rows = useMemo(() => {
    const list = data || []
    if (filter === "all") return list
    return list.filter((l) => l.level === filter)
  }, [data, filter])

  return (
    <div>
      <PageHeader
        title="日志"
        description="记录扫描、识别、发卡与登录相关的运营事件"
        right={
          <button
            onClick={() => {
              mutate()
              toast("已刷新日志", "info")
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-surface px-3 text-sm text-foreground hover:bg-slate-50"
          >
            <RefreshCw
              className={cn("size-4", isValidating && "animate-spin")}
            />
            刷新
          </button>
        }
      />

      <div className="flex gap-1 border-b bg-surface px-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-lg border bg-surface">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs text-muted">
                <th className="w-44 px-3 py-2.5 font-medium">时间</th>
                <th className="w-20 px-3 py-2.5 font-medium">级别</th>
                <th className="w-40 px-3 py-2.5 font-medium">事件</th>
                <th className="w-40 px-3 py-2.5 font-medium">账号</th>
                <th className="px-3 py-2.5 font-medium">详情</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted">
                    <Loader2 className="mr-2 inline size-4 animate-spin" />
                    正在加载日志…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted">
                    暂无日志
                  </td>
                </tr>
              ) : (
                rows.map((l) => {
                  const lv = LEVEL[l.level]
                  return (
                    <tr
                      key={l.id}
                      className="border-b last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-2.5 font-mono text-xs text-muted">
                        {l.time}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            lv.cls,
                          )}
                        >
                          {lv.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {l.event}
                      </td>
                      <td className="px-3 py-2.5 text-muted">
                        {l.account || "-"}
                      </td>
                      <td className="px-3 py-2.5 text-muted">
                        {l.detail || "-"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
