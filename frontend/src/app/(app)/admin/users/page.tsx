"use client"

import { useState, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Shield, UserCheck, UserX } from "lucide-react"
import { api } from "@/core/services/api"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/shared/components/DataTable"
import { useFloatingForm } from "@/shared/components/FloatingFormManager"

interface AppUser {
  id: number
  email: string
  name: string
  role: string
  active: boolean
}

interface UsersResponse {
  items: AppUser[]
  total: number
}

const columns: Column<AppUser>[] = [
  { key: "name", header: "Nome", sortable: true },
  { key: "email", header: "E-mail", sortable: true },
  { key: "role", header: "Perfil", sortable: true,
    render: (u) => (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${
        u.role === "super_admin"
          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
      }`}>
        {u.role === "super_admin" ? <Shield className="h-3 w-3" /> : null}
        {u.role === "super_admin" ? "Super Admin" : "Admin"}
      </span>
    ),
  },
  {
    key: "active",
    header: "Status",
    render: (u) => (
      <span className={`inline-flex items-center gap-1 text-xs ${
        u.active ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"
      }`}>
        {u.active ? (
          <><UserCheck className="h-3 w-3" /> Ativo</>
        ) : (
          <><UserX className="h-3 w-3" /> Inativo</>
        )}
      </span>
    ),
  },
]

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const { closeForm } = useFloatingForm()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState({ name: "", email: "", password: "", confirmPassword: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (data.password !== data.confirmPassword) {
      setError("Senhas não conferem")
      return
    }
    if (data.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }
    setSaving(true)
    setError("")
    try {
      await api.post("/api/v1/admin/users", {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      onSuccess()
      closeForm("create-user-form")
    } catch (err: any) {
      setError(err.message || "Erro ao criar usuário")
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
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Nome *</label>
        <input value={data.name} onChange={(e) => setData(p => ({...p, name: e.target.value}))} required
          className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">E-mail *</label>
        <input type="email" value={data.email} onChange={(e) => setData(p => ({...p, email: e.target.value}))} required
          className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Senha *</label>
        <input type="password" value={data.password} onChange={(e) => setData(p => ({...p, password: e.target.value}))} required minLength={6}
          className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Confirmar Senha *</label>
        <input type="password" value={data.confirmPassword} onChange={(e) => setData(p => ({...p, confirmPassword: e.target.value}))} required
          className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => closeForm("create-user-form")}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Cancelar</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Criar Usuário</button>
      </div>
    </form>
  )
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { openForm } = useFloatingForm()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<UsersResponse>("/api/v1/admin/users"),
    retry: false,
  })

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] })
  }, [queryClient])

  const handleOpenCreate = () => {
    openForm("create-user-form", "Novo Usuário", <CreateUserForm onSuccess={onSuccess} />)
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">Erro ao carregar usuários</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Apenas usuários com perfil Super Admin podem acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Gerenciar Usuários
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Crie e gerencie contas de administradores do sistema
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-none bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <DataTable<AppUser>
            columns={columns}
            data={data?.items || []}
            emptyMessage="Nenhum usuário encontrado"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        <Shield className="h-3 w-3" />
        Apenas Super Administradores podem gerenciar usuários.
      </div>
    </div>
  )
}
