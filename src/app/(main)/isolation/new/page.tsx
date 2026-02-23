"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import IsolationCreateForm, { IsolationCreateFormRef } from "@/app/(main)/isolation/_components/form/IsolationCreateForm"

export default function IsolationNewPage() {
  const router = useRouter()
  const isolationRef = useRef<IsolationCreateFormRef>(null)

  const handleSaveComplete = () => {
    toast.success("Isolation record saved successfully.")
    router.push("/isolation")
  }

  return (
    <div className="space-y-6">
      <IsolationCreateForm
        ref={isolationRef}
        onSaveSuccess={handleSaveComplete}
      />
    </div>
  )
}
