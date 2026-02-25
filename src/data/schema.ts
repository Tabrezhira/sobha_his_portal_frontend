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

export type ClinicVisit = {
	_id?: string
	locationId?: string

	date?: string | Date
	time?: string

	empNo?: string
	employeeName?: string
	dateOfJoining?: string
	eligibilityForSickLeave?: boolean

	emiratesId?: string

	insuranceId?: string
	trLocation?: string
	mobileNumber?: string

	natureOfCase?: string
	caseCategory?: string

	nurseAssessment?: string[]
	symptomDuration?: string

	temperature?: string | number
	bloodPressure?: string
	heartRate?: string | number

	others?: string

	tokenNo?: string
	sentTo?: string
	providerName?: string

	doctorName?: string

	primaryDiagnosis?: string
	secondaryDiagnosis?: string[]

	medicines?: ClinicVisitMedicine[]

	sickLeaveStatus?: string
	sickLeaveStartDate?: string | Date
	sickLeaveEndDate?: string | Date
	totalSickLeaveDays?: string | number
	remarks?: string

	referral?: boolean
	referralCode?: string
	referralType?: string
	referredToHospital?: string
	visitDateReferral?: string | Date
	specialistType?: string
	doctorNameReferral?: string
	investigationReports?: string
	primaryDiagnosisReferral?: string
	secondaryDiagnosisReferral?: string[]
	nurseRemarksReferral?: string
	insuranceApprovalRequested?: boolean
	followUpRequired?: boolean
	followUpVisits?: ClinicVisitFollowUp[]

	visitStatus?: string

	finalRemarks?: string
	ipAdmissionRequired?: boolean
	createdBy?: string
}

export type HospitalFollowUp = {
	date?: string | Date
	remarks?: string
}

export type Hospital = {
	locationId?: string

	clinicVisitToken?: string

	empNo?: string
	employeeName?: string

	emiratesId?: string
	insuranceId?: string

	trLocation?: string
	mobileNumber?: string

	hospitalName?: string
	dateOfAdmission?: string | Date

	natureOfCase?: string
	caseCategory?: string

	primaryDiagnosis?: string
	secondaryDiagnosis?: string[]

	status?: string

	dischargeSummaryReceived?: boolean
	dateOfDischarge?: string | Date
	daysHospitalized?: number

	followUp?: HospitalFollowUp[]

	fitnessStatus?: string

	isolationRequired?: boolean

	finalRemarks?: string
	createdBy?: string
}

export type Isolation = {
	locationId?: string

	clinicVisitToken?: string

	empNo?: string
	type?: string

	employeeName?: string

	emiratesId?: string
	insuranceId?: string

	mobileNumber?: string
	trLocation?: string

	isolatedIn?: string
	isolationReason?: string

	nationality?: string

	slUpto?: string

	dateFrom?: string | Date
	dateTo?: string | Date

	currentStatus?: string

	remarks?: string
	createdBy?: string
}

export type User = (
	| {
		_id?: string
		name?: string
		empId?: string
		email?: string
		password?: string
		role: "Manager" | "manager"
		locationId: string
		managerLocation: string[] // Required for managers
		createdAt?: Date | string
		updatedAt?: Date | string
	}
	| {
		_id?: string
		name?: string
		empId?: string
		email?: string
		password?: string
		role?: "maleNurse" | "superadmin" | "CSR"
		locationId: string
		managerLocation?: never
		createdAt?: Date | string
		updatedAt?: Date | string
	}
)

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

	// ---- CRT ----
	crtCorrectiveActionStatus: "CRTCORRECTIVE ACTION STATUS",
	crtInsuranceType: "CRTINSURANCE TYPE",
	crtPreventiveActionStatus: "CRTPREVENTIVE ACTION STATUS",
	crtResponsibility: "CRTRESPONSIBILITY",
	crtStatus: "CRTSTATUS",
	crtTypeOfIssue: "CRTTYPE OF ISSUE",

	// ---- ENIH ----
	enihChangeCaseType: "ENIHCHANGE CASE TYPE",

	// ---- G ----
	gCorrectiveActionStatus: "GCORRECTIVE ACTION STATUS",
	gPreventiveActionStatus: "GPREVENTIVE ACTION STATUS",
	gResponsibility: "GRESPONSIBILITYTY",
	gSourceOfGrievance: "GSOURCE OF GRIEVANCE",
	gStatus: "GSTATUS",
	gTypeOfIssue: "GTYPE OF ISSUE",

	// ---- IP ----
	ipAdmissionMode: "IPADMISSION MODE",
	ipChangeCaseType: "IPCHANGE CASE TYPE",
	ipDischargedHI: "IPDISCHARGED-H&I",
	ipFitToTravel: "IPFIT TO TRAVEL",
	ipFollowUpRequired: "IPFOLLOWUP REQUIRED",
	ipImVisitStatus: "IPIM VISIT STATUS",
	ipInsuranceApprovalStatus: "IPINSURNACE APPROVAL STATUS",
	ipMemberResumeToWork: "IPMEMBER RESUME TO WORK",
	ipPostRehabRequired: "IPPOST REHAB REQUIRED",
	ipRehabExtension: "IPREHAB EXTENSION",

	// ---- MB ----
	mbReferredReqToSpecialist: "MBREFFERED REQ TO SPECIALIST",
	mbWasTreatmentEffective: "MBWAS TREATMENT EFFECTIVE",
	mbWasTreatmentEffective2: "MBWAS TREATMENT EFFECTIVE 2",


} as const

export const inputsearch = {
	nurseAssessment: "NURSE ASSESMENT",
	primaryDiagnosis: "PRIMARY DIAGNOSIS",
	medicineName: "medicine Name",
	providerName: "PROVIDER NAME"
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

			// --- Newly Added ---
			"CRTCORRECTIVE ACTION STATUS",
			"CRTINSURANCE TYPE",
			"CRTPREVENTIVE ACTION STATUS",
			"CRTRESPONSIBILITY",
			"CRTSTATUS",
			"CRTTYPE OF ISSUE",
			"ENIHCHANGE CASE TYPE",
			"GCORRECTIVE ACTION STATUS",
			"GPREVENTIVE ACTION STATUS",
			"GRESPONSIBILITYTY",
			"GSOURCE OF GRIEVANCE",
			"GSTATUS",
			"GTYPE OF ISSUE",
			"IPADMISSION MODE",
			"IPCHANGE CASE TYPE",
			"IPDISCHARGED-H&I",
			"IPFIT TO TRAVEL",
			"IPFOLLOWUP REQUIRED",
			"IPIM VISIT STATUS",
			"IPINSURNACE APPROVAL STATUS",
			"IPMEMBER RESUME TO WORK",
			"IPPOST REHAB REQUIRED",
			"IPREHAB EXTENSION",
			"MBREFFERED REQ TO SPECIALIST",
			"MBWAS TREATMENT EFFECTIVE",
			"MBWAS TREATMENT EFFECTIVE 2",

		],
		inputsearch: [
			"NURSE ASSESMENT",
			"PRIMARY DIAGNOSIS",
			"medicine Name",
			"CRTPROVIDER NAME",
		],
	},
}

export const dropdownCategories = {
	...dropdown,
	...inputsearch,
} as const

export type Summary = {
	success: boolean;
	data: {
		empNo: string;
		last90Days: {
			count: number;
			visits: {
				date: string;
				provider: string;
			}[];
		};
		allTimeTotalVisits: number;
		sickLeaveApprovedCount: number;
		totalReferrals: number;
		openReferrals: number;
	};
};

export type HappinessSurveyEligibility = {
	success: boolean
	data: {
		empId: string
		lastSurveyDate: string
		nextEligibleDate: string
	}
}

export type LeaveEligibility = {
	success: boolean
	data: {
		empNo: string
		doj: string
		leave: "eligible" | "not_eligible" | string
	}
}

