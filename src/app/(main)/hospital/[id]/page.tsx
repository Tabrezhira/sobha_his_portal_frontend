"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { api } from "@/lib/api"

const emptyFollowUp = { date: "", remarks: "" }

type HospitalResponse = {
  _id?: string
  id?: string
  locationId?: string
  sno?: number
  empNo?: string
  employeeName?: string
  emiratesId?: string
  insuranceId?: string
  trLocation?: string
  mobileNumber?: string
  hospitalName?: string
  dateOfAdmission?: string
  natureOfCase?: string
  caseCategory?: string
  primaryDiagnosis?: string
  secondaryDiagnosis?: string[]
  status?: string
  dischargeSummaryReceived?: boolean
  dateOfDischarge?: string
  daysHospitalized?: number
  followUp?: Array<{ date?: string; remarks?: string }>
  fitnessStatus?: string
  isolationRequired?: boolean
  finalRemarks?: string
  createdBy?: string
}

export default function HospitalEdit() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const hospitalId = params?.id

  const [form, setForm] = useState({
    locationId: "",
    sno: "",
    empNo: "",
    employeeName: "",
    emiratesId: "",
    insuranceId: "",
    trLocation: "",
    mobileNumber: "",
    hospitalName: "",
    dateOfAdmission: "",
    natureOfCase: "",
    caseCategory: "",
    primaryDiagnosis: "",
    secondaryDiagnosis: "",
    status: "",
    dischargeSummaryReceived: false,
    dateOfDischarge: "",
    daysHospitalized: "",
    fitnessStatus: "",
    isolationRequired: false,
    finalRemarks: "",
    createdBy: "",
  })

  const [followUp, setFollowUp] = useState([emptyFollowUp])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const canSubmit = useMemo(() => {
    return (
      form.sno &&
      form.empNo &&
      form.employeeName &&
      form.emiratesId &&
      form.createdBy
    )
  }, [form])

  const updateForm = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFollowUpChange = (
    index: number,
    key: keyof typeof emptyFollowUp,
    value: string,
  ) => {
    setFollowUp((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    )
  }

  const buildPayload = () => {
    const toNumber = (value: string) => (value ? Number(value) : undefined)
    const toArray = (value: string) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

    const filteredFollowUp = followUp
      .filter((item) => item.date || item.remarks)
      .map((item) => ({
        date: item.date || undefined,
        remarks: item.remarks || undefined,
      }))

    return {
      locationId: form.locationId || undefined,
      sno: Number(form.sno),
      empNo: form.empNo,
      employeeName: form.employeeName,
      emiratesId: form.emiratesId,
      insuranceId: form.insuranceId || undefined,
      trLocation: form.trLocation || undefined,
      mobileNumber: form.mobileNumber || undefined,
      hospitalName: form.hospitalName || undefined,
      dateOfAdmission: form.dateOfAdmission || undefined,
      natureOfCase: form.natureOfCase || undefined,
      caseCategory: form.caseCategory || undefined,
      primaryDiagnosis: form.primaryDiagnosis || undefined,
      secondaryDiagnosis: form.secondaryDiagnosis
        ? toArray(form.secondaryDiagnosis)
        : undefined,
      status: form.status || undefined,
      dischargeSummaryReceived: form.dischargeSummaryReceived,
      dateOfDischarge: form.dateOfDischarge || undefined,
      daysHospitalized: toNumber(form.daysHospitalized),
      followUp: filteredFollowUp.length ? filteredFollowUp : undefined,
      fitnessStatus: form.fitnessStatus || undefined,
      isolationRequired: form.isolationRequired,
      finalRemarks: form.finalRemarks || undefined,
      createdBy: form.createdBy,
    }
  }

  useEffect(() => {
    if (!hospitalId) return

    let isMounted = true
    setLoading(true)
    api
      .get(`/hospital/${hospitalId}`)
      .then((response) => {
        const data: HospitalResponse = response.data?.data ?? response.data
        if (!isMounted || !data) return

        setForm((prev) => ({
          ...prev,
          locationId: data.locationId ?? "",
          sno: data.sno?.toString() ?? "",
          empNo: data.empNo ?? "",
          employeeName: data.employeeName ?? "",
          emiratesId: data.emiratesId ?? "",
          insuranceId: data.insuranceId ?? "",
          trLocation: data.trLocation ?? "",
          mobileNumber: data.mobileNumber ?? "",
          hospitalName: data.hospitalName ?? "",
          dateOfAdmission: data.dateOfAdmission
            ? data.dateOfAdmission.slice(0, 10)
            : "",
          natureOfCase: data.natureOfCase ?? "",
          caseCategory: data.caseCategory ?? "",
          primaryDiagnosis: data.primaryDiagnosis ?? "",
          secondaryDiagnosis: data.secondaryDiagnosis?.join(", ") ?? "",
          status: data.status ?? "",
          dischargeSummaryReceived: Boolean(data.dischargeSummaryReceived),
          dateOfDischarge: data.dateOfDischarge
            ? data.dateOfDischarge.slice(0, 10)
            : "",
          daysHospitalized: data.daysHospitalized?.toString() ?? "",
          fitnessStatus: data.fitnessStatus ?? "",
          isolationRequired: Boolean(data.isolationRequired),
          finalRemarks: data.finalRemarks ?? "",
          createdBy: data.createdBy ?? "",
        }))

        setFollowUp(
          data.followUp?.length
            ? data.followUp.map((item) => ({
                date: item.date ? item.date.slice(0, 10) : "",
                remarks: item.remarks ?? "",
              }))
            : [emptyFollowUp],
        )
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load hospital record.")
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [hospitalId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!canSubmit) {
      setError("Please fill all required fields.")
      return
    }

    if (!hospitalId) {
      setError("Hospital record not found.")
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/hospital/${hospitalId}`, buildPayload())
      setMessage("Hospital record updated successfully.")
      router.refresh()
    } catch {
      setError("Failed to update hospital record.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Hospital Record
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and update hospital details.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/hospital">Back to hospital</Link>
        </Button>
      </div>

      {loading ? (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Loading hospital record...
        </div>
      ) : (
        <>
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Admission details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Required fields are marked.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="sno" className="font-medium">
                    S No *
                  </Label>
                  <Input
                    id="sno"
                    type="number"
                    enableStepper={false}
                    className="mt-2"
                    value={form.sno}
                    onChange={(e) => updateForm("sno", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfAdmission" className="font-medium">
                    Date of Admission
                  </Label>
                  <Input
                    id="dateOfAdmission"
                    type="date"
                    className="mt-2"
                    value={form.dateOfAdmission}
                    onChange={(e) =>
                      updateForm("dateOfAdmission", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hospitalName" className="font-medium">
                    Hospital Name
                  </Label>
                  <Input
                    id="hospitalName"
                    className="mt-2"
                    value={form.hospitalName}
                    onChange={(e) => updateForm("hospitalName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="font-medium">
                    Status
                  </Label>
                  <Input
                    id="status"
                    className="mt-2"
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="locationId" className="font-medium">
                    Location ID
                  </Label>
                  <Input
                    id="locationId"
                    className="mt-2"
                    value={form.locationId}
                    onChange={(e) => updateForm("locationId", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="trLocation" className="font-medium">
                    TR Location
                  </Label>
                  <Input
                    id="trLocation"
                    className="mt-2"
                    value={form.trLocation}
                    onChange={(e) => updateForm("trLocation", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Employee details
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="empNo" className="font-medium">
                    Employee No *
                  </Label>
                  <Input
                    id="empNo"
                    className="mt-2"
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
                    className="mt-2"
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
                    className="mt-2"
                    value={form.emiratesId}
                    onChange={(e) => updateForm("emiratesId", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceId" className="font-medium">
                    Insurance ID
                  </Label>
                  <Input
                    id="insuranceId"
                    className="mt-2"
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
                    className="mt-2"
                    value={form.mobileNumber}
                    onChange={(e) => updateForm("mobileNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="createdBy" className="font-medium">
                    Created By (User ID) *
                  </Label>
                  <Input
                    id="createdBy"
                    className="mt-2"
                    value={form.createdBy}
                    onChange={(e) => updateForm("createdBy", e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Case details
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="natureOfCase" className="font-medium">
                    Nature of Case
                  </Label>
                  <Input
                    id="natureOfCase"
                    className="mt-2"
                    value={form.natureOfCase}
                    onChange={(e) => updateForm("natureOfCase", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="caseCategory" className="font-medium">
                    Case Category
                  </Label>
                  <Input
                    id="caseCategory"
                    className="mt-2"
                    value={form.caseCategory}
                    onChange={(e) => updateForm("caseCategory", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryDiagnosis" className="font-medium">
                    Primary Diagnosis
                  </Label>
                  <Input
                    id="primaryDiagnosis"
                    className="mt-2"
                    value={form.primaryDiagnosis}
                    onChange={(e) => updateForm("primaryDiagnosis", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="secondaryDiagnosis" className="font-medium">
                    Secondary Diagnosis (comma separated)
                  </Label>
                  <Input
                    id="secondaryDiagnosis"
                    className="mt-2"
                    value={form.secondaryDiagnosis}
                    onChange={(e) =>
                      updateForm("secondaryDiagnosis", e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Discharge & fitness
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="dateOfDischarge" className="font-medium">
                    Date of Discharge
                  </Label>
                  <Input
                    id="dateOfDischarge"
                    type="date"
                    className="mt-2"
                    value={form.dateOfDischarge}
                    onChange={(e) =>
                      updateForm("dateOfDischarge", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="daysHospitalized" className="font-medium">
                    Days Hospitalized
                  </Label>
                  <Input
                    id="daysHospitalized"
                    type="number"
                    enableStepper={false}
                    className="mt-2"
                    value={form.daysHospitalized}
                    onChange={(e) =>
                      updateForm("daysHospitalized", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fitnessStatus" className="font-medium">
                    Fitness Status
                  </Label>
                  <Input
                    id="fitnessStatus"
                    className="mt-2"
                    value={form.fitnessStatus}
                    onChange={(e) => updateForm("fitnessStatus", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.dischargeSummaryReceived}
                    onCheckedChange={(checked) =>
                      updateForm("dischargeSummaryReceived", Boolean(checked))
                    }
                  />
                  <Label className="font-medium">
                    Discharge summary received
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.isolationRequired}
                    onCheckedChange={(checked) =>
                      updateForm("isolationRequired", Boolean(checked))
                    }
                  />
                  <Label className="font-medium">Isolation required</Label>
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Follow up visits
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setFollowUp((prev) => [...prev, emptyFollowUp])}
                >
                  Add follow up
                </Button>
              </div>
              <div className="space-y-4">
                {followUp.map((visit, index) => (
                  <div
                    key={`followup-${index}`}
                    className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-900"
                  >
                    <div>
                      <Label className="font-medium">Date</Label>
                      <Input
                        type="date"
                        className="mt-2"
                        value={visit.date}
                        onChange={(e) =>
                          handleFollowUpChange(index, "date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="font-medium">Remarks</Label>
                      <Input
                        className="mt-2"
                        value={visit.remarks}
                        onChange={(e) =>
                          handleFollowUpChange(index, "remarks", e.target.value)
                        }
                      />
                    </div>
                    {followUp.length > 1 && (
                      <div className="sm:col-span-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setFollowUp((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Divider />

            <Card className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  Final notes
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="finalRemarks" className="font-medium">
                    Final Remarks
                  </Label>
                  <Input
                    id="finalRemarks"
                    className="mt-2"
                    value={form.finalRemarks}
                    onChange={(e) => updateForm("finalRemarks", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Update hospital record"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/hospital">Cancel</Link>
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
