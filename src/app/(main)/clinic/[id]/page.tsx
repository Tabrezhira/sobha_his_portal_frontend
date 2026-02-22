"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import ClinicVisitForm, { ClinicVisitFormInitialData } from "../_components/form/ClinicVisitForm"

export default function ClinicVisitEdit() {
  const params = useParams<{ id: string }>()
  const clinicId = params?.id
  const [initialData, setInitialData] = useState<ClinicVisitFormInitialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clinicId) return
    let isMounted = true
    api
      .get(`/clinic/${clinicId}`)
      .then((response) => {
        if (!isMounted) return
        setInitialData(response.data?.data ?? response.data)
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
    <ClinicVisitForm mode="edit" initialData={initialData || undefined} />
  )
}
