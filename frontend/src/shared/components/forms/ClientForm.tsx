"use client"

import { useState } from "react"
import { api } from "@/core/services/api"
import { useFloatingForm } from "../FloatingFormManager"
import { Loader2 } from "lucide-react"

interface ClientFormProps {
  onSuccess?: () => void
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({
    company_name: "",
    trade_name: "",
    cnpj: "",
    state_registration: "",
    phone: "",
    email: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: "",
  })

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await api.post("/api/v1/clients", data)
      onSuccess?.()
      closeForm("client-form")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Razão Social
          </label>
          <input
            value={data.company_name}
            onChange={(e) => handleChange("company_name", e.target.value)}
            required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Nome Fantasia
          </label>
          <input
            value={data.trade_name}
            onChange={(e) => handleChange("trade_name", e.target.value)}
            required
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            CNPJ
          </label>
          <input
            value={data.cnpj}
            onChange={(e) => handleChange("cnpj", e.target.value)}
            required
            placeholder="00.000.000/0000-00"
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Inscrição Estadual
          </label>
          <input
            value={data.state_registration}
            onChange={(e) => handleChange("state_registration", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Telefone
          </label>
          <input
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Contato
          </label>
          <input
            value={data.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Endereço
          </label>
          <input
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Cidade
          </label>
          <input
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              UF
            </label>
            <input
              value={data.state}
              onChange={(e) => handleChange("state", e.target.value)}
              maxLength={2}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              CEP
            </label>
            <input
              value={data.zip_code}
              onChange={(e) => handleChange("zip_code", e.target.value)}
              placeholder="00000-000"
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Observações
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => closeForm("client-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}
