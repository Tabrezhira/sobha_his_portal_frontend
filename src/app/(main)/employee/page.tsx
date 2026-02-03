"use client"

import { columns } from "@/app/(main)/employee/_components/data-table/columns"
import { DataTable } from "@/app/(main)/employee/_components/data-table/DataTable"
import { Card } from "@/components/Card"
import { Patient } from "@/data/schema"
import { dropdownApi } from "@/lib/api"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default function Example() {
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const { data: response, isLoading, isFetching, error } = useQuery({
    queryKey: ["employees", { search, pageIndex, pageSize }],
    queryFn: async () => {
      const response = await dropdownApi.get("/patients", {
        params: { q: search || undefined, page: pageIndex + 1, limit: pageSize },
      })
      const items = response?.data?.items
      const total = response?.data?.total
      return {
        items: Array.isArray(items) ? (items as Patient[]) : [],
        total: typeof total === "number" ? total : 0,
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const data = response?.items ?? []
  const totalRows = response?.total ?? 0

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Employee Details
      </h1>
      <Card className="mt-4 sm:mt-6 lg:mt-10">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading employees...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-500">
            Failed to load employees
          </p>
        )}
        {!isLoading && isFetching && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Updating results...
          </p>
        )}
        <DataTable
          data={data}
          columns={columns}
          onSearch={(value) => {
            setSearch(value)
            setPageIndex(0)
          }}
          pagination={{
            pageIndex,
            pageSize,
            pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
            totalRows,
            onPaginationChange: (updater) => {
              setPageIndex((prev) =>
                typeof updater === "function" ? updater({ pageIndex: prev, pageSize }).pageIndex : updater.pageIndex,
              )
            },
          }}
        />
      </Card>
    </>
  )
}
