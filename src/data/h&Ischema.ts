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
