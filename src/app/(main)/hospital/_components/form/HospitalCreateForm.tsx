"use client"
/* eslint-disable no-unused-vars */
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

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
import EmployeeSummary from "@/components/forms/EmployeeSummary"
import { useAuthStore } from "@/store/auth"
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

const upperCaseValue = (value?: string) =>
  typeof value === "string" ? value.toUpperCase() : ""


type ClinicEmployeeDetails = {
  empNo: string
  employeeName: string
  emiratesId: string
  insuranceId?: string
  mobileNumber?: string
  trLocation?: string
}

type HospitalCreateFormProps = {
  clinicVisitId?: string
  employee?: ClinicEmployeeDetails | null

  hideActions?: boolean
  onSaveSuccess?: () => void
}

export type HospitalCreateFormRef = {
  getPayload: () => Record<string, unknown>
  isValid: () => boolean
}

export type HospitalCreateFormInitialData = Partial<Hospital> & {
  _id?: string
  id?: string
  clinicVisitId?: string
  sno?: string | number
  followUp?: Array<{ date?: string; remarks?: string }>
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

  const showMenu = open && (loading || items.length > 0)

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

const HospitalCreateForm = forwardRef<HospitalCreateFormRef, HospitalCreateFormProps>(
  function HospitalCreateForm(
    {
      clinicVisitId,
      employee,
      hideActions = false,
      onSaveSuccess,
    },
    ref,
  ) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)
    const fetchDropdownData = useDropdownStore((state) => state.fetchDropdownData)

    const [natureOfCaseOptions, setNatureOfCaseOptions] = useState<string[]>([])
    const [caseCategoryOptions, setCaseCategoryOptions] = useState<string[]>([])
    const [trLocationOptions, setTrLocationOptions] = useState<string[]>([])
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<string[]>([])
    const [hospitalNameOptions, setHospitalNameOptions] = useState<string[]>([])
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




    const [followUp, setFollowUp] = useState([emptyFollowUp])

    // Track employee lookup
    const [employeeLookupError, setEmployeeLookupError] = useState<string | null>(null)
    const [employeeLookupLoading, setEmployeeLookupLoading] = useState(false)
    const lastFetchedEmpNo = useRef<string | null>(null)

      // @ts-ignore
    const [clinicTokenLookupError, setClinicTokenLookupError] = useState<string | null>(null)
          // @ts-ignore

    const [clinicTokenLookupLoading, setClinicTokenLookupLoading] = useState(false)
          // @ts-ignore
    const [clinicTokenLocked, setClinicTokenLocked] = useState(false)
    
    
    const lastFetchedClinicToken = useRef<string | null>(null)
    const [patientId, setPatientId] = useState<string | null>(null)
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
    const [summaryEmpId, setSummaryEmpId] = useState<string | null>(null)
    const lastSummaryEmpNo = useRef<string | null>(null)

    const [originalEmployeeData, setOriginalEmployeeData] = useState<{ empNo: string; employeeName: string; emiratesId: string; insuranceId: string; trLocation: string; mobileNumber: string } | null>(null)

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

          // @ts-ignore

    const handleClinicTokenLookup = useCallback(async () => {
      const token = form.clinicVisitToken?.trim()
      if (!token) return

      if (token.length !== 24) {
        setClinicTokenLookupError("Clinic Visit Token must be 24 characters.")
        return
      }

      if (lastFetchedClinicToken.current === token) return

      const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
      if (!baseUrl) {
        setClinicTokenLookupError("Dropdown API URL is not configured.")
        return
      }

      setClinicTokenLookupError(null)
      setClinicTokenLookupLoading(true)

      try {
        const response = await fetch(`${baseUrl}/clinic/${token}/employee-info`)

        if (!response.ok) {
          throw new Error("Failed to fetch clinic visit employee info.")
        }

        const payload = await response.json()
        const data = payload?.data

        if (!data) {
          throw new Error("No employee data found.")
        }

        setForm((prev) => ({
          ...prev,
          empNo: data.emp || prev.empNo,
          employeeName: data.name || prev.employeeName,
          emiratesId: data.emiratesId || prev.emiratesId,
          insuranceId: data.insuranceId || prev.insuranceId,
          mobileNumber: data.mobileNumber || prev.mobileNumber,
          trLocation: data.trLocation || prev.trLocation,
        }))

        if (data.emp) {
          lastFetchedEmpNo.current = String(data.emp).trim().toUpperCase()
        }

        lastFetchedClinicToken.current = token
        setClinicTokenLocked(true)
      } catch (lookupError) {
        setClinicTokenLookupError("Unable to load employee details from clinic visit.")
      } finally {
        setClinicTokenLookupLoading(false)
      }
    }, [form.clinicVisitToken])

          // @ts-ignore

    const handleClinicTokenRemove = useCallback(() => {
      setClinicTokenLookupError(null)
      setClinicTokenLookupLoading(false)
      setClinicTokenLocked(false)
      lastFetchedClinicToken.current = null
      setForm((prev) => ({
        ...prev,
        clinicVisitToken: "",
        empNo: "",
        employeeName: "",
        emiratesId: "",
        insuranceId: "",
        mobileNumber: "",
        trLocation: "",
      }))
    }, [])

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

        const [natureOfCase, caseCategory, trLocation, hospitalNames] = await Promise.all([
          fetchDropdownData(dropdownCategories.natureOfCase, baseUrl),
          fetchDropdownData(dropdownCategories.caseCategory, baseUrl),
          fetchDropdownData(dropdownCategories.trLocation, baseUrl),
          fetchDropdownData(dropdownCategories.externalProvider, baseUrl),
        ])

        setNatureOfCaseOptions(natureOfCase)
        setCaseCategoryOptions(caseCategory)
        setTrLocationOptions(trLocation)
        setHospitalNameOptions(hospitalNames)
      }

      loadDropdownOptions()
    }, [fetchDropdownData])


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

        if (data._id) {
          setPatientId(data._id)
          setOriginalEmployeeData(employeeData)
        } else {
          setPatientId(null)
          setOriginalEmployeeData(null)
        }

        setForm((prev) => ({
          ...prev,
          employeeName: employeeData.employeeName,
          emiratesId: employeeData.emiratesId,
          insuranceId: employeeData.insuranceId,
          mobileNumber: employeeData.mobileNumber,
        }))
        lastFetchedEmpNo.current = trimmed
      } catch (lookupError) {
        setPatientId(null)
        setOriginalEmployeeData(null)
        setEmployeeLookupError("Unable to load employee details.")
      } finally {
        setEmployeeLookupLoading(false)
      }
    }

    const autoSaveEmployeeDetails = useCallback(async () => {
      if (!patientId && form.empNo.trim() && form.employeeName.trim()) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
          if (!baseUrl) return

          const patientPayload = {
            empId: upperCaseValue(form.empNo),
            PatientName: form.employeeName,
            emiratesId: form.emiratesId,
            insuranceId: form.insuranceId,
            mobileNumber: form.mobileNumber,
            trLocation: form.trLocation,
          }

          const createResponse = await fetch(`${baseUrl}/patients`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patientPayload),
          })

          const createdPatient = await createResponse.json()

          if (!createResponse.ok) return

          const newPatientId = createdPatient.data?._id || createdPatient._id
          if (newPatientId) {
            setPatientId(newPatientId)
            setOriginalEmployeeData({
              empNo: upperCaseValue(form.empNo),
              employeeName: form.employeeName,
              emiratesId: form.emiratesId,
              insuranceId: form.insuranceId,
              trLocation: form.trLocation,
              mobileNumber: form.mobileNumber,
            })
            return
          }
        } catch (error) {
          return
        }
      }

      if (!patientId || !originalEmployeeData) return

      const currentData = {
        empNo: upperCaseValue(form.empNo),
        employeeName: form.employeeName,
        emiratesId: form.emiratesId,
        insuranceId: form.insuranceId,
        trLocation: form.trLocation,
        mobileNumber: form.mobileNumber,
      }

      const hasChanges = Object.keys(currentData).some(
        (key) => currentData[key as keyof typeof currentData] !== originalEmployeeData[key as keyof typeof originalEmployeeData]
      )

      if (!hasChanges) return

      try {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) return

        const payload = {
          PatientName: form.employeeName,
          emiratesId: form.emiratesId,
          insuranceId: form.insuranceId,
          trLocation: form.trLocation,
          mobileNumber: form.mobileNumber,
        }

        const response = await fetch(`${baseUrl}/patients/${patientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) return

        setOriginalEmployeeData({
          empNo: upperCaseValue(form.empNo),
          employeeName: form.employeeName,
          emiratesId: form.emiratesId,
          insuranceId: form.insuranceId,
          trLocation: form.trLocation,
          mobileNumber: form.mobileNumber,
        })
      } catch (error) {
      }
    }, [patientId, originalEmployeeData, form])

    useEffect(() => {
      const handleBeforeUnload = () => {
        if (patientId) {
          autoSaveEmployeeDetails()
        }
      }
      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }, [patientId, autoSaveEmployeeDetails])

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
        empNo: upperCaseValue(form.empNo),
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

      if (form.dateOfAdmission && form.dateOfDischarge && new Date(form.dateOfDischarge) < new Date(form.dateOfAdmission)) {
        toast.error("Date of Discharge cannot be before Date of Admission.")
        return
      }



      setSubmitting(true)
      try {



        let finalPatientId = patientId

        if (!finalPatientId && form.empNo.trim()) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
            if (!baseUrl) {
              throw new Error("Dropdown API URL is not configured.")
            }

            const patientPayload = {
              empNo: upperCaseValue(form.empNo),
              PatientName: form.employeeName,
              emiratesId: form.emiratesId,
              insuranceId: form.insuranceId,
              mobileNumber: form.mobileNumber,
              trLocation: form.trLocation,
            }

            const createResponse = await fetch(`${baseUrl}/patients`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(patientPayload),
            })

            const createdPatient = await createResponse.json()

            if (!createResponse.ok) {
              throw new Error(`Failed to create patient record: ${createdPatient?.message || "Unknown error"}`)
            }

            finalPatientId = createdPatient.data?._id || createdPatient._id

            if (finalPatientId) {
              setPatientId(finalPatientId)
              setOriginalEmployeeData({
                empNo: upperCaseValue(form.empNo),
                employeeName: form.employeeName,
                emiratesId: form.emiratesId,
                insuranceId: form.insuranceId,
                trLocation: form.trLocation,
                mobileNumber: form.mobileNumber,
              })
            }
          } catch (createError) {
            toast.error("Failed to create patient record. Please try again.")
            setSubmitting(false)
            return
          }
        }

        // Auto save employee changes if patient exists
        if (finalPatientId) {
          await autoSaveEmployeeDetails()
        }

        await api.post("/hospital", buildPayload())

        await queryClient.invalidateQueries({ queryKey: ["hospital"] })

        toast.success("Hospital record saved successfully.")
        if (onSaveSuccess) {
          onSaveSuccess()
        } else {
          setTimeout(() => {
            router.push("/hospital")
          }, 1000)
        }
      } catch {
        toast.error("Failed to save hospital record.")
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
              New Hospital Record
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter hospital details and submit.
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
                  Clinic Visit Record ID
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="clinicVisitToken"
                    className="flex-1"
                    disabled={clinicTokenLocked}
                    value={form.clinicVisitToken}
                    onChange={(e) =>
                      updateForm("clinicVisitToken", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={clinicTokenLookupLoading || !form.clinicVisitToken.trim()}
                    onClick={clinicTokenLocked ? handleClinicTokenRemove : handleClinicTokenLookup}
                  >
                    {clinicTokenLocked ? "Remove" : "Save"}
                  </Button>
                </div>
                {clinicTokenLookupLoading && (
                  <p className="mt-1 text-xs text-blue-600">
                    Looking up clinic visit...
                  </p>
                )}
                {clinicTokenLookupError && (
                  <p className="mt-1 text-xs text-red-600">
                    {clinicTokenLookupError}
                  </p>
                )}
              </div> */}
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
                <Select
                  value={form.hospitalName}
                  onValueChange={(value) => updateForm("hospitalName", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select hospital name" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        hospitalNameOptions,
                        form.hospitalName,
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
                <Label htmlFor="status" className="font-medium">
                  Status
                </Label>
                <Select
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
                <div className="mt-2 flex gap-2">
                  <Input
                    id="empNo"
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
                  disabled
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
              <div>
                <Label htmlFor="trLocation" className="font-medium">
                  TR Location
                </Label>
                <Select
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
                <Select
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
              <div>
                <Label htmlFor="caseCategory" className="font-medium">
                  Case Category
                </Label>
                <Select
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
                    onClick={() => setSecondaryDiagnoses((prev) => [...prev, ""])}
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
              <div>
                <Label htmlFor="fitnessStatus" className="font-medium">
                  Fitness Status
                </Label>
                <Select
                  value={form.fitnessStatus}
                  onValueChange={(value) => updateForm("fitnessStatus", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select fitness status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fit to Work">Fit to Work</SelectItem>
                    <SelectItem value="Fit with Restriction">Fit with Restriction</SelectItem>
                    <SelectItem value="Not Fit to Work">Not Fit to Work</SelectItem>
                    <SelectItem value="Not Decided">Not Decided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dischargeSummaryReceived" className="font-medium">
                  Discharge Summary Received
                </Label>
                <Select
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
              <div>
                <Label htmlFor="isolationRequired" className="font-medium">
                  Isolation Required
                </Label>
                <Select
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

          {!hideActions && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save hospital record"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/hospital">Cancel</Link>
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

export default HospitalCreateForm
