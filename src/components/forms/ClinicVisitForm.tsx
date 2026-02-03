"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { dropdownCategories } from "@/data/schema"
import { useDropdownStore } from "@/store/dropdown"
import { api } from "@/lib/api"

const emptyMedicine = { name: "", course: "", expiryDate: "" }
const emptyFollowUp = { visitDate: "", visitRemarks: "" }
const emptyReferral = {
  referralCode: "",
  referralType: "",
  referredToHospital: "",
  visitDateReferral: "",
  specialistType: "",
  doctorName: "",
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

interface ClinicVisitFormProps {
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
  conditionMet?: boolean
  clinicSaved?: boolean
}

export default function ClinicVisitForm({ onIpAdmissionChange, onCaseCategoryChange, onClinicSaved, onReset, conditionMet, clinicSaved }: ClinicVisitFormProps) {
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

  const getLocalDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getLocalTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
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
    finalRemarks: "",
    ipAdmissionRequired: false,
    createdBy: "",
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      slNo: prev.slNo || generateSlNo(),
      date: prev.date || getLocalDate(),
      time: prev.time || getLocalTime(),
    }))
  }, [])

  useEffect(() => {
    fetchCategories(process.env.NEXT_PUBLIC_DROPDOWN_API_URL)
  }, [fetchCategories])

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
  const [referrals, setReferrals] = useState([emptyReferral])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false)
  const [createdTokenNo, setCreatedTokenNo] = useState<string | null>(null)
  const [employeeLookupError, setEmployeeLookupError] = useState<string | null>(
    null,
  )
  const [employeeLookupLoading, setEmployeeLookupLoading] = useState(false)
  const lastFetchedEmpNo = useRef<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
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

  const handleEmployeeLookup = async (empNo: string) => {
    const trimmed = empNo.trim()
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

      setForm((prev) => ({
        ...prev,
        employeeName: data.PatientName ?? prev.employeeName,
        emiratesId: data.emiratesId ?? prev.emiratesId,
        insuranceId: data.insuranceId ?? prev.insuranceId,
        trLocation: data.trLocation ?? prev.trLocation,
        mobileNumber: data.mobileNumber ?? prev.mobileNumber,
      }))
      lastFetchedEmpNo.current = trimmed
    } catch (lookupError) {
      setEmployeeLookupError("Unable to load employee details.")
    } finally {
      setEmployeeLookupLoading(false)
    }
  }

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
    index: number,
    key: keyof typeof emptyReferral,
    value: string | boolean,
  ) => {
    setReferrals((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    )
  }

  const handleFollowUpChange = (
    referralIndex: number,
    followIndex: number,
    key: keyof typeof emptyFollowUp,
    value: string,
  ) => {
    setReferrals((prev) =>
      prev.map((ref, i) => {
        if (i !== referralIndex) return ref
        const followUpVisits = ref.followUpVisits.map((visit, vIndex) =>
          vIndex === followIndex ? { ...visit, [key]: value } : visit,
        )
        return { ...ref, followUpVisits }
      }),
    )
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

    const filteredReferrals = referrals
      .filter(
        (item) =>
          item.referralCode ||
          item.referralType ||
          item.referredToHospital ||
          item.visitDateReferral ||
          item.specialistType ||
          item.doctorName ||
          item.investigationReports ||
          item.primaryDiagnosisReferral ||
          (item.secondaryDiagnosisReferral?.length ?? 0) > 0 ||
          item.nurseRemarksReferral,
      )
      .map((item) => ({
        referralCode: item.referralCode || undefined,
        referralType: item.referralType || undefined,
        referredToHospital: item.referredToHospital || undefined,
        visitDateReferral: item.visitDateReferral || undefined,
        specialistType: item.specialistType || undefined,
        doctorName: item.doctorName || undefined,
        investigationReports: item.investigationReports || undefined,
        primaryDiagnosisReferral: item.primaryDiagnosisReferral || undefined,
        secondaryDiagnosisReferral: item.secondaryDiagnosisReferral?.length
          ? item.secondaryDiagnosisReferral.filter(Boolean)
          : undefined,
        nurseRemarksReferral: item.nurseRemarksReferral || undefined,
        insuranceApprovalRequested: item.insuranceApprovalRequested,
        followUpRequired: item.followUpRequired,
        followUpVisits: item.followUpVisits
          .filter((visit) => visit.visitDate || visit.visitRemarks)
          .map((visit) => ({
            visitDate: visit.visitDate || undefined,
            visitRemarks: visit.visitRemarks || undefined,
          })),
      }))

    return {
      locationId: form.locationId || undefined,
      slNo: Number(form.slNo),
      date: form.date,
      time: form.time,
      empNo: form.empNo,
      employeeName: form.employeeName,
      emiratesId: form.emiratesId,
      insuranceId: form.insuranceId || undefined,
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
      referrals: filteredReferrals.length ? filteredReferrals : undefined,
      visitStatus: form.visitStatus || undefined,
      finalRemarks: form.finalRemarks || undefined,
      ipAdmissionRequired: form.ipAdmissionRequired,
      createdBy: form.createdBy,
    }
  }

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
      finalRemarks: "",
      ipAdmissionRequired: false,
    }))
    setMedicines([emptyMedicine])
    setSecondaryDiagnoses([])
    setNurseAssessments([])
    setReferrals([emptyReferral])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!canSubmit) {
      toast.error("Please fill all required fields.")
      return
    }

    setSubmitting(true)
    try {
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
      setError("Failed to save clinic visit.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            New Clinic Visit
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter clinic visit details and submit.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/clinic">Back to clinic</Link>
        </Button>
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
              />
            </div>
            <div>
              <Label htmlFor="time" className="font-medium">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                className="mt-2"
                value={form.time}
                onChange={(e) => updateForm("time", e.target.value)}
                required
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
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Referred">Referred</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                  updateForm("empNo", e.target.value)
                  if (lastFetchedEmpNo.current === e.target.value.trim()) {
                    lastFetchedEmpNo.current = null
                  }
                }}
                onBlur={(e) => handleEmployeeLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    handleEmployeeLookup(e.currentTarget.value)
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
              <Label htmlFor="trLocation" className="font-medium">
                TR Location *
              </Label>
              <Select
                value={form.trLocation}
                onValueChange={(value) => updateForm("trLocation", value)}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select TR location" />
                </SelectTrigger>
                <SelectContent>
                  {trLocationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
                value={form.natureOfCase}
                onValueChange={(value) => updateForm("natureOfCase", value)}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select nature of case" />
                </SelectTrigger>
                <SelectContent>
                  {natureOfCaseOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="caseCategory" className="font-medium">
                Case Category *
              </Label>
              <Select
                value={form.caseCategory}
                onValueChange={(value) => updateForm("caseCategory", value)}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select case category" />
                </SelectTrigger>
                <SelectContent>
                  {caseCategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
                value={form.symptomDuration}
                onValueChange={(value) => updateForm("symptomDuration", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select symptom duration" />
                </SelectTrigger>
                <SelectContent>
                  {symptomDurationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
                value={form.sentTo}
                onValueChange={(value) => updateForm("sentTo", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select sent to" />
                </SelectTrigger>
                <SelectContent>
                  {sentToOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="providerName" className="font-medium">
                Provider Name
              </Label>
              <Select
                value={form.providerName}
                onValueChange={(value) => updateForm("providerName", value)}
                disabled={!form.sentTo}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={form.sentTo ? "Select provider" : "Select 'Sent To' first"} />
                </SelectTrigger>
                <SelectContent>
                  {providerNameOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
                    value={medicine.course}
                    onValueChange={(value) =>
                      handleMedicineChange(index, "course", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicineCourseOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
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
                value={form.sickLeaveStatus}
                onValueChange={(value) => updateForm("sickLeaveStatus", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Not Approved">Not Approved</SelectItem>
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
              Referrals
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReferrals((prev) => [...prev, emptyReferral])}
            >
              Add referral
            </Button>
          </div>
          <div className="space-y-4">
            {referrals.map((referral, index) => (
              <div
                key={`referral-${index}`}
                className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-900"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label htmlFor={`referralType-${index}`} className="font-medium">
                      Referral Type
                    </Label>
                    <Select
                      value={referral.referralType}
                      onValueChange={(value) =>
                        handleReferralChange(index, "referralType", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select referral type" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`referredTo-${index}`} className="font-medium">
                      Referred To
                    </Label>
                    <Select
                      value={referral.referredToHospital}
                      onValueChange={(value) =>
                        handleReferralChange(index, "referredToHospital", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select referred to" />
                      </SelectTrigger>
                      <SelectContent>
                        {referredToOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-medium">Visit Date</Label>
                    <Input
                      type="date"
                      className="mt-2"
                      value={referral.visitDateReferral}
                      onChange={(e) =>
                        handleReferralChange(
                          index,
                          "visitDateReferral",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`specialistType-${index}`} className="font-medium">
                      Specialist Type
                    </Label>
                    <Select
                      value={referral.specialistType}
                      onValueChange={(value) =>
                        handleReferralChange(index, "specialistType", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select specialist type" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialistTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-medium">Doctor Name</Label>
                    <Input
                      className="mt-2"
                      value={referral.doctorName}
                      onChange={(e) =>
                        handleReferralChange(
                          index,
                          "doctorName",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="">
                    <Label className="font-medium">Investigation Reports</Label>
                    <Input
                      className="mt-2"
                      value={referral.investigationReports}
                      onChange={(e) =>
                        handleReferralChange(
                          index,
                          "investigationReports",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <SuggestionInput
                      id={`primaryDiagnosisReferral-${index}`}
                      label="Primary Diagnosis"
                      value={referral.primaryDiagnosisReferral}
                      onChange={(value) =>
                        handleReferralChange(
                          index,
                          "primaryDiagnosisReferral",
                          value,
                        )
                      }
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
                          setReferrals((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    secondaryDiagnosisReferral: [
                                      ...item.secondaryDiagnosisReferral,
                                      "",
                                    ],
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        Add diagnosis
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {referral.secondaryDiagnosisReferral.map(
                        (diagnosis, diagnosisIndex) => (
                          <div details
                            key={`secondary-diagnosis-referral-${index}-${diagnosisIndex}`}
                            className="flex gap-2 items-end"
                          >
                            <div className="flex-1">
                              <SuggestionInput
                                id={`secondaryDiagnosisReferral-${index}-${diagnosisIndex}`}
                                label={diagnosisIndex === 0 ? "Diagnosis" : ""}
                                value={diagnosis}
                                onChange={(value) =>
                                  setReferrals((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            secondaryDiagnosisReferral:
                                              item.secondaryDiagnosisReferral.map(
                                                (entry, entryIndex) =>
                                                  entryIndex === diagnosisIndex
                                                    ? value
                                                    : entry,
                                              ),
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                category={dropdownCategories.primaryDiagnosis}
                              />
                            </div>
                            {referral.secondaryDiagnosisReferral.length > 0 && (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  setReferrals((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            secondaryDiagnosisReferral:
                                              item.secondaryDiagnosisReferral.filter(
                                                (_, entryIndex) =>
                                                  entryIndex !== diagnosisIndex,
                                              ),
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="h-10"
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
                      value={referral.nurseRemarksReferral}
                      onChange={(e) =>
                        handleReferralChange(
                          index,
                          "nurseRemarksReferral",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Checkbox
                      checked={referral.insuranceApprovalRequested}
                      onCheckedChange={(checked) =>
                        handleReferralChange(
                          index,
                          "insuranceApprovalRequested",
                          Boolean(checked),
                        )
                      }
                    />
                    Insurance approval requested
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Checkbox
                      checked={referral.followUpRequired}
                      onCheckedChange={(checked) =>
                        handleReferralChange(
                          index,
                          "followUpRequired",
                          Boolean(checked),
                        )
                      }
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
                        setReferrals((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  followUpVisits: [
                                    ...item.followUpVisits,
                                    emptyFollowUp,
                                  ],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      Add follow up
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {referral.followUpVisits.map((visit, followIndex) => (
                      <div
                        key={`follow-${index}-${followIndex}`}
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
                                index,
                                followIndex,
                                "visitDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label className="font-medium">Remarks</Label>
                          <Input
                            className="mt-2"
                            value={visit.visitRemarks}
                            onChange={(e) =>
                              handleFollowUpChange(
                                index,
                                followIndex,
                                "visitRemarks",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        {referral.followUpVisits.length > 1 && (
                          <div className="sm:justify-self-end">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setReferrals((prev) =>
                                  prev.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          followUpVisits:
                                            item.followUpVisits.filter(
                                              (_, vIndex) =>
                                                vIndex !== followIndex,
                                            ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              Remove follow up
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {referrals.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setReferrals((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    Remove referral
                  </Button>
                )}
              </div>
            ))}
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={submitting || Boolean(conditionMet && clinicSaved)}
          >
            {submitting ? "Saving..." : "Save clinic visit"}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/clinic">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
