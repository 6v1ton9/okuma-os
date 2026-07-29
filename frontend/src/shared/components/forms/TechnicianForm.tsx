"use client"

import { useState } from "react"
import { api } from "@/core/services/api"
import { useFloatingForm } from "../FloatingFormManager"
import { Loader2 } from "lucide-react"

interface Props { onSuccess?: () => void }

export function TechnicianForm({ onSuccess }: Props) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({
    name: "", cpf: "", rg: "", birth_date: "",
    phone: "", email: "", role: "",
  })

  const h = (f: string, v: string) => setData((p) => ({ ...p, [f]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      await api.post("/api/v1/technicians", data)
      onSuccess?.(); closeForm("technician-form")
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-sm">
      {error && <div className="bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Nome *</label>
          <input value={data.name} onChange={(e) => h("name", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">CPF *</label>
            <input value={data.cpf} onChange={(e) => h("cpf", e.target.value)} required placeholder="000.000.000-00"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">RG</label>
            <input value={data.rg} onChange={(e) => h("rg", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Nascimento</label>
          <input type="date" value={data.birth_date} onChange={(e) => h("birth_date", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Telefone</label>
          <input value={data.phone} onChange={(e) => h("phone", e.target.value)} placeholder="(11) 99999-9999"
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">E-mail</label>
          <input type="email" value={data.email} onChange={(e) => h("email", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Cargo</label>
          <input value={data.role} onChange={(e) => h("role", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => closeForm("technician-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800">Cancelar</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Salvar</button>
      </div>
    </form>
  )
}
