"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  Wrench,
  HardHat,
  CalendarCheck,
  Loader2,
} from "lucide-react"
import { api } from "@/core/services/api"
import { cn } from "@/lib/utils"

interface DashboardData {
  total_clients: number
  active_clients: number
  total_machine_models: number
  total_customer_machines: number
  total_technicians: number
  active_technicians: number
  upcoming_events: number
  pending_events: number
  confirmed_events: number
}

const cards = [
  {
    label: "Clientes Ativos",
    key: "active_clients",
    icon: Building2,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    label: "Modelos de Máquinas",
    key: "total_machine_models",
    icon: Wrench,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    label: "Técnicos Ativos",
    key: "active_technicians",
    icon: HardHat,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    label: "Eventos Pendentes",
    key: "pending_events",
    icon: CalendarCheck,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400",
  },
]

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get<DashboardData>("/api/v1/dashboard/summary"),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const value = data ? data[card.key as keyof DashboardData] : 0
          return (
            <div
              key={card.key}
              className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                    {value}
                  </p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center", card.color)}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/clients"
            className="flex items-center gap-3 rounded-none border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <Building2 className="h-4 w-4 text-blue-600" />
            Novo Cliente
          </a>
          <a
            href="/machines/models"
            className="flex items-center gap-3 rounded-none border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <Wrench className="h-4 w-4 text-emerald-600" />
            Novo Modelo
          </a>
          <a
            href="/technicians"
            className="flex items-center gap-3 rounded-none border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <HardHat className="h-4 w-4 text-amber-600" />
            Novo Técnico
          </a>
          <a
            href="/calendar"
            className="flex items-center gap-3 rounded-none border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <CalendarCheck className="h-4 w-4 text-rose-600" />
            Novo Evento
          </a>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
            Resumo
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">
                Total de Clientes
              </dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                {data?.total_clients || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">
                Máquinas em Campo
              </dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                {data?.total_customer_machines || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">
                Eventos Confirmados
              </dt>
              <dd className="text-sm font-medium text-neutral-900 dark:text-white">
                {data?.confirmed_events || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">
                Próximos Eventos
              </dt>
              <dd className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {data?.upcoming_events || 0}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
            Sistema
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="h-2 w-2 bg-emerald-500" />
              API conectada
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="h-2 w-2 bg-emerald-500" />
              Banco de dados operacional
            </div>
            <div className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
              OKUMA OS v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
