import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initialOf(name?: string) {
  if (!name) return "?"
  return name.trim().charAt(0) || "?"
}
