"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ScrollText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/inbounds", label: "客资管理", icon: Users },
  { href: "/accounts", label: "账号", icon: UserCircle },
  { href: "/logs", label: "日志", icon: ScrollText },
  { href: "/settings", label: "设置", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-surface">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
          卡
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">
            私信通名片助手
          </span>
          <span className="text-[11px] text-muted">客资识别 · 名片回复</span>
        </div>
      </div>
      <nav className="flex-1 p-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-slate-50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3 text-[11px] text-muted">
        v0 前端界面 · 仅调用现有接口
      </div>
    </aside>
  )
}
