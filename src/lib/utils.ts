import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Legacy alias for cn - used by Tremor components
export const cx = cn

// Focus ring utility for keyboard navigation
export const focusRing = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-blue-500 dark:outline-blue-500",
]

// Focus input utility
export const focusInput = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-blue-500 dark:outline-blue-500",
]

// Error input state
export const hasErrorInput = [
  "ring-red-500 border-red-500 dark:ring-red-500 dark:border-red-500",
]

// Formatters
export const formatters: {
  [key: string]: (value: number) => string
} = {
  currency: (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value),
  unit: (value: number) => `${value}`,
}

export const percentageFormatter = (value: number) =>
  `${Intl.NumberFormat("en-US").format(value)}%`
