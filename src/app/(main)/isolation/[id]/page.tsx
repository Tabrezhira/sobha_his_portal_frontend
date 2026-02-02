"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { api } from "@/lib/api"

type IsolationResponse = {
  _id?: string
  id?: string
  locationId?: string
  siNo?: number
  empNo?: string
  type?: string
  employeeName?: string
  emiratesId?: string
  insuranceId?: string
  mobileNumber?: string
  trLocation?: string
  isolatedIn?: string
  isolationReason?: string
  nationality?: string
  slUpto?: string
  dateFrom?: string
  dateTo?: string
  currentStatus?: string
  remarks?: string
  createdBy?: string
}

export default function IsolationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const isolationId = params?.id

  const [form, setForm] = useState({
    locationId: "",
    siNo: "",
    empNo: "",
    type: "",
    employeeName: "",
    emiratesId: "",
    insuranceId: "",
    mobileNumber: "",
    trLocation: "",
    isolatedIn: "",
    isolationReason: "",
    nationality: "",
    slUpto: "",
    dateFrom: "",
    dateTo: "",
    currentStatus: "",
    remarks: "",
    createdBy: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const canSubmit = useMemo(() => {
    return (
      form.siNo &&
      form.empNo &&
      form.employeeName &&
      form.emiratesId &&
      form.createdBy
    )
  }, [form])

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const buildPayload = () => {
    return {
      locationId: form.locationId || undefined,
      siNo: Number(form.siNo),
      empNo: form.empNo,
      type: form.type || undefined,
      employeeName: form.employeeName,
      emiratesId: form.emiratesId,
      insuranceId: form.insuranceId || undefined,
      mobileNumber: form.mobileNumber || undefined,
      trLocation: form.trLocation || undefined,
      isolatedIn: form.isolatedIn || undefined,
      isolationReason: form.isolationReason || undefined,
      nationality: form.nationality || undefined,
      slUpto: form.slUpto || undefined,
      dateFrom: form.dateFrom || undefined,
      dateTo: form.dateTo || undefined,
      currentStatus: form.currentStatus || undefined,
      remarks: form.remarks || undefined,
      createdBy: form.createdBy,
    }
  }

  useEffect(() => {
    if (!isolationId) return

    api
      .get(`/isolation/${isolationId}`)
      .then((response) => {
        const data: IsolationResponse =
          response.data?.data ?? response.data ?? {}

        setForm({
          locationId: data.locationId ?? "",
          siNo: String(data.siNo ?? ""),
          empNo: data.empNo ?? "",
          type: data.type ?? "",
          employeeName: data.employeeName ?? "",
          emiratesId: data.emiratesId ?? "",
          insuranceId: data.insuranceId ?? "",
          mobileNumber: data.mobileNumber ?? "",
          trLocation: data.trLocation ?? "",
          isolatedIn: data.isolatedIn ?? "",
          isolationReason: data.isolationReason ?? "",
          nationality: data.nationality ?? "",
          slUpto: data.slUpto ? String(data.slUpto).split("T")[0] : "",
          dateFrom: data.dateFrom ? String(data.dateFrom).split("T")[0] : "",
          dateTo: data.dateTo ? String(data.dateTo).split("T")[0] : "",
          currentStatus: data.currentStatus ?? "",
          remarks: data.remarks ?? "",
          createdBy: data.createdBy ?? "",
        })
      })
      .catch(() => {
        toast.error("Failed to load isolation record")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isolationId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      toast.error("Please fill all required fields.")
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/isolation/${isolationId}`, buildPayload())
      toast.success("Isolation record updated successfully.")
      router.push("/isolation")
    } catch {
      toast.error("Failed to update isolation record.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this isolation record?")) {
      return
    }

    try {
      await api.delete(`/isolation/${isolationId}`)
      toast.success("Isolation record deleted successfully.")
      router.push("/isolation")
    } catch {
      toast.error("Failed to delete isolation record.")
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Loading isolation record...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Edit Isolation Record
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update isolation details and submit.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button asChild variant="secondary">
            <Link href="/isolation">Back to isolation</Link>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Isolation details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Required fields are marked with *.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="siNo" className="font-medium">
                SI No *
              </Label>
              <Input
                id="siNo"
                name="siNo"
                type="number"
                value={form.siNo}
                onChange={(e) => updateForm("siNo", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="empNo" className="font-medium">
                Employee No *
              </Label>
              <Input
                id="empNo"
                name="empNo"
                type="text"
                value={form.empNo}
                onChange={(e) => updateForm("empNo", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="employeeName" className="font-medium">
                Employee Name *
              </Label>
              <Input
                id="employeeName"
                name="employeeName"
                type="text"
                value={form.employeeName}
                onChange={(e) => updateForm("employeeName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="emiratesId" className="font-medium">
                Emirates ID *
              </Label>
              <Input
                id="emiratesId"
                name="emiratesId"
                type="text"
                value={form.emiratesId}
                onChange={(e) => updateForm("emiratesId", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="font-medium">
                Type
              </Label>
              <Input
                id="type"
                name="type"
                type="text"
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="insuranceId" className="font-medium">
                Insurance ID
              </Label>
              <Input
                id="insuranceId"
                name="insuranceId"
                type="text"
                value={form.insuranceId}
                onChange={(e) => updateForm("insuranceId", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mobileNumber" className="font-medium">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="text"
                value={form.mobileNumber}
                onChange={(e) => updateForm("mobileNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trLocation" className="font-medium">
                TR Location
              </Label>
              <Input
                id="trLocation"
                name="trLocation"
                type="text"
                value={form.trLocation}
                onChange={(e) => updateForm("trLocation", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nationality" className="font-medium">
                Nationality
              </Label>
              <Input
                id="nationality"
                name="nationality"
                type="text"
                value={form.nationality}
                onChange={(e) => updateForm("nationality", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Isolation Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="isolatedIn" className="font-medium">
                Isolated In
              </Label>
              <Input
                id="isolatedIn"
                name="isolatedIn"
                type="text"
                value={form.isolatedIn}
                onChange={(e) => updateForm("isolatedIn", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateFrom" className="font-medium">
                Date From
              </Label>
              <Input
                id="dateFrom"
                name="dateFrom"
                type="date"
                value={form.dateFrom}
                onChange={(e) => updateForm("dateFrom", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="font-medium">
                Date To
              </Label>
              <Input
                id="dateTo"
                name="dateTo"
                type="date"
                value={form.dateTo}
                onChange={(e) => updateForm("dateTo", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="slUpto" className="font-medium">
                SL Upto
              </Label>
              <Input
                id="slUpto"
                name="slUpto"
                type="date"
                value={form.slUpto}
                onChange={(e) => updateForm("slUpto", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currentStatus" className="font-medium">
                Current Status
              </Label>
              <Input
                id="currentStatus"
                name="currentStatus"
                type="text"
                value={form.currentStatus}
                onChange={(e) => updateForm("currentStatus", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="isolationReason" className="font-medium">
              Isolation Reason
            </Label>
            <Textarea
              id="isolationReason"
              name="isolationReason"
              value={form.isolationReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateForm("isolationReason", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="remarks" className="font-medium">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              name="remarks"
              value={form.remarks}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateForm("remarks", e.target.value)}
              rows={3}
            />
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Additional Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="locationId" className="font-medium">
                Location ID
              </Label>
              <Input
                id="locationId"
                name="locationId"
                type="text"
                value={form.locationId}
                onChange={(e) => updateForm("locationId", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="createdBy" className="font-medium">
                Created By *
              </Label>
              <Input
                id="createdBy"
                name="createdBy"
                type="text"
                value={form.createdBy}
                onChange={(e) => updateForm("createdBy", e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="secondary">
            <Link href="/isolation">Cancel</Link>
          </Button>
          <Button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Updating..." : "Update Isolation Record"}
          </Button>
        </div>
      </form>
    </div>
  )
}
