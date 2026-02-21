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

// Follow-up interface
export interface IFollowUp {
  followUpDate?: Date;
  remarks?: string;
}

// Technician Visit interface
export interface ITechnicianVisit {
  visitNumber?: number;
  technicianFeedback?: string;
  physicianFeedback?: string;
}

// Main IP Admission interface
export interface IIpAdmission {
  _id?: string;
  hospitalCase?: string; // ObjectId reference to Hospital
  empNo: string;
  name: string;
  emiratesId?: string;
  insuranceId?: string;
  trLocation?: string;
  mobileNumber?: string;
  hospitalName?: string;
  doa?: Date; // Date of Admission
  natureOfCase?: string;
  caseCategory?: string;
  caseType?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  status?: string;
  dischargeSummaryReceived?: boolean;
  dod?: Date; // Date of Discharge
  noOfDaysHospitalized?: number;
  followUps?: IFollowUp[];
  fitnessStatus?: string;
  exitStatus?: string;
  isolationOrRehabilitationRequired?: boolean;
  remarks?: string;
  hiManagers?: string;
  admissionMode?: string;
  admissionType?: string;
  insuranceApprovalStatus?: string;
  treatmentUndergone?: string;
  imVisitStatus?: string;
  noOfVisits?: number;
  technicianVisits?: ITechnicianVisit[];
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
  dischargeComments?: string;
  caseTypeChangeComments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new IP admission
export type CreateIpAdmissionInput = Omit<
  IIpAdmission,
  "_id" | "createdAt" | "updatedAt"
>;

// Type for updating an IP admission
export type UpdateIpAdmissionInput = Partial<
  Omit<IIpAdmission, "_id" | "createdAt" | "updatedAt">
>;

