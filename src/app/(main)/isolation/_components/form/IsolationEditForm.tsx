"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
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
import type { Isolation } from "@/data/schema"
import { dropdownCategories } from "@/data/schema"
import { api } from "@/lib/api"
import { useDropdownStore } from "@/store/dropdown"

type ClinicEmployeeDetails = {
  empNo: string
  employeeName: string
  emiratesId: string
  insuranceId?: string
  mobileNumber?: string
  trLocation?: string
}

type IsolationEditFormProps = {
  clinicVisitId?: string
  employee?: ClinicEmployeeDetails | null
  initialData?: IsolationFormInitialData
  hideActions?: boolean
  onSaveSuccess?: () => void
}

export type IsolationEditFormRef = {
  getPayload: () => Record<string, unknown>
  isValid: () => boolean
}

export type IsolationFormInitialData = Partial<Isolation> & {
  _id?: string
  id?: string
  clinicVisitId?: string
}

const getDisplayOptions = (options: string[], current?: string) => {
  const trimmed = current?.trim()
  const items = trimmed ? [...options, trimmed] : options
  return Array.from(new Set(items)).filter(Boolean)
}

const IsolationEditForm = forwardRef<IsolationEditFormRef, IsolationEditFormProps>(
  function IsolationEditForm(
    {
      clinicVisitId,
      employee,
      initialData,
      hideActions = false,
      onSaveSuccess,
    },
    ref,
  ) {
    const router = useRouter()
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)
    const fetchDropdownData = useDropdownStore((state) => state.fetchDropdownData)

    const [trLocationOptions, setTrLocationOptions] = useState<string[]>([])
    const [form, setForm] = useState({
      locationId: "",
      clinicVisitToken: "",
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

    const isolationRecordId = initialData?._id ?? initialData?.id
    const [submitting, setSubmitting] = useState(false)



    useEffect(() => {
      if (clinicVisitId) {
        setForm((prev) => ({ ...prev, clinicVisitId }))
      }
    }, [clinicVisitId])

    useEffect(() => {
      if (!initialData) return

      const toDateInput = (value?: string | Date) => {
        if (!value) return ""
        if (typeof value === "string") return value.slice(0, 10)
        return value.toISOString().slice(0, 10)
      }

      setForm((prev) => ({
        ...prev,
        locationId: initialData.locationId ?? "",
        clinicVisitToken: initialData.clinicVisitToken ?? "",
        clinicVisitId:
          clinicVisitId ?? initialData.clinicVisitId ?? prev.clinicVisitId,
        empNo: initialData.empNo ?? "",
        type: initialData.type ?? "",
        employeeName: initialData.employeeName ?? "",
        emiratesId: initialData.emiratesId ?? "",
        insuranceId: initialData.insuranceId ?? "",
        mobileNumber: initialData.mobileNumber ?? "",
        trLocation: initialData.trLocation ?? "",
        isolatedIn: initialData.isolatedIn ?? "",
        isolationReason: initialData.isolationReason ?? "",
        nationality: initialData.nationality ?? "",
        slUpto: initialData.slUpto ?? "",
        dateFrom: toDateInput(initialData.dateFrom),
        dateTo: toDateInput(initialData.dateTo),
        currentStatus: initialData.currentStatus ?? "",
        remarks: initialData.remarks ?? "",
      }))
    }, [initialData, clinicVisitId])

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
        form.empNo &&
        form.employeeName &&
        form.emiratesId
      )
    }, [form])

    const updateForm = (key: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
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
        clinicVisitToken: form.clinicVisitToken || undefined,
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

      if (!canSubmit) {
        toast.error("Please fill all required fields.")
        return
      }

      if (!isolationRecordId) {
        toast.error("Isolation record not found.")
        return
      }

      setSubmitting(true)
      try {
        await api.put(`/isolation/${isolationRecordId}`, buildPayload())
        toast.success("Isolation record updated successfully.")
        if (onSaveSuccess) {
          onSaveSuccess()
        } else {
          router.push("/isolation")
        }
      } catch {
        toast.error("Failed to update isolation record.")
        setSubmitting(false)
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
              Isolation Record
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and update isolation details.
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
                <Label htmlFor="clinicVisitToken" className="font-medium">
                  Clinic Visit Token
                </Label>
                <Input
                  id="clinicVisitToken"
                  name="clinicVisitToken"
                  type="text"
                  value={form.clinicVisitToken}
                  onChange={(e) => updateForm("clinicVisitToken", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="empNo" className="font-medium">
                  Employee No *
                </Label>
                <Input
                  id="empNo"
                  name="empNo"
                  disabled
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
                  disabled
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
                  disabled
                  type="text"
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
                  disabled
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
                  disabled
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
                  disabled
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
                  value={form.type || undefined}
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
                  value={form.isolatedIn || undefined}
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
                  type="text"
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
                {submitting ? "Updating..." : "Update Isolation Record"}
              </Button>
            </div>
          )}
        </form>
      </div>
    )
  }
)

export default IsolationEditForm
