"use client"

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onSort?: (key: string) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  sortBy,
  sortOrder,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-neutral-500 dark:text-neutral-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400",
                  col.sortable && "cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200",
                  col.headerClassName
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="inline-flex">
                      {sortBy === col.key ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {data.map((item, index) => (
            <tr
              key={(item as any)?.id ? String((item as any).id) : `row-${index}`}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : ((item as Record<string, unknown>)[col.key] as React.ReactNode) ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
