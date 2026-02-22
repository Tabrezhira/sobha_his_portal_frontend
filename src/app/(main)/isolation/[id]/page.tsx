"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import IsolationForm, { IsolationFormInitialData } from "../_components/form/IsolationForm"

export default function IsolationEdit() {
  const params = useParams<{ id: string }>()
  const isolationId = params?.id
  const [initialData, setInitialData] = useState<IsolationFormInitialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isolationId) return
    let isMounted = true
    api
      .get(`/isolation/${isolationId}`)
      .then((response) => {
        if (!isMounted) return
        setInitialData(response.data?.data ?? response.data)
      })
      .catch(() => {
        if (!isMounted) return
        setError("Failed to load isolation record.")
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [isolationId])

  if (loading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Loading isolation record...
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
    <IsolationForm mode="edit" initialData={initialData || undefined} />
  )
}
