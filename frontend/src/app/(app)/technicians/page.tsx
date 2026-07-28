"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
import { api } from "@/core/services/api"
import { DataTable, type Column } from "@/shared/components/DataTable"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { SearchInput } from "@/shared/components/SearchInput"
import { Pagination } from "@/shared/components/Pagination"
import { Button } from "@/components/ui/button"
import { formatCPF, formatPhone } from "@/lib/utils"

interface Technician {
  id: number
  name: string
  cpf: string
  phone: string | null
  email: string | null
  role: string | null
  status: string
  active: boolean
}

interface TechniciansResponse {
  items: Technician[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const columns: Column<Technician>[] = [
  { key: "name", header: "Nome", sortable: true },
  {
    key: "cpf",
    header: "CPF",
    render: (t) => formatCPF(t.cpf),
  },
  { key: "role", header: "Cargo", sortable: true, render: (t) => t.role || "-" },
  { key: "email", header: "E-mail", render: (t) => t.email || "-" },
  {
    key: "phone",
    header: "Telefone",
    render: (t) => (t.phone ? formatPhone(t.phone) : "-"),
  },
  {
    key: "status",
    header: "Status",
    render: (t) => <StatusBadge status={t.status} />,
    className: "w-24",
  },
]

export default function TechniciansPage() {
  const [data, setData] = useState<TechniciansResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<TechniciansResponse>("/api/v1/technicians", {
        page: String(page),
        page_size: "20",
        ...(search && { search }),
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-72">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        <Button className="rounded-none bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Técnico
        </Button>
      </div>

      <div className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {loading && !data ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            <DataTable<Technician>
              columns={columns}
              data={data?.items || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              emptyMessage="Nenhum técnico encontrado"
            />
            {data && (
              <Pagination
                page={data.page}
                totalPages={data.total_pages}
                total={data.total}
                pageSize={data.page_size}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
