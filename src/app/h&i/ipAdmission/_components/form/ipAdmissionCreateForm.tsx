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
import { useAuthStore } from "@/store/auth"

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
import type { Hospital } from "@/data/schema"
import { dropdownCategories } from "@/data/schema"
import { useDropdownStore } from "@/store/dropdown"
import type { IpRepeatVisitFormManagerPart } from "@/data/h&Ischema"

const emptyFollowUp = { date: "", remarks: "" }

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

export type HospitalEditFormInitialData = Partial<Hospital> & IpRepeatVisitFormManagerPart & {
  _id?: string
  id?: string
  clinicVisitId?: string
  sno?: string | number
  followUp?: Array<{ date?: string; remarks?: string }>
  createdBy?: string | { _id?: string; name?: string }
}

type CategorySelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  category: string
  required?: boolean
  disabled?: boolean
}

const CategorySelect = ({
  id,
  label,
  value,
  onChange,
  category,
  required,
  disabled,
}: CategorySelectProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL || ""
  const { fetchDropdownData } = useDropdownStore()
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchDropdownData(category, baseUrl)
        if (mounted) setItems(data)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [category, baseUrl, fetchDropdownData])

  return (
    <div>
      <Label htmlFor={id} className="font-medium">
        {label}
        {required ? " *" : ""}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id={id} className="mt-2">
          <SelectValue placeholder={loading ? "Loading..." : "Select"} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    const { token, user } = useAuthStore()
    const fetchCategories = useDropdownStore((state) => state.fetchCategories)

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

      // Manager fields
      hiManagers: user?.name || "",
      admissionMode: "",
      admissionType: "",
      insuranceApprovalStatus: "",
      treatmentUndergone: "",
      imVisitStatus: "",
      noOfVisits: "",
      treatmentLocation: "",
      placeOfLocation: "",
      postRecoveryLocation: "",
      fitToTravel: "",
      postRehabRequired: "",
      durationOfRehab: "",
      followUpRequired: "",
      rehabExtension: "",
      rehabExtensionDuration: "",
      memberResumeToWork: "",
      technicianFeedbackForm: "",
      dischargedHI: "",
      dodHI: "",
      source: "",
      caseTypeChange: "",
      dischargeComments: "",
      caseTypeChangeComments: "",
      technicianVisits: [] as { technicianFeedback?: string; physicianFeedback?: string }[],
    })

    const hospitalRecordId = initialData?._id ?? initialData?.id

    const [followUp, setFollowUp] = useState([emptyFollowUp])
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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

        // Manager fields
        hiManagers: initialData.hiManagers || user?.name || "",
        admissionMode: initialData.admissionMode ?? "",
        admissionType: initialData.admissionType ?? "",
        insuranceApprovalStatus: initialData.insuranceApprovalStatus ?? "",
        treatmentUndergone: initialData.treatmentUndergone ?? "",
        imVisitStatus: initialData.imVisitStatus ?? "",
        noOfVisits: initialData.noOfVisits !== undefined ? String(initialData.noOfVisits) : "",
        treatmentLocation: initialData.treatmentLocation ?? "",
        placeOfLocation: initialData.placeOfLocation ?? "",
        postRecoveryLocation: initialData.postRecoveryLocation ?? "",
        fitToTravel: initialData.fitToTravel !== undefined ? String(initialData.fitToTravel) : "",
        postRehabRequired: initialData.postRehabRequired !== undefined ? String(initialData.postRehabRequired) : "",
        durationOfRehab: initialData.durationOfRehab !== undefined ? String(initialData.durationOfRehab) : "",
        followUpRequired: initialData.followUpRequired !== undefined ? String(initialData.followUpRequired) : "",
        rehabExtension: initialData.rehabExtension !== undefined ? String(initialData.rehabExtension) : "",
        rehabExtensionDuration: initialData.rehabExtensionDuration !== undefined ? String(initialData.rehabExtensionDuration) : "",
        memberResumeToWork: initialData.memberResumeToWork !== undefined ? String(initialData.memberResumeToWork) : "",
        technicianFeedbackForm: initialData.technicianFeedbackForm ?? "",
        dischargedHI: initialData.dischargedHI !== undefined ? String(initialData.dischargedHI) : "",
        dodHI: toDateInput(initialData.dodHI),
        source: initialData.source ?? "",
        caseTypeChange: initialData.caseTypeChange ?? "",
        dischargeComments: initialData.dischargeComments ?? "",
        caseTypeChangeComments: initialData.caseTypeChangeComments ?? "",
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fetchCategories(process.env.NEXT_PUBLIC_DROPDOWN_API_URL)
    }, [fetchCategories])

    const handleFollowUpChange = (
      index: number,
      key: keyof typeof emptyFollowUp,
      value: string,
    ) => {
      setFollowUp((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      )
    }

    const handleTechnicianVisitChange = (
      index: number,
      key: "technicianFeedback" | "physicianFeedback",
      value: string,
    ) => {
      setForm((prev) => ({
        ...prev,
        technicianVisits: prev.technicianVisits.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      }))
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

        // Manager fields
        hiManagers: form.hiManagers || undefined,
        admissionMode: form.admissionMode || undefined,
        admissionType: form.admissionType || undefined,
        insuranceApprovalStatus: form.insuranceApprovalStatus || undefined,
        treatmentUndergone: form.treatmentUndergone || undefined,
        imVisitStatus: form.imVisitStatus || undefined,
        noOfVisits: toNumber(form.noOfVisits),
        treatmentLocation: form.treatmentLocation || undefined,
        placeOfLocation: form.placeOfLocation || undefined,
        postRecoveryLocation: form.postRecoveryLocation || undefined,
        fitToTravel: form.fitToTravel || undefined,
        postRehabRequired: form.postRehabRequired || undefined,
        durationOfRehab: toNumber(form.durationOfRehab),
        followUpRequired: form.followUpRequired || undefined,
        rehabExtension: form.rehabExtension || undefined,
        rehabExtensionDuration: toNumber(form.rehabExtensionDuration),
        memberResumeToWork: form.memberResumeToWork || undefined,
        technicianFeedbackForm: form.technicianFeedbackForm || undefined,
        dischargedHI: form.dischargedHI || undefined,
        dodHI: form.dodHI || undefined,
        source: form.source || undefined,
        caseTypeChange: form.caseTypeChange || undefined,
        dischargeComments: form.dischargeComments || undefined,
        caseTypeChangeComments: form.caseTypeChangeComments || undefined,
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

      const payload = {
        hospitalCase: hospitalRecordId,
        empNo: form.empNo,
        dateOfAdmission: form.dateOfAdmission || undefined,
        hospitalName: form.hospitalName || undefined,
        trLocation: form.trLocation || undefined,

        hiManagers: form.hiManagers || undefined,
        admissionMode: form.admissionMode || undefined,
        admissionType: form.admissionType || undefined,
        insuranceApprovalStatus: form.insuranceApprovalStatus || undefined,
        treatmentUndergone: form.treatmentUndergone || undefined,
        imVisitStatus: form.imVisitStatus || undefined,
        noOfVisits: form.noOfVisits ? Number(form.noOfVisits) : undefined,
        treatmentLocation: form.treatmentLocation || undefined,
        placeOfLocation: form.placeOfLocation || undefined,
        postRecoveryLocation: form.postRecoveryLocation || undefined,
        fitToTravel: form.fitToTravel || undefined,
        postRehabRequired: form.postRehabRequired || undefined,
        durationOfRehab: form.durationOfRehab ? Number(form.durationOfRehab) : undefined,
        followUpRequired: form.followUpRequired || undefined,
        rehabExtension: form.rehabExtension || undefined,
        rehabExtensionDuration: form.rehabExtensionDuration ? Number(form.rehabExtensionDuration) : undefined,
        memberResumeToWork: form.memberResumeToWork || undefined,
        technicianFeedbackForm: form.technicianFeedbackForm || undefined,
        dischargedHI: form.dischargedHI || undefined,
        dodHI: form.dodHI || undefined,
        caseTypeChange: form.caseTypeChange || undefined,
        dischargeComments: form.dischargeComments || undefined,
        caseTypeChangeComments: form.caseTypeChangeComments || undefined,
        technicianVisits: form.technicianVisits.filter(
          (visit) => visit.technicianFeedback?.trim() || visit.physicianFeedback?.trim()
        ).length ? form.technicianVisits : undefined,
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CURD_API_URL}/ip-admission/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        )

        if (!response.ok) {
          throw new Error("Failed to save manager details")
        }

        toast.success("Manager details saved successfully.")

        if (onSaveSuccess) {
          onSaveSuccess()
        } else {
          setTimeout(() => {
            router.push("/hospital")
          }, 1000)
        }
      } catch (error) {
        toast.error("Failed to update hospital record.")
        console.error(error)
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
          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Hospital details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
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
                  disabled
                />
              </div>
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
                <CategorySelect
                  id="hospitalName"
                  label="Hospital Name"
                  value={form.hospitalName}
                  onChange={(value) => updateForm("hospitalName", value)}
                  category={dropdownCategories.externalProvider}
                  disabled={true}
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
                  disabled
                />
              </div>
            </div>
            <Divider />
            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Employee details
              </h3>
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
                  disabled
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
                  disabled
                />
              </div>
            </div>
            <Divider />
            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Case details
              </h3>
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
                  disabled
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
                  disabled
                />
              </div>
              <div className="col-span-2 lg:col-span-3">
                <CategorySelect
                  id="primaryDiagnosis"
                  label="Primary Diagnosis"
                  value={form.primaryDiagnosis}
                  onChange={(value) => updateForm("primaryDiagnosis", value)}
                  category={dropdownCategories.primaryDiagnosis}
                  disabled
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
                    disabled
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
                        <CategorySelect
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
                          disabled
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
                          disabled
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Divider />
            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Discharge &amp; fitness
              </h3>
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
                  disabled
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
                <Input
                  id="fitnessStatus"
                  className="mt-2"
                  value={form.fitnessStatus}
                  onChange={(e) => updateForm("fitnessStatus", e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label
                  htmlFor="dischargeSummaryReceived"
                  className="font-medium"
                >
                  Discharge Summary Received
                </Label>
                <Input
                  id="dischargeSummaryReceived"
                  className="mt-2"
                  value={form.dischargeSummaryReceived ? "Yes" : "No"}
                  onChange={(e) => updateForm("dischargeSummaryReceived", e.target.value === "Yes")}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="isolationRequired" className="font-medium">
                  Isolation Required
                </Label>
                <Input
                  id="isolationRequired"
                  className="mt-2"
                  value={form.isolationRequired ? "Yes" : "No"}
                  onChange={(e) => updateForm("isolationRequired", e.target.value === "Yes")}
                  disabled
                />
              </div>
            </div>
            <Divider />
            <div className="col-span-full flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Follow up visits
              </h3>
              <Button
                type="button"
                variant="secondary"
                disabled
                onClick={() =>
                  setFollowUp((prev) => [...prev, emptyFollowUp])
                }
              >
                Add follow up
              </Button>
            </div>
            <div className="col-span-full space-y-4">
              {followUp.map((visit, index) => (
                <div
                  key={`followup-${index}`}
                  className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-900"
                >
                  <div>
                    <Label className="font-medium">Date</Label>
                    <Input
                      type="date"
                      disabled
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
                      disabled
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
                        disabled
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Divider />
            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Final notes
              </h3>
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
                  disabled
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Manager Update
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="hiManagers" className="font-medium">H&amp;I Managers</Label>
                <Input
                  id="hiManagers"
                  className="mt-2"
                  value={form.hiManagers}
                  onChange={(e) => updateForm("hiManagers", e.target.value)}
                />
              </div>
              <div>
                <CategorySelect
                  id="admissionMode"
                  label="Admission Mode"
                  value={form.admissionMode}
                  onChange={(val) => updateForm("admissionMode", val)}
                  category={dropdownCategories.ipAdmissionMode}
                />
              </div>
              <div>
                <CategorySelect
                  id="admissionType"
                  label="Admission Type"
                  value={form.admissionType}
                  onChange={(val) => updateForm("admissionType", val)}
                  category={dropdownCategories.ipAdmissionType}
                />
              </div>

              <div>
                <CategorySelect
                  id="insuranceApprovalStatus"
                  label="Insurance Approval Status"
                  value={form.insuranceApprovalStatus}
                  onChange={(val) => updateForm("insuranceApprovalStatus", val)}
                  category={dropdownCategories.ipInsuranceApprovalStatus}
                />
              </div>
              <div>
                <CategorySelect
                  id="imVisitStatus"
                  label="IM Visit Status"
                  value={form.imVisitStatus}
                  onChange={(val) => updateForm("imVisitStatus", val)}
                  category={dropdownCategories.ipImVisitStatus}
                />
              </div>
              <div>
                <Label htmlFor="noOfVisits" className="font-medium">No of Visits</Label>
                <Input
                  id="noOfVisits"
                  type="number"
                  className="mt-2"
                  value={form.noOfVisits}
                  onChange={(e) => updateForm("noOfVisits", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="source" className="font-medium">Source</Label>
                <Input
                  id="source"
                  className="mt-2"
                  value={form.source}
                  onChange={(e) => updateForm("source", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="caseTypeChange" className="font-medium">Case Type Change</Label>
                <Select
                  value={form.caseTypeChange}
                  onValueChange={(val) => updateForm("caseTypeChange", val)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High Critical">High Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technicianFeedbackForm" className="font-medium">Technician Feedback Form</Label>
                <Input
                  id="technicianFeedbackForm"
                  className="mt-2"
                  value={form.technicianFeedbackForm}
                  onChange={(e) => updateForm("technicianFeedbackForm", e.target.value)}
                />
              </div>
            </div>

            <Divider />

            <div className="col-span-full flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Technician Visits
              </h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    technicianVisits: [
                      ...prev.technicianVisits,
                      { technicianFeedback: "", physicianFeedback: "" },
                    ],
                  }))
                }
              >
                Add Visit
              </Button>
            </div>
            <div className="col-span-full space-y-4">
              {form.technicianVisits.map((visit, index) => (
                <div
                  key={`technician-visit-${index}`}
                  className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-900"
                >
                  <div>
                    <Label className="font-medium">Technician Feedback</Label>
                    <Input
                      className="mt-2"
                      value={visit.technicianFeedback || ""}
                      onChange={(e) =>
                        handleTechnicianVisitChange(index, "technicianFeedback", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="font-medium">Physician Feedback</Label>
                    <Input
                      className="mt-2"
                      value={visit.physicianFeedback || ""}
                      onChange={(e) =>
                        handleTechnicianVisitChange(index, "physicianFeedback", e.target.value)
                      }
                    />
                  </div>
                  {form.technicianVisits.length > 1 && (
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            technicianVisits: prev.technicianVisits.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Divider />

            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Treatment &amp; Recovery
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-3 lg:col-span-full">
                <Label htmlFor="treatmentUndergone" className="font-medium">Treatment Undergone</Label>
                <Select
                  value={form.treatmentUndergone}
                  onValueChange={(val) => updateForm("treatmentUndergone", val)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="treatmentLocation" className="font-medium">Treatment Location</Label>
                <Input
                  id="treatmentLocation"
                  className="mt-2"
                  value={form.treatmentLocation}
                  onChange={(e) => updateForm("treatmentLocation", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="placeOfLocation" className="font-medium">Place of Location</Label>
                <Input
                  id="placeOfLocation"
                  className="mt-2"
                  value={form.placeOfLocation}
                  onChange={(e) => updateForm("placeOfLocation", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postRecoveryLocation" className="font-medium">Post Recovery Location</Label>
                <Input
                  id="postRecoveryLocation"
                  className="mt-2"
                  value={form.postRecoveryLocation}
                  onChange={(e) => updateForm("postRecoveryLocation", e.target.value)}
                />
              </div>
            </div>

            <Divider />

            <div className="col-span-full">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Discharge &amp; Rehab
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <CategorySelect
                  id="fitToTravel"
                  label="Fit to Travel"
                  value={form.fitToTravel}
                  onChange={(val) => updateForm("fitToTravel", val)}
                  category={dropdownCategories.ipFitToTravel}
                />
              </div>
              <div>
                <CategorySelect
                  id="memberResumeToWork"
                  label="Member Resume to Work"
                  value={form.memberResumeToWork}
                  onChange={(val) => updateForm("memberResumeToWork", val)}
                  category={dropdownCategories.ipMemberResumeToWork}
                />
              </div>
              <div>
                <CategorySelect
                  id="followUpRequired"
                  label="Follow Up Required"
                  value={form.followUpRequired}
                  onChange={(val) => updateForm("followUpRequired", val)}
                  category={dropdownCategories.ipFollowUpRequired}
                />
              </div>

              <div>
                <CategorySelect
                  id="postRehabRequired"
                  label="Post Rehab Required"
                  value={form.postRehabRequired}
                  onChange={(val) => updateForm("postRehabRequired", val)}
                  category={dropdownCategories.ipPostRehabRequired}
                />
              </div>
              {form.postRehabRequired === "Yes" && (
                <div>
                  <Label htmlFor="durationOfRehab" className="font-medium">Duration of Rehab (days)</Label>
                  <Input
                    id="durationOfRehab"
                    type="number"
                    className="mt-2"
                    value={form.durationOfRehab}
                    onChange={(e) => updateForm("durationOfRehab", e.target.value)}
                  />
                </div>
              )}

              <div className={form.postRehabRequired !== "Yes" ? "col-span-1" : ""}>
                <CategorySelect
                  id="rehabExtension"
                  label="Rehab Extension"
                  value={form.rehabExtension}
                  onChange={(val) => updateForm("rehabExtension", val)}
                  category={dropdownCategories.ipRehabExtension}
                />
              </div>
              {form.rehabExtension === "Yes" && (
                <div>
                  <Label htmlFor="rehabExtensionDuration" className="font-medium">Rehab Extension Duration (days)</Label>
                  <Input
                    id="rehabExtensionDuration"
                    type="number"
                    className="mt-2"
                    value={form.rehabExtensionDuration}
                    onChange={(e) => updateForm("rehabExtensionDuration", e.target.value)}
                  />
                </div>
              )}

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <CategorySelect
                    id="dischargedHI"
                    label="Discharged H&I"
                    value={form.dischargedHI}
                    onChange={(val) => updateForm("dischargedHI", val)}
                    category={dropdownCategories.ipDischargedHI}
                  />
                </div>
                {form.dischargedHI && form.dischargedHI !== "No" && form.dischargedHI !== "false" && (
                  <div>
                    <Label htmlFor="dodHI" className="font-medium">Date of Discharge H&amp;I</Label>
                    <Input
                      id="dodHI"
                      type="date"
                      className="mt-2"
                      value={form.dodHI}
                      onChange={(e) => updateForm("dodHI", e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dischargeComments" className="font-medium">Discharge Comments</Label>
                  <Input
                    id="dischargeComments"
                    className="mt-2"
                    value={form.dischargeComments}
                    onChange={(e) => updateForm("dischargeComments", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="caseTypeChangeComments" className="font-medium">Case Type Change Comments</Label>
                  <Input
                    id="caseTypeChangeComments"
                    className="mt-2"
                    value={form.caseTypeChangeComments}
                    onChange={(e) => updateForm("caseTypeChangeComments", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-4 pb-2">
              <Button type="button" variant="secondary" onClick={() => { if (onSaveSuccess) onSaveSuccess(); else router.back(); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save details"}
              </Button>
            </div>
          </Card>
        </form>

      </div>
    )
  },
)

export default HospitalEditForm