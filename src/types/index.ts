// Core Type Definitions for CareFlow AI

export type UserRole = 
  | 'CLINIC_ADMIN' 
  | 'DOCTOR' 
  | 'NURSE' 
  | 'RECEPTIONIST' 
  | 'PATIENT';

export interface Tenant {
  id: string;
  name: string;
  city: string;
  subscriptionPlan: 'Starter' | 'Growth' | 'Professional' | 'Enterprise';
  activeDoctorsCount: number;
  patientsCount: number;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  preferredLanguage: 'en' | 'hi' | 'es';
  consentGiven: boolean;
  assignedDoctorId: string;
  primaryDiagnosis: string;
  lastVisitDate: string;
  avatarBg: string;
}

export type TaskStatus = 
  | 'DRAFT' 
  | 'APPROVED' 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'OVERDUE' 
  | 'ESCALATED' 
  | 'BLOCKED';

export type TaskCategory = 
  | 'APPOINTMENT' 
  | 'LAB_REPORT' 
  | 'MEDICATION' 
  | 'FOLLOWUP_CALL' 
  | 'SELF_MONITORING';

export interface CareTask {
  id: string;
  carePlanId: string;
  patientId: string;
  title: string;
  description: string;
  category: TaskCategory;
  ownerRole: 'PATIENT' | 'RECEPTIONIST' | 'NURSE' | 'DOCTOR';
  dueDate: string;
  status: TaskStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceEvidenceText: string;
  requiresEvidence?: boolean;
  isAmbiguousDate?: boolean;
  ambiguityNote?: string;
  evidenceUploaded?: string;
  patientCompleted?: boolean;
  clinicianVerified?: boolean;
}

export interface CarePlan {
  id: string;
  tenantId: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  version: number;
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
  rawInstructions: string;
  groundingConfidence: number; // e.g. 98.5%
  tasks: CareTask[];
  ambiguityFlags: string[];
}

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateTime: string;
  durationMinutes: number;
  type: 'In-Person Follow-Up' | 'Video Consultation' | 'Lab Review';
  status: 'CONFIRMED' | 'PENDING' | 'RESCHEDULED' | 'COMPLETED';
}

export interface DiagnosticReport {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  taskId: string;
  testName: string;
  uploadedAt: string;
  status: 'PENDING_REVIEW' | 'VERIFIED_NORMAL' | 'VERIFIED_CRITICAL';
  ocrExtracted: {
    keyValues: { [param: string]: string };
    flags: string[];
  };
  fileUrl?: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  taskId?: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'IN_APP';
  scheduledFor: string;
  sentAt?: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED_RETRYING' | 'RESPONDED';
  messageText: string;
  retryCount: number;
  language: 'en' | 'hi' | 'es';
}

export interface EscalationItem {
  id: string;
  tenantId: string;
  taskId: string;
  patientId: string;
  patientName: string;
  category: 'UNRESPONSIVE_PATIENT' | 'OVERDUE_CRITICAL_REPORT' | 'DOUBLE_BOOKING' | 'CLINICAL_QUERY';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedToRole: UserRole;
  assignedToName: string;
  summary: string;
  createdAt: string;
  resolutionNote?: string;
}

export interface AgentExecutionTrace {
  id: string;
  timestamp: string;
  agentNumber: 1 | 2 | 3 | 4 | 5 | 6;
  agentName: string;
  status: 'SUCCESS' | 'RUNNING' | 'FLAGGED' | 'IDLE';
  latencyMs: number;
  logMessage: string;
  toolCalls: string[];
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceId: string;
  resourceType: string;
  details: string;
}
