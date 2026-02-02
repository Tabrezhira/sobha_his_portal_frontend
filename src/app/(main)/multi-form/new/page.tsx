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
  const [clinicSaved, setClinicSaved] = useState(false)

  const isHospitalEnabled = ipAdmissionRequired
  const isIsolationEnabled = caseCategory === "COMMUNICABLE /INFECTIOUS DISEASE"
  const conditionMet = isHospitalEnabled || isIsolationEnabled

  const handleClinicSaved = (id: string) => {
    setClinicId(id)
    setClinicSaved(true)
  }

  const handleResetForm = () => {
    setClinicId(null)
    setClinicSaved(false)
    setIpAdmissionRequired(false)
    setCaseCategory("")
  }

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="clinic" className="w-full">
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

        <TabsContent value="clinic" className="mt-6">
          <ClinicVisitForm 
            onIpAdmissionChange={setIpAdmissionRequired}
            onCaseCategoryChange={setCaseCategory}
            onClinicSaved={handleClinicSaved}
            onReset={handleResetForm}
            conditionMet={conditionMet}
          />
        </TabsContent>

        <TabsContent value="hospital" className="mt-6">
          {isHospitalEnabled && clinicSaved && <HospitalForm />}
        </TabsContent>

        <TabsContent value="isolation" className="mt-6">
          {isIsolationEnabled && clinicSaved && <IsolationForm />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
