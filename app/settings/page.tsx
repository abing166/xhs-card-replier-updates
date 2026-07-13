"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import {
  BrainCircuit,
  FolderOpen,
  Gauge,
  Loader2,
  RefreshCcw,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/components/toast"
import {
  fetchSettings,
  reanalyzeInbounds,
  saveAiSettings,
  testAi,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import type { AppSettings } from "@/lib/types"

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<AppSettings>(
    "settings",
    fetchSettings,
  )
  const { toast } = useToast()

  const [autoScan, setAutoScan] = useState(true)
  const [tray, setTray] = useState(true)
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [savingAi, setSavingAi] = useState(false)
  const [testing, setTesting] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)

  useEffect(() => {
    if (!data) return
    setAutoScan(data.autoScanOnStart)
    setTray(data.trayOnStart)
    setAutoLaunch(data.autoLaunch)
    setModel(data.ai.model)
    setBaseUrl(data.ai.baseUrl)
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" /> 正在加载设置…
      </div>
    )
  }

  async function onSaveAi() {
    setSavingAi(true)
    await saveAiSettings({ apiKey: apiKey || undefined, model, baseUrl })
    setSavingAi(false)
    toast("AI 设置已保存", "success")
    mutate()
  }

  return (
    <div>
      <PageHeader title="设置" description="运行、AI 识别、回复节奏与维护配置" />

      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        {/* 运行设置 */}
        <Section title="运行设置" icon={Settings2}>
          <ToggleRow
            label="启动后自动扫描"
            hint="软件启动后自动读取账号配置并扫描私信客资"
            checked={autoScan}
            onChange={setAutoScan}
          />
          <ToggleRow
            label="启动后托盘运行"
            hint="最小化到系统托盘后台运行"
            checked={tray}
            onChange={setTray}
          />
          <ToggleRow
            label="开机自启动"
            hint="开机时自动启动软件"
            checked={autoLaunch}
            onChange={setAutoLaunch}
          />
        </Section>

        {/* AI 识别 */}
        <Section title="AI 识别" icon={BrainCircuit}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">AI Key</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                data.ai.keyConfigured
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {data.ai.keyConfigured ? "已配置" : "未配置"}
            </span>
          </div>
          <Field label="模型">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="例如 gpt-4o-mini"
              className="input"
            />
          </Field>
          <Field label="OpenAI 兼容地址">
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="input"
            />
          </Field>
          <Field label="API Key">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="留空表示不修改"
              className="input"
            />
          </Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={onSaveAi} disabled={savingAi} className="btn-primary">
              {savingAi && <Loader2 className="size-4 animate-spin" />}
              保存
            </button>
            <button
              onClick={async () => {
                setTesting(true)
                const ok = await testAi()
                setTesting(false)
                toast(ok ? "AI 识别测试通过" : "AI 识别测试失败", ok ? "success" : "error")
              }}
              disabled={testing}
              className="btn-ghost"
            >
              {testing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              测试 AI 识别
            </button>
            <button
              onClick={async () => {
                setReanalyzing(true)
                await reanalyzeInbounds()
                setReanalyzing(false)
                toast("已提交重新识别客资", "success")
              }}
              disabled={reanalyzing}
              className="btn-ghost"
            >
              {reanalyzing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              重新识别客资
            </button>
          </div>
          <p className="rounded-md bg-background/60 p-2.5 text-xs leading-relaxed text-muted">
            AI 只用于病种/手术识别、手机号识别和最近消息总结，不生成聊天回复。
          </p>
        </Section>

        {/* 回复节奏 */}
        <Section title="回复节奏" icon={Gauge}>
          <InfoRow label="每轮最多发送" value={`${data.pace.maxPerRound} 张`} />
          <InfoRow
            label="发送间隔"
            value={`随机 ${data.pace.intervalMin}-${data.pace.intervalMax} 秒`}
          />
          <ToggleRow
            label="连续失败自动暂停账号"
            hint="连续发卡失败时自动暂停该账号，避免异常持续"
            checked={data.pace.autoPauseOnFail}
            onChange={() => {}}
          />
        </Section>

        {/* 维护 */}
        <Section title="维护" icon={Wrench}>
          <button
            onClick={() => toast("正在检测更新…", "info")}
            className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <RefreshCcw className="size-4 text-muted" /> 检测更新
            </span>
            <span className="text-xs text-muted">当前版本 v1.0.0</span>
          </button>
          <button
            onClick={() => toast("已打开诊断目录", "info")}
            className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="size-4 text-muted" /> 打开诊断目录
            </span>
          </button>
        </Section>
      </div>

      <style jsx global>{`
        .input {
          height: 2.25rem;
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: var(--color-foreground);
          outline: none;
        }
        .input:focus {
          border-color: var(--color-primary);
        }
        .btn-primary {
          display: inline-flex;
          height: 2.25rem;
          align-items: center;
          gap: 0.375rem;
          border-radius: 0.375rem;
          background: var(--color-primary);
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #fff;
        }
        .btn-ghost {
          display: inline-flex;
          height: 2.25rem;
          align-items: center;
          gap: 0.375rem;
          border-radius: 0.375rem;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: var(--color-foreground);
        }
      `}</style>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Settings2
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-surface p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
