"use client"

import Link from "next/link"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
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
import type { ClinicVisit } from "@/data/schema"
import { dropdownCategories } from "@/data/schema"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { useDropdownStore } from "@/store/dropdown"
import EmployeeSummary from "@/components/forms/EmployeeSummary"

const emptyMedicine = { name: "", course: "", expiryDate: "" }
const emptyFollowUp = { visitDate: "", visitRemarks: "" }
const emptyReferral = {
  referralCode: "",
  referralType: "",
  referredToHospital: "",
  visitDateReferral: "",
  specialistType: "",
  doctorNameReferral: "",
  investigationReports: "",
  primaryDiagnosisReferral: "",
  secondaryDiagnosisReferral: [] as string[],
  nurseRemarksReferral: "",
  insuranceApprovalRequested: false,
  followUpRequired: false,
  followUpVisits: [emptyFollowUp],
}

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

const normalizeSelectValue = (value?: string) =>
  typeof value === "string" ? value.trim() : ""

const upperCaseValue = (value?: string) =>
  typeof value === "string" ? value.toUpperCase() : ""

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
  }, [baseUrl, category, query])

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
}

const SuggestionInput = ({
  id,
  label,
  value,
  onChange,
  category,
  required,
  type = "text",
}: SuggestionInputProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
  const { items, loading } = useDropdownSearch(baseUrl, category, value)
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    blurTimeout.current = setTimeout(() => setOpen(false), 150)
  }

  const handleSelect = (item: string) => {
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

interface ClinicCreateFormProps {
  onIpAdmissionChange?: (value: boolean) => void
  onCaseCategoryChange?: (value: string) => void
  onClinicSaved?: (payload: {
    id: string
    employee: {
      empNo: string
      employeeName: string
      emiratesId: string
      insuranceId?: string
      mobileNumber?: string
      trLocation?: string
    }
  }) => void
  onReset?: () => void
  onSaveSuccess?: () => void
  conditionMet?: boolean
  clinicSaved?: boolean
  mode?: "create" | "edit"
  initialData?: ClinicCreateFormInitialData
  hideActions?: boolean
}

export type ClinicCreateFormRef = {
  getPayload: () => Record<string, unknown>
  isValid: () => boolean
}

export type ClinicCreateFormInitialData = Partial<ClinicVisit> & {
  _id?: string
  id?: string
  slNo?: string | number
}

const ClinicCreateForm = forwardRef<ClinicCreateFormRef, ClinicCreateFormProps>(
  function ClinicCreateForm(
    {
      onIpAdmissionChange,
      onCaseCategoryChange,
      onClinicSaved,
      onReset,
      onSaveSuccess,
      conditionMet,
      clinicSaved,
      mode = "create",
      initialData,
      hideActions = false,
    },
    ref,
  ) {
    const user = useAuthStore((state) => state.user)
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)
    const fetchDropdownData = useDropdownStore((state) => state.fetchDropdownData)

    const [natureOfCaseOptions, setNatureOfCaseOptions] = useState<string[]>([])
    const [caseCategoryOptions, setCaseCategoryOptions] = useState<string[]>([])
    const [sentToOptions, setSentToOptions] = useState<string[]>([])
    const [symptomDurationOptions, setSymptomDurationOptions] = useState<string[]>([])
    const [providerNameOptions, setProviderNameOptions] = useState<string[]>([])
    const [trLocationOptions, setTrLocationOptions] = useState<string[]>([])
    const [referralTypeOptions, setReferralTypeOptions] = useState<string[]>([])
    const [referredToOptions, setReferredToOptions] = useState<string[]>([])
    const [specialistTypeOptions, setSpecialistTypeOptions] = useState<string[]>([])
    const [medicineCourseOptions, setMedicineCourseOptions] = useState<string[]>([])

    // Track employee patient ID and original data for auto-save
    const [patientId, setPatientId] = useState<string | null>(null)
    const [originalEmployeeData, setOriginalEmployeeData] = useState<{ empNo: string; employeeName: string; emiratesId: string; insuranceId: string; trLocation: string; mobileNumber: string } | null>(null)

    const getLocalDate = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    // const getLocalTime = () => {
    //   const now = new Date()
    //   const hours = String(now.getHours()).padStart(2, "0")
    //   const minutes = String(now.getMinutes()).padStart(2, "0")
    //   return `${hours}:${minutes}`
    // }

    function getLocalTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');   // 0–23
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`; // HH:mm 24-hour format
    }


    const generateSlNo = () => String(Date.now())

    const [form, setForm] = useState({
      locationId: "",
      slNo: generateSlNo(),
      date: getLocalDate(),
      time: getLocalTime(),
      empNo: "",
      employeeName: "",
      emiratesId: "",
      insuranceId: "",
      dateOfJoining: "",
      eligibilityForSickLeave: false,
      trLocation: "",
      mobileNumber: "",
      natureOfCase: "",
      caseCategory: "",
      symptomDuration: "",
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      others: "",
      tokenNo: "",
      sentTo: "",
      providerName: "",
      doctorName: "",
      primaryDiagnosis: "",
      sickLeaveStatus: "",
      sickLeaveStartDate: "",
      sickLeaveEndDate: "",
      totalSickLeaveDays: "",
      remarks: "",
      visitStatus: "Open",
      referral: false,
      finalRemarks: "",
      ipAdmissionRequired: false,
      createdBy: "",
    })

    const isEditMode = mode === "edit"
    const clinicRecordId = initialData?._id ?? initialData?.id

    useEffect(() => {
      setForm((prev) => ({
        ...prev,
        slNo: prev.slNo || generateSlNo(),
        date: prev.date || getLocalDate(),
        time: prev.time || getLocalTime(),
        locationId: prev.locationId || (user?.locationId ?? ""),
        trLocation: prev.trLocation || (user?.locationId ?? ""),
      }))
    }, [user?.locationId])

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
        slNo:
          initialData.slNo !== undefined && initialData.slNo !== null
            ? String(initialData.slNo)
            : prev.slNo,
        date: toDateInput(initialData.date) || prev.date,
        time: initialData.time ?? prev.time,
        empNo: upperCaseValue(initialData.empNo),
        employeeName: initialData.employeeName ?? "",
        emiratesId: initialData.emiratesId ?? "",
        insuranceId: initialData.insuranceId ?? "",
        dateOfJoining: toDateInput(initialData.dateOfJoining),
        eligibilityForSickLeave: Boolean(initialData.eligibilityForSickLeave),
        trLocation: normalizeSelectValue(initialData.trLocation),
        mobileNumber: initialData.mobileNumber ?? "",
        natureOfCase: normalizeSelectValue(initialData.natureOfCase),
        caseCategory: normalizeSelectValue(initialData.caseCategory),
        symptomDuration: normalizeSelectValue(initialData.symptomDuration),
        temperature:
          initialData.temperature !== undefined && initialData.temperature !== null
            ? String(initialData.temperature)
            : "",
        bloodPressure: initialData.bloodPressure ?? "",
        heartRate:
          initialData.heartRate !== undefined && initialData.heartRate !== null
            ? String(initialData.heartRate)
            : "",
        others: initialData.others ?? "",
        tokenNo: initialData.tokenNo ?? "",
        sentTo: normalizeSelectValue(initialData.sentTo),
        providerName: normalizeSelectValue(initialData.providerName),
        doctorName: initialData.doctorName ?? "",
        primaryDiagnosis: initialData.primaryDiagnosis ?? "",
        sickLeaveStatus: normalizeSelectValue(initialData.sickLeaveStatus),
        sickLeaveStartDate: toDateInput(initialData.sickLeaveStartDate),
        sickLeaveEndDate: toDateInput(initialData.sickLeaveEndDate),
        totalSickLeaveDays:
          initialData.totalSickLeaveDays !== undefined &&
            initialData.totalSickLeaveDays !== null
            ? String(initialData.totalSickLeaveDays)
            : "",
        remarks: initialData.remarks ?? "",
        visitStatus: normalizeSelectValue(initialData.visitStatus) || "Open",
        referral: Boolean(initialData.referral),
        finalRemarks: initialData.finalRemarks ?? "",
        ipAdmissionRequired: Boolean(initialData.ipAdmissionRequired),
        createdBy: initialData.createdBy ?? "",
      }))

      setNurseAssessments(
        initialData.nurseAssessment?.length ? initialData.nurseAssessment : [],
      )
      setSecondaryDiagnoses(
        initialData.secondaryDiagnosis?.length
          ? initialData.secondaryDiagnosis
          : [],
      )

      setMedicines(
        initialData.medicines?.length
          ? initialData.medicines.map((item) => ({
            name: item.name ?? "",
            course: normalizeSelectValue(item.course),
            expiryDate: item.expiryDate
              ? String(item.expiryDate).slice(0, 10)
              : "",
          }))
          : [emptyMedicine],
      )

      setReferralDetails({
        referralCode: initialData.referralCode ?? "",
        referralType: normalizeSelectValue(initialData.referralType),
        referredToHospital: normalizeSelectValue(initialData.referredToHospital),
        visitDateReferral: toDateInput(initialData.visitDateReferral),
        specialistType: normalizeSelectValue(initialData.specialistType),
        doctorNameReferral: initialData.doctorNameReferral ?? "",
        investigationReports: initialData.investigationReports ?? "",
        primaryDiagnosisReferral: initialData.primaryDiagnosisReferral ?? "",
        secondaryDiagnosisReferral: initialData.secondaryDiagnosisReferral?.length
          ? initialData.secondaryDiagnosisReferral
          : [],
        nurseRemarksReferral: initialData.nurseRemarksReferral ?? "",
        insuranceApprovalRequested: Boolean(initialData.insuranceApprovalRequested),
        followUpRequired: Boolean(initialData.followUpRequired),
        followUpVisits: initialData.followUpVisits?.length
          ? initialData.followUpVisits.map((visit) => ({
            visitDate: visit.visitDate ? String(visit.visitDate).slice(0, 10) : "",
            visitRemarks: visit.visitRemarks ?? "",
          }))
          : [emptyFollowUp],
      })

      if (onIpAdmissionChange) {
        onIpAdmissionChange(Boolean(initialData.ipAdmissionRequired))
      }
      if (onCaseCategoryChange) {
        onCaseCategoryChange(initialData.caseCategory ?? "")
      }
    }, [initialData, onIpAdmissionChange, onCaseCategoryChange])

    useEffect(() => {
      fetchCategories(process.env.NEXT_PUBLIC_DROPDOWN_API_URL)
    }, [fetchCategories])

    useEffect(() => {
      const start = form.sickLeaveStartDate
      const end = form.sickLeaveEndDate

      if (!start || !end) {
        setForm((prev) =>
          prev.totalSickLeaveDays
            ? { ...prev, totalSickLeaveDays: "" }
            : prev,
        )
        return
      }

      const startDate = new Date(start)
      const endDate = new Date(end)

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate < startDate
      ) {
        setForm((prev) =>
          prev.totalSickLeaveDays
            ? { ...prev, totalSickLeaveDays: "" }
            : prev,
        )
        return
      }

      const msPerDay = 1000 * 60 * 60 * 24
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1
      const value = String(days)

      setForm((prev) =>
        prev.totalSickLeaveDays === value ? prev : { ...prev, totalSickLeaveDays: value },
      )
    }, [form.sickLeaveStartDate, form.sickLeaveEndDate])

    useEffect(() => {
      const loadDropdownOptions = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) return

        const [
          natureOfCase,
          caseCategory,
          sentTo,
          symptomDuration,
          medicineCourse,
          trLocation,
        ] = await Promise.all([
          fetchDropdownData(dropdownCategories.natureOfCase, baseUrl),
          fetchDropdownData(dropdownCategories.caseCategory, baseUrl),
          fetchDropdownData(dropdownCategories.sentTo, baseUrl),
          fetchDropdownData(dropdownCategories.symptomDuration, baseUrl),
          fetchDropdownData(dropdownCategories.medicineCourse, baseUrl),
          fetchDropdownData(dropdownCategories.trLocation, baseUrl),
        ])

        setNatureOfCaseOptions(natureOfCase)
        setCaseCategoryOptions(caseCategory)
        setSentToOptions(sentTo)
        setSymptomDurationOptions(symptomDuration)
        setMedicineCourseOptions(medicineCourse)
        setTrLocationOptions(trLocation)
      }

      loadDropdownOptions()
    }, [fetchDropdownData])

    useEffect(() => {
      const loadReferralOptions = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl) return

        const [referralType, referredTo, specialistType] = await Promise.all([
          fetchDropdownData(dropdownCategories.referralType, baseUrl),
          fetchDropdownData(dropdownCategories.externalProvider, baseUrl),
          fetchDropdownData(dropdownCategories.specialistType, baseUrl),
        ])

        setReferralTypeOptions(referralType)
        setReferredToOptions(referredTo)
        setSpecialistTypeOptions(specialistType)
      }

      loadReferralOptions()
    }, [fetchDropdownData])

    useEffect(() => {
      const loadProviderOptions = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
        if (!baseUrl || !form.sentTo) {
          setProviderNameOptions([])
          return
        }

        let category = ""
        if (form.sentTo === "TR HOME CARE") {
          category = dropdownCategories.trHomeCare
        } else if (form.sentTo === "TR TELE-HEALTH") {
          category = dropdownCategories.trTeleHealth
        } else if (form.sentTo === "EXTERNAL PROVIDER") {
          category = dropdownCategories.externalProvider
        }

        if (category) {
          const options = await fetchDropdownData(category, baseUrl)
          setProviderNameOptions(options)
        } else {
          setProviderNameOptions([])
        }
      }

      loadProviderOptions()
    }, [form.sentTo, fetchDropdownData])

    const [medicines, setMedicines] = useState([emptyMedicine])
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<string[]>([])
    const [nurseAssessments, setNurseAssessments] = useState<string[]>([])
    const [referralDetails, setReferralDetails] = useState(emptyReferral)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false)
    const [createdTokenNo, setCreatedTokenNo] = useState<string | null>(null)
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
    const [summaryEmpId, setSummaryEmpId] = useState<string | null>(null)
    const [employeeLookupError, setEmployeeLookupError] = useState<string | null>(
      null,
    )
    const [employeeLookupLoading, setEmployeeLookupLoading] = useState(false)
    const lastFetchedEmpNo = useRef<string | null>(null)
    const lastSummaryEmpNo = useRef<string | null>(null)

    const canSubmit = useMemo(() => {
      return Boolean(
        form.slNo &&
        form.date &&
        form.time &&
        form.empNo &&
        form.employeeName &&
        form.emiratesId &&
        form.trLocation &&
        form.mobileNumber &&
        form.natureOfCase &&
        form.caseCategory
      )
    }, [form])

    const isEndBeforeStart = useMemo(() => {
      if (!form.sickLeaveStartDate || !form.sickLeaveEndDate) return false
      const start = new Date(form.sickLeaveStartDate)
      const end = new Date(form.sickLeaveEndDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
      return end < start
    }, [form.sickLeaveStartDate, form.sickLeaveEndDate])

    const joinDateDisplay = useMemo(() => {
      if (!form.dateOfJoining) return "Not set"
      const parsed = new Date(form.dateOfJoining)
      return Number.isNaN(parsed.getTime())
        ? String(form.dateOfJoining)
        : parsed.toLocaleDateString()
    }, [form.dateOfJoining])

    const sickLeaveStatusLabel = form.eligibilityForSickLeave
      ? "Eligible"
      : "Not eligible"

    const sickLeaveStatusColor = form.eligibilityForSickLeave
      ? "text-emerald-600"
      : "text-red-600"

    const copyToClipboard = useCallback(async (value: string, label: string) => {
      const trimmed = value?.toString().trim()
      if (!trimmed) {
        toast.error(`${label} is empty.`)
        return
      }
      try {
        await navigator.clipboard.writeText(trimmed)
        toast.success(`${label} copied.`)
      } catch (err) {
        toast.error(`Unable to copy ${label}.`)
      }
    }, [])

    const updateForm = (key: keyof typeof form, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [key]: value }))

      // Notify parent of changes
      if (key === "ipAdmissionRequired" && onIpAdmissionChange) {
        onIpAdmissionChange(value as boolean)
      }
      if (key === "caseCategory" && onCaseCategoryChange) {
        onCaseCategoryChange(value as string)
      }
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
          trLocation: data.trLocation ?? "",
          mobileNumber: data.mobileNumber ?? "",
        }

        // Store patient ID for auto-save and original data for change detection
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
        // If lookup fails, clear patient ID to trigger creation on submit
        setPatientId(null)
        setOriginalEmployeeData(null)
        setEmployeeLookupError("Unable to load employee details.")
      } finally {
        setEmployeeLookupLoading(false)
      }
    }

    // Check if employee details have changed and auto-save if needed, or create patient if not exists
    const autoSaveEmployeeDetails = useCallback(async () => {
      // If patient ID doesn't exist, try to create it first
      if (!patientId && form.empNo.trim() && form.employeeName.trim()) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL
          if (!baseUrl) {
            console.error("Dropdown API URL is not configured.")
            return
          }

          const patientPayload = {
            empId: upperCaseValue(form.empNo),
            PatientName: form.employeeName,
            emiratesId: form.emiratesId,
            insuranceId: form.insuranceId,
            mobileNumber: form.mobileNumber,
            trLocation: form.trLocation,
          }

          console.log("Auto-creating patient with payload:", patientPayload)

          const createResponse = await fetch(`${baseUrl}/patients`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patientPayload),
          })

          console.log("Patient creation response status:", createResponse.status)

          const createdPatient = await createResponse.json()
          console.log("Patient creation response data:", createdPatient)

          if (!createResponse.ok) {
            console.error(`Failed to create patient: ${createdPatient?.message || "Unknown error"}`)
            return
          }

          const newPatientId = createdPatient.data?._id || createdPatient._id
          if (newPatientId) {
            console.log("Patient auto-created with ID:", newPatientId)
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
          console.error("Error auto-creating patient:", error)
          return
        }
      }

      // If patient exists, check for changes and auto-save
      if (!patientId || !originalEmployeeData) return

      // Check if any employee field has changed
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
        if (!baseUrl) {
          console.error("Dropdown API URL is not configured.")
          return
        }

        const payload = {
          PatientName: form.employeeName,
          emiratesId: form.emiratesId,
          insuranceId: form.insuranceId,
          trLocation: form.trLocation,
          mobileNumber: form.mobileNumber,
        }

        console.log("Auto-saving patient changes with payload:", payload)

        const response = await fetch(`${baseUrl}/patients/${patientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.error("Failed to save patient details.")
          return
        }

        console.log("Patient details auto-saved successfully")

        // Update the original data to reflect what's now saved
        setOriginalEmployeeData({
          empNo: upperCaseValue(form.empNo),
          employeeName: form.employeeName,
          emiratesId: form.emiratesId,
          insuranceId: form.insuranceId,
          trLocation: form.trLocation,
          mobileNumber: form.mobileNumber,
        })
      } catch (error) {
        console.error("Error saving patient details:", error)
      }
    }, [patientId, originalEmployeeData, form])

    const handleMedicineChange = (
      index: number,
      key: keyof typeof emptyMedicine,
      value: string,
    ) => {
      setMedicines((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      )
    }

    const handleReferralChange = (
      key: keyof typeof emptyReferral,
      value: string | boolean,
    ) => {
      setReferralDetails((prev) => ({ ...prev, [key]: value }))
    }

    const handleFollowUpChange = (
      followIndex: number,
      key: keyof typeof emptyFollowUp,
      value: string,
    ) => {
      setReferralDetails((prev) => {
        const followUpVisits = prev.followUpVisits.map((visit, vIndex) =>
          vIndex === followIndex ? { ...visit, [key]: value } : visit,
        )
        return { ...prev, followUpVisits }
      })
    }

    const buildPayload = () => {
      const toNumber = (value: string) => (value ? Number(value) : undefined)

      const filteredMedicines = medicines
        .filter((item) => item.name || item.course || item.expiryDate)
        .map((item) => ({
          name: item.name || undefined,
          course: item.course || undefined,
          expiryDate: item.expiryDate || undefined,
        }))

      const filteredFollowUps = referralDetails.followUpVisits
        .filter((visit) => visit.visitDate || visit.visitRemarks)
        .map((visit) => ({
          visitDate: visit.visitDate || undefined,
          visitRemarks: visit.visitRemarks || undefined,
        }))

      const hasReferralDetails = Boolean(
        form.referral ||
        referralDetails.referralCode ||
        referralDetails.referralType ||
        referralDetails.referredToHospital ||
        referralDetails.visitDateReferral ||
        referralDetails.specialistType ||
        referralDetails.doctorNameReferral ||
        referralDetails.investigationReports ||
        referralDetails.primaryDiagnosisReferral ||
        (referralDetails.secondaryDiagnosisReferral?.filter(Boolean).length ?? 0) > 0 ||
        referralDetails.nurseRemarksReferral ||
        referralDetails.insuranceApprovalRequested ||
        referralDetails.followUpRequired ||
        filteredFollowUps.length > 0,
      )

      return {
        locationId: form.locationId || undefined,
        slNo: Number(form.slNo),
        date: form.date,
        time: form.time,
        empNo: upperCaseValue(form.empNo),
        employeeName: form.employeeName,
        emiratesId: form.emiratesId,
        insuranceId: form.insuranceId || undefined,
        dateOfJoining: form.dateOfJoining || undefined,
        eligibilityForSickLeave: form.eligibilityForSickLeave,
        trLocation: form.trLocation,
        mobileNumber: form.mobileNumber,
        natureOfCase: form.natureOfCase,
        caseCategory: form.caseCategory,
        nurseAssessment: nurseAssessments.filter(Boolean).length ? nurseAssessments.filter(Boolean) : undefined,
        symptomDuration: form.symptomDuration || undefined,
        temperature: toNumber(form.temperature),
        bloodPressure: form.bloodPressure || undefined,
        heartRate: toNumber(form.heartRate),
        others: form.others || undefined,
        tokenNo: form.tokenNo,
        sentTo: form.sentTo || undefined,
        providerName: form.providerName || undefined,
        doctorName: form.doctorName || undefined,
        primaryDiagnosis: form.primaryDiagnosis || undefined,
        secondaryDiagnosis: secondaryDiagnoses.filter(Boolean).length ? secondaryDiagnoses.filter(Boolean) : undefined,
        medicines: filteredMedicines.length ? filteredMedicines : undefined,
        sickLeaveStatus: form.sickLeaveStatus || undefined,
        sickLeaveStartDate: form.sickLeaveStartDate || undefined,
        sickLeaveEndDate: form.sickLeaveEndDate || undefined,
        totalSickLeaveDays: toNumber(form.totalSickLeaveDays),
        remarks: form.remarks || undefined,
        referral: form.referral,
        referralCode: hasReferralDetails ? referralDetails.referralCode || undefined : undefined,
        referralType: hasReferralDetails ? referralDetails.referralType || undefined : undefined,
        referredToHospital: hasReferralDetails ? referralDetails.referredToHospital || undefined : undefined,
        visitDateReferral: hasReferralDetails ? referralDetails.visitDateReferral || undefined : undefined,
        specialistType: hasReferralDetails ? referralDetails.specialistType || undefined : undefined,
        doctorNameReferral: hasReferralDetails ? referralDetails.doctorNameReferral || undefined : undefined,
        investigationReports: hasReferralDetails ? referralDetails.investigationReports || undefined : undefined,
        primaryDiagnosisReferral: hasReferralDetails ? referralDetails.primaryDiagnosisReferral || undefined : undefined,
        secondaryDiagnosisReferral: hasReferralDetails && referralDetails.secondaryDiagnosisReferral?.filter(Boolean).length
          ? referralDetails.secondaryDiagnosisReferral.filter(Boolean)
          : undefined,
        nurseRemarksReferral: hasReferralDetails ? referralDetails.nurseRemarksReferral || undefined : undefined,
        insuranceApprovalRequested: hasReferralDetails ? referralDetails.insuranceApprovalRequested : undefined,
        followUpRequired: hasReferralDetails ? referralDetails.followUpRequired : undefined,
        followUpVisits: hasReferralDetails && filteredFollowUps.length ? filteredFollowUps : undefined,
        visitStatus: form.visitStatus || undefined,
        finalRemarks: form.finalRemarks || undefined,
        ipAdmissionRequired: form.ipAdmissionRequired,
        createdBy: form.createdBy,
      }
    }

    useImperativeHandle(ref, () => ({
      getPayload: () => buildPayload(),
      isValid: () => canSubmit,
    }))

    const resetForm = () => {
      setForm((prev) => ({
        ...prev,
        slNo: generateSlNo(),
        date: getLocalDate(),
        time: getLocalTime(),
        empNo: "",
        employeeName: "",
        emiratesId: "",
        insuranceId: "",
        dateOfJoining: "",
        eligibilityForSickLeave: false,
        trLocation: "",
        mobileNumber: "",
        natureOfCase: "",
        caseCategory: "",
        symptomDuration: "",
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        others: "",
        tokenNo: "",
        sentTo: "",
        providerName: "",
        doctorName: "",
        primaryDiagnosis: "",
        sickLeaveStatus: "",
        sickLeaveStartDate: "",
        sickLeaveEndDate: "",
        totalSickLeaveDays: "",
        remarks: "",
        visitStatus: "Open",
        referral: false,
        finalRemarks: "",
        ipAdmissionRequired: false,
      }))
      setMedicines([emptyMedicine])
      setSecondaryDiagnoses([])
      setNurseAssessments([])
      setReferralDetails(emptyReferral)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setMessage(null)

      if (!canSubmit) {
        toast.error("Please fill all required fields.")
        return
      }

      if (isEndBeforeStart) {
        toast.error("End Date cannot be before Start Date.")
        return
      }

      if (isEditMode && !clinicRecordId) {
        toast.error("Clinic record not found.")
        return
      }

      setSubmitting(true)
      try {
        // If patient ID doesn't exist (lookup failed), create a new patient first
        let finalPatientId = patientId
        console.log("handleSubmit - patientId:", patientId, "form.empNo:", form.empNo)

        if (!finalPatientId && form.empNo.trim()) {
          console.log("Creating new patient because lookup failed")
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

            console.log("Creating patient with payload:", patientPayload)

            const createResponse = await fetch(`${baseUrl}/patients`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(patientPayload),
            })

            console.log("Patient creation response status:", createResponse.status)

            const createdPatient = await createResponse.json()
            console.log("Patient creation response data:", createdPatient)

            if (!createResponse.ok) {
              throw new Error(`Failed to create patient record: ${createdPatient?.message || "Unknown error"}`)
            }

            finalPatientId = createdPatient.data?._id || createdPatient._id

            if (finalPatientId) {
              console.log("Patient created successfully with ID:", finalPatientId)
              setPatientId(finalPatientId)
              // Update original data to reflect the newly created patient
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
            console.error("Error creating patient:", createError)
            toast.error("Failed to create patient record. Please try again.")
            setSubmitting(false)
            return
          }
        }

        if (isEditMode && clinicRecordId) {
          await api.put(`/clinic/${clinicRecordId}`, buildPayload())
          toast.success("Clinic visit updated successfully.")
          if (onSaveSuccess) {
            onSaveSuccess()
          }
          return
        }

        const response = await api.post("/clinic", buildPayload())
        const clinic = response?.data?.data
        const tokenValue = clinic?.tokenNo
        const clinicId = clinic?._id

        // Call parent callback if conditions are met
        if (conditionMet && clinicId && onClinicSaved) {
          onClinicSaved({
            id: clinicId,
            employee: {
              empNo: clinic?.empNo ? String(clinic.empNo) : form.empNo,
              employeeName: clinic?.employeeName
                ? String(clinic.employeeName)
                : form.employeeName,
              emiratesId: clinic?.emiratesId
                ? String(clinic.emiratesId)
                : form.emiratesId,
              insuranceId: clinic?.insuranceId
                ? String(clinic.insuranceId)
                : form.insuranceId || undefined,
              mobileNumber: clinic?.mobileNumber
                ? String(clinic.mobileNumber)
                : form.mobileNumber || undefined,
              trLocation: clinic?.trLocation
                ? String(clinic.trLocation)
                : form.trLocation || undefined,
            },
          })
          setCreatedTokenNo(
            tokenValue !== undefined && tokenValue !== null
              ? String(tokenValue)
              : null,
          )
          setTokenDialogOpen(true)
          // Don't reset form when condition is met
        } else {
          // Reset form only if no conditions are met
          setCreatedTokenNo(
            tokenValue !== undefined && tokenValue !== null
              ? String(tokenValue)
              : null,
          )
          setTokenDialogOpen(true)
        }
      } catch (err) {
        setError(
          isEditMode
            ? "Failed to update clinic visit."
            : "Failed to save clinic visit.",
        )
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
              {isEditMode ? "Clinic Visit" : "New Clinic Visit"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Review and update clinic visit details."
                : "Enter clinic visit details and submit."}
            </p>
          </div>
          {!hideActions && (
            <Button asChild variant="secondary">
              <Link href="/clinic">Back to clinic</Link>
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
        {employeeLookupError && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
            {employeeLookupError}
          </div>
        )}

        <Dialog
          open={tokenDialogOpen}
          onOpenChange={(open) => {
            setTokenDialogOpen(open)
            if (!open) {
              setCreatedTokenNo(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clinic visit created</DialogTitle>
              <DialogDescription>
                {createdTokenNo
                  ? `Token No: ${createdTokenNo}`
                  : "Token number is not available."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setTokenDialogOpen(false)
                  setCreatedTokenNo(null)
                  // Only reset form if no conditions are met
                  if (!conditionMet && onReset) {
                    onReset()
                    resetForm()
                  }
                }}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={summaryDialogOpen}
          onOpenChange={(open) => {
            setSummaryDialogOpen(open)
            if (!open) {
              setSummaryEmpId(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Employee summary</DialogTitle>
              <DialogDescription className="mb-2 ">
                Summary for the selected employee.
              </DialogDescription>
            </DialogHeader>
            <EmployeeSummary empId={summaryEmpId ?? ""} />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSummaryDialogOpen(false)
                  setSummaryEmpId(null)
                }}
              >
                Close
              </Button>
              {summaryEmpId ? (
                <Button asChild>
                  <Link href={`/clinic?empNo=${encodeURIComponent(summaryEmpId)}`}>
                    Detail lists
                  </Link>
                </Button>
              ) : (
                <Button disabled>Detail lists</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="slNo" value={form.slNo} readOnly />
          <input
            type="hidden"
            name="locationId"
            value={form.locationId}
            readOnly
          />
          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Visit details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Required fields are marked.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isEditMode && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recordId" className="font-medium">
                    Record ID
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="recordId"
                      className="mt-0 flex-1"
                      value={clinicRecordId ?? ""}
                      readOnly
                      disabled
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => copyToClipboard(String(clinicRecordId ?? ""), "Record ID")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              {isEditMode && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tokenNo" className="font-medium">
                    Token No
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tokenNo"
                      className="mt-0 flex-1"
                      value={form.tokenNo}
                      onChange={(e) => updateForm("tokenNo", e.target.value)}
                      readOnly
                      disabled
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => copyToClipboard(String(form.tokenNo ?? ""), "Token No")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="date" className="font-medium">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-2"
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="time" className="font-medium">
                  Time *
                </Label>
                <Input
                  id="time"
                  type="text"
                  className="mt-2"
                  value={form.time}
                  onChange={(e) => updateForm("time", e.target.value)}
                  required
                  disabled
                  step="60"
                />
              </div>

              <div>
                <Label htmlFor="visitStatus" className="font-medium">
                  Visit Status
                </Label>
                <Select
                  value={form.visitStatus}
                  onValueChange={(value) => updateForm("visitStatus", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Referred">Referred</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
                <Input
                  id="empNo"
                  className="mt-2"
                  value={form.empNo}
                  onChange={(e) => {
                    const upper = upperCaseValue(e.target.value)
                    updateForm("empNo", upper)
                    if (lastFetchedEmpNo.current === upper.trim()) {
                      lastFetchedEmpNo.current = null
                    }
                    if (lastSummaryEmpNo.current === upper.trim()) {
                      lastSummaryEmpNo.current = null
                    }
                  }}
                  onBlur={(e) => {
                    handleEmployeeLookup(e.target.value)
                    openSummaryForEmpNo(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Tab") {
                      handleEmployeeLookup(e.currentTarget.value)
                      openSummaryForEmpNo(e.currentTarget.value)
                    }
                  }}
                  required
                />
                {employeeLookupLoading && (
                  <p className="mt-2 text-xs text-gray-500">Loading details...</p>
                )}
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
                  disabled
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
                  disabled
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
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="trLocation" className="font-medium">
                  TR Location *
                </Label>
                <Select
                  value={normalizeSelectValue(form.trLocation)}
                  onValueChange={(value) => updateForm("trLocation", value)}
                  disabled
                  required
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select TR location" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(trLocationOptions, form.trLocation).map(
                        (option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ),
                      )}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mobileNumber" className="font-medium">
                  Mobile Number *
                </Label>
                <Input
                  id="mobileNumber"
                  className="mt-2"
                  value={form.mobileNumber}
                  onChange={(e) => updateForm("mobileNumber", e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Sick leave eligibility
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="font-medium">Date of joining</Label>
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                  {joinDateDisplay}
                </p>
              </div>
              <div>
                <Label className="font-medium">Eligibility status</Label>
                <p className={`mt-2 text-sm font-semibold ${sickLeaveStatusColor}`}>
                  {sickLeaveStatusLabel}
                </p>
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
                  Nature of Case *
                </Label>
                <Select
                  value={normalizeSelectValue(form.natureOfCase)}
                  onValueChange={(value) => updateForm("natureOfCase", value)}
                  required
                  onOpenChange={(open) => {
                    // Auto-save employee details when Nature of Case is about to be opened
                    if (open) {
                      autoSaveEmployeeDetails()
                    }
                  }}
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
                  Case Category *
                </Label>
                <Select
                  value={normalizeSelectValue(form.caseCategory)}
                  onValueChange={(value) => updateForm("caseCategory", value)}
                  required
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
              <Card className="space-y-2 col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    Nurse Assessment
                  </h2>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setNurseAssessments((prev) => [...prev, ""])}
                  >
                    Add assessment
                  </Button>
                </div>
                <div className="space-y-3">
                  {nurseAssessments.map((assessment, index) => (
                    <div
                      key={`nurse-assessment-${index}`}
                      className="flex gap-2 items-end"
                    >
                      <div className="flex-1">
                        <SuggestionInput
                          id={`nurseAssessment-${index}`}
                          label={index === 0 ? "Assessment" : ""}
                          value={assessment}
                          onChange={(value) =>
                            setNurseAssessments((prev) =>
                              prev.map((item, i) => (i === index ? value : item))
                            )
                          }
                          category={dropdownCategories.nurseAssessment}
                        />
                      </div>
                      {nurseAssessments.length > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setNurseAssessments((prev) =>
                              prev.filter((_, i) => i !== index)
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
              <div>
                <Label htmlFor="symptomDuration" className="font-medium">
                  Symptom Duration
                </Label>
                <Select
                  value={normalizeSelectValue(form.symptomDuration)}
                  onValueChange={(value) => updateForm("symptomDuration", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select symptom duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        symptomDurationOptions,
                        form.symptomDuration,
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
                <Label htmlFor="temperature" className="font-medium">
                  Temperature
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  enableStepper={false}
                  className="mt-2"
                  value={form.temperature}
                  onChange={(e) => updateForm("temperature", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressure" className="font-medium">
                  Blood Pressure
                </Label>
                <Input
                  id="bloodPressure"
                  className="mt-2"
                  value={form.bloodPressure}
                  onChange={(e) => updateForm("bloodPressure", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="heartRate" className="font-medium">
                  Heart Rate
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  enableStepper={false}
                  className="mt-2"
                  value={form.heartRate}
                  onChange={(e) => updateForm("heartRate", e.target.value)}
                />
              </div>

              <div className="">
                <Label htmlFor="others" className="font-medium">
                  Others
                </Label>
                <Input
                  id="others"
                  className="mt-2"
                  value={form.others}
                  onChange={(e) => updateForm("others", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sentTo" className="font-medium">
                  Sent To
                </Label>
                <Select
                  value={normalizeSelectValue(form.sentTo)}
                  onValueChange={(value) => updateForm("sentTo", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select sent to" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(sentToOptions, form.sentTo).map(
                        (option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ),
                      )}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="providerName" className="font-medium">
                  Provider Name
                </Label>
                <Select
                  value={normalizeSelectValue(form.providerName)}
                  onValueChange={(value) => updateForm("providerName", value)}
                  disabled={!form.sentTo}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={form.sentTo ? "Select provider" : "Select 'Sent To' first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {getDisplayOptions(
                        providerNameOptions,
                        form.providerName,
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
                <Label htmlFor="doctorName" className="font-medium">
                  Doctor Name
                </Label>
                <Input
                  id="doctorName"
                  className="mt-2"
                  value={form.doctorName}
                  onChange={(e) => updateForm("doctorName", e.target.value)}
                />
              </div>
              <div>
                <SuggestionInput
                  id="primaryDiagnosis"
                  label="Primary Diagnosis"
                  value={form.primaryDiagnosis}
                  onChange={(value) => updateForm("primaryDiagnosis", value)}
                  category={dropdownCategories.primaryDiagnosis}
                />
              </div>
              <Card className="space-y-2 col-span-2 lg:col-span-3">
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
                              prev.map((item, i) => (i === index ? value : item))
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
                              prev.filter((_, i) => i !== index)
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
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Medicines
              </h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMedicines((prev) => [...prev, emptyMedicine])}
              >
                Add medicine
              </Button>
            </div>
            <div className="space-y-4">
              {medicines.map((medicine, index) => (
                <div
                  key={`medicine-${index}`}
                  className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 p-4 sm:grid-cols-3 dark:border-gray-900"
                >
                  <div>
                    <SuggestionInput
                      id={`medicine-name-${index}`}
                      label="Name"
                      value={medicine.name}
                      onChange={(value) =>
                        handleMedicineChange(index, "name", value)
                      }
                      category={dropdownCategories.medicineName}
                    />
                  </div>
                  <div>
                    <Label className="font-medium">Course</Label>
                    <Select
                      value={normalizeSelectValue(medicine.course)}
                      onValueChange={(value) =>
                        handleMedicineChange(index, "course", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[200px]">
                          {getDisplayOptions(
                            medicineCourseOptions,
                            medicine.course,
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
                    <Label className="font-medium">Expiry Date</Label>
                    <Input
                      type="date"
                      className="mt-2"
                      value={medicine.expiryDate}
                      onChange={(e) =>
                        handleMedicineChange(index, "expiryDate", e.target.value)
                      }
                    />
                  </div>
                  {medicines.length > 1 && (
                    <div className="sm:col-span-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setMedicines((prev) =>
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
          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Sick leave
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="sickLeaveStatus" className="font-medium">
                  Status
                </Label>
                <Select
                  value={normalizeSelectValue(form.sickLeaveStatus)}
                  onValueChange={(value) => updateForm("sickLeaveStatus", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Not Approved">Not Approved</SelectItem>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sickLeaveStartDate" className="font-medium">
                  Start Date
                </Label>
                <Input
                  id="sickLeaveStartDate"
                  type="date"
                  className="mt-2"
                  value={form.sickLeaveStartDate}
                  onChange={(e) =>
                    updateForm("sickLeaveStartDate", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sickLeaveEndDate" className="font-medium">
                  End Date
                </Label>
                <Input
                  id="sickLeaveEndDate"
                  type="date"
                  className="mt-2"
                  value={form.sickLeaveEndDate}
                  min={form.sickLeaveStartDate || undefined}
                  onChange={(e) => updateForm("sickLeaveEndDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="totalSickLeaveDays" className="font-medium">
                  Total Days
                </Label>
                <Input
                  id="totalSickLeaveDays"
                  type="number"
                  enableStepper={false}
                  className="mt-2"
                  value={form.totalSickLeaveDays}
                  onChange={(e) =>
                    updateForm("totalSickLeaveDays", e.target.value)
                  }
                  disabled
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <Label htmlFor="remarks" className="font-medium">
                  Remarks
                </Label>
                <Input
                  id="remarks"
                  className="mt-2"
                  value={form.remarks}
                  onChange={(e) => updateForm("remarks", e.target.value)}
                />
              </div>
            </div>
          </Card>
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Referral
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Checkbox
                  checked={form.referral}
                  onCheckedChange={(checked) =>
                    updateForm("referral", Boolean(checked))
                  }
                />
                Referral made
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="referralCode" className="font-medium">
                    Referral Code
                  </Label>
                  <Input
                    id="referralCode"
                    className="mt-2"
                    value={referralDetails.referralCode}
                    onChange={(e) => handleReferralChange("referralCode", e.target.value)}
                    disabled={!form.referral}
                  />
                </div>
                <div>
                  <Label htmlFor="referralType" className="font-medium">
                    Referral Type
                  </Label>
                  <Select
                    value={normalizeSelectValue(referralDetails.referralType)}
                    onValueChange={(value) => handleReferralChange("referralType", value)}
                    disabled={!form.referral}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select referral type" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {getDisplayOptions(
                          referralTypeOptions,
                          referralDetails.referralType,
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
                  <Label htmlFor="referredTo" className="font-medium">
                    Referred To
                  </Label>
                  <Select
                    value={normalizeSelectValue(referralDetails.referredToHospital)}
                    onValueChange={(value) => handleReferralChange("referredToHospital", value)}
                    disabled={!form.referral}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select referred to" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {getDisplayOptions(
                          referredToOptions,
                          referralDetails.referredToHospital,
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
                  <Label className="font-medium">Visit Date</Label>
                  <Input
                    type="date"
                    className="mt-2"
                    value={referralDetails.visitDateReferral}
                    onChange={(e) => handleReferralChange("visitDateReferral", e.target.value)}
                    disabled={!form.referral}
                  />
                </div>
                <div>
                  <Label htmlFor="specialistType" className="font-medium">
                    Specialist Type
                  </Label>
                  <Select
                    value={normalizeSelectValue(referralDetails.specialistType)}
                    onValueChange={(value) => handleReferralChange("specialistType", value)}
                    disabled={!form.referral}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select specialist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {getDisplayOptions(
                          specialistTypeOptions,
                          referralDetails.specialistType,
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
                  <Label className="font-medium">Doctor Name</Label>
                  <Input
                    className="mt-2"
                    value={referralDetails.doctorNameReferral}
                    onChange={(e) => handleReferralChange("doctorNameReferral", e.target.value)}
                    disabled={!form.referral}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="font-medium">Investigation Reports</Label>
                  <Input
                    className="mt-2"
                    value={referralDetails.investigationReports}
                    onChange={(e) => handleReferralChange("investigationReports", e.target.value)}
                    disabled={!form.referral}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <SuggestionInput
                    id="primaryDiagnosisReferral"
                    label="Primary Diagnosis"
                    value={referralDetails.primaryDiagnosisReferral}
                    onChange={(value) => handleReferralChange("primaryDiagnosisReferral", value)}
                    category={dropdownCategories.primaryDiagnosis}
                  />
                </div>
                <Card className="sm:col-span-3 lg:col-span-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Secondary Diagnosis</Label>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setReferralDetails((prev) => ({
                          ...prev,
                          secondaryDiagnosisReferral: [
                            ...prev.secondaryDiagnosisReferral,
                            "",
                          ],
                        }))
                      }
                      disabled={!form.referral}
                    >
                      Add diagnosis
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {referralDetails.secondaryDiagnosisReferral.map(
                      (diagnosis, diagnosisIndex) => (
                        <div
                          key={`secondary-diagnosis-referral-${diagnosisIndex}`}
                          className="flex gap-2 items-end"
                        >
                          <div className="flex-1">
                            <SuggestionInput
                              id={`secondaryDiagnosisReferral-${diagnosisIndex}`}
                              label={diagnosisIndex === 0 ? "Diagnosis" : ""}
                              value={diagnosis}
                              onChange={(value) =>
                                setReferralDetails((prev) => ({
                                  ...prev,
                                  secondaryDiagnosisReferral:
                                    prev.secondaryDiagnosisReferral.map(
                                      (entry, entryIndex) =>
                                        entryIndex === diagnosisIndex ? value : entry,
                                    ),
                                }))
                              }
                              category={dropdownCategories.primaryDiagnosis}
                            />
                          </div>
                          {referralDetails.secondaryDiagnosisReferral.length > 0 && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setReferralDetails((prev) => ({
                                  ...prev,
                                  secondaryDiagnosisReferral:
                                    prev.secondaryDiagnosisReferral.filter(
                                      (_, entryIndex) => entryIndex !== diagnosisIndex,
                                    ),
                                }))
                              }
                              className="h-10"
                              disabled={!form.referral}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </Card>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label className="font-medium">Nurse Remarks</Label>
                  <Input
                    className="mt-2"
                    value={referralDetails.nurseRemarksReferral}
                    onChange={(e) => handleReferralChange("nurseRemarksReferral", e.target.value)}
                    disabled={!form.referral}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Checkbox
                    checked={referralDetails.insuranceApprovalRequested}
                    onCheckedChange={(checked) =>
                      handleReferralChange("insuranceApprovalRequested", Boolean(checked))
                    }
                    disabled={!form.referral}
                  />
                  Insurance approval requested
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Checkbox
                    checked={referralDetails.followUpRequired}
                    onCheckedChange={(checked) =>
                      handleReferralChange("followUpRequired", Boolean(checked))
                    }
                    disabled={!form.referral}
                  />
                  Follow up required
                </label>
              </div>

              <Divider />

              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    Follow up visits
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setReferralDetails((prev) => ({
                        ...prev,
                        followUpVisits: [...prev.followUpVisits, emptyFollowUp],
                      }))
                    }
                    disabled={!form.referral}
                  >
                    Add follow up
                  </Button>
                </div>

                <div className="space-y-3">
                  {referralDetails.followUpVisits.map((visit, followIndex) => (
                    <div
                      key={`follow-${followIndex}`}
                      className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                    >
                      <div>
                        <Label className="font-medium">Visit Date</Label>
                        <Input
                          type="date"
                          className="mt-2"
                          value={visit.visitDate}
                          onChange={(e) =>
                            handleFollowUpChange(
                              followIndex,
                              "visitDate",
                              e.target.value,
                            )
                          }
                          disabled={!form.referral}
                        />
                      </div>
                      <div>
                        <Label className="font-medium">Remarks</Label>
                        <Input
                          className="mt-2"
                          value={visit.visitRemarks}
                          onChange={(e) =>
                            handleFollowUpChange(
                              followIndex,
                              "visitRemarks",
                              e.target.value,
                            )
                          }
                          disabled={!form.referral}
                        />
                      </div>
                      {referralDetails.followUpVisits.length > 1 && (
                        <div className="sm:justify-self-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              setReferralDetails((prev) => ({
                                ...prev,
                                followUpVisits: prev.followUpVisits.filter(
                                  (_, vIndex) => vIndex !== followIndex,
                                ),
                              }))
                            }
                            disabled={!form.referral}
                          >
                            Remove follow up
                          </Button>
                        </div>
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
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.ipAdmissionRequired}
                  onCheckedChange={(checked) =>
                    updateForm("ipAdmissionRequired", Boolean(checked))
                  }
                />
                <Label className="font-medium">IP admission required</Label>
              </div>
            </div>
          </Card>

          {!hideActions && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={
                  submitting ||
                  (mode === "create" && Boolean(conditionMet && clinicSaved))
                }
              >
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                    ? "Update clinic visit"
                    : "Save clinic visit"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/clinic">Cancel</Link>
              </Button>
            </div>
          )}
        </form>
      </div>
    )
  }
)

export default ClinicCreateForm
