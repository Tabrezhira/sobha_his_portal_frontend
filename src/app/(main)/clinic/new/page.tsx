"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import ClinicCreateForm, { ClinicCreateFormRef } from "@/app/(main)/clinic/_components/form/ClinicCreateForm"

export default function NewClinicVisitPage() {
  const router = useRouter()
  const clinicRef = useRef<ClinicCreateFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Clinic visit saved successfully.")
    router.push("/clinic")
  }

  return (
    <div className="space-y-6">
      <ClinicCreateForm mode="create" ref={clinicRef} onSaveSuccess={handleSaveComplete} />
    </div>
  )
}
