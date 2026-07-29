"use client"

import { useState } from "react"
import { api } from "@/core/services/api"
import { useFloatingForm } from "../FloatingFormManager"
import { Loader2 } from "lucide-react"

interface Props {
  onSuccess?: () => void
}

export function MachineModelForm({ onSuccess }: Props) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({
    name: "", model: "", line: "", controller: "",
    weight: "", travel_x: "", travel_y: "", travel_z: "",
    power: "", tech_specs: "", notes: "",
  })

  const handleChange = (field: string, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      const payload: Record<string, any> = { ...data }
      for (const k of ["weight","travel_x","travel_y","travel_z","power"])
        payload[k] = payload[k] ? Number(payload[k]) : null
      await api.post("/api/v1/machines/models", payload)
      onSuccess?.(); closeForm("machine-model-form")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar")
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Nome *</label>            <input value={data.name} onChange={(e) => handleChange("name", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Modelo *</label>            <input value={data.model} onChange={(e) => handleChange("model", e.target.value)} required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Linha</label>            <input value={data.line} onChange={(e) => handleChange("line", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Controlador</label>            <input value={data.controller} onChange={(e) => handleChange("controller", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Curso X</label>
            <input type="number" value={data.travel_x} onChange={(e) => handleChange("travel_x", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Curso Y</label>
            <input type="number" value={data.travel_y} onChange={(e) => handleChange("travel_y", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Curso Z</label>
            <input type="number" value={data.travel_z} onChange={(e) => handleChange("travel_z", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Peso (kg)</label>
            <input type="number" value={data.weight} onChange={(e) => handleChange("weight", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Potência (kW)</label>
            <input type="number" value={data.power} onChange={(e) => handleChange("power", e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Especificações Técnicas</label>            <textarea value={data.tech_specs} onChange={(e) => handleChange("tech_specs", e.target.value)} rows={3}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Observações</label>            <textarea value={data.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={2}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => closeForm("machine-model-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Cancelar</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Salvar</button>
      </div>
    </form>
  )
}
