"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
import { api } from "@/core/services/api"
import { DataTable, type Column } from "@/shared/components/DataTable"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { SearchInput } from "@/shared/components/SearchInput"
import { Pagination } from "@/shared/components/Pagination"
import { Button } from "@/components/ui/button"

interface CustomerMachine {
  id: number
  client_name: string | null
  machine_model_name: string | null
  machine_model_model: string | null
  serial_number: string
  year: number | null
  location: string | null
  status: string
}

interface CustomerResponse {
  items: CustomerMachine[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const columns: Column<CustomerMachine>[] = [
  {
    key: "serial_number",
    header: "Nº Série",
    sortable: true,
    render: (m) => (
      <span className="font-mono text-xs">{m.serial_number}</span>
    ),
  },
  { key: "client_name", header: "Cliente", render: (m) => m.client_name || "-" },
  { key: "machine_model_name", header: "Modelo", render: (m) => m.machine_model_name || "-" },
  {
    key: "machine_model_model",
    header: "Marca/Ref",
    render: (m) => m.machine_model_model || "-",
  },
  { key: "year", header: "Ano", render: (m) => m.year || "-", className: "w-20 text-center" },
  { key: "location", header: "Localização", render: (m) => m.location || "-" },
  {
    key: "status",
    header: "Status",
    render: (m) => <StatusBadge status={m.status} />,
    className: "w-24",
  },
]

export default function CustomerMachinesPage() {
  const [data, setData] = useState<CustomerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("numero_serie")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<CustomerResponse>("/api/v1/machines/customer", {
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
          Nova Máquina
        </Button>
      </div>

      <div className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {loading && !data ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            <DataTable<CustomerMachine>
              columns={columns}
              data={data?.items || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              emptyMessage="Nenhuma máquina de cliente encontrada"
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
