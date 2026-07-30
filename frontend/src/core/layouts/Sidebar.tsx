"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Building2, PanelRightClose, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_MODULES, type NavModule } from "@/core/constants/modules"
import { useFloatingForm } from "@/shared/components/FloatingFormManager"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/core/services/api"

const categoryLabels: Record<string, string> = {
  dashboard: "",
  cadastros: "CADASTROS",
  operacional: "OPERACIONAL",
  configuracoes: "CONFIGURAÇÕES",
  admin: "ADMINISTRADOR",
}

const categoryOrder = ["dashboard", "cadastros", "operacional", "configuracoes", "admin"]

// 🔥 Mapa de pre-fetch: quando o mouse passar por cima de um link,
// já começamos a carregar os dados daquela página
const PREFETCH_QUERIES: Record<string, { queryKey: any[]; url: string; params?: Record<string,string> }[]> = {
  "/dashboard": [{ queryKey: ["dashboard-summary"], url: "/api/v1/dashboard/summary" }],
  "/clients": [{ queryKey: ["clients",{page:1,sortBy:"razao_social",sortOrder:"asc"}], url: "/api/v1/clients", params: { page: "1", page_size: "20", sort_by: "razao_social", sort_order: "asc" } }],
  "/machines/models": [{ queryKey: ["machine-models",{page:1,sortBy:"model",sortOrder:"asc"}], url: "/api/v1/machines/models", params: { page: "1", page_size: "20", sort_by: "model", sort_order: "asc" } }],
  "/machines/customer": [{ queryKey: ["customer-machines",{page:1,sortBy:"numero_serie",sortOrder:"asc"}], url: "/api/v1/machines/customer", params: { page: "1", page_size: "20", sort_by: "numero_serie", sort_order: "asc" } }],
  "/technicians": [{ queryKey: ["technicians",{page:1,sortBy:"name",sortOrder:"asc"}], url: "/api/v1/technicians", params: { page: "1", page_size: "20", sort_by: "name", sort_order: "asc" } }],
  "/calendar": [{ queryKey: ["calendar-spreadsheet"], url: "/api/v1/calendar/spreadsheet", params: { start_date: new Date().toISOString().slice(0,10), end_date: new Date(Date.now()+7*86400000).toISOString().slice(0,10) } }],
  "/settings": [{ queryKey: ["event-statuses"], url: "/api/v1/settings/event-statuses" }],
  "/admin/users": [{ queryKey: ["admin-users"], url: "/api/v1/admin/users" }],
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()
  const { minimizedForms, restoreForm, closeForm } = useFloatingForm()
  const queryClient = useQueryClient()

  // 🔥 Pre-fetch data when hovering over a sidebar link
  const handlePrefetch = (path: string) => {
    const queries = PREFETCH_QUERIES[path]
    if (!queries) return
    for (const q of queries) {
      queryClient.prefetchQuery({
        queryKey: q.queryKey,
        queryFn: () => api.get(q.url, q.params),
        staleTime: 1000 * 60 * 5,
      })
    }
  }

  useEffect(() => {
    // Get user role from JWT payload stored in localStorage
    try {
      const token = localStorage.getItem("okuma_token")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserRole(payload.role || "admin")
      }
    } catch {
      setUserRole(null)
    }
  }, [])

  const filteredModules = NAV_MODULES.filter((mod) => {
    if (mod.adminOnly && userRole !== "super_admin") return false
    return true
  })

  const groupedModules = categoryOrder.reduce(
    (acc, cat) => {
      const modules = filteredModules.filter((m) => m.category === cat)
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

                return (                    <Link
                    key={mod.path}
                    href={mod.path}
                    onMouseEnter={() => handlePrefetch(mod.path)}
                    onTouchStart={() => handlePrefetch(mod.path)}
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

        {/* Minimized Forms Section */}
        {minimizedForms.length > 0 && !collapsed && (
          <div className="mb-6">
            <div className="mb-2 px-2">
              <span className="text-[10px] font-semibold tracking-widest text-neutral-400 dark:text-neutral-500">
                JANELAS MINIMIZADAS
              </span>
            </div>
            <div className="space-y-1">
              {minimizedForms.map((form) => (
                <div
                  key={form.id}
                  className="group flex items-center gap-2 rounded-none px-2 py-2 text-sm transition-colors bg-blue-50/50 dark:bg-blue-950/30 border-l-2 border-blue-500"
                >
                  <button
                    onClick={() => restoreForm(form.id)}
                    className="flex flex-1 items-center gap-2 text-left text-neutral-700 hover:text-blue-700 dark:text-neutral-300 dark:hover:text-blue-400 transition-colors"
                    title="Restaurar janela"
                  >
                    <PanelRightClose className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="truncate">{form.title}</span>
                  </button>
                  <button
                    onClick={() => closeForm(form.id)}
                    className="shrink-0 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Fechar janela"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
