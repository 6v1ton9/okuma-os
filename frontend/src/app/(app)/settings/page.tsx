"use client"

import { useQuery } from "@tanstack/react-query"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/core/hooks/useTheme"
import { api } from "@/core/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/shared/components/Skeleton"

interface EventStatusConfig {
  statuses: {
    status: string
    label: string
    color: string
    order: number
  }[]
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  const { data: statuses, isLoading } = useQuery({
    queryKey: ["event-statuses"],
    queryFn: () => api.get<EventStatusConfig>("/api/v1/settings/event-statuses"),
  })

  return (
    <div className="max-w-2xl space-y-8">
      {/* Theme Settings */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
          Aparência
        </h2>
        <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Modo Escuro
              </Label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Alterne entre tema claro e escuro
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Event Status Colors */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
          Cores dos Status da Agenda
        </h2>
        <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {statuses?.statuses.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-6 w-6"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {s.label}
                      </span>
                      <span className="ml-2 text-xs text-neutral-400">
                        ({s.status})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      defaultValue={s.color}
                      className="h-8 w-16 rounded-none border-neutral-200 p-0.5 dark:border-neutral-800"
                    />
                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      {s.color}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* System Info */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
          Sistema
        </h2>
        <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Versão</dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Framework</dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">Next.js + FastAPI</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Banco de Dados</dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">PostgreSQL (Supabase)</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}
