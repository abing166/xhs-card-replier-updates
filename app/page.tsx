"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Power,
  Radar,
  Send,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { useToast } from "@/components/toast"
import { fetchDashboard, setCardEnabled } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { DashboardData } from "@/lib/types"

type ControlState =
  | "reply_off"
  | "reply_on"
  | "scanning"
  | "need_qrcode"
  | "error"

function resolveState(d: DashboardData): ControlState {
  if (d.scanState === "error") return "error"
  if (!d.hasLoggedInAccount || d.scanState === "need_qrcode")
    return "need_qrcode"
  if (!d.scanCompleted || d.scanState === "scanning") return "scanning"
  return d.replyEnabled ? "reply_on" : "reply_off"
}

const STATE_TAG: Record<ControlState, { label: string; className: string }> = {
  reply_off: { label: "回复关闭", className: "bg-slate-100 text-slate-600" },
  reply_on: { label: "回复开启", className: "bg-green-50 text-green-700" },
  scanning: { label: "正在扫描", className: "bg-blue-50 text-blue-700" },
  need_qrcode: { label: "需要扫码", className: "bg-amber-50 text-amber-700" },
  error: { label: "异常", className: "bg-red-50 text-red-700" },
}

export default function DashboardPage() {
  const { data, mutate, isLoading } = useSWR<DashboardData>(
    "dashboard",
    fetchDashboard,
    { refreshInterval: 8000 },
  )
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [replyEnabled, setReplyEnabled] = useState(false)

  useEffect(() => {
    if (data) setReplyEnabled(data.replyEnabled)
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" /> 正在加载运行总览…
      </div>
    )
  }

  const d: DashboardData = { ...data, replyEnabled }
  const state = resolveState(d)
  const tag = STATE_TAG[state]

  const canToggle = state === "reply_off" || state === "reply_on"

  async function onToggle() {
    if (!canToggle || busy) return
    const next = !replyEnabled
    setBusy(true)
    const res = await setCardEnabled(next)
    setBusy(false)
    if (res.scanIncomplete) {
      toast("客资扫描未完成，请稍等", "error")
      return
    }
    if (!res.ok) {
      toast("操作失败，请重试", "error")
      return
    }
    setReplyEnabled(next)
    toast(next ? "已开启回复，开始按队列发送名片" : "已关闭回复", "success")
    mutate()
  }

  const mainButton = (() => {
    switch (state) {
      case "scanning":
        return { text: "正在扫描", disabled: true, loading: true }
      case "need_qrcode":
        return { text: "请先扫码登录", disabled: true }
      case "error":
        return { text: "存在异常账号", disabled: true }
      case "reply_off":
        return { text: "开启回复", disabled: false }
      case "reply_on":
        return { text: "关闭回复", disabled: false, danger: true }
    }
  })()

  return (
    <div>
      <PageHeader
        title="运行总览"
        description="软件启动后自动扫描客资，此页控制是否发送商家名片"
        right={
          <div className="flex items-center gap-3 rounded-lg border bg-surface px-3 py-1.5 text-sm">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                tag.className,
              )}
            >
              {replyEnabled ? "回复开启" : "回复关闭"}
            </span>
            <Divider />
            <SummaryItem label="今日进线" value={d.todayInbound} />
            <Divider />
            <SummaryItem label="待发卡" value={d.pendingCards} />
            <Divider />
            <SummaryItem label="已发" value={d.sentCards} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
        {/* Reply control + stat cards */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <section className="rounded-xl border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                回复控制
              </h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  tag.className,
                )}
              >
                {tag.label}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              软件会自动扫描已登录账号的私信客资。开启回复后，会按队列给未发过名片的私信用户发送商家名片。
            </p>
            <button
              onClick={onToggle}
              disabled={mainButton.disabled || busy}
              className={cn(
                "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors",
                mainButton.disabled
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : mainButton.danger
                    ? "bg-danger text-white hover:opacity-90"
                    : "bg-primary text-white hover:opacity-90",
              )}
            >
              {busy || mainButton.loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              {mainButton.text}
            </button>
          </section>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="今日进线" value={d.todayInbound} icon={TrendingUp} tone="primary" />
            <StatCard label="待发卡" value={d.pendingCards} icon={Clock} />
            <StatCard label="已发卡" value={d.sentCards} icon={Send} tone="success" />
            <StatCard label="发卡失败" value={d.failedCards} icon={XCircle} tone="danger" />
            <StatCard label="运行账号" value={d.runningAccounts} icon={Users} />
            <StatCard label="异常账号" value={d.errorAccounts} icon={AlertTriangle} tone={d.errorAccounts > 0 ? "danger" : "default"} />
            <StatCard label="需人工查看" value={d.needReview} icon={UserCheck} tone={d.needReview > 0 ? "warning" : "default"} />
            <StatCard label="符合发卡" value={d.qualified} icon={CheckCircle2} tone="success" />
          </div>
        </div>

        {/* Running status */}
        <section className="rounded-xl border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">运行状态</h2>
          <div className="mt-3 flex flex-col gap-3">
            <StatusRow icon={Radar} title="后台扫描" text={d.activity.backgroundScan} tone="primary" />
            <StatusRow icon={Send} title="发卡任务" text={d.activity.cardTask} tone="default" />
            <StatusRow
              icon={AlertTriangle}
              title="异常账号"
              text={d.activity.errorAccount}
              tone={d.errorAccounts > 0 ? "danger" : "success"}
            />
            <StatusRow icon={Activity} title="最近动作" text={d.activity.lastAction} tone="default" />
          </div>
        </section>
      </div>
    </div>
  )
}

function Divider() {
  return <span className="h-4 w-px bg-border" />
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  )
}

function StatusRow({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof Activity
  title: string
  text: string
  tone: "default" | "primary" | "success" | "danger"
}) {
  const toneMap = {
    default: "text-slate-400",
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
  }
  return (
    <div className="flex gap-3 rounded-lg border bg-background/50 p-3">
      <Icon className={cn("mt-0.5 size-4 shrink-0", toneMap[tone])} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-muted text-pretty">
          {text}
        </p>
      </div>
    </div>
  )
}
