import { cn } from "@/lib/utils"

// Platform indicator only. Represents 小红书 as a brand mark — never used as an
// account avatar. Renders a compact red rounded square with a book glyph.
export function PlatformLogo({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      title="小红书"
      aria-label="小红书平台"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "#ff2442",
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      书
    </span>
  )
}
