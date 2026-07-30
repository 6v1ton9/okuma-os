"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, KeyRound } from "lucide-react"
import { api, ApiError } from "@/core/services/api"

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  must_change_password: boolean
  user: {
    id: number
    email: string
    name: string
    role: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@okuma.com.br")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post<LoginResponse>("/api/v1/auth/login", {
        email,
        password,
      })

      // Store both access and refresh tokens
      localStorage.setItem("okuma_token", response.access_token)
      localStorage.setItem("okuma_refresh_token", response.refresh_token)

      // 🔥 Se o sistema exigir troca de senha, mostrar formulário
      if (response.must_change_password) {
        setMustChangePassword(true)
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Erro de conexão com o servidor")
      }
    } finally {
      if (!mustChangePassword) setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("As senhas não conferem")
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/api/v1/auth/change-password", {
        current_password: password,
        new_password: newPassword,
      })

      // Login novamente com a nova senha
      const response = await api.post<LoginResponse>("/api/v1/auth/login", {
        email,
        password: newPassword,
      })

      localStorage.setItem("okuma_token", response.access_token)
      localStorage.setItem("okuma_refresh_token", response.refresh_token)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Erro ao alterar senha")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-sm border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center bg-blue-600">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
            OKUMA OS
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {mustChangePassword ? "Alteração de Senha" : "Sistema de Gerenciamento Operacional"}
          </p>
        </div>

        {mustChangePassword ? (
          /* 🔥 Change Password Form - first login */
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <KeyRound className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Por segurança, você precisa alterar sua senha antes de continuar.</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Confirme a Nova Senha
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder="Digite a senha novamente"
                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Alterar Senha e Entrar"
              )}
            </button>
          </form>
        ) : (
          /* Normal Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
                placeholder="Sua senha"
              />
            </div>

            {error && (
              <div className="bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          OKUMA OS v1.0.0
        </div>
      </div>
    </div>
  )
}
