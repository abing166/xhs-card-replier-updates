"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { initialOf } from "@/lib/utils"

// Account avatar. Falls back to the first character of the account name when
// the avatar image is missing or fails to load. Never shows a platform logo.
export function AccountAvatar({
  name,
  src,
  size = 28,
  className,
}: {
  name: string
  src?: string
  size?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  const showImage = src && !error

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-medium text-blue-700",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || "/placeholder.svg"}
          alt={name}
          crossOrigin="anonymous"
          className="size-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        initialOf(name)
      )}
    </span>
  )
}
