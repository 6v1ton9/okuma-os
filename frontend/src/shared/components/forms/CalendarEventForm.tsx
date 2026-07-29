"use client"

import { useState, useEffect } from "react"
import { api } from "@/core/services/api"
import { useFloatingForm } from "../FloatingFormManager"
import { Loader2 } from "lucide-react"

interface Props { onSuccess?: () => void }

export function CalendarEventForm({ onSuccess }: Props) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [data, setData] = useState({
    client_id: "", customer_machine_id: "", description: "",
    start_datetime: "", end_datetime: "", status: "pending",
    notes: "", city: "", technician_ids: [] as number[],
  })

  useEffect(() => {
    api.get<any>("/api/v1/clients?page_size=200").then((r) => setClients(r.items || [])).catch(() => {})
    api.get<any>("/api/v1/machines/customer?page_size=200").then((r) => setMachines(r.items || [])).catch(() => {})
    api.get<any>("/api/v1/technicians?page_size=200")
      .then((r) => setTechnicians(r.items || []))
      .catch(() => console.error("Erro ao carregar técnicos"))
  }, [])

  const h = (f: string, v: any) => setData((p) => ({ ...p, [f]: v }))
  const toggleTech = (id: number) => {
    setData((p) => ({
      ...p,
      technician_ids: p.technician_ids.includes(id)
        ? p.technician_ids.filter((t) => t !== id)
        : [...p.technician_ids, id],
    }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      const payload = {
        ...data,
        client_id: Number(data.client_id),
        customer_machine_id: data.customer_machine_id ? Number(data.customer_machine_id) : null,
        start_datetime: new Date(data.start_datetime).toISOString(),
        end_datetime: new Date(data.end_datetime).toISOString(),
      }
      await api.post("/api/v1/calendar", payload)
      onSuccess?.(); closeForm("calendar-event-form")
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-sm">
      {error && <div className="bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Cliente *</label>
          <select value={data.client_id} onChange={(e) => h("client_id", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Selecione...</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Máquina</label>
          <select value={data.customer_machine_id} onChange={(e) => h("customer_machine_id", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Nenhuma</option>
            {machines.map((m: any) => <option key={m.id} value={m.id}>{m.serial_number} - {m.client_name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Descrição *</label>
          <input value={data.description} onChange={(e) => h("description", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Data/Hora Início *</label>
            <input type="datetime-local" value={data.start_datetime} onChange={(e) => h("start_datetime", e.target.value)} required
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Data/Hora Fim *</label>
            <input type="datetime-local" value={data.end_datetime} onChange={(e) => h("end_datetime", e.target.value)} required
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Cidade</label>
          <input value={data.city} onChange={(e) => h("city", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Status</label>
          <select value={data.status} onChange={(e) => h("status", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="pending">Aguardando</option>
            <option value="confirmed">Confirmada</option>
            <option value="unavailable">Indisponível</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Técnicos</label>
          <div className="flex flex-wrap gap-2">
            {technicians.map((t: any) => (
              <label key={t.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={data.technician_ids.includes(t.id)}
                  onChange={() => toggleTech(t.id)}
                  className="rounded-none border-neutral-300 dark:border-neutral-700" />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Observações</label>
          <textarea value={data.notes} onChange={(e) => h("notes", e.target.value)} rows={2}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => closeForm("calendar-event-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800">Cancelar</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Salvar</button>
      </div>
    </form>
  )
}
