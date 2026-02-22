"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import ClinicEditForm from "../_components/form/ClinicEditForm"
import { ClinicEditFormInitialData } from "../_components/form/ClinicEditForm"

export default function ClinicVisitEdit() {
  const params = useParams<{ id: string }>()
  const clinicId = params?.id
  const [initialData, setInitialData] = useState<ClinicEditFormInitialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clinicId) return
    let isMounted = true
    api
      .get(`/clinic/${clinicId}`)
      .then((response) => {
        if (!isMounted) return
        const data = response.data?.data ?? response.data
        console.log("Fetched initialData:", data)
        setInitialData(data)
      })
      .catch(() => {
        if (!isMounted) return
        setError("Failed to load clinic visit.")
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [clinicId])

  if (loading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Loading clinic visit...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!loading && !error && (
        <ClinicEditForm mode="edit" initialData={initialData || undefined} />
      )}
    </div>
  )
}
