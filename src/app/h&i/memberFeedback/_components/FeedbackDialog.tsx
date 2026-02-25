"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/Dialog"
import { Card } from "@/components/Card"
import EmployeeSummary from "@/components/forms/EmployeeSummary"
import MemberFeedbackForm from "./MemberFeedbackForm"

import { ScrollArea } from "@/components/ui/scroll-area"

interface MemberFeedbackDialogProps {
    isOpen: boolean
    onClose: () => void
    data: any | null // raw data from row
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-900 dark:text-gray-50">
            {value}
        </p>
    </div>
)

export function MemberFeedbackDialog({
    isOpen,
    onClose,
    data,
}: MemberFeedbackDialogProps) {
    if (!data) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl sm:max-w-[70vw] w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <DialogTitle>Member Feedback Details</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        {/* Left Column: Top (Clinic Details) & Bottom (Member Feedback) */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* TOP: Clinic Details */}
                            <Card className="flex flex-col flex-1 p-0 overflow-hidden bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 max-h-[500px]">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                        Clinic Details
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1 p-4 bg-white dark:bg-gray-950">
                                    <div className="space-y-6">

                                        {/* Patient & Visit Info */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800">
                                                Patient & Visit Info
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                                <DetailItem label="Employee" value={`${data.empNo || "-"} - ${data.employeeName || data.name || "-"}`} />
                                                <DetailItem label="Emirates ID" value={data.emiratesId} />
                                                <DetailItem label="Mobile Number" value={data.mobileNumber} />
                                                <DetailItem label="Insurance ID" value={data.insuranceId} />
                                                <DetailItem label="TR Location" value={data.trLocation} />
                                                <DetailItem label="Date & Time" value={`${data.date ? new Date(data.date).toLocaleDateString() : "-"} ${data.time || ""}`} />
                                                <DetailItem label="Token No" value={data.tokenNo} />
                                                <DetailItem label="Visit Status" value={data.visitStatus} />
                                            </div>
                                        </div>

                                        {/* Assessment & Vitals */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800">
                                                Assessment & Vitals
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                                <DetailItem label="Nature of Case" value={data.natureOfCase} />
                                                <DetailItem label="Case Category" value={data.caseCategory} />
                                                <DetailItem label="Symptom Duration" value={data.symptomDuration} />
                                                <DetailItem label="Temperature" value={data.temperature ? `${data.temperature} °C` : "-"} />
                                                <DetailItem label="Blood Pressure" value={data.bloodPressure} />
                                                <DetailItem label="Heart Rate" value={data.heartRate ? `${data.heartRate} bpm` : "-"} />
                                                <div className="col-span-2 md:col-span-3">
                                                    <DetailItem label="Nurse Assessment" value={Array.isArray(data.nurseAssessment) ? data.nurseAssessment.join(", ") : (data.nurseAssessment || "-")} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Diagnosis & Treatment */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800">
                                                Diagnosis & Treatment
                                            </h4>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                                <div className="col-span-2 lg:col-span-3 flex flex-col gap-3">
                                                    <DetailItem label="Primary Diagnosis" value={data.primaryDiagnosis} />
                                                    {Array.isArray(data.secondaryDiagnosis) && data.secondaryDiagnosis.length > 0 && (
                                                        <DetailItem label="Secondary Diagnosis" value={data.secondaryDiagnosis.join(", ")} />
                                                    )}
                                                </div>
                                                <div className="col-span-2 lg:col-span-3">
                                                    <p className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Medicines</p>
                                                    {Array.isArray(data.medicines) && data.medicines.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {data.medicines.map((med: any, i: number) => (
                                                                <div key={med._id || i} className="bg-gray-50 dark:bg-gray-900 rounded-md p-2 text-xs border border-gray-100 dark:border-gray-800 flex justify-between items-center gap-2">
                                                                    <span className="font-medium truncate" title={med.name}>{med.name}</span>
                                                                    <span className="shrink-0 text-gray-500">{med.course}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="font-medium text-gray-900 dark:text-gray-50">-</p>
                                                    )}
                                                </div>
                                                <DetailItem label="Sick Leave Status" value={data.sickLeaveStatus} />
                                                <DetailItem label="Sick Leave Days" value={data.totalSickLeaveDays} />
                                                {(data.sickLeaveStartDate || data.sickLeaveEndDate) && (
                                                    <DetailItem label="Sick Leave Dates" value={`${data.sickLeaveStartDate ? new Date(data.sickLeaveStartDate).toLocaleDateString() : ""} - ${data.sickLeaveEndDate ? new Date(data.sickLeaveEndDate).toLocaleDateString() : ""}`} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Referral & Follow Up */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800">
                                                Referral & Additional Details
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                                <DetailItem label="Provider Name" value={data.providerName} />
                                                <DetailItem label="Sent To" value={data.sentTo} />
                                                <DetailItem label="Doctor Name" value={data.doctorName} />

                                                <DetailItem label="Referral" value={data.referral ? "Yes" : "No"} />
                                                {data.referral && (
                                                    <>
                                                        <DetailItem label="Referred To" value={data.referredToHospital || data.referredTo} />
                                                        <DetailItem label="Specialist Type" value={data.specialistType} />
                                                    </>
                                                )}
                                                <div className="col-span-2 md:col-span-3">
                                                    <DetailItem label="Remarks" value={data.remarks} />
                                                    {data.finalRemarks && <DetailItem label="Final Remarks" value={data.finalRemarks} />}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </ScrollArea>
                            </Card>

                            {/* BOTTOM: Member Feedback */}
                            <Card className="flex-1 p-6 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 min-h-[300px]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                                    Member Feedback
                                </h3>
                                {/* Feedback Content */}
                                <MemberFeedbackForm clinicId={data._id} employeeId={data.empNo} />
                            </Card>
                        </div>

                        {/* RIGHT SIDE: Employee Clinic History */}
                        <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
                            <EmployeeSummary
                                empId={data.empNo}
                                className="flex-1 h-full overflow-y-auto bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                            />
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
