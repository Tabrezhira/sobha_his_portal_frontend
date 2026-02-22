"use client"

import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/Button"
import NewClinicVisitForm from "@/app/(main)/clinic/_components/form/NewClinicVisitForm"
import { ClinicVisitFormRef } from "@/app/(main)/clinic/_components/form/ClinicVisitForm"

export default function NewClinicVisitPage() {
  const router = useRouter()
  const clinicRef = useRef<ClinicVisitFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Clinic visit saved successfully.")
    router.push("/clinic")
  }

  return (
    <div className="space-y-6">
      <NewClinicVisitForm ref={clinicRef} onSaveSuccess={handleSaveComplete} />
    </div>
  )
}
