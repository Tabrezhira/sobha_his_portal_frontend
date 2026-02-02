export type OverviewData = {
	date: string
	"Rows written": number
	"Rows read": number
	Queries: number
	"Payments completed": number
	"Sign ups": number
	Logins: number
	"Sign outs": number
	"Support calls": number
}

export type Usage = {
	owner: string
	status: string
	costs: number
	region: string
	stability: number
	lastEdited: string
}

export type ClinicVisitMedicine = {
	name?: string
	course?: string
	expiryDate?: Date | string
}

export type ClinicVisitFollowUp = {
	visitDate?: Date | string
	visitRemarks?: string
}

export type ClinicVisitReferral = {
	referralCode?: string
	referralType?: string
	referredToHospital?: string
	visitDateReferral?: Date | string
	specialistType?: string
	doctorName?: string
	investigationReports?: string
	primaryDiagnosisReferral?: string
	secondaryDiagnosisReferral?: string[]
	nurseRemarksReferral?: string
	insuranceApprovalRequested?: boolean
	followUpRequired?: boolean
	followUpVisits?: ClinicVisitFollowUp[]
}

export type ClinicVisit = {
	locationId?: string

	slNo: number
	date: Date | string
	time: string

	empNo: string
	employeeName: string

	emiratesId: string

	insuranceId?: string
	trLocation: string
	mobileNumber: string

	natureOfCase: string
	caseCategory: string

	nurseAssessment?: string[]
	symptomDuration?: string

	temperature?: number
	bloodPressure?: string
	heartRate?: number

	others?: string

	tokenNo: string
	sentTo?: string
	providerName?: string

	doctorName?: string

	primaryDiagnosis?: string
	secondaryDiagnosis?: string[]

	medicines?: ClinicVisitMedicine[]

	sickLeaveStatus?: "Approved" | "Not Approved"
	sickLeaveStartDate?: Date | string
	sickLeaveEndDate?: Date | string
	totalSickLeaveDays?: number
	remarks?: string

	referrals?: ClinicVisitReferral[]

	visitStatus?: "Open" | "Closed" | "Referred" | "Other"

	finalRemarks?: string
	ipAdmissionRequired?: boolean
	createdBy: string
}

export type HospitalFollowUp = {
	date?: Date | string
	remarks?: string
}

export type Hospital = {
	locationId?: string
	sno: number

	empNo: string
	employeeName: string

	emiratesId: string
	insuranceId?: string

	trLocation?: string
	mobileNumber?: string

	hospitalName?: string
	dateOfAdmission?: Date | string

	natureOfCase?: string
	caseCategory?: string

	primaryDiagnosis?: string
	secondaryDiagnosis?: string[]

	status?: string

	dischargeSummaryReceived?: boolean
	dateOfDischarge?: Date | string
	daysHospitalized?: number

	followUp?: HospitalFollowUp[]

	fitnessStatus?: string

	isolationRequired?: boolean

	finalRemarks?: string
	createdBy: string
}

export type Isolation = {
	locationId?: string

	siNo: number

	empNo: string
	type?: string

	employeeName: string

	emiratesId: string
	insuranceId?: string

	mobileNumber?: string
	trLocation?: string

	isolatedIn?: string
	isolationReason?: string

	nationality?: string

	slUpto?: Date | string

	dateFrom?: Date | string
	dateTo?: Date | string

	currentStatus?: string

	remarks?: string
	createdBy: string
}

export type User = {
	name?: string
	empId?: string
	email?: string
	password?: string
	role?: "staff" | "manager" | "superadmin"
	locationId: string
}

export type Patient = {
	_id?: string
	empId: string
	PatientName: string
	emiratesId?: string | null
	insuranceId?: string | null
	trLocation?: string | null
	mobileNumber?: string | null
}

export type DropdownResponse = {
	success: boolean
	data: string[]
}

export type DropdownGroupsResponse = {
	success: boolean
	data: {
		dropdown: string[]
		inputsearch: string[]
	}
}

export const dropdown = {
	trLocation: "TR LOCATION",
	natureOfCase: "NATURE OF CASE",
	caseCategory: "CASE CATEGORY",
	symptomDuration: "SYMPTOM DURATION",
	sentTo: "SENT TO",
	trHomeCare: "TR HOME CARE",
	trTeleHealth: "TR TELE-HEALTH",
	medicineCourse: "MEDICINE  COURSE",
	sickLeaveStatus: "SICK LEAVE STATUS",
	referral: "REFERRAL",
	referralType: "REFERRAL TYPE",
	specialistType: "SPECIALIST TYPE",
	externalProvider: "EXTERNAL PROVIDER",
	insuranceApproval: "INSURANCE APPROVAL REQUESTS",
	followUpRequired: "FOLLOW UP  REQUIRED",
	visitStatus: "VISIT STATUS",
	ipAdmission: "IP ADMISSION",
} as const

export const inputsearch = {
	nurseAssessment: "NURSE ASSESMENT",
	primaryDiagnosis: "PRIMARY DIAGNOSIS",
	medicineName: "medicine Name",
} as const

export type DropdownCategory = (typeof dropdown)[keyof typeof dropdown]

export type InputSearchCategory =
	(typeof inputsearch)[keyof typeof inputsearch]

export const dropdownData: DropdownGroupsResponse = {
	success: true,
	data: {
		dropdown: [
			"TR LOCATION",
			"NATURE OF CASE",
			"CASE CATEGORY",
			"SYMPTOM DURATION",
			"SENT TO",
			"TR HOME CARE",
			"TR TELE-HEALTH",
			"MEDICINE  COURSE",
			"SICK LEAVE STATUS",
			"REFERRAL",
			"REFERRAL TYPE",
			"SPECIALIST TYPE",
			"EXTERNAL PROVIDER",
			"INSURANCE APPROVAL REQUESTS",
			"FOLLOW UP  REQUIRED",
			"VISIT STATUS",
			"IP ADMISSION",
		],
		inputsearch: [
			"NURSE ASSESMENT",
			"PRIMARY DIAGNOSIS",
			"medicine Name",
		],
	},
}

export const dropdownCategories = {
	...dropdown,
	...inputsearch,
} as const

