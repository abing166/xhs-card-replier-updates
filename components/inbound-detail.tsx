"use client"

import { X } from "lucide-react"
import { AccountAvatar } from "@/components/account-avatar"
import { PlatformLogo } from "@/components/platform-logo"
import { StatusBadge } from "@/components/status-badge"
import type { Inbound } from "@/lib/types"

export function InboundDetail({
  inbound,
  onClose,
}: {
  inbound: Inbound | null
  onClose: () => void
}) {
  if (!inbound) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex w-full max-w-md flex-col border-l bg-surface shadow-xl">
        <div className="flex h-14 items-center justify-between border-b px-5">
          <h2 className="text-base font-semibold">客资详情</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <dl className="flex flex-col gap-4 text-sm">
            <Row label="平台">
              <PlatformLogo size={20} />
            </Row>
            <Row label="来源账号">
              <span className="flex items-center gap-2">
                <AccountAvatar name={inbound.accountName} size={24} />
                {inbound.accountName}
              </span>
            </Row>
            <Row label="客户">{inbound.customerName}</Row>
            <Row label="咨询病种/手术">{inbound.disease}</Row>
            <Row label="联系方式">{inbound.phone || "-"}</Row>
            <Row label="最近消息总结">{inbound.summary}</Row>
            <Row label="发卡状态">
              <StatusBadge status={inbound.status} />
            </Row>
            <Row label="发卡时间">{inbound.sentAt || "-"}</Row>
            {inbound.status === "failed" && (
              <Row label="失败原因">
                <span className="text-danger">{inbound.failReason || "-"}</span>
              </Row>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}
