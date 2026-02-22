"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import IsolationForm, { IsolationFormRef } from "@/app/(main)/isolation/_components/form/IsolationForm"

export default function IsolationNewPage() {
  const router = useRouter()
  const isolationRef = useRef<IsolationFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Isolation record saved successfully.")
    router.push("/isolation")
  }

  return (
    <div className="space-y-6">
      <IsolationForm
        ref={isolationRef}
        mode="create"
        onSaveSuccess={handleSaveComplete}
      />
    </div>
  )
}
