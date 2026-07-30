"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import { api, ApiError } from "@/core/services/api"

interface LoginResponse {
  access_token: string
  token_type: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post<LoginResponse>("/api/v1/auth/login", {
        email,
        password,
      })
      localStorage.setItem("okuma_token", response.access_token)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Erro de conexão com o servidor")
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
            Sistema de Gerenciamento Operacional
          </p>
        </div>

        {/* Form */}
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

        <div className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          OKUMA OS v1.0.0
        </div>
      </div>
    </div>
  )
}
