"use client"

import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  inactive: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  unavailable: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Aguardando",
  confirmed: "Confirmada",
  unavailable: "Indisponível",
  completed: "Concluída",
  cancelled: "Cancelada",
}

interface StatusBadgeProps {
  status: string
  customLabel?: string
  className?: string
}

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
        className
      )}
    >
      {customLabel || statusLabels[status] || status}
    </span>
  )
}
