"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
import { api } from "@/core/services/api"
import { DataTable, type Column } from "@/shared/components/DataTable"
import { SearchInput } from "@/shared/components/SearchInput"
import { Pagination } from "@/shared/components/Pagination"
import { Button } from "@/components/ui/button"
import { useFloatingForm } from "@/shared/components/FloatingFormManager"
import { MachineModelForm } from "@/shared/components/forms/MachineModelForm"

interface MachineModel {
  id: number
  name: string
  model: string
  line: string | null
  controller: string | null
  power: number | null
  active: boolean
}

interface ModelsResponse {
  items: MachineModel[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const columns: Column<MachineModel>[] = [
  { key: "name", header: "Nome", sortable: true },
  { key: "model", header: "Modelo", sortable: true },
  { key: "line", header: "Linha", sortable: true, render: (m) => m.line || "-" },
  { key: "controller", header: "Controlador", render: (m) => m.controller || "-" },
  {
    key: "power",
    header: "Potência",
    render: (m) => (m.power ? `${m.power} kW` : "-"),
    className: "w-24 text-right",
  },
]

export default function MachineModelsPage() {
  const [data, setData] = useState<ModelsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("model")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { openForm } = useFloatingForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<ModelsResponse>("/api/v1/machines/models", {
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
        <Button
          onClick={() =>
            openForm("machine-model-form", "Novo Modelo", <MachineModelForm onSuccess={fetchData} />)
          }
          className="rounded-none bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <div className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {loading && !data ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            <DataTable<MachineModel>
              columns={columns}
              data={data?.items || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              emptyMessage="Nenhum modelo de máquina encontrado"
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
