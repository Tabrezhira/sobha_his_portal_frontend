// Grievance Status enum
export enum GrievanceStatus {
  Open = "Open",
  InProgress = "In Progress",
  Closed = "Closed",
  OnHold = "ON Hold",
}

// Main Grievance interface
export interface IGrievance {
  _id?: string;
  date: Date;
  employeeId: string;
  employeeName: string;
  insuranceID: string;
  trLocation: string;
  Manager: string;
  employeeMobile: string;
  sourceOfGrievance: string;
  grievanceRemarks?: string;
  typeOfIssue: string;
  issueDate: Date;
  closedDate?: Date;
  tatMins?: number;
  slaTatMins?: number;
  status: GrievanceStatus;
  rootCause?: string;
  correctiveAction?: string;
  correctiveActionStatus?: string;
  preventiveAction?: string;
  preventiveActionStatus?: string;
  responsibility?: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new grievance (without _id and timestamps)
export type CreateGrievanceInput = Omit<
  IGrievance,
  "_id" | "createdAt" | "updatedAt"
>;

// Type for updating a grievance
export type UpdateGrievanceInput = Partial<
  Omit<IGrievance, "_id" | "createdAt" | "updatedAt">
>;

// ========== Happiness Survey Types ==========

// Main Happiness Survey interface
export interface IHappinessSurvey {
  _id?: string;
  date: Date;
  time: string;
  empNo: string;
  empName: string;
  emiratesId?: string;
  insuranceId?: string;
  trLocation?: string;
  surveyor?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  q6?: number;
  overallRating?: number;
  suggestion?: string;
  happinessScore: number;
  photoUrl?: string;
  signatureUrl?: string;
  photoId?: string;
  signatureId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new happiness survey
export type CreateHappinessSurveyInput = Omit<
  IHappinessSurvey,
  "_id" | "createdAt" | "updatedAt"
>;

// Type for updating a happiness survey
export type UpdateHappinessSurveyInput = Partial<
  Omit<IHappinessSurvey, "_id" | "createdAt" | "updatedAt">
>;

// ========== Case Resolution Tracker Types ==========

// Main Case Resolution Tracker interface
export interface ICaseResolutionTracker {
  _id?: string;
  locationId?: string;
  date: Date;
  empId: string;
  empName: string;
  insuranceID: string;
  trLocation: string;
  MANAGER: string;
  empMobileNo: string;
  TypeOfAdmission: string;
  insuranceType: string;
  providerName: string;
  issue: string;
  typeOfIssue: string;
  issueDate: Date;
  closedDate?: Date;
  TAT?: number;
  slaTAT?: number;
  status?: string;
  rootCause?: string;
  correctiveAction?: string;
  correctiveActionStatus?: string;
  preventiveAction?: string;
  preventiveActionStatus?: string;
  responsibility?: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new case resolution tracker
export type CreateCaseResolutionTrackerInput = Omit<
  ICaseResolutionTracker,
  "_id" | "createdAt" | "updatedAt"
>;

// Type for updating a case resolution tracker
export type UpdateCaseResolutionTrackerInput = Partial<
  Omit<ICaseResolutionTracker, "_id" | "createdAt" | "updatedAt">
>;

// ========== Patient Type ==========

export interface IPatient {
  _id?: string;
  empId: string;
  PatientName: string;
  emiratesId?: string | null;
  insuranceId?: string | null;
  trLocation?: string | null;
  mobileNumber?: string | null;
}

// ========== IP Admission Types ==========

export type CaseTypeChange = "Normal" | "Critical" | "High Critical";

export interface IpNewVisitsPopup {
  hospitalCase: string;
  empNo: string;
  empName: string;
  trlocation: string;
  caseTypeChange: CaseTypeChange;
}

export interface TechnicianVisit {
  technicianFeedback?: string;
  physicianFeedback?: string;
}

export interface IpNewVisitsEmployeeNotInHISForm {
  empNo: string;
  hiManagers: string;
  caseTypeChange: CaseTypeChange;
  hospitalName: string;
  dateOfAdmission: Date;
  technicianVisits: TechnicianVisit[];
  treatmentUndergone: string;
}



export type HospitalFollowUp = {
  date?: string | Date;
  remarks?: string;
};

export interface IpRepeatVisitFormHospitalPart {
  locationId?: string;

  clinicVisitToken?: string;

  empNo?: string;
  employeeName?: string;

  emiratesId?: string;
  insuranceId?: string;

  trLocation?: string;
  mobileNumber?: string;

  hospitalName?: string;
  dateOfAdmission?: string | Date;

  natureOfCase?: string;
  caseCategory?: string;

  primaryDiagnosis?: string;
  secondaryDiagnosis?: string[];

  status?: string;

  dischargeSummaryReceived?: boolean;
  dateOfDischarge?: string | Date;
  daysHospitalized?: number;

  followUp?: HospitalFollowUp[];

  fitnessStatus?: string;

  isolationRequired?: boolean;

  finalRemarks?: string;
  createdBy?: string;
}

export interface IpRepeatVisitFormManagerPart {
  hiManagers?: string;

  admissionMode?: string;
  admissionType?: string;

  insuranceApprovalStatus?: string;

  treatmentUndergone?: string;

  imVisitStatus?: string;
  noOfVisits?: number;

  technicianVisits?: TechnicianVisit[];

  treatmentLocation?: string;
  placeOfLocation?: string;
  postRecoveryLocation?: string;

  fitToTravel?: boolean;
  postRehabRequired?: boolean;
  durationOfRehab?: number;

  followUpRequired?: boolean;
  rehabExtension?: boolean;
  rehabExtensionDuration?: number;

  memberResumeToWork?: Date;

  technicianFeedbackForm?: string;

  dischargedHI?: boolean;
  dodHI?: Date;

  source?: string;

  caseTypeChange?: CaseTypeChange;

  dischargeComments?: string;
  caseTypeChangeComments?: string;
}