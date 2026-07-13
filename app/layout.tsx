import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { ToastProvider } from "@/components/toast"

export const metadata: Metadata = {
  title: "私信通名片助手",
  description: "红书私信通客资识别与名片回复工具",
}

export const viewport = {
  themeColor: "#f6f7f9",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="bg-background">
      <body className="bg-background text-foreground">
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
