"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { Summary } from "@/data/schema"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export type EmployeeSummaryProps = {
  empId?: string
  className?: string
}

type SummaryState = {
  loading: boolean
  error: string | null
  data: Summary["data"] | null
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

export default function EmployeeSummary({ empId, className }: EmployeeSummaryProps) {
  const [state, setState] = useState<SummaryState>({
    loading: false,
    error: null,
    data: null,
  })

  const normalizedEmpId = useMemo(() => (empId || "").trim(), [empId])

  useEffect(() => {
    let cancelled = false

    const fetchSummary = async () => {
      if (!normalizedEmpId) {
        setState({ loading: false, error: null, data: null })
        return
      }
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await api.get<Summary>("/clinic/summary", {
          params: { empNo: normalizedEmpId },
        })
        if (cancelled) return
        setState({ loading: false, error: null, data: response.data.data })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Failed to load summary"
        setState({ loading: false, error: message, data: null })
      }
    }

    fetchSummary()

    return () => {
      cancelled = true
    }
  }, [normalizedEmpId])

  return (
    <Card className={`p-5 ${className ?? ""}`.trim()}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Employee Summary</div>
        <div className="text-sm font-semibold">{normalizedEmpId || "No employee"}</div>
      </div>

      <Separator className="my-4" />

      {!normalizedEmpId && (
        <div className="text-sm text-muted-foreground">
          Enter an employee id to load summary.
        </div>
      )}

      {normalizedEmpId && state.loading && (
        <div className="text-sm text-muted-foreground">Loading summary…</div>
      )}

      {normalizedEmpId && state.error && (
        <div className="text-sm text-red-500">{state.error}</div>
      )}

      {normalizedEmpId && state.data && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Visits last 90 days</div>
              <div className="text-lg font-semibold">{state.data.last90Days.count}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">All-time total visits</div>
              <div className="text-lg font-semibold">{state.data.allTimeTotalVisits}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sick leave approved</div>
              <div className="text-lg font-semibold">{state.data.sickLeaveApprovedCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total referrals</div>
              <div className="text-lg font-semibold">{state.data.totalReferrals}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Open referrals</div>
              <div className="text-lg font-semibold">{state.data.openReferrals}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm font-semibold">Visits (last 90 days)</div>
            <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
              {state.data.last90Days.visits.length === 0 && (
                <div className="text-sm text-muted-foreground">No visits in last 90 days.</div>
              )}
              {state.data.last90Days.visits.map((visit, index) => (
                <div
                  key={`${visit.date}-${index}`}
                  className="flex items-center justify-between rounded-md border border-muted px-3 py-2 text-sm"
                >
                  <span>{formatDate(visit.date)}</span>
                  <span className="text-muted-foreground">
                    {visit.provider || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
