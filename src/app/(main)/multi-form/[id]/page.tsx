"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Card } from "@/components/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClinicVisitForm, {
  ClinicVisitFormInitialData,
  ClinicVisitFormRef,
} from "@/components/updateforms/ClinicVisitForm"
import HospitalForm, {
  HospitalFormInitialData,
  HospitalFormRef,
} from "@/components/updateforms/HospitalForm"
import IsolationForm, {
  IsolationFormInitialData,
  IsolationFormRef,
} from "@/components/updateforms/IsolationForm"
import { api } from "@/lib/api"

type ClinicVisitResponse = ClinicVisitFormInitialData & {
  hospitalizations?: HospitalFormInitialData[]
  isolations?: IsolationFormInitialData[]
}

type ClinicEmployee = {
  empNo: string
  employeeName: string
  emiratesId: string
  insuranceId?: string
  mobileNumber?: string
  trLocation?: string
}

export default function MultiFormEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clinicId = params?.id

  const clinicRef = useRef<ClinicVisitFormRef>(null)
  const hospitalRef = useRef<HospitalFormRef>(null)
  const isolationRef = useRef<IsolationFormRef>(null)

  const [clinicData, setClinicData] = useState<ClinicVisitResponse | null>(null)
  const [hospitalData, setHospitalData] =
    useState<HospitalFormInitialData | null>(null)
  const [isolationData, setIsolationData] =
    useState<IsolationFormInitialData | null>(null)
  const [clinicEmployee, setClinicEmployee] = useState<ClinicEmployee | null>(
    null,
  )
  const [ipAdmissionRequired, setIpAdmissionRequired] = useState(false)
  const [caseCategory, setCaseCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "clinic" | "hospital" | "isolation"
  >("clinic")
  const didInitTab = useRef(false)

  useEffect(() => {
    if (!clinicId) return

    let isMounted = true
    setLoading(true)
    setError(null)

    api
      .get(`/clinic/${clinicId}`)
      .then((response) => {
        const data: ClinicVisitResponse = response.data?.data ?? response.data
        if (!isMounted || !data) return

        setClinicData(data)
        setHospitalData(data.hospitalizations?.[0] ?? null)
        setIsolationData(data.isolations?.[0] ?? null)
        setIpAdmissionRequired(Boolean(data.ipAdmissionRequired))
        setCaseCategory(data.caseCategory ?? "")
        setClinicEmployee({
          empNo: data.empNo ?? "",
          employeeName: data.employeeName ?? "",
          emiratesId: data.emiratesId ?? "",
          insuranceId: data.insuranceId ?? undefined,
          mobileNumber: data.mobileNumber ?? undefined,
          trLocation: data.trLocation ?? undefined,
        })
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load clinic visit.")
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
  }, [clinicId])

  const hasHospitalRecord = Boolean(hospitalData?._id ?? hospitalData?.id)
  const hasIsolationRecord = Boolean(isolationData?._id ?? isolationData?.id)

  const isHospitalEnabled = ipAdmissionRequired || hasHospitalRecord
  const isIsolationEnabled =
    caseCategory === "COMMUNICABLE /INFECTIOUS DISEASE" || hasIsolationRecord

  const requestedTab = searchParams.get("tab")

  const handleSaveComplete = () => {
    toast.success("Records saved successfully.")
    router.push("/clinic")
  }

  useEffect(() => {
    if (didInitTab.current || loading) return

    if (requestedTab === "hospital" && isHospitalEnabled) {
      setActiveTab("hospital")
      didInitTab.current = true
      return
    }

    if (requestedTab === "isolation" && isIsolationEnabled) {
      setActiveTab("isolation")
      didInitTab.current = true
      return
    }

    didInitTab.current = true
  }, [requestedTab, isHospitalEnabled, isIsolationEnabled, loading])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Edit Multi-Form
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update clinic, hospital, and isolation records.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Loading records...
        </Card>
      ) : !clinicData ? (
        <Card className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          Clinic visit not found.
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "clinic" | "hospital" | "isolation")
          }
          className="w-full"
        >
          <div className="sticky top-0 z-30 -mx-4 space-y-4 border-b border-gray-200 bg-white/95 px-4 pb-4 pt-4 backdrop-blur dark:border-gray-900 dark:bg-gray-950/95 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clinic">Clinic Visit</TabsTrigger>
              <TabsTrigger value="hospital" disabled={!isHospitalEnabled}>
                Hospital
              </TabsTrigger>
              <TabsTrigger value="isolation" disabled={!isIsolationEnabled}>
                Isolation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clinic" className="mt-6">
            <ClinicVisitForm
              ref={clinicRef}
              mode="edit"
              initialData={clinicData}
              hideActions={false}
              onIpAdmissionChange={setIpAdmissionRequired}
              onCaseCategoryChange={setCaseCategory}
              onSaveSuccess={handleSaveComplete}
            />
          </TabsContent>

          <TabsContent value="hospital" className="mt-6">
            {isHospitalEnabled && (
              <HospitalForm
                ref={hospitalRef}
                mode="edit"
                hideActions={false}
                clinicVisitId={clinicId}
                employee={clinicEmployee}
                initialData={hospitalData ?? undefined}
                onSaveSuccess={handleSaveComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="isolation" className="mt-6">
            {isIsolationEnabled && (
              <IsolationForm
                ref={isolationRef}
                mode="edit"
                hideActions={false}
                clinicVisitId={clinicId}
                employee={clinicEmployee}
                initialData={isolationData ?? undefined}
                onSaveSuccess={handleSaveComplete}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
