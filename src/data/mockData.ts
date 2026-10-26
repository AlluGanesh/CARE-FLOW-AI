import { 
  Tenant, 
  User, 
  Patient, 
  CareTask, 
  CarePlan, 
  Appointment, 
  DiagnosticReport, 
  NotificationItem, 
  EscalationItem, 
  AgentExecutionTrace,
  AuditEvent 
} from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-apex',
    name: 'Apex Multispeciality Clinic',
    city: 'South Extension, New Delhi',
    subscriptionPlan: 'Growth',
    activeDoctorsCount: 6,
    patientsCount: 412
  },
  {
    id: 'tenant-metro',
    name: 'Metro Heart & Metabolic Center',
    city: 'Indiranagar, Bengaluru',
    subscriptionPlan: 'Professional',
    activeDoctorsCount: 12,
    patientsCount: 1140
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-dr-roy',
    tenantId: 'tenant-apex',
    name: 'Dr. Ananya Roy, MD',
    role: 'DOCTOR',
    email: 'dr.roy@apexclinic.health',
    specialty: 'Internal Medicine & Cardiology'
  },
  {
    id: 'usr-dr-sharma',
    tenantId: 'tenant-apex',
    name: 'Dr. Rajesh Sharma, MD',
    role: 'DOCTOR',
    email: 'dr.sharma@apexclinic.health',
    specialty: 'Endocrinology & Diabetology'
  },
  {
    id: 'usr-nurse-meera',
    tenantId: 'tenant-apex',
    name: 'Meera Nair, RN',
    role: 'NURSE',
    email: 'meera.nair@apexclinic.health'
  },
  {
    id: 'usr-admin-vikram',
    tenantId: 'tenant-apex',
    name: 'Vikram Seth',
    role: 'CLINIC_ADMIN',
    email: 'admin@apexclinic.health'
  },
  {
    id: 'usr-patient-priya',
    tenantId: 'tenant-apex',
    name: 'Priya Patel',
    role: 'PATIENT',
    email: 'priya.patel@example.com'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-100',
    tenantId: 'tenant-apex',
    name: 'Ananya Rao',
    age: 42,
    gender: 'Female',
    phone: '+91 98450 11223',
    email: 'ananya.rao@example.com',
    preferredLanguage: 'en',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-sharma',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus Follow-Up',
    lastVisitDate: '2026-10-24',
    avatarBg: '#ec4899'
  },
  {
    id: 'pat-101',
    tenantId: 'tenant-apex',
    name: 'Priya Patel',
    age: 48,
    gender: 'Female',
    phone: '+91 98112 34567',
    email: 'priya.patel@example.com',
    preferredLanguage: 'en',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-sharma',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus & Borderline Microalbuminuria',
    lastVisitDate: '2026-10-21',
    avatarBg: '#0ea5e9'
  },
  {
    id: 'pat-102',
    tenantId: 'tenant-apex',
    name: 'Rahul Verma',
    age: 56,
    gender: 'Male',
    phone: '+91 98201 87654',
    email: 'rahul.verma@example.com',
    preferredLanguage: 'hi',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-roy',
    primaryDiagnosis: 'Post-PCI Stent (LAD) - 3 Month Follow-Up',
    lastVisitDate: '2026-10-18',
    avatarBg: '#8b5cf6'
  },
  {
    id: 'pat-103',
    tenantId: 'tenant-apex',
    name: 'Sarah Jenkins',
    age: 34,
    gender: 'Female',
    phone: '+91 97110 54321',
    email: 'sarah.j@example.com',
    preferredLanguage: 'en',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-roy',
    primaryDiagnosis: 'Hypothyroidism Post-Thyroidectomy',
    lastVisitDate: '2026-10-22',
    avatarBg: '#06b6d4'
  },
  {
    id: 'pat-104',
    tenantId: 'tenant-apex',
    name: 'Amit Kumar',
    age: 29,
    gender: 'Male',
    phone: '+91 99991 12233',
    email: 'amit.kumar@example.com',
    preferredLanguage: 'en',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-sharma',
    primaryDiagnosis: 'Asthma Exacerbation & Bronchial Hyperactivity',
    lastVisitDate: '2026-10-14',
    avatarBg: '#10b981'
  },
  {
    id: 'pat-105',
    tenantId: 'tenant-metro',
    name: 'Kavita Sundaram',
    age: 62,
    gender: 'Female',
    phone: '+91 94441 55667',
    email: 'kavita.s@example.com',
    preferredLanguage: 'en',
    consentGiven: true,
    assignedDoctorId: 'usr-dr-roy',
    primaryDiagnosis: 'Stage 2 Hypertension & Potassium Check',
    lastVisitDate: '2026-10-19',
    avatarBg: '#f59e0b'
  }
];

export const INITIAL_TASKS: CareTask[] = [
  {
    id: 'task-01',
    carePlanId: 'cp-101',
    patientId: 'pat-101',
    title: 'Complete Fasting HbA1c & Urine ACR Test',
    description: 'Patient must complete fasting blood draw and spot urine albumin-creatinine ratio at designated diagnostic partner before follow-up.',
    category: 'LAB_REPORT',
    ownerRole: 'PATIENT',
    dueDate: '2026-10-23', // Overdue relative to current local time (Oct 24)
    status: 'OVERDUE',
    priority: 'HIGH',
    sourceEvidenceText: 'Prescribed HbA1c and spot urine microalbumin test. Must be done before next visit.',
    requiresEvidence: true,
    isAmbiguousDate: false
  },
  {
    id: 'task-02',
    carePlanId: 'cp-101',
    patientId: 'pat-101',
    title: 'Schedule Doctor Review Appointment (7-10 Days)',
    description: 'Book follow-up slot with Dr. Rajesh Sharma with diagnostic report in hand.',
    category: 'APPOINTMENT',
    ownerRole: 'RECEPTIONIST',
    dueDate: '2026-10-26',
    status: 'PENDING',
    priority: 'MEDIUM',
    sourceEvidenceText: 'Review in clinic in 7 to 10 days with lab test reports.',
    isAmbiguousDate: false
  },
  {
    id: 'task-03',
    carePlanId: 'cp-101',
    patientId: 'pat-101',
    title: 'Self-Record 3-Day Morning Fasting Blood Glucose',
    description: 'Log glucometer readings daily before breakfast in patient portal app.',
    category: 'SELF_MONITORING',
    ownerRole: 'PATIENT',
    dueDate: '2026-10-25',
    status: 'PENDING',
    priority: 'LOW',
    sourceEvidenceText: 'Please keep daily fasting sugar log for 3 consecutive days.',
    patientCompleted: false
  },
  {
    id: 'task-04',
    carePlanId: 'cp-102',
    patientId: 'pat-102',
    title: 'Echocardiogram (Echo) & Lipid Profile Report Review',
    description: 'Upload diagnostic hospital report for cardiology staff assessment.',
    category: 'LAB_REPORT',
    ownerRole: 'NURSE',
    dueDate: '2026-10-22',
    status: 'ESCALATED',
    priority: 'CRITICAL',
    sourceEvidenceText: '2D Echo and lipid profile must be reviewed to adjust dual antiplatelet therapy.',
    isAmbiguousDate: false,
    ambiguityNote: 'Overdue by 48 hrs with no patient response to SMS notification.'
  },
  {
    id: 'task-05',
    carePlanId: 'cp-103',
    patientId: 'pat-103',
    title: 'Serum TSH & Free T4 Test',
    description: 'Thyroid function test prior to dosage titration.',
    category: 'LAB_REPORT',
    ownerRole: 'PATIENT',
    dueDate: '2026-10-27',
    status: 'APPROVED',
    priority: 'HIGH',
    sourceEvidenceText: 'Check TSH and FT4 in 6 weeks, bring report to OPD.',
    isAmbiguousDate: false
  },
  {
    id: 'task-06',
    carePlanId: 'cp-104',
    patientId: 'pat-104',
    title: 'Follow-up Call for Inhaler Compliance & Peak Flow',
    description: 'Nurse coordinator follow-up call to assess respiratory wheezing status.',
    category: 'FOLLOWUP_CALL',
    ownerRole: 'NURSE',
    dueDate: '2026-10-24',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    sourceEvidenceText: 'Coordinator check-in call at 7 days to verify Budesonide inhaler adherence.',
    clinicianVerified: true
  }
];

export const INITIAL_CARE_PLANS: CarePlan[] = [
  {
    id: 'cp-101',
    tenantId: 'tenant-apex',
    consultationId: 'cons-01',
    patientId: 'pat-101',
    doctorId: 'usr-dr-sharma',
    version: 1,
    status: 'IN_PROGRESS',
    approvedAt: '2026-10-21 11:45',
    approvedBy: 'Dr. Rajesh Sharma, MD',
    rawInstructions: 'Continue Metformin 500mg BD. Prescribed HbA1c and spot urine microalbumin test. Must be done before next visit. Review in clinic in 7 to 10 days with lab test reports. Please keep daily fasting sugar log for 3 consecutive days.',
    groundingConfidence: 99.1,
    tasks: INITIAL_TASKS.slice(0, 3),
    ambiguityFlags: []
  },
  {
    id: 'cp-102',
    tenantId: 'tenant-apex',
    consultationId: 'cons-02',
    patientId: 'pat-102',
    doctorId: 'usr-dr-roy',
    version: 1,
    status: 'IN_PROGRESS',
    approvedAt: '2026-10-18 16:20',
    approvedBy: 'Dr. Ananya Roy, MD',
    rawInstructions: 'Maintain Aspirin 75mg + Ticagrelor 90mg BD. 2D Echo and lipid profile must be reviewed to adjust dual antiplatelet therapy. Return in 3 weeks.',
    groundingConfidence: 97.8,
    tasks: [INITIAL_TASKS[3]],
    ambiguityFlags: ['Ambiguous date: "in 3 weeks" requires explicit calendar selection']
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01',
    tenantId: 'tenant-apex',
    patientId: 'pat-101',
    patientName: 'Priya Patel',
    doctorId: 'usr-dr-sharma',
    doctorName: 'Dr. Rajesh Sharma',
    dateTime: '2026-10-26 10:30 AM',
    durationMinutes: 20,
    type: 'In-Person Follow-Up',
    status: 'CONFIRMED'
  },
  {
    id: 'apt-02',
    tenantId: 'tenant-apex',
    patientId: 'pat-103',
    patientName: 'Sarah Jenkins',
    doctorId: 'usr-dr-roy',
    doctorName: 'Dr. Ananya Roy',
    dateTime: '2026-10-27 02:00 PM',
    durationMinutes: 15,
    type: 'Lab Review',
    status: 'PENDING'
  },
  {
    id: 'apt-03',
    tenantId: 'tenant-apex',
    patientId: 'pat-102',
    patientName: 'Rahul Verma',
    doctorId: 'usr-dr-roy',
    doctorName: 'Dr. Ananya Roy',
    dateTime: '2026-10-28 11:15 AM',
    durationMinutes: 30,
    type: 'In-Person Follow-Up',
    status: 'CONFIRMED'
  }
];

export const INITIAL_REPORTS: DiagnosticReport[] = [
  {
    id: 'rep-01',
    tenantId: 'tenant-apex',
    patientId: 'pat-101',
    patientName: 'Priya Patel',
    taskId: 'task-01',
    testName: 'Comprehensive Metabolic & HbA1c Panel',
    uploadedAt: '2026-10-24 09:12 AM',
    status: 'PENDING_REVIEW',
    ocrExtracted: {
      keyValues: {
        'HbA1c': '7.9% (High)',
        'Fasting Blood Glucose': '148 mg/dL (High)',
        'eGFR': '68 mL/min (Mild reduction)',
        'Urine Microalbumin/Creatinine': '42 mg/g (Microalbuminuria)'
      },
      flags: ['HbA1c > 7.0 target', 'Urine Microalbumin elevated']
    },
    fileUrl: 'hba1c_report_priya_oct24.pdf'
  },
  {
    id: 'rep-02',
    tenantId: 'tenant-apex',
    patientId: 'pat-104',
    patientName: 'Amit Kumar',
    taskId: 'task-06',
    testName: 'Spirometry & Peak Expiratory Flow',
    uploadedAt: '2026-10-23 04:45 PM',
    status: 'VERIFIED_NORMAL',
    ocrExtracted: {
      keyValues: {
        'FEV1 / FVC Ratio': '81% (Normal)',
        'Peak Expiratory Flow': '460 L/min'
      },
      flags: ['Adequate bronchodilator response']
    },
    fileUrl: 'spirometry_amit_oct23.pdf'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    tenantId: 'tenant-apex',
    patientId: 'pat-101',
    patientName: 'Priya Patel',
    channel: 'WHATSAPP',
    scheduledFor: '2026-10-22 09:00 AM',
    sentAt: '2026-10-22 09:01 AM',
    status: 'DELIVERED',
    messageText: 'Hello Priya, Dr. Rajesh Sharma has scheduled your Fasting HbA1c test. Please visit Metropolis Lab before Oct 23. Tap to view prep: careflow.ai/p/t01',
    retryCount: 0,
    language: 'en'
  },
  {
    id: 'notif-02',
    tenantId: 'tenant-apex',
    patientId: 'pat-102',
    patientName: 'Rahul Verma',
    channel: 'SMS',
    scheduledFor: '2026-10-23 10:00 AM',
    sentAt: '2026-10-23 10:02 AM',
    status: 'FAILED_RETRYING',
    messageText: 'नमस्ते राहुल जी, डॉ. अनन्या रॉय द्वारा अनुशंसित 2D Echo परीक्षण रिपोर्ट लंबित है। कृपया आज ही अपलोड करें: careflow.ai/p/t04',
    retryCount: 2,
    language: 'hi'
  },
  {
    id: 'notif-03',
    tenantId: 'tenant-apex',
    patientId: 'pat-103',
    patientName: 'Sarah Jenkins',
    channel: 'EMAIL',
    scheduledFor: '2026-10-24 08:30 AM',
    sentAt: '2026-10-24 08:30 AM',
    status: 'DELIVERED',
    messageText: 'Reminder: Scheduled Follow-Up Appointment with Dr. Roy on Oct 27, 2:00 PM at Apex Multispeciality Clinic.',
    retryCount: 0,
    language: 'en'
  }
];

export const INITIAL_ESCALATIONS: EscalationItem[] = [
  {
    id: 'esc-01',
    tenantId: 'tenant-apex',
    taskId: 'task-04',
    patientId: 'pat-102',
    patientName: 'Rahul Verma',
    category: 'OVERDUE_CRITICAL_REPORT',
    urgency: 'CRITICAL',
    status: 'OPEN',
    assignedToRole: 'NURSE',
    assignedToName: 'Meera Nair, RN',
    summary: 'Post-PCI cardiac patient Echo & Lipid report overdue by 48h. Two automated SMS alerts failed or unanswered.',
    createdAt: '2026-10-24 09:30 AM'
  },
  {
    id: 'esc-02',
    tenantId: 'tenant-apex',
    taskId: 'task-01',
    patientId: 'pat-101',
    patientName: 'Priya Patel',
    category: 'UNRESPONSIVE_PATIENT',
    urgency: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToRole: 'RECEPTIONIST',
    assignedToName: 'Frontdesk Team',
    summary: 'Fasting blood test overdue by 1 day. Patient consultation scheduled for Oct 26; receptionist requested to confirm patient attendance.',
    createdAt: '2026-10-24 10:15 AM',
    resolutionNote: 'Patient contacted; report uploaded via portal this morning.'
  }
];

export const INITIAL_AGENT_TRACES: AgentExecutionTrace[] = [
  {
    id: 'tr-01',
    timestamp: '2026-10-24 11:14:02',
    agentNumber: 1,
    agentName: 'Care Plan Intelligence Agent',
    status: 'SUCCESS',
    latencyMs: 780,
    logMessage: 'Successfully extracted 3 structured follow-up tasks from Dr. Sharma instructions with 99.1% grounding recall.',
    toolCalls: ['extract_entities(instructions)', 'resolve_temporal_deadlines("7-10 days")', 'schema_validator(tasks)']
  },
  {
    id: 'tr-02',
    timestamp: '2026-10-24 11:14:03',
    agentNumber: 6,
    agentName: 'Audit & Verification Agent',
    status: 'SUCCESS',
    latencyMs: 310,
    logMessage: 'Zero unsupported hallucinated tasks. Evidence text bound to span [32:118]. Confidence 0.991. Sent to Clinician Approval Checkpoint.',
    toolCalls: ['grounding_verifier(source_text, proposed_tasks)', 'detect_unsupported_claims()']
  },
  {
    id: 'tr-03',
    timestamp: '2026-10-24 11:14:05',
    agentNumber: 2,
    agentName: 'Scheduling Agent',
    status: 'SUCCESS',
    latencyMs: 420,
    logMessage: 'Identified 4 valid slots for Dr. Sharma between Oct 26 and Oct 29. Transmitted hold token to Outbox.',
    toolCalls: ['query_doctor_calendar("usr-dr-sharma", "2026-10-26/29")', 'check_clinic_hours()']
  },
  {
    id: 'tr-04',
    timestamp: '2026-10-24 11:14:10',
    agentNumber: 3,
    agentName: 'Patient Engagement Agent',
    status: 'SUCCESS',
    latencyMs: 390,
    logMessage: 'Selected Template DIABETES_LAB_REMINDER_EN. Verified patient consent=true. Scheduled outbox dispatch for WhatsApp.',
    toolCalls: ['template_selector("LAB_REPORT", lang="en")', 'verify_consent("pat-101")', 'enqueue_outbox()']
  },
  {
    id: 'tr-05',
    timestamp: '2026-10-24 11:14:15',
    agentNumber: 4,
    agentName: 'Follow-Up Monitoring Agent',
    status: 'FLAGGED',
    latencyMs: 610,
    logMessage: 'Cron evaluation detected Task-04 overdue by 48 hours for Post-PCI patient Rahul Verma. Triggered Escalation Agent.',
    toolCalls: ['evaluate_task_deadlines(tenant="tenant-apex")', 'flag_overdue("task-04")']
  },
  {
    id: 'tr-06',
    timestamp: '2026-10-24 11:14:16',
    agentNumber: 5,
    agentName: 'Escalation Agent',
    status: 'SUCCESS',
    latencyMs: 340,
    logMessage: 'Raised Critical Escalation Ticket ESC-01 routed to Nurse Meera Nair. Prepared clinical summary context card.',
    toolCalls: ['create_escalation_ticket(priority="CRITICAL", role="NURSE")', 'notify_staff_queue("usr-nurse-meera")']
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-01',
    tenantId: 'tenant-apex',
    timestamp: '2026-10-24 11:14:16',
    actorName: 'Agent 5: Escalation Agent',
    actorRole: 'NURSE',
    action: 'CREATE_ESCALATION',
    resourceId: 'esc-01',
    resourceType: 'Escalation',
    details: 'Auto-escalated overdue cardiac report for Rahul Verma (pat-102)'
  },
  {
    id: 'aud-02',
    tenantId: 'tenant-apex',
    timestamp: '2026-10-24 10:45:00',
    actorName: 'Priya Patel',
    actorRole: 'PATIENT',
    action: 'UPLOAD_DOCUMENT',
    resourceId: 'rep-01',
    resourceType: 'MedicalDocument',
    details: 'Uploaded Fasting HbA1c diagnostic panel PDF via Patient Portal'
  },
  {
    id: 'aud-03',
    tenantId: 'tenant-apex',
    timestamp: '2026-10-21 11:45:30',
    actorName: 'Dr. Rajesh Sharma, MD',
    actorRole: 'DOCTOR',
    action: 'APPROVE_CARE_PLAN',
    resourceId: 'cp-101',
    resourceType: 'CarePlan',
    details: 'Doctor approved care plan v1 with 3 follow-up tasks'
  }
];

// Preset realistic clinical consultation scenarios for testing AI Care Plan Extraction
export const CLINICAL_PRESETS = [
  {
    title: 'Type 2 Diabetes & Chronic Kidney Follow-Up',
    patientName: 'Priya Patel',
    patientId: 'pat-101',
    doctorId: 'usr-dr-sharma',
    notes: `Patient presents for 3-month diabetes review. Last fasting glucose 156 mg/dL.
1. Order repeat Fasting HbA1c and Serum Creatinine with spot Urine ACR in 5 days.
2. Schedule in-clinic review appointment in 7 days to assess renal parameters.
3. Patient must maintain daily fasting blood glucose log for 3 consecutive mornings.
4. Continue Metformin 500mg BD. If HbA1c remains >7.5%, will consider SGLT-2 inhibitor addition at review.`,
    expectedTasks: [
      {
        title: 'Complete Fasting HbA1c, Serum Creatinine & Urine ACR',
        category: 'LAB_REPORT',
        ownerRole: 'PATIENT',
        dueDate: 'Within 5 days',
        priority: 'HIGH',
        evidence: 'Order repeat Fasting HbA1c and Serum Creatinine with spot Urine ACR in 5 days.'
      },
      {
        title: 'Schedule In-Clinic Doctor Review Appointment',
        category: 'APPOINTMENT',
        ownerRole: 'RECEPTIONIST',
        dueDate: 'In 7 days',
        priority: 'HIGH',
        evidence: 'Schedule in-clinic review appointment in 7 days to assess renal parameters.'
      },
      {
        title: 'Maintain 3-Day Morning Fasting Glucose Log',
        category: 'SELF_MONITORING',
        ownerRole: 'PATIENT',
        dueDate: 'Next 3 days',
        priority: 'MEDIUM',
        evidence: 'Patient must maintain daily fasting blood glucose log for 3 consecutive mornings.'
      }
    ]
  },
  {
    title: 'Post-PCI Angioplasty Cardiology Check',
    patientName: 'Rahul Verma',
    patientId: 'pat-102',
    doctorId: 'usr-dr-roy',
    notes: `Status post-LAD drug-eluting stent placement 60 days ago.
1. Complete 2D Transthoracic Echocardiogram (Echo) to re-evaluate LVEF and wall motion before next visit.
2. Fasting Lipid Profile (Total Cholesterol, LDL, HDL, Triglycerides) to verify Atorvastatin 40mg efficacy.
3. Follow-up consultation in cardiology OPD in 2 weeks.
4. If chest discomfort or atypical dyspnea occurs, seek emergency care immediately.`,
    expectedTasks: [
      {
        title: '2D Transthoracic Echocardiogram (Echo)',
        category: 'LAB_REPORT',
        ownerRole: 'PATIENT',
        dueDate: 'Within 10 days',
        priority: 'CRITICAL',
        evidence: 'Complete 2D Transthoracic Echocardiogram (Echo) to re-evaluate LVEF and wall motion'
      },
      {
        title: 'Fasting Lipid Profile Test',
        category: 'LAB_REPORT',
        ownerRole: 'PATIENT',
        dueDate: 'Within 10 days',
        priority: 'HIGH',
        evidence: 'Fasting Lipid Profile (Total Cholesterol, LDL, HDL, Triglycerides) to verify Atorvastatin efficacy'
      },
      {
        title: 'Cardiology OPD Follow-Up Appointment',
        category: 'APPOINTMENT',
        ownerRole: 'RECEPTIONIST',
        dueDate: 'In 2 weeks',
        priority: 'HIGH',
        evidence: 'Follow-up consultation in cardiology OPD in 2 weeks.'
      }
    ]
  },
  {
    title: 'Post-Op Thyroidectomy & Calcium Monitoring',
    patientName: 'Sarah Jenkins',
    patientId: 'pat-103',
    doctorId: 'usr-dr-roy',
    notes: `Follow-up post total thyroidectomy Day 14. Surgical incision healing well.
1. Order Serum Calcium and Ionized Calcium test to rule out hypocalcemia.
2. Schedule review in 10 days.
3. Continue Levothyroxine 100mcg taken with water 30 mins before breakfast.
4. Report any tingling sensation around lips or fingers immediately to nurse hotline.`,
    expectedTasks: [
      {
        title: 'Serum & Ionized Calcium Blood Test',
        category: 'LAB_REPORT',
        ownerRole: 'PATIENT',
        dueDate: 'In 5 days',
        priority: 'CRITICAL',
        evidence: 'Order Serum Calcium and Ionized Calcium test to rule out hypocalcemia.'
      },
      {
        title: 'Post-Surgical Review Visit',
        category: 'APPOINTMENT',
        ownerRole: 'RECEPTIONIST',
        dueDate: 'In 10 days',
        priority: 'MEDIUM',
        evidence: 'Schedule review in 10 days.'
      }
    ]
  }
];

export interface ResearchDemoPreset {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  rawReportText: string;
}

export const RESEARCH_DEMO_PRESETS: ResearchDemoPreset[] = [
  {
    id: 'preset-ananya',
    patientId: 'pat-100',
    patientName: 'Ananya Rao',
    title: 'Ananya Rao — Diabetes Follow-Up Report',
    description: 'Type 2 Diabetes, HbA1c 8.2%, FBS 165 mg/dL, Metformin 500 mg',
    rawReportText: `Diagnosis: Type 2 Diabetes
HbA1c: 8.2%
Fasting Blood Sugar: 165 mg/dL
Medication: Metformin 500 mg
Follow-up: Review after 2 weeks.`
  },
  {
    id: 'preset-rahul',
    patientId: 'pat-102',
    patientName: 'Rahul Verma',
    title: 'Rahul Verma — Cardiology & Lipid Follow-Up',
    description: 'Hypertension, Dyslipidemia, BP 138/88 mmHg, Cholesterol 215 mg/dL',
    rawReportText: `Clinical Consultation Summary
Patient: Rahul Verma
Diagnosis: Hypertension, Dyslipidemia
Medical Tests:
- Blood Pressure: 138/88 mmHg
- Total Cholesterol: 215 mg/dL
- LDL Cholesterol: 132 mg/dL
- HDL Cholesterol: 42 mg/dL
- Serum Creatinine: 1.0 mg/dL
Prescribed Medications:
- Amlodipine 5 mg once daily
- Atorvastatin 20 mg once daily
Follow-up:
Review in cardiology outpatient clinic after 4 weeks. Repeat lipid panel in 3 months.`
  },
  {
    id: 'preset-priya',
    patientId: 'pat-101',
    patientName: 'Priya Patel',
    title: 'Priya Patel — Metabolic & Renal Screening',
    description: 'Type 2 Diabetes, Microalbuminuria, eGFR 68 mL/min, Urine ACR 45 mg/g',
    rawReportText: `Metabolic & Renal Diagnostic Follow-Up
Patient: Priya Patel
Diagnosis: Type 2 Diabetes Mellitus with Microalbuminuria
Laboratory Investigations:
- HbA1c: 7.9%
- Fasting Blood Sugar: 154 mg/dL
- Serum Creatinine: 1.2 mg/dL
- eGFR: 68 mL/min
- Urine Albumin/Creatinine: 45 mg/g
Medication:
- Metformin 500 mg twice daily
- Lisinopril 5 mg once daily
Follow-up:
Repeat Renal Function Panel in 6 weeks. Review with attending physician after 2 weeks. Upload laboratory report.`
  }
];

