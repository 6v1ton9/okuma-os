"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

/**
 * Skeleton loading placeholder.
 * Renderiza um bloco animado que simula o formato do conteúdo carregando.
 * 
 * Exemplos de uso:
 * <Skeleton className="h-4 w-48" />           // linha de texto
 * <Skeleton className="h-32 w-full" />         // card/bloco
 * <Skeleton className="h-64 w-full" />         // tabela
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Cards skeleton for the dashboard.
 */
export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Table skeleton with configurable rows and columns.
 */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`c-${r}-${c}`}
              className={cn(
                "h-4 flex-1",
                c === 0 ? "w-1/4" : "",
                c === cols - 1 ? "w-16" : ""
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Calendar spreadsheet skeleton.
 */
export function CalendarSkeleton() {
  return (
    <div className="p-4">
      {/* Day headers */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-12 w-48" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-12 flex-1" />
        ))}
      </div>
      {/* Technician rows */}
      {Array.from({ length: 4 }).map((_, r) => (
        <div key={`tr-${r}`} className="flex gap-2 mb-2">
          <Skeleton className="h-20 w-48" />
          {Array.from({ length: 7 }).map((_, c) => (
            <Skeleton key={`tc-${r}-${c}`} className="h-20 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
