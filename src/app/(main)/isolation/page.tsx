"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import Link from "next/link"

import { columns } from "@/app/(main)/isolation/_components/data-table/columns"
import { DataTable } from "@/app/(main)/isolation/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Isolation } from "@/data/schema"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function IsolationPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["isolation", user?.role],
    queryFn: async () => {
      const endpoint = user?.role === "staff" ? "/isolation/my-location" : "/isolation"
      const response = await api.get(endpoint)
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.items ?? []
      return Array.isArray(payload) ? (payload as Isolation[]) : []
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const tableData = data ?? []

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Isolation
        </h1>
        <Button asChild variant="secondary">
          <Link href="/multi-form/new">New isolation record</Link>
        </Button>
      </div>
      <Card className="mt-4 sm:mt-6 lg:mt-10">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            Failed to load isolation records
          </div>
        ) : isLoading ? (
          <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading isolation records...
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
              onRowClick={(row) => {
                const record = row as {
                  _id?: string
                  id?: string
                  clinicVisitId?: { _id?: string; id?: string } | string
                }
                const recordId = record._id ?? record.id
                const clinicVisitId =
                  typeof record.clinicVisitId === "string"
                    ? record.clinicVisitId
                    : record.clinicVisitId?._id ?? record.clinicVisitId?.id

                if (clinicVisitId) {
                  router.push(`/multi-form/${clinicVisitId}?tab=isolation`)
                  return
                }

                if (!recordId) return
                router.push(`/isolation/${recordId}`)
              }}
            />
          </>
        )}
      </Card>
    </>
  )
}
