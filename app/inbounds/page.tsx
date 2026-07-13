"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { Download, Loader2, RefreshCw, RotateCw, Search } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PlatformLogo } from "@/components/platform-logo"
import { AccountAvatar } from "@/components/account-avatar"
import { StatusBadge } from "@/components/status-badge"
import { InboundDetail } from "@/components/inbound-detail"
import { useToast } from "@/components/toast"
import { accountAction, fetchInbounds } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Inbound, InboundTab } from "@/lib/types"

const TABS: { key: InboundTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "今日进线" },
  { key: "pending", label: "待发卡" },
  { key: "sent", label: "已发卡" },
  { key: "failed", label: "发卡失败" },
  { key: "review", label: "需人工查看" },
  { key: "not_qualified", label: "不符合发卡" },
]

export default function InboundsPage() {
  const [tab, setTab] = useState<InboundTab>("all")
  const [account, setAccount] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [detail, setDetail] = useState<Inbound | null>(null)
  const { toast } = useToast()

  const { data, isLoading, mutate, isValidating } = useSWR<Inbound[]>(
    ["inbounds", tab],
    () => fetchInbounds(tab),
  )

  const accounts = useMemo(() => {
    const set = new Set((data || []).map((i) => i.accountName))
    return Array.from(set)
  }, [data])

  const rows = useMemo(() => {
    let list = data || []
    if (account !== "all") list = list.filter((i) => i.accountName === account)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          (i.phone || "").toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q),
      )
    }
    return list
  }, [data, account, query])

  function exportCsv() {
    const header = [
      "平台",
      "来源账号",
      "客户",
      "咨询病种/手术",
      "联系方式",
      "最近消息总结",
      "发卡状态",
      "发卡时间",
      "失败原因",
    ]
    const lines = rows.map((r) =>
      [
        "小红书",
        r.accountName,
        r.customerName,
        r.disease,
        r.phone || "-",
        r.summary,
        r.status,
        r.sentAt || "-",
        r.failReason || "-",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `客资_${tab}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast("已导出当前客资", "success")
  }

  async function retry(row: Inbound) {
    toast(`已重新加入发卡队列：${row.customerName}`, "info")
    await accountAction(0, "start")
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="客资管理"
        description="自动识别最近 7 天私信客资，按队列发送商家名片"
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b bg-surface px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-surface px-4 py-3">
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="h-9 rounded-md border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="all">全部账号</option>
          {accounts.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索客户昵称、手机号、消息"
            className="h-9 w-full rounded-md border bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => mutate()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-surface px-3 text-sm text-foreground hover:bg-slate-50"
        >
          <RefreshCw className={cn("size-4", isValidating && "animate-spin")} />
          刷新
        </button>
        <button
          onClick={exportCsv}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-surface px-3 text-sm text-foreground hover:bg-slate-50"
        >
          <Download className="size-4" />
          导出客资
        </button>
      </div>

      {/* Table */}
      <div className="px-4 pb-6">
        <div className="overflow-hidden rounded-lg border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs text-muted">
                  <Th className="w-14">平台</Th>
                  <Th className="w-44">来源账号</Th>
                  <Th className="w-32">客户</Th>
                  <Th className="w-40">咨询病种/手术</Th>
                  <Th className="w-32">联系方式</Th>
                  <Th>最近消息总结</Th>
                  <Th className="w-28">发卡状态</Th>
                  <Th className="w-36">发卡时间</Th>
                  <Th className="w-48">失败原因</Th>
                  <Th className="w-24">操作</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      <Loader2 className="mr-2 inline size-4 animate-spin" />
                      正在加载客资…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      暂无符合条件的客资
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-slate-50/60"
                    >
                      <Td>
                        <PlatformLogo size={20} />
                      </Td>
                      <Td>
                        <span className="flex items-center gap-2">
                          <AccountAvatar
                            name={r.accountName}
                            src={r.accountAvatar}
                            size={26}
                          />
                          <span className="truncate">{r.accountName}</span>
                        </span>
                      </Td>
                      <Td className="font-medium text-foreground">
                        {r.customerName}
                      </Td>
                      <Td>{r.disease}</Td>
                      <Td>{r.phone || "-"}</Td>
                      <Td className="max-w-xs whitespace-normal text-muted">
                        {r.summary}
                      </Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                      <Td className="text-muted">{r.sentAt || "-"}</Td>
                      <Td className="max-w-xs whitespace-normal text-danger">
                        {r.status === "failed" ? r.failReason || "-" : "-"}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetail(r)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                          >
                            详情
                          </button>
                          {r.status === "failed" && (
                            <button
                              onClick={() => retry(r)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-slate-100"
                            >
                              <RotateCw className="size-3" />
                              重试
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InboundDetail inbound={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th className={cn("px-3 py-2.5 font-medium", className)}>{children}</th>
  )
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={cn("px-3 py-3 align-middle", className)}>{children}</td>
  )
}
