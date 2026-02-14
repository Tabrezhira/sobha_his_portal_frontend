"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

import Link from "next/link"

import { columns } from "@/app/(main)/clinic/_components/data-table/columns"
import { DataTable } from "@/app/(main)/clinic/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { ClinicVisit } from "@/data/schema"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function Example() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["clinic", user?.role, searchTerm, pageIndex, pageSize],
    queryFn: async () => {
      const page = pageIndex + 1
      if (searchTerm) {
        const response = await api.get("/clinic", {
          params: {
            empNo: searchTerm,
            page,
            limit: pageSize,
          },
        })
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? response.data?.items ?? []
        const items = Array.isArray(payload) ? (payload as ClinicVisit[]) : []
        const meta = response.data?.meta
        return { items, meta }
      }

      const endpoint = user?.role === "staff" ? "/clinic/my-location" : "/clinic"
      const response = await api.get(endpoint, {
        params: {
          page,
          limit: pageSize,
        },
      })
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.items ?? []
      const items = Array.isArray(payload) ? (payload as ClinicVisit[]) : []
      const meta = response.data?.meta
      return { items, meta }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
          Clinic Visits
        </h1>
        <Button asChild variant="secondary">
          <Link href="/multi-form/new">New clinic visit</Link>
        </Button>
      </div>
      <Card className="mt-4 sm:mt-6 lg:mt-10">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            Failed to load clinic visits
          </div>
        ) : isLoading ? (
          <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading clinic visits...
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
              }}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalRows={totalRows}
              onPageChange={setPageIndex}
              onRowClick={(row) => {
                const recordId = (row as { _id?: string; id?: string })._id
                if (!recordId) return
                router.push(`/multi-form/${recordId}`)
              }}
            />
          </>
        )}
      </Card>
    </>
  )
}
