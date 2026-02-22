"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import HospitalCreateForm, { HospitalCreateFormRef } from "@/app/(main)/hospital/_components/form/HospitalCreateForm"

export default function NewHospitalRecordPage() {
  const router = useRouter()
  const hospitalRef = useRef<HospitalCreateFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Hospital record saved successfully.")
    router.push("/hospital")
  }

  return (
    <div className="space-y-6">
      <HospitalCreateForm
        ref={hospitalRef}
        onSaveSuccess={handleSaveComplete}
      />
    </div>
  )
}
