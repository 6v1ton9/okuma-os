const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("okuma_token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Add a reasonable timeout to avoid hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorBody.detail || `Erro ${response.status}: ${response.statusText}`
      )
    }

    if (response.status === 204) return null as T
    return response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "A requisição excedeu o tempo limite. Verifique se o servidor está rodando.")
    }
    // NetworkError (fetch failed)
    throw new ApiError(0, `Erro de conexão com o servidor (${API_URL}). Verifique se o backend está rodando e se a variável NEXT_PUBLIC_API_URL está configurada corretamente.`)
  }
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) => {
    const searchParams = params
      ? "?" + new URLSearchParams(params).toString()
      : ""
    return request<T>(`${endpoint}${searchParams}`)
  },

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
}
