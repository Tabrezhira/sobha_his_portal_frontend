"use client"

import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import Link from "next/link"

import { columns } from "@/app/(main)/clinic/_components/data-table/columns"
import { DataTable } from "@/app/(main)/clinic/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClinicVisit } from "@/data/schema"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

/**
 * ClinicPage component.
 *
 * This component displays a list of clinic visits in a data table.
 * It fetches data from the API using React Query, supporting pagination and search.
 *
 * @returns {JSX.Element} The rendered ClinicPage component.
 */
export default function ClinicPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  // raw input shown in the UI
  const [searchInput, setSearchInput] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [visitStatus, setVisitStatus] = useState<string>("OPEN") // Default to OPEN cases
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20
  // normalized search used for querying
  const searchTerm = searchInput.trim().toUpperCase()
  const isValidSearch = searchTerm.length > 0
  const isSearchEndpoint = isValidSearch || !!filterDate

  const { data, isLoading, isFetching, error } = useQuery({
    // include the searchTerm in the key only when it meets the 6+ uppercase requirement
    queryKey: ["clinic", user?.role, isValidSearch ? searchTerm : null, filterDate, visitStatus, pageIndex, pageSize],
    queryFn: async () => {
      const page = pageIndex + 1

      const params: any = {
        page,
        limit: pageSize,
      }

      if (isValidSearch) {
        params.empNo = searchTerm
      }
      if (filterDate) {
        params.date = filterDate
      }
      if (visitStatus !== "ALL") {
        params.visitStatus = visitStatus
      }

      const endpoint = isSearchEndpoint ? "/clinic/search" : "/clinic"
      const response = await api.get(endpoint, { params })
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.items ?? []
      const items = Array.isArray(payload) ? (payload as ClinicVisit[]) : []
      const meta = response.data?.meta
      return { items, meta }
    },
    // when performing a search we want fresh data
    staleTime: isSearchEndpoint ? 0 : 5 * 60 * 1000,
    refetchOnMount: isSearchEndpoint ? true : false,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const tableData = data?.items ?? []
  const totalRows = typeof data?.meta?.total === "number" ? data.meta.total : undefined
  const pageCount =
    typeof totalRows === "number" ? Math.ceil(totalRows / pageSize) : undefined

  useEffect(() => {
    const empNo = searchParams.get("empNo")?.trim() ?? ""
    if (empNo) {
      // Sync from URL only when query params change, avoiding overwrite during local clear
      const upperEmpNo = empNo.toUpperCase()
      setSearchInput((prev) => {
        if (prev === upperEmpNo) return prev
        setPageIndex(0)
        return upperEmpNo
      })
    }
  }, [searchParams])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Clinic Visits
        </h1>
        <Button asChild variant="secondary">
          <Link href="/clinic/new">New clinic visit</Link>
        </Button>
      </div>
      <Tabs
        defaultValue="OPEN"
        value={visitStatus}
        onValueChange={(val) => {
          setVisitStatus(val)
          setPageIndex(0)
        }}
        className="mt-4 sm:mt-6 lg:mt-10"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="OPEN">Open Cases</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed Cases</TabsTrigger>
          <TabsTrigger value="ALL">All Cases</TabsTrigger>
        </TabsList>
        <Card>
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
                searchValue={searchInput}
                onSearchChange={(value) => {
                  const upper = value.toUpperCase()
                  const normalized = upper.trim()
                  if (!normalized && searchParams.has("empNo")) {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("empNo")
                    const next = params.toString()
                    router.replace(next ? `${pathname}?${next}` : pathname)
                  }
                  setSearchInput(upper)
                  setPageIndex(0)
                }}
                dateFilter={filterDate}
                onDateChange={(val) => {
                  setFilterDate(val)
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
                  router.push(`/clinic/${recordId}`)
                }}
              />
            </>
          )}
        </Card>
      </Tabs>
    </>
  )
}
