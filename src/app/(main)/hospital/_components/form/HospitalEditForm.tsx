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
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Hospital } from "@/data/schema"
import { dropdownCategories } from "@/data/schema"
import { api } from "@/lib/api"
import { useDropdownStore } from "@/store/dropdown"

const emptyFollowUp = { date: "", remarks: "" }

type DropdownApiItem = {
  _id: string
  name: string
  category: string
}

type DropdownApiResponse = {
  success: boolean
  count?: number
  data: DropdownApiItem[]
}

const DEFAULT_DROPDOWN_LIMIT = 5

const getDisplayOptions = (options: string[], current?: string) => {
  const trimmed = current?.trim()
  const items = trimmed ? [...options, trimmed] : options
  return Array.from(new Set(items)).filter(Boolean)
}

type HospitalEditFormProps = {
  clinicVisitId?: string
  initialData?: HospitalEditFormInitialData
  hideActions?: boolean
  onSaveSuccess?: () => void
}

export type HospitalEditFormRef = {
  getPayload: () => Record<string, unknown>
  isValid: () => boolean
}

export type HospitalEditFormInitialData = Partial<Hospital> & {
  _id?: string
  id?: string
  clinicVisitId?: string
  sno?: string | number
  followUp?: Array<{ date?: string; remarks?: string }>
  createdBy?: string | { _id?: string; name?: string }
}

const useDropdownSearch = (
  baseUrl: string | undefined,
  category: string,
  query: string,
) => {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery || !baseUrl) {
      setItems([])
      return
    }

    const controller = new AbortController()
    const handle = setTimeout(async () => {
      setLoading(true)
      try {
        const url = new URL(`${baseUrl}/professions`)
        url.searchParams.set("category", category)
        url.searchParams.set("search", trimmedQuery)
        url.searchParams.set("limit", String(DEFAULT_DROPDOWN_LIMIT))

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        })

        if (!response.ok) {
          setItems([])
          return
        }

        const payload = (await response.json()) as DropdownApiResponse
        const names = Array.isArray(payload?.data)
          ? payload.data
            .map((item) => item?.name)
            .filter((name): name is string => Boolean(name))
          : []
        setItems(names)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setItems([])
        }
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(handle)
      controller.abort()
    }
  }, [query, category, baseUrl])

  return { items, loading }
}

type SuggestionInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  category: string
  required?: boolean
  type?: string
  disabled?: boolean
  strict?: boolean
}

const SuggestionInput = ({
  id,
  label,
  value,
  onChange,
  category,
  required,
  type = "text",
  disabled,
  strict = true,
}: SuggestionInputProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
  const [inputValue, setInputValue] = useState(value)
  const { items, loading } = useDropdownSearch(baseUrl, category, inputValue)
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (blurTimeout.current) {
        clearTimeout(blurTimeout.current)
      }
    }
  }, [])

  const closeWithDelay = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current)
    }
    blurTimeout.current = setTimeout(() => {
      setOpen(false)

      if (!strict) {
        if (value !== inputValue) onChange(inputValue)
        return
      }

      if (inputValue && !loading) {
        const exactMatch = items.find(
          (item) => item.toLowerCase() === inputValue.toLowerCase(),
        )
        if (exactMatch) {
          if (exactMatch !== value) {
            onChange(exactMatch)
          }
          setInputValue(exactMatch)
        } else {
          onChange("")
          setInputValue("")
        }
      } else if (!inputValue) {
        onChange("")
      }
    }, 150)
  }

  const handleSelect = (item: string) => {
    setInputValue(item)
    onChange(item)
    setOpen(false)
  }

  const showMenu = open && !disabled && (loading || items.length > 0)

  return (
    <div className="relative">
      <Label htmlFor={id} className="font-medium">
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        type={type}
        className="mt-2"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={closeWithDelay}
        required={required}
        autoComplete="off"
        disabled={disabled}
      />
      {showMenu && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Loading suggestions...
            </div>
          )}
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
              onMouseDown={(event) => {
                event.preventDefault()
                handleSelect(item)
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const HospitalEditForm = forwardRef<HospitalEditFormRef, HospitalEditFormProps>(
  function HospitalEditForm(
    {
      clinicVisitId,
      initialData,
      hideActions = false,
      onSaveSuccess,
    },
    ref,
  ) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)
    const fetchDropdownData = useDropdownStore((state) => state.fetchDropdownData)

    const [natureOfCaseOptions, setNatureOfCaseOptions] = useState<string[]>([])
    const [caseCategoryOptions, setCaseCategoryOptions] = useState<string[]>([])
    const [trLocationOptions, setTrLocationOptions] = useState<string[]>([])
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<string[]>([])
    const [form, setForm] = useState({
      locationId: "",
      clinicVisitToken: "",
      clinicVisitId: clinicVisitId ?? "",
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
      status: "Admit",
      dischargeSummaryReceived: false,
      dateOfDischarge: "",
      daysHospitalized: "",
      fitnessStatus: "",
      isolationRequired: false,
      finalRemarks: "",
      createdBy: "",
    })

    const hospitalRecordId = initialData?._id ?? initialData?.id

    const [followUp, setFollowUp] = useState([emptyFollowUp])
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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
      if (!initialData) return

      const toDateInput = (value?: string | Date) => {
        if (!value) return ""
        if (typeof value === "string") return value.slice(0, 10)
        return value.toISOString().slice(0, 10)
      }

      // Handle createdBy being either a string or an object { _id, name }
      const resolveCreatedBy = (
        value?: string | { _id?: string; name?: string },
      ): string => {
        if (!value) return ""
        if (typeof value === "string") return value
        return value.name ?? value._id ?? ""
      }

      setForm((prev) => ({
        ...prev,
        locationId: initialData.locationId ?? "",
        clinicVisitToken: initialData.clinicVisitToken ?? "",
        clinicVisitId:
          clinicVisitId ?? initialData.clinicVisitId ?? prev.clinicVisitId,
        sno:
          initialData.sno !== undefined && initialData.sno !== null
            ? String(initialData.sno)
            : prev.sno,
        empNo: initialData.empNo ?? "",
        employeeName: initialData.employeeName ?? "",
        emiratesId: initialData.emiratesId ?? "",
        insuranceId: initialData.insuranceId ?? "",
        trLocation: initialData.trLocation ?? "",
        mobileNumber: initialData.mobileNumber ?? "",
        hospitalName: initialData.hospitalName ?? "",
        dateOfAdmission: toDateInput(initialData.dateOfAdmission),
        natureOfCase: initialData.natureOfCase ?? "",
        caseCategory: initialData.caseCategory ?? "",
        primaryDiagnosis: initialData.primaryDiagnosis ?? "",
        status: initialData.status ?? "Admit",
        dischargeSummaryReceived: Boolean(initialData.dischargeSummaryReceived),
        dateOfDischarge: toDateInput(initialData.dateOfDischarge),
        daysHospitalized:
          initialData.daysHospitalized !== undefined &&
            initialData.daysHospitalized !== null
            ? String(initialData.daysHospitalized)
            : "",
        fitnessStatus: initialData.fitnessStatus ?? "",
        isolationRequired: Boolean(initialData.isolationRequired),
        finalRemarks: initialData.finalRemarks ?? "",
        createdBy: resolveCreatedBy(initialData.createdBy),
      }))

      setSecondaryDiagnoses(
        initialData.secondaryDiagnosis?.length
          ? initialData.secondaryDiagnosis
          : [],
      )

      setFollowUp(
        initialData.followUp?.length
          ? initialData.followUp.map((item) => ({
            date: item.date ? String(item.date).slice(0, 10) : "",
            remarks: item.remarks ?? "",
          }))
          : [emptyFollowUp],
      )
    }, [initialData, clinicVisitId])

    useEffect(() => {
      if (form.dateOfAdmission && form.dateOfDischarge) {
        const admission = new Date(form.dateOfAdmission)
        const discharge = new Date(form.dateOfDischarge)
        if (!isNaN(admission.getTime()) && !isNaN(discharge.getTime())) {
          const diffTime = discharge.getTime() - admission.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays >= 0) {
            setForm((prev) => {
              if (prev.daysHospitalized !== String(diffDays)) {
                return { ...prev, daysHospitalized: String(diffDays) }
              }
              return prev
            })
          }
        }
      } else {
        setForm((prev) => {
          if (prev.daysHospitalized !== "") {
            return { ...prev, daysHospitalized: "" }
          }
          return prev
        })
      }
    }, [form.dateOfAdmission, form.dateOfDischarge])

    const canSubmit = useMemo(() => {
      return (
        form.empNo &&
        form.employeeName &&
        form.emiratesId
      )
    }, [form])

    const updateForm = (key: keyof typeof form, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

    useEffect(() => {
      fetchCategories(process.env.NEXT_PUBLIC_DROPDOWN_API_URL)
    }, [fetchCategories])

    useEffect(() => {
      const loadDropdownOptions = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) return

        const [natureOfCase, caseCategory, trLocation] = await Promise.all([
          fetchDropdownData(dropdownCategories.natureOfCase, baseUrl),
          fetchDropdownData(dropdownCategories.caseCategory, baseUrl),
          fetchDropdownData(dropdownCategories.trLocation, baseUrl),
        ])

        setNatureOfCaseOptions(natureOfCase)
        setCaseCategoryOptions(caseCategory)
        setTrLocationOptions(trLocation)
      }

      loadDropdownOptions()
    }, [fetchDropdownData])

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

      const filteredFollowUp = followUp
        .filter((item) => item.date || item.remarks)
        .map((item) => ({
          date: item.date || undefined,
          remarks: item.remarks || undefined,
        }))

      return {
        locationId: form.locationId || undefined,
        clinicVisitToken: form.clinicVisitToken || undefined,
        clinicVisitId: clinicVisitId || form.clinicVisitId || undefined,
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
        secondaryDiagnosis: secondaryDiagnoses.filter(Boolean).length
          ? secondaryDiagnoses.filter(Boolean)
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

    useImperativeHandle(ref, () => ({
      getPayload: () => buildPayload(),
      isValid: () => Boolean(canSubmit),
    }))

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setMessage(null)

      if (!canSubmit) {
        toast.error("Please fill all required fields.")
        return
      }

      if (
        form.dateOfAdmission &&
        form.dateOfDischarge &&
        new Date(form.dateOfDischarge) < new Date(form.dateOfAdmission)
      ) {
        toast.error("Date of Discharge cannot be before Date of Admission.")
        return
      }

      if (!hospitalRecordId) {
        toast.error("Hospital record not found.")
        return
      }

      setSubmitting(true)
      try {
        if (hospitalRecordId) {
          await api.put(`/hospital/${hospitalRecordId}`, buildPayload())

          await queryClient.invalidateQueries({ queryKey: ["hospital"] })

          toast.success("Hospital record updated successfully.")
          if (onSaveSuccess) {
            onSaveSuccess()
          } else {
            setTimeout(() => {
              router.push("/hospital")
            }, 1000)
          }
          return
        }
      } catch {
        toast.error("Failed to update hospital record.")
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
          {!hideActions && (
            <Button asChild variant="secondary">
              <Link href="/hospital">Back to hospital</Link>
            </Button>
          )}
        </div>

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
          {/* ── Admission details ── */}
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
              {/* <div>
                <Label htmlFor="clinicVisitToken" className="font-medium">
                  Clinic Visit Token
                </Label>
                <Input
                  id="clinicVisitToken"
                  className="mt-2"
                  value={form.clinicVisitToken}
                  onChange={(e) =>
                    updateForm("clinicVisitToken", e.target.value)
                  }
                />
              </div> */}
              <div>
                <Label htmlFor="dateOfAdmission" className="font-medium">
                  Date of Admission
                </Label>
                <Input
                  id="dateOfAdmission"
                  type="date"
                  disabled
                  className="mt-2"
                  value={form.dateOfAdmission}
                  onChange={(e) =>
                    updateForm("dateOfAdmission", e.target.value)
                  }
                />
              </div>
              <div>
                <SuggestionInput
                  id="hospitalName"
                  label="Hospital Name"
                  value={form.hospitalName}
                  onChange={(value) => updateForm("hospitalName", value)}
                  category={dropdownCategories.externalProvider}
                  disabled={true}
                />
              </div>
              {/* ✅ FIX: key prop forces re-mount when form.status changes */}
              <div>
                <Label htmlFor="status" className="font-medium">
                  Status
                </Label>
                <Select
                  key={form.status}
                  value={form.status}
                  onValueChange={(value) => updateForm("status", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      <SelectItem value="Admit">Admit</SelectItem>
                      <SelectItem value="Discharge">Discharge</SelectItem>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* ── Employee details ── */}
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
                  disabled
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
                  className="mt-2"
                  value={form.emiratesId}
                  onChange={(e) => updateForm("emiratesId", e.target.value)}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="insuranceId" className="font-medium">
                  Insurance ID
                </Label>
                <Input
                  id="insuranceId"
                  className="mt-2"
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
                  className="mt-2"
                  value={form.mobileNumber}
                  onChange={(e) => updateForm("mobileNumber", e.target.value)}
                />
              </div>
              {/* ✅ FIX: key prop forces re-mount when form.trLocation changes */}
              <div>
                <Label htmlFor="trLocation" className="font-medium">
                  TR Location
                </Label>
                <Select
                  key={form.trLocation}
                  value={form.trLocation}
                  onValueChange={(value) => updateForm("trLocation", value)}
                >
                  <SelectTrigger className="mt-2">
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
            </div>
          </Card>

          {/* ── Case details ── */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Case details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* ✅ FIX: key prop forces re-mount when form.natureOfCase changes */}
              <div>
                <Label htmlFor="natureOfCase" className="font-medium">
                  Nature of Case
                </Label>
                <Select
                  key={form.natureOfCase}
                  value={form.natureOfCase}
                  onValueChange={(value) => updateForm("natureOfCase", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select nature of case" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        natureOfCaseOptions,
                        form.natureOfCase,
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              {/* ✅ FIX: key prop forces re-mount when form.caseCategory changes */}
              <div>
                <Label htmlFor="caseCategory" className="font-medium">
                  Case Category
                </Label>
                <Select
                  key={form.caseCategory}
                  value={form.caseCategory}
                  onValueChange={(value) => updateForm("caseCategory", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select case category" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        caseCategoryOptions,
                        form.caseCategory,
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 lg:col-span-3">
                <SuggestionInput
                  id="primaryDiagnosis"
                  label="Primary Diagnosis"
                  value={form.primaryDiagnosis}
                  onChange={(value) => updateForm("primaryDiagnosis", value)}
                  category={dropdownCategories.primaryDiagnosis}
                />
              </div>
              <Card className="space-y-2 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    Secondary Diagnosis
                  </h2>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setSecondaryDiagnoses((prev) => [...prev, ""])
                    }
                  >
                    Add diagnosis
                  </Button>
                </div>
                <div className="space-y-3">
                  {secondaryDiagnoses.map((diagnosis, index) => (
                    <div
                      key={`secondary-diagnosis-${index}`}
                      className="flex gap-2 items-end"
                    >
                      <div className="flex-1">
                        <SuggestionInput
                          id={`secondaryDiagnosis-${index}`}
                          label={index === 0 ? "Diagnosis" : ""}
                          value={diagnosis}
                          onChange={(value) =>
                            setSecondaryDiagnoses((prev) =>
                              prev.map((item, i) =>
                                i === index ? value : item,
                              ),
                            )
                          }
                          category={dropdownCategories.primaryDiagnosis}
                        />
                      </div>
                      {secondaryDiagnoses.length > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setSecondaryDiagnoses((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="h-10"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Card>

          {/* ── Discharge & fitness ── */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Discharge &amp; fitness
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
                  min={form.dateOfAdmission}
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
                  disabled
                  enableStepper={false}
                  className="mt-2"
                  value={form.daysHospitalized}
                  onChange={(e) =>
                    updateForm("daysHospitalized", e.target.value)
                  }
                />
              </div>
              {/* ✅ FIX: key prop forces re-mount when form.fitnessStatus changes */}
              <div>
                <Label htmlFor="fitnessStatus" className="font-medium">
                  Fitness Status
                </Label>
                <Select
                  key={form.fitnessStatus}
                  value={form.fitnessStatus}
                  onValueChange={(value) => updateForm("fitnessStatus", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select fitness status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fit to Work">Fit to Work</SelectItem>
                    <SelectItem value="Fit with Restriction">
                      Fit with Restriction
                    </SelectItem>
                    <SelectItem value="Not Fit to Work">
                      Not Fit to Work
                    </SelectItem>
                    <SelectItem value="Not Decided">Not Decided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* ✅ FIX: key prop forces re-mount when dischargeSummaryReceived changes */}
              <div>
                <Label
                  htmlFor="dischargeSummaryReceived"
                  className="font-medium"
                >
                  Discharge Summary Received
                </Label>
                <Select
                  key={String(form.dischargeSummaryReceived)}
                  value={form.dischargeSummaryReceived ? "Yes" : "No"}
                  onValueChange={(value) =>
                    updateForm("dischargeSummaryReceived", value === "Yes")
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* ✅ FIX: key prop forces re-mount when isolationRequired changes */}
              <div>
                <Label htmlFor="isolationRequired" className="font-medium">
                  Isolation Required
                </Label>
                <Select
                  key={String(form.isolationRequired)}
                  value={form.isolationRequired ? "Yes" : "No"}
                  onValueChange={(value) =>
                    updateForm("isolationRequired", value === "Yes")
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* ── Follow up visits ── */}
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Follow up visits
              </h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setFollowUp((prev) => [...prev, emptyFollowUp])
                }
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

          {/* ── Final notes ── */}
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

          {!hideActions && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update hospital record"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/hospital">Cancel</Link>
              </Button>
            </div>
          )}
        </form>
      </div>
    )
  },
)

export default HospitalEditForm