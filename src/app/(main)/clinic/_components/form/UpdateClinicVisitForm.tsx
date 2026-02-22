"use client"

import { forwardRef } from "react"
import ClinicVisitForm, { ClinicVisitFormRef } from "./ClinicVisitForm"

// Wrapper component dedicated to updating existing clinic visits
const UpdateClinicVisitForm = forwardRef<ClinicVisitFormRef, Omit<React.ComponentProps<typeof ClinicVisitForm>, "mode">>(
  function UpdateClinicVisitForm(props, ref) {
    return <ClinicVisitForm ref={ref} mode="edit" {...props} />
  },
)

export default UpdateClinicVisitForm
