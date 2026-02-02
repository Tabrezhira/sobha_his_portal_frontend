"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"

import { Button } from "@/components/Button"
import { columns } from "@/app/(main)/isolation/_components/data-table/columns"
import { DataTable } from "@/app/(main)/isolation/_components/data-table/DataTable"
import { api } from "@/lib/api"
import { Isolation } from "@/data/schema"

export default function IsolationPage() {
  const router = useRouter()
  const [data, setData] = useState<Isolation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    api
      .get("/isolation")
      .then((response) => {
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? response.data?.items ?? []

        if (isMounted) {
          setData(payload)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load isolation records")
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Isolation
        </h1>
        <Button asChild variant="secondary">
          <Link href="/isolation/new">New isolation record</Link>
        </Button>
      </div>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : isLoading ? (
          <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading isolation records...
          </div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            onRowClick={(row) => {
              const recordId = (row as { _id?: string; id?: string })._id
              if (!recordId) return
              router.push(`/isolation/${recordId}`)
            }}
          />
        )}
      </div>
    </>
  )
}
