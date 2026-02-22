"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import HospitalForm, { HospitalFormRef } from "@/app/(main)/hospital/_components/form/HospitalForm"

export default function NewHospitalRecordPage() {
  const router = useRouter()
  const hospitalRef = useRef<HospitalFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Hospital record saved successfully.")
    router.push("/hospital")
  }

  return (
    <div className="space-y-6">
      <HospitalForm
        ref={hospitalRef}
        mode="create"
        onSaveSuccess={handleSaveComplete}
      />
    </div>
  )
}
