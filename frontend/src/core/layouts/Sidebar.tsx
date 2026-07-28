"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_MODULES, type NavModule } from "@/core/constants/modules"

const categoryLabels: Record<string, string> = {
  dashboard: "",
  cadastros: "CADASTROS",
  operacional: "OPERACIONAL",
  configuracoes: "CONFIGURAÇÕES",
}

const categoryOrder = ["dashboard", "cadastros", "operacional", "configuracoes"]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const groupedModules = categoryOrder.reduce(
    (acc, cat) => {
      const modules = NAV_MODULES.filter((m) => m.category === cat)
      if (modules.length > 0) acc[cat] = modules
      return acc
    },
    {} as Record<string, NavModule[]>
  )

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-neutral-200 px-4 dark:border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                OKUMA
              </span>
              <span className="text-[10px] font-medium tracking-wider text-neutral-500 dark:text-neutral-400">
                OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {Object.entries(groupedModules).map(([category, modules]) => (
          <div key={category} className="mb-6">
            {!collapsed && categoryLabels[category] && (
              <div className="mb-2 px-2">
                <span className="text-[10px] font-semibold tracking-widest text-neutral-400 dark:text-neutral-500">
                  {categoryLabels[category]}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {modules.map((mod) => {
                const Icon = mod.icon
                const isActive = pathname.startsWith(mod.path)

                return (
                  <Link
                    key={mod.path}
                    href={mod.path}
                    className={cn(
                      "flex items-center gap-3 rounded-none px-2 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                    )}
                    title={collapsed ? mod.name : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{mod.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-none px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
