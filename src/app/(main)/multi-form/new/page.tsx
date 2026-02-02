"use client"

import ClinicVisitForm from "@/components/forms/ClinicVisitForm"
import HospitalForm from "@/components/forms/HospitalForm"
import IsolationForm from "@/components/forms/IsolationForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/Card"
import { useState } from "react"

export default function MultiFormPage() {
  const [ipAdmissionRequired, setIpAdmissionRequired] = useState(false)
  const [caseCategory, setCaseCategory] = useState("")
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [clinicEmployee, setClinicEmployee] = useState<{
    empNo: string
    employeeName: string
    emiratesId: string
    insuranceId?: string
    mobileNumber?: string
    trLocation?: string
  } | null>(null)
  const [clinicSaved, setClinicSaved] = useState(false)

  const isHospitalEnabled = ipAdmissionRequired
  const isIsolationEnabled = caseCategory === "COMMUNICABLE /INFECTIOUS DISEASE"
  const conditionMet = isHospitalEnabled || isIsolationEnabled

  const handleClinicSaved = (payload: {
    id: string
    employee: {
      empNo: string
      employeeName: string
      emiratesId: string
      insuranceId?: string
      mobileNumber?: string
      trLocation?: string
    }
  }) => {
    setClinicId(payload.id)
    setClinicEmployee(payload.employee)
    setClinicSaved(true)
  }

  const handleResetForm = () => {
    setClinicId(null)
    setClinicEmployee(null)
    setClinicSaved(false)
    setIpAdmissionRequired(false)
    setCaseCategory("")
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="clinic" className="w-full">
        <div className="sticky top-0 z-30 -mx-4 space-y-4 border-b border-gray-200 bg-white/95 px-4 pb-4 pt-4 backdrop-blur dark:border-gray-900 dark:bg-gray-950/95 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
              Multi-Form Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Select a form to fill out and submit your records.
            </p>
          </div>

          {conditionMet && clinicSaved && clinicId && (
            <Card className="border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/40">
              <p className="text-sm text-emerald-700 dark:text-emerald-200">
                ✓ Clinic visit saved (ID: {clinicId}). You can now proceed to {isHospitalEnabled && isIsolationEnabled ? "Hospital or Isolation" : isHospitalEnabled ? "Hospital" : "Isolation"} form.
              </p>
            </Card>
          )}

          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clinic">Clinic Visit</TabsTrigger>
            <TabsTrigger 
              value="hospital" 
              disabled={!isHospitalEnabled || (conditionMet && !clinicSaved)}
            >
              Hospital {(!isHospitalEnabled || (conditionMet && !clinicSaved)) && "(Save clinic first)"}
            </TabsTrigger>
            <TabsTrigger 
              value="isolation" 
              disabled={!isIsolationEnabled || (conditionMet && !clinicSaved)}
            >
              Isolation {(!isIsolationEnabled || (conditionMet && !clinicSaved)) && "(Save clinic first)"}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="clinic" className="mt-6" forceMount>
          <ClinicVisitForm 
            onIpAdmissionChange={setIpAdmissionRequired}
            onCaseCategoryChange={setCaseCategory}
            onClinicSaved={handleClinicSaved}
            onReset={handleResetForm}
            conditionMet={conditionMet}
          />
        </TabsContent>

        <TabsContent value="hospital" className="mt-6" forceMount>
          {isHospitalEnabled && clinicSaved && (
            <HospitalForm clinicVisitId={clinicId ?? undefined} employee={clinicEmployee} />
          )}
        </TabsContent>

        <TabsContent value="isolation" className="mt-6" forceMount>
          {isIsolationEnabled && clinicSaved && (
            <IsolationForm clinicVisitId={clinicId ?? undefined} employee={clinicEmployee} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
