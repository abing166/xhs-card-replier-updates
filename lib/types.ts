// Business-facing types for the 私信通名片助手 frontend.
// These describe the shape the UI expects. The backend APIs are the source of
// truth; the client normalizes responses into these shapes.

export type CardStatus =
  | "pending" // 待发卡
  | "reply_off" // 回复关闭中
  | "sending" // 发卡中
  | "sent" // 已发卡
  | "failed" // 发卡失败
  | "review" // 需人工查看
  | "not_qualified" // 不符合发卡
  | "cancelled" // 已取消

export type InboundTab =
  | "all"
  | "today"
  | "pending"
  | "sent"
  | "failed"
  | "review"
  | "not_qualified"

export interface Inbound {
  id: string
  platform: "xhs"
  accountName: string
  accountAvatar?: string
  customerName: string
  disease: string // 咨询病种/手术
  phone?: string
  summary: string // 最近消息总结 (<= 30 字)
  status: CardStatus
  sentAt?: string
  failReason?: string
}

export interface DashboardData {
  replyEnabled: boolean
  scanCompleted: boolean
  hasLoggedInAccount: boolean
  scanState: "idle" | "scanning" | "need_qrcode" | "error" | "done"
  todayInbound: number
  pendingCards: number
  sentCards: number
  failedCards: number
  runningAccounts: number
  errorAccounts: number
  needReview: number
  qualified: number
  activity: {
    backgroundScan: string
    cardTask: string
    errorAccount: string
    lastAction: string
  }
}

export type AccountLoginState = "logged_in" | "logged_out" | "checking" | "error"
export type AccountScanState = "scanning" | "paused" | "idle" | "error"

export interface Account {
  index: number
  name: string
  avatar?: string
  platform: "xhs"
  lastAction: string
  loginState: AccountLoginState
  scanState: AccountScanState
  todayInbound: number
  pendingCards: number
  todaySent: number
}

export type LogLevel = "info" | "success" | "warn" | "error"

export interface LogEntry {
  id: string
  time: string
  level: LogLevel
  event: string
  account?: string
  detail?: string
}

export interface AppSettings {
  autoScanOnStart: boolean
  trayOnStart: boolean
  autoLaunch: boolean
  ai: {
    keyConfigured: boolean
    model: string
    baseUrl: string
  }
  pace: {
    maxPerRound: number
    intervalMin: number
    intervalMax: number
    autoPauseOnFail: boolean
  }
}
