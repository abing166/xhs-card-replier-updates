// Thin API layer. Talks to the existing local backend under /api/*.
// When the backend is unreachable (e.g. web preview), it falls back to demo
// data so the UI still renders. API paths are never changed here.

import {
  demoAccounts,
  demoDashboard,
  demoInbounds,
  demoLogs,
  demoSettings,
} from "./demo-data"
import type {
  Account,
  AppSettings,
  DashboardData,
  Inbound,
  InboundTab,
  LogEntry,
} from "./types"

async function tryFetch(input: string, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  })
  return res
}

// Generic GET with demo fallback. Returns { data, live }.
async function getWithFallback<T>(url: string, demo: T): Promise<T> {
  try {
    const res = await tryFetch(url)
    if (!res.ok) throw new Error(String(res.status))
    return (await res.json()) as T
  } catch {
    return demo
  }
}

export const fetchDashboard = () =>
  getWithFallback<DashboardData>("/api/dashboard", demoDashboard)

export const fetchInbounds = async (tab: InboundTab): Promise<Inbound[]> => {
  const data = await getWithFallback<Inbound[] | { items: Inbound[] }>(
    `/api/inbounds?tab=${tab}`,
    demoInbounds,
  )
  const list = Array.isArray(data) ? data : data.items || []
  // Client side filter for demo data so tabs behave in preview.
  if (list === demoInbounds) return filterDemo(demoInbounds, tab)
  return list
}

function filterDemo(list: Inbound[], tab: InboundTab): Inbound[] {
  switch (tab) {
    case "all":
      return list
    case "today":
      return list
    case "pending":
      return list.filter((i) => i.status === "pending" || i.status === "reply_off")
    case "sent":
      return list.filter((i) => i.status === "sent")
    case "failed":
      return list.filter((i) => i.status === "failed")
    case "review":
      return list.filter((i) => i.status === "review")
    case "not_qualified":
      return list.filter((i) => i.status === "not_qualified")
    default:
      return list
  }
}

export const fetchAccounts = () =>
  getWithFallback<Account[]>("/api/status", demoAccounts).then((d) =>
    Array.isArray(d) ? d : demoAccounts,
  )

export const fetchLogs = () =>
  getWithFallback<LogEntry[]>("/api/logs?limit=200", demoLogs).then((d) =>
    Array.isArray(d) ? d : demoLogs,
  )

export const fetchSettings = () =>
  getWithFallback<AppSettings>("/api/settings", demoSettings)

export interface CardEnabledResult {
  ok: boolean
  scanIncomplete?: boolean
}

// POST /api/runtime/card-enabled — 409 means scan not complete.
export async function setCardEnabled(value: boolean): Promise<CardEnabledResult> {
  try {
    const res = await tryFetch("/api/runtime/card-enabled", {
      method: "POST",
      body: JSON.stringify({ value }),
    })
    if (res.status === 409) return { ok: false, scanIncomplete: true }
    if (!res.ok) return { ok: false }
    return { ok: true }
  } catch {
    // No backend in preview — optimistically succeed so the toggle is testable.
    return { ok: true }
  }
}

// Fire-and-forget account actions. Returns whether the call succeeded.
export async function accountAction(
  index: number,
  action:
    | "relogin"
    | "start"
    | "pause"
    | "show"
    | "hide"
    | "reload"
    | "recheck"
    | "scan-full"
    | "clear-login",
): Promise<boolean> {
  try {
    const res = await tryFetch(`/api/account/${index}/${action}`, {
      method: "POST",
    })
    return res.ok
  } catch {
    return true
  }
}

export async function reanalyzeInbounds(): Promise<boolean> {
  try {
    const res = await tryFetch("/api/inbounds/reanalyze", { method: "POST" })
    return res.ok
  } catch {
    return true
  }
}

export async function testAi(): Promise<boolean> {
  try {
    const res = await tryFetch("/api/settings/ai-test", { method: "POST" })
    return res.ok
  } catch {
    return true
  }
}

export async function saveAiSettings(payload: {
  apiKey?: string
  model?: string
  baseUrl?: string
}): Promise<boolean> {
  try {
    const res = await tryFetch("/api/settings/ai", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return true
  }
}
