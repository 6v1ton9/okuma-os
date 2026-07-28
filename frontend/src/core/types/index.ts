export interface User {
  id: string
  email: string
  name?: string
}

export interface ModuleConfig {
  name: string
  description: string
  version: string
  icon: string
  path: string
  category: "cadastros" | "operacional" | "configuracoes"
  order: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface EventStatusColor {
  status: string
  label: string
  color: string
  order: number
}

export interface SpreadsheetData {
  technicians: { id: number; name: string; role: string | null }[]
  days: string[]
  events: Record<string, Record<string, EventCard[]>>
}

export interface EventCard {
  id: number
  client_name: string
  description: string
  status: string
  start_datetime: string
  end_datetime: string
  city: string | null
  serial_number: string | null
}
