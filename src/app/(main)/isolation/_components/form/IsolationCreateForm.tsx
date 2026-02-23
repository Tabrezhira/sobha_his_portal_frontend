"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dropdownCategories } from "@/data/schema"
import { api } from "@/lib/api"
import EmployeeSummary from "@/components/forms/EmployeeSummary"
import { useAuthStore } from "@/store/auth"
import { useDropdownStore } from "@/store/dropdown"

type ClinicEmployeeDetails = {
  empNo: string
  employeeName: string
  emiratesId: string
  insuranceId?: string
  mobileNumber?: string
  trLocation?: string
}

type IsolationCreateFormProps = {
  clinicVisitId?: string
  employee?: ClinicEmployeeDetails | null
  hideActions?: boolean
  onSaveSuccess?: () => void
}

export type IsolationCreateFormRef = {
  getPayload: () => Record<string, unknown>
  isValid: () => boolean
}

const getDisplayOptions = (options: string[], current?: string) => {
  const trimmed = current?.trim()
  const items = trimmed ? [...options, trimmed] : options
  return Array.from(new Set(items)).filter(Boolean)
}

const IsolationCreateForm = forwardRef<IsolationCreateFormRef, IsolationCreateFormProps>(
  function IsolationCreateForm(
    {
      clinicVisitId,
      employee,
      hideActions = false,
      onSaveSuccess,
    },
    ref,
  ) {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)
    const fetchDropdownData = useDropdownStore((state) => state.fetchDropdownData)

    const [trLocationOptions, setTrLocationOptions] = useState<string[]>([])

    // Track employee lookup
    const [employeeLookupError, setEmployeeLookupError] = useState<string | null>(null)
    const [employeeLookupLoading, setEmployeeLookupLoading] = useState(false)
    const lastFetchedEmpNo = useRef<string | null>(null)
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
    const [summaryEmpId, setSummaryEmpId] = useState<string | null>(null)
    const lastSummaryEmpNo = useRef<string | null>(null)
    const [form, setForm] = useState({
      locationId: "",
      clinicVisitId: clinicVisitId ?? "",
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
    })

    const [submitting, setSubmitting] = useState(false)

    const trLocationDisplayOptions = useMemo(() => {
      const current = form.trLocation?.trim()
      const items = current ? [...trLocationOptions, current] : trLocationOptions
      return Array.from(new Set(items)).filter(Boolean)
    }, [trLocationOptions, form.trLocation])

    useEffect(() => {
      if (clinicVisitId) {
        setForm((prev) => ({ ...prev, clinicVisitId }))
      }
    }, [clinicVisitId])

    useEffect(() => {
      if (!employee) return
      setForm((prev) => ({
        ...prev,
        empNo: employee.empNo || prev.empNo,
        employeeName: employee.employeeName || prev.employeeName,
        emiratesId: employee.emiratesId || prev.emiratesId,
        insuranceId: employee.insuranceId || prev.insuranceId,
        mobileNumber: employee.mobileNumber || prev.mobileNumber,
        trLocation: employee.trLocation || prev.trLocation,
      }))
    }, [employee])

    const canSubmit = useMemo(() => {
      return (
        (clinicVisitId || form.clinicVisitId) &&
        form.empNo &&
        form.employeeName &&
        form.emiratesId
      )
    }, [clinicVisitId, form])

    const updateForm = (key: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

    const openSummaryForEmpNo = (empNo: string) => {
      const trimmed = empNo.trim()
      if (!trimmed) return
      if (lastSummaryEmpNo.current === trimmed && summaryDialogOpen) return
      lastSummaryEmpNo.current = trimmed
      setSummaryEmpId(trimmed)
      setSummaryDialogOpen(true)
    }

    const handleEmployeeLookup = async (empNo: string) => {
      const trimmed = empNo.trim().toUpperCase()
      if (!trimmed) return

      if (lastFetchedEmpNo.current === trimmed) return

      setEmployeeLookupError(null)
      setEmployeeLookupLoading(true)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) {
          setEmployeeLookupError("Dropdown API URL is not configured.")
          return
        }

        const response = await fetch(`${baseUrl}/patients/emp/${trimmed}`)
        if (!response.ok) {
          throw new Error("Failed to fetch employee details.")
        }
        const data = await response.json()

        const employeeData = {
          empNo: trimmed,
          employeeName: data.PatientName ?? "",
          emiratesId: data.emiratesId ?? "",
          insuranceId: data.insuranceId ?? "",
          trLocation: user?.locationId ?? "",
          mobileNumber: data.mobileNumber ?? "",
        }

        setForm((prev) => ({
          ...prev,
          employeeName: employeeData.employeeName,
          emiratesId: employeeData.emiratesId,
          insuranceId: employeeData.insuranceId,
          mobileNumber: employeeData.mobileNumber,
          trLocation: employeeData.trLocation || prev.trLocation,
        }))
        lastFetchedEmpNo.current = trimmed
      } catch (lookupError) {
        setEmployeeLookupError("Unable to load employee details.")
      } finally {
        setEmployeeLookupLoading(false)
      }
    }

    useEffect(() => {
      fetchCategories(process.env.NEXT_PUBLIC_DROPDOWN_API_URL)
    }, [fetchCategories])

    useEffect(() => {
      const loadDropdownOptions = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) return

        const trLocation = await fetchDropdownData(
          dropdownCategories.trLocation,
          baseUrl
        )

        setTrLocationOptions(trLocation)
      }

      loadDropdownOptions()
    }, [fetchDropdownData])

    const buildPayload = () => {
      return {
        locationId: form.locationId || undefined,
        clinicVisitId: clinicVisitId || form.clinicVisitId || undefined,
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
      }
    }

    useImperativeHandle(ref, () => ({
      getPayload: () => buildPayload(),
      isValid: () => Boolean(canSubmit),
    }))

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!clinicVisitId && !form.clinicVisitId) {
        toast.error("Clinic visit is required. Please save clinic visit first.")
        return
      }

      if (!canSubmit) {
        toast.error("Please fill all required fields.")
        return
      }

      setSubmitting(true)
      try {
        const response = await api.post("/isolation", buildPayload())
        toast.success("Isolation record saved successfully.")

        // Redirect to the detail page if we get an ID back
        if (onSaveSuccess) {
          onSaveSuccess()
        } else if (response.data?._id) {
          router.push(`/isolation/${response.data._id}`)
        } else {
          router.push("/isolation")
        }
      } catch {
        toast.error("Failed to save isolation record.")
        setSubmitting(false)
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
              New Isolation Record
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter isolation details and submit.
            </p>
          </div>
          {!hideActions && (
            <Button asChild variant="secondary">
              <Link href="/isolation">Back to isolation</Link>
            </Button>
          )}
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
                <Label htmlFor="empNo" className="font-medium">
                  Employee No *
                </Label>
                <div className="mt-0 flex gap-2">
                  <Input
                    id="empNo"
                    name="empNo"
                    type="text"
                    value={form.empNo}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase()
                      updateForm("empNo", val)
                      if (val.length === 6) {
                        handleEmployeeLookup(val)
                      }
                    }}
                    required
                  />
                  {form.empNo && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openSummaryForEmpNo(form.empNo)}
                    >
                      Summary
                    </Button>
                  )}
                </div>
                {employeeLookupLoading && (
                  <p className="mt-1 text-xs text-blue-600">
                    Looking up employee...
                  </p>
                )}
                {employeeLookupError && (
                  <p className="mt-1 text-xs text-red-600">
                    {employeeLookupError}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="employeeName" className="font-medium">
                  Employee Name *
                </Label>
                <Input
                  id="employeeName"
                  name="employeeName"
                  type="text"
                  disabled
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
                  disabled
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
                  name="insuranceId"
                  type="text"
                  disabled
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
                <Select
                  value={form.trLocation}
                  disabled
                  onValueChange={(value) => updateForm("trLocation", value)}
                >
                  <SelectTrigger >
                    <SelectValue placeholder="Select TR location" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {trLocationDisplayOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
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
              <div>
                <Label htmlFor="type" className="font-medium">
                  Types
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => updateForm("type", value)}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      <SelectItem value="ISOLATION">ISOLATION</SelectItem>
                      <SelectItem value="REHABILITATION">REHABILITATION</SelectItem>
                    </ScrollArea>
                  </SelectContent>
                </Select>
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
                <Select
                  value={form.isolatedIn}
                  onValueChange={(value) => updateForm("isolatedIn", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        trLocationOptions,
                        form.isolatedIn,
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFrom" className="font-medium">
                  Date From
                </Label>
                <Input
                  id="dateFrom"
                  name="dateFrom"
                  type="date"
                  className="mt-2"
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
                  className="mt-2"
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

          {!hideActions && (
            <div className="flex justify-end gap-2">
              <Button asChild variant="secondary">
                <Link href="/isolation">Cancel</Link>
              </Button>
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Saving..." : "Save Isolation Record"}
              </Button>
            </div>
          )}
        </form>

        <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Summary</DialogTitle>
              <DialogDescription>
                Complete clinical history for employee {summaryEmpId}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {summaryEmpId ? (
                <EmployeeSummary empId={summaryEmpId} />
              ) : (
                <p className="text-sm text-gray-500">No employee number provided</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setSummaryDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

export default IsolationCreateForm
