"use client"

import { forwardRef } from "react"
import ClinicVisitForm, { ClinicVisitFormRef } from "./ClinicVisitForm"

// Wrapper component dedicated to creating new clinic visits
const NewClinicVisitForm = forwardRef<ClinicVisitFormRef, Omit<React.ComponentProps<typeof ClinicVisitForm>, "mode">>(
  function NewClinicVisitForm(props, ref) {
    return <ClinicVisitForm ref={ref} mode="create" {...props} />
  },
)

export default NewClinicVisitForm
