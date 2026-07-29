"use client"

import { useState, useEffect } from "react"
import { api } from "@/core/services/api"
import { useFloatingForm } from "../FloatingFormManager"
import { Loader2 } from "lucide-react"

interface Props { onSuccess?: () => void }

export function CustomerMachineForm({ onSuccess }: Props) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [data, setData] = useState({
    client_id: "", machine_model_id: "", serial_number: "",
    year: "", installation_date: "", location: "", notes: "",
  })

  useEffect(() => {
    api.get<any>("/api/v1/clients?page_size=200").then((r) => setClients(r.items || [])).catch(() => {})
    api.get<any>("/api/v1/machines/models?page_size=200").then((r) => setModels(r.items || [])).catch(() => {})
  }, [])

  const h = (f: string, v: string) => setData((p) => ({ ...p, [f]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      await api.post("/api/v1/machines/customer", {
        ...data,
        client_id: Number(data.client_id),
        machine_model_id: Number(data.machine_model_id),
        year: data.year ? Number(data.year) : null,
      })
      onSuccess?.(); closeForm("customer-machine-form")
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
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Modelo *</label>
          <select value={data.machine_model_id} onChange={(e) => h("machine_model_id", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Selecione...</option>
            {models.map((m: any) => <option key={m.id} value={m.id}>{m.name} / {m.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Nº Série *</label>
          <input value={data.serial_number} onChange={(e) => h("serial_number", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Ano</label>
            <input type="number" value={data.year} onChange={(e) => h("year", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Data Instalação</label>
            <input type="date" value={data.installation_date} onChange={(e) => h("installation_date", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Localização</label>
          <input value={data.location} onChange={(e) => h("location", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Observações</label>
          <textarea value={data.notes} onChange={(e) => h("notes", e.target.value)} rows={2}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => closeForm("customer-machine-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800">Cancelar</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Salvar</button>
      </div>
    </form>
  )
}
