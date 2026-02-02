"use client"

import { columns } from "@/app/(main)/employee/_components/data-table/columns"
import { DataTable } from "@/app/(main)/employee/_components/data-table/DataTable"
import { Patient } from "@/data/schema"
import { dropdownApi } from "@/lib/api"
import { useEffect, useState } from "react"

export default function Example() {
  const [data, setData] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [totalRows, setTotalRows] = useState(0)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await dropdownApi.get("/patients", {
          params: { q: search || undefined, page: pageIndex + 1, limit: pageSize },
        })

        const items = response?.data?.items
        const total = response?.data?.total
        if (isMounted) {
          setData(Array.isArray(items) ? items : [])
          setTotalRows(typeof total === "number" ? total : 0)
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load patients")
          setData([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [search, pageIndex, pageSize])

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Employee Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading employees...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
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
      </div>
    </>
  )
}
