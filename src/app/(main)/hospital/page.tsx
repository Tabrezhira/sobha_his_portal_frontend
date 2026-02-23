"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

import Link from "next/link"

import { columns } from "@/app/(main)/hospital/_components/data-table/columns"
import { DataTable } from "@/app/(main)/hospital/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Hospital } from "@/data/schema"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function Example() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchRequestId, setSearchRequestId] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20

  const normalizedSearchTerm = searchTerm.trim()
  const shouldSearch = normalizedSearchTerm.length >= 6

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "hospital",
      user?.role,
      shouldSearch ? normalizedSearchTerm : "",
      pageIndex,
      pageSize,
      shouldSearch ? searchRequestId : 0,
    ],
    queryFn: async () => {
      const page = pageIndex + 1

      if (shouldSearch) {
        const response = await api.get("/hospital", {
          params: {
            empNo: normalizedSearchTerm,
            page,
            limit: pageSize,
          },
        })
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? response.data?.items ?? []
        const items = Array.isArray(payload) ? (payload as Hospital[]) : []
        const meta = response.data?.meta
        return { items, meta }
      }

      const endpoint = user?.role === "maleNurse" ? "/hospital/my-location" : "/hospital"
      const response = await api.get(endpoint, {
        params: {
          page,
          limit: pageSize,
        },
      })
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.items ?? []
      const items = Array.isArray(payload) ? (payload as Hospital[]) : []
      const meta = response.data?.meta
      return { items, meta }
    },
    placeholderData: shouldSearch ? undefined : keepPreviousData,
    staleTime: shouldSearch ? 0 : 5 * 60 * 1000,
    gcTime: shouldSearch ? 0 : 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const tableData = data?.items ?? []
  const totalRows = typeof data?.meta?.total === "number" ? data.meta.total : undefined
  const pageCount =
    typeof totalRows === "number" ? Math.ceil(totalRows / pageSize) : undefined

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Hospital
        </h1>
        <Button asChild variant="secondary">
          <Link href="/hospital/new">New hospital record</Link>
        </Button>
      </div>
      <Card className="mt-4 sm:mt-6 lg:mt-10">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            Failed to load hospital records
          </div>
        ) : isLoading ? (
          <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading hospital records...
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="mb-3 text-xs text-gray-400 dark:text-gray-500">
                Updating results...
              </div>
            )}
            <DataTable
              data={tableData}
              columns={columns}
              onSearchChange={(value) => {
                setSearchTerm(value)
                setPageIndex(0)
                if (value.trim().length >= 6) {
                  setSearchRequestId((prev) => prev + 1)
                }
              }}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalRows={totalRows}
              onPageChange={setPageIndex}
              onRowClick={(row) => {
                const record = row as {
                  _id?: string
                  id?: string
                  clinicVisitId?: { _id?: string; id?: string } | string
                }
                const recordId = record._id ?? record.id

                if (!recordId) return
                router.push(`/hospital/${recordId}`)
              }}
            />
          </>
        )}
      </Card>
    </>
  )
}
