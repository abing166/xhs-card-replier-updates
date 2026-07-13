"use client"

import useSWR from "swr"
import { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  MoreHorizontal,
  Plus,
  QrCode,
  RefreshCw,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { AccountAvatar } from "@/components/account-avatar"
import { PlatformLogo } from "@/components/platform-logo"
import { useToast } from "@/components/toast"
import { accountAction, fetchAccounts } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Account } from "@/lib/types"

const LOGIN_TAG: Record<Account["loginState"], { label: string; cls: string }> =
  {
    logged_in: { label: "已登录", cls: "bg-green-50 text-green-700" },
    logged_out: { label: "未登录", cls: "bg-slate-100 text-slate-600" },
    checking: { label: "待检测", cls: "bg-blue-50 text-blue-700" },
    error: { label: "异常", cls: "bg-red-50 text-red-700" },
  }

const SCAN_TAG: Record<Account["scanState"], { label: string; cls: string }> = {
  scanning: { label: "扫描中", cls: "bg-blue-50 text-blue-700" },
  paused: { label: "已暂停", cls: "bg-amber-50 text-amber-700" },
  idle: { label: "未扫描", cls: "bg-slate-100 text-slate-600" },
  error: { label: "异常", cls: "bg-red-50 text-red-700" },
}

export default function AccountsPage() {
  const { data, isLoading, mutate } = useSWR<Account[]>(
    "accounts",
    fetchAccounts,
    { refreshInterval: 10000 },
  )
  const { toast } = useToast()

  async function add() {
    toast("正在打开扫码登录窗口…", "info")
    try {
      await fetch("/api/accounts", { method: "POST" })
    } catch {
      /* preview: no backend */
    }
    mutate()
  }

  return (
    <div>
      <PageHeader
        title="账号"
        description="账号页只处理单个账号登录和扫描；全局开启/关闭回复在首页操作。"
        right={
          <>
            <button
              onClick={add}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="size-4 shrink-0" />
              新增账号
            </button>
            <button
              onClick={() => mutate()}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border bg-surface px-3 text-sm text-foreground hover:bg-slate-50"
            >
              <RefreshCw className="size-4 shrink-0" />
              刷新状态
            </button>
          </>
        }
      />

      <div className="p-6">
        {isLoading || !data ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" /> 正在加载账号…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((acc) => (
              <AccountCard key={acc.index} account={acc} onChanged={mutate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AccountCard({
  account,
  onChanged,
}: {
  account: Account
  onChanged: () => void
}) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  async function run(
    action: Parameters<typeof accountAction>[1],
    message: string,
  ) {
    setBusy(true)
    await accountAction(account.index, action)
    setBusy(false)
    toast(message, "success")
    onChanged()
  }

  const login = LOGIN_TAG[account.loginState]
  const scan = SCAN_TAG[account.scanState]

  const main = (() => {
    if (account.loginState === "error" || account.scanState === "error")
      return {
        text: "查看异常",
        icon: AlertTriangle,
        onClick: () => toast(account.lastAction, "error"),
        danger: true,
      }
    if (account.loginState === "logged_out" || account.loginState === "checking")
      return {
        text: "扫码登录",
        icon: QrCode,
        onClick: () => run("relogin", "已打开扫码登录窗口"),
      }
    if (account.scanState === "paused")
      return {
        text: "启用扫描",
        onClick: () => run("start", "已启用扫描"),
      }
    return {
      text: "暂停",
      onClick: () => run("pause", "已暂停该账号扫描"),
    }
  })()

  const MainIcon = main.icon

  return (
    <div className="flex flex-col rounded-xl border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <AccountAvatar name={account.name} src={account.avatar} size={40} />
          <PlatformLogo
            size={16}
            className="absolute -bottom-1 -right-1 ring-2 ring-white"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {account.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {account.lastAction}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Tag label={login.label} cls={login.cls} />
        <Tag label={scan.label} cls={scan.cls} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-background/60 p-2 text-center">
        <Metric label="今日进线" value={account.todayInbound} />
        <Metric label="待发卡" value={account.pendingCards} />
        <Metric label="今日已发" value={account.todaySent} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={main.onClick}
          disabled={busy}
          className={cn(
            "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium",
            main.danger
              ? "bg-red-50 text-danger hover:bg-red-100"
              : "bg-primary text-white hover:opacity-90",
          )}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            MainIcon && <MainIcon className="size-4" />
          )}
          {main.text}
        </button>
        <MoreMenu
          items={[
            { label: "全量扫描", action: () => run("scan-full", "已开始全量扫描") },
            { label: "打开窗口", action: () => run("show", "已打开浏览器窗口") },
            { label: "隐藏窗口", action: () => run("hide", "已隐藏浏览器窗口") },
            { label: "重新检测", action: () => run("recheck", "正在重新检测登录状态") },
            { label: "重新加载", action: () => run("reload", "已重新加载账号") },
            {
              label: "清除登录",
              danger: true,
              action: () => run("clear-login", "已清除登录态"),
            },
          ]}
        />
      </div>
    </div>
  )
}

function Tag({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cls)}
    >
      {label}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}

function MoreMenu({
  items,
}: {
  items: { label: string; action: () => void; danger?: boolean }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-9 items-center justify-center rounded-md border bg-surface text-muted hover:bg-slate-50"
        aria-label="更多操作"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-1 w-36 overflow-hidden rounded-lg border bg-surface py-1 shadow-lg">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false)
                it.action()
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                it.danger ? "text-danger" : "text-foreground",
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
