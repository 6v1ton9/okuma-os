"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  subWeeks,
  addWeeks,
  isSameDay,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
} from "lucide-react"
import { api } from "@/core/services/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFloatingForm } from "@/shared/components/FloatingFormManager"
import { CalendarEventForm } from "@/shared/components/forms/CalendarEventForm"

interface Technician {
  id: number
  name: string
  role: string | null
}

interface EventCard {
  id: number
  client_name: string
  description: string
  status: string
  start_datetime: string
  end_datetime: string
  city: string | null
  serial_number: string | null
}

interface SpreadsheetData {
  technicians: Technician[]
  days: string[]
  events: Record<string, Record<string, EventCard[]>>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-400 text-yellow-950",
  confirmed: "bg-emerald-500 text-white",
  unavailable: "bg-blue-400 text-white",
  completed: "bg-neutral-400 text-white",
  cancelled: "bg-red-500 text-white",
}

function EventBlock({ event }: { event: EventCard }) {
  return (
    <div
      className={cn(
        "mb-1 rounded-none px-2 py-1.5 text-[11px] leading-tight cursor-pointer transition-opacity hover:opacity-90",
        statusColors[event.status] || "bg-neutral-200 text-neutral-800"
      )}
      title={`${event.client_name} - ${event.description}`}
    >
      <div className="font-semibold truncate">{event.client_name}</div>
      {event.city && (
        <div className="opacity-75 truncate">{event.city}</div>
      )}
    </div>
  )
}

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const today = useMemo(() => new Date(), [])
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  )

  const { openForm } = useFloatingForm()

  const weekEnd = useMemo(
    () => endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [currentWeekStart]
  )

  const { data, isLoading } = useQuery({
    queryKey: ["calendar-spreadsheet", format(currentWeekStart, "yyyy-MM-dd")],
    queryFn: () =>
      api.get<SpreadsheetData>("/api/v1/calendar/spreadsheet", {
        start_date: format(currentWeekStart, "yyyy-MM-dd"),
        end_date: format(weekEnd, "yyyy-MM-dd"),
      }),
  })

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["calendar-spreadsheet"] })
  }, [queryClient])

  const days: Date[] = []
  let cursor = currentWeekStart
  while (cursor <= weekEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            className="h-8 w-8 rounded-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {format(currentWeekStart, "d 'de' MMM", { locale: ptBR })} —{" "}
            {format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            className="h-8 w-8 rounded-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }))}
            className="ml-2 h-8 rounded-none text-xs"
          >
            Hoje
          </Button>
        </div>
        <Button
          onClick={() =>
            openForm("calendar-event-form", "Novo Evento", <CalendarEventForm onSuccess={onSuccess} />)
          }
          className="rounded-none bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-yellow-400" />
          Aguardando
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-emerald-500" />
          Confirmada
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-blue-400" />
          Indisponível
        </span>
      </div>

      {/* Spreadsheet */}
      <div className="overflow-auto border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {/* Day headers skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-12 w-48 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`day-${i}`} className="h-12 flex-1 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
              ))}
            </div>
            {/* Technician rows skeleton */}
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={`tr-${r}`} className="flex gap-2 mb-2">
                <div className="h-20 w-48 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                {Array.from({ length: 7 }).map((_, c) => (
                  <div key={`tc-${r}-${c}`} className="h-20 flex-1 animate-pulse bg-neutral-200/50 dark:bg-neutral-800/50" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="sticky top-0 bg-neutral-50 dark:bg-neutral-900">
                <th className="w-48 border-r border-b border-neutral-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  Técnico
                </th>
                {days.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd")
                  const isToday = isSameDay(day, today)
                  return (
                    <th
                      key={dayStr}
                      className={cn(
                        "min-w-[160px] border-r border-b border-neutral-200 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider dark:border-neutral-800",
                        isToday
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          : "text-neutral-500 dark:text-neutral-400"
                      )}
                    >
                      <div>{format(day, "EEE", { locale: ptBR })}</div>
                      <div className="text-base font-bold">{format(day, "d")}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {data?.technicians.map((tech) => (
                <tr key={tech.id} className="group">
                  <td className="sticky left-0 border-r border-b border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {tech.name}
                    </div>
                    {tech.role && (
                      <div className="text-[10px] text-neutral-400">{tech.role}</div>
                    )}
                  </td>
                  {days.map((day) => {
                    const dayStr = format(day, "yyyy-MM-dd")
                    const techIdStr = String(tech.id)
                    const events =
                      data?.events?.[dayStr]?.[techIdStr] || []
                    const isToday = isSameDay(day, today)

                    return (
                      <td
                        key={`${tech.id}-${dayStr}`}
                        className={cn(
                          "border-r border-b border-neutral-100 p-1.5 align-top dark:border-neutral-800",
                          isToday && "bg-blue-50/30 dark:bg-blue-950/20"
                        )}
                      >
                        {events.length > 0 ? (
                          events.map((event) => (
                            <EventBlock key={event.id} event={event} />
                          ))
                        ) : (
                          <div className="flex h-full min-h-[48px] items-center justify-center">
                            <span className="text-[10px] text-neutral-300 dark:text-neutral-600">
                              —
                            </span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {(!data || data.technicians.length === 0) && (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    Nenhum técnico cadastrado. Cadastre técnicos para visualizar a agenda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Info notice */}
      {data && data.technicians.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <Info className="h-3 w-3" />
          Clique em um evento para ver detalhes. Use os botões de navegação para mudar de semana.
        </div>
      )}
    </div>
  )
}
