import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ClinicianApprovalView } from './components/ClinicianApprovalView';
import { PatientPortalView } from './components/PatientPortalView';
import { AgentOrchestratorView } from './components/AgentOrchestratorView';
import { TaskQueueView } from './components/TaskQueueView';
import { AppointmentsView } from './components/AppointmentsView';
import { ReportsView } from './components/ReportsView';
import { CommunicationsView } from './components/CommunicationsView';
import { AuditView } from './components/AuditView';
import { SimulateEventModal } from './components/SimulateEventModal';

import { 
  INITIAL_TENANTS, 
  INITIAL_USERS, 
  INITIAL_PATIENTS, 
  INITIAL_TASKS, 
  INITIAL_CARE_PLANS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_REPORTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ESCALATIONS, 
  INITIAL_AGENT_TRACES, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';

import { 
  Tenant, 
  UserRole, 
  CareTask, 
  Patient, 
  Appointment, 
  DiagnosticReport, 
  NotificationItem, 
  EscalationItem, 
  AgentExecutionTrace, 
  AuditEvent, 
  TaskStatus 
} from './types';

export function App() {
  // Master State
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('DOCTOR');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Entity State
  const [tasks, setTasks] = useState<CareTask[]>(INITIAL_TASKS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [reports, setReports] = useState<DiagnosticReport[]>(INITIAL_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [escalations, setEscalations] = useState<EscalationItem[]>(INITIAL_ESCALATIONS);
  const [agentTraces, setAgentTraces] = useState<AgentExecutionTrace[]>(INITIAL_AGENT_TRACES);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

  // Modal State
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-101');

  // Tenant-Scoped Data (Demonstrates Strict Multi-Tenant Isolation)
  const tenantPatients = patients.filter(p => p.tenantId === activeTenant.id);
  const tenantTasks = tasks.filter(t => {
    const pat = patients.find(p => p.id === t.patientId);
    return pat ? pat.tenantId === activeTenant.id : true;
  });
  const tenantAppointments = appointments.filter(a => a.tenantId === activeTenant.id);
  const tenantReports = reports.filter(r => r.tenantId === activeTenant.id);
  const tenantNotifications = notifications.filter(n => n.tenantId === activeTenant.id);
  const tenantEscalations = escalations.filter(e => e.tenantId === activeTenant.id);

  const overdueCount = tenantTasks.filter(t => t.status === 'OVERDUE').length;
  const escalationCount = tenantEscalations.filter(e => e.status === 'OPEN').length;

  // Helper to add audit logs
  const logAudit = (action: string, resId: string, resType: string, details: string) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}`,
      tenantId: activeTenant.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName: currentRole === 'DOCTOR' ? 'Dr. Rajesh Sharma, MD' : currentRole === 'NURSE' ? 'Meera Nair, RN' : 'Vikram Seth',
      actorRole: currentRole,
      action,
      resourceId: resId,
      resourceType: resType,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to add agent execution trace
  const addAgentTrace = (agentNum: 1 | 2 | 3 | 4 | 5 | 6, name: string, status: 'SUCCESS' | 'FLAGGED', msg: string, tools: string[]) => {
    const newTrace: AgentExecutionTrace = {
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      agentNumber: agentNum,
      agentName: name,
      status,
      latencyMs: Math.floor(Math.random() * 400) + 250,
      logMessage: msg,
      toolCalls: tools
    };
    setAgentTraces(prev => [newTrace, ...prev]);
  };

  // Handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'PATIENT') {
      setCurrentView('patient-portal');
    } else if (role === 'DOCTOR' && currentView === 'patient-portal') {
      setCurrentView('approval');
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    logAudit('UPDATE_TASK_STATUS', taskId, 'CareTask', `Status transitioned to ${newStatus}`);
    addAgentTrace(
      4,
      'Follow-Up Monitoring Agent',
      'SUCCESS',
      `Task #${taskId} state updated to ${newStatus}. Re-evaluating care plan loop completion.`,
      ['evaluate_task_deadlines()', 'update_task_state()']
    );
  };

  const handleApproveCarePlan = (stagedTasks: CareTask[], doctorNotes: string, patientId: string) => {
    const pat = patients.find(p => p.id === patientId) || patients[0];
    
    // Add tasks to global task pool
    setTasks(prev => [...stagedTasks, ...prev]);

    // Add Audit Log
    logAudit('APPROVE_CARE_PLAN', `cp-${Date.now()}`, 'CarePlan', `Clinician approved care plan for ${pat.name} with ${stagedTasks.length} tasks`);

    // Add Trace for Agent 1 & Agent 6 verification & Agent 3 outbox dispatch
    addAgentTrace(
      1,
      'Care Plan Intelligence Agent',
      'SUCCESS',
      `Extracted ${stagedTasks.length} follow-up tasks from clinician note for ${pat.name}.`,
      ['extract_entities()', 'schema_validator()']
    );

    addAgentTrace(
      6,
      'Audit & Verification Agent',
      'SUCCESS',
      `Clinician approval checkpoint verified. Zero unsupported additions detected. Tasks activated.`,
      ['verify_grounding()', 'human_checkpoint_approved()']
    );

    // Queue notification in Outbox via Agent 3
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenantId: activeTenant.id,
      patientId: pat.id,
      patientName: pat.name,
      channel: 'WHATSAPP',
      scheduledFor: 'Immediate',
      sentAt: 'Just now',
      status: 'DELIVERED',
      messageText: `Hello ${pat.name}, Dr. Sharma has finalized your approved follow-up care plan. Tap to view your tests: careflow.ai/p/${pat.id}`,
      retryCount: 0,
      language: pat.preferredLanguage
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAgentTrace(
      3,
      'Patient Engagement Agent',
      'SUCCESS',
      `Enqueued patient reminder in WhatsApp outbox for ${pat.name} (${pat.phone}).`,
      ['template_selector()', 'verify_consent()', 'enqueue_outbox()']
    );
  };

  const handleUploadReport = (taskId: string, fileName: string) => {
    const pat = patients.find(p => p.id === selectedPatientId) || patients[0];
    
    // Create new Diagnostic Report
    const newRep: DiagnosticReport = {
      id: `rep-${Date.now()}`,
      tenantId: activeTenant.id,
      patientId: pat.id,
      patientName: pat.name,
      taskId,
      testName: 'Comprehensive HbA1c & Renal Metabolic Panel',
      uploadedAt: 'Today, 11:20 AM',
      status: 'PENDING_REVIEW',
      ocrExtracted: {
        keyValues: {
          'HbA1c': '7.8% (Elevated)',
          'Fasting Blood Glucose': '142 mg/dL (Elevated)',
          'eGFR': '71 mL/min (Normal)',
          'Urine Albumin/Creatinine': '38 mg/g (Borderline)'
        },
        flags: ['HbA1c above target 7.0%', 'Borderline microalbuminuria']
      },
      fileUrl: fileName
    };
    setReports(prev => [newRep, ...prev]);

    // Update task status from OVERDUE to PENDING (evidence attached)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'PENDING', evidenceUploaded: fileName } : t));

    logAudit('UPLOAD_DIAGNOSTIC_DOCUMENT', newRep.id, 'MedicalDocument', `Patient uploaded ${fileName}; OCR parameters extracted.`);
    
    addAgentTrace(
      6,
      'Audit & Verification Agent',
      'SUCCESS',
      `OCR parsed ${fileName} for ${pat.name}. Associated with task #${taskId}. Routed to clinical review queue.`,
      ['ocr_parser()', 'associate_report_to_task()', 'flag_thresholds()']
    );
  };

  const handleCompletePatientTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', patientCompleted: true } : t));
    logAudit('PATIENT_COMPLETED_TASK', taskId, 'CareTask', 'Patient submitted self-monitoring reading');
    addAgentTrace(
      4,
      'Follow-Up Monitoring Agent',
      'SUCCESS',
      `Patient marked self-monitoring task #${taskId} complete. Care loop updated.`,
      ['record_patient_adherence()']
    );
  };

  const handleBookAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    logAudit('BOOK_APPOINTMENT', apt.id, 'Appointment', `Booked ${apt.type} for ${apt.patientName} with ${apt.doctorName}`);
    addAgentTrace(
      2,
      'Scheduling Agent',
      'SUCCESS',
      `Reserved slot ${apt.dateTime} for ${apt.patientName}. Transmitted calendar invite.`,
      ['query_doctor_calendar()', 'reserve_slot_lock()']
    );
  };

  const handleVerifyReport = (reportId: string, status: 'VERIFIED_NORMAL' | 'VERIFIED_CRITICAL') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    logAudit('VERIFY_REPORT', reportId, 'DiagnosticReport', `Clinician verified report as ${status}`);
  };

  const handleRetryNotification = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'DELIVERED', retryCount: n.retryCount + 1, sentAt: 'Just now' } : n));
    logAudit('RETRY_NOTIFICATION', notifId, 'Notification', 'Manual retry executed by staff');
    addAgentTrace(
      3,
      'Patient Engagement Agent',
      'SUCCESS',
      `Retried notification dispatch #${notifId} via fallback SMS gateway. Status: DELIVERED.`,
      ['retry_handler()', 'fallback_gateway()']
    );
  };

  const handleResolveEscalation = (escalationId: string, note: string) => {
    setEscalations(prev => prev.map(e => e.id === escalationId ? { ...e, status: 'RESOLVED', resolutionNote: note } : e));
    logAudit('RESOLVE_ESCALATION', escalationId, 'Escalation', `Staff resolved escalation: ${note}`);
    addAgentTrace(
      5,
      'Escalation Agent',
      'SUCCESS',
      `Escalation ticket #${escalationId} closed by staff. Follow-up obligation resolved.`,
      ['close_escalation_ticket()']
    );
  };

  // Multi-Agent Simulations
  const handleTriggerMonitoringCron = () => {
    addAgentTrace(
      4,
      'Follow-Up Monitoring Agent',
      'FLAGGED',
      `Cron evaluation completed across ${tenantTasks.length} tasks. Identified 1 overdue test for Priya Patel (Task #task-01). Alert sent to staff queue.`,
      ['evaluate_task_deadlines()', 'flag_overdue()', 'generate_work_queue()']
    );
  };

  const handleTriggerUnresponsivePatient = () => {
    const newEsc: EscalationItem = {
      id: `esc-${Date.now()}`,
      tenantId: activeTenant.id,
      taskId: 'task-04',
      patientId: 'pat-102',
      patientName: 'Rahul Verma',
      category: 'UNRESPONSIVE_PATIENT',
      urgency: 'CRITICAL',
      status: 'OPEN',
      assignedToRole: 'NURSE',
      assignedToName: 'Meera Nair, RN',
      summary: 'Post-PCI cardiac patient failed to respond to 2 automated SMS reminders for 2D Echo report.',
      createdAt: 'Just now'
    };
    setEscalations(prev => [newEsc, ...prev]);

    addAgentTrace(
      5,
      'Escalation Agent',
      'SUCCESS',
      `Raised critical escalation ticket #${newEsc.id} for Nurse Meera Nair: Post-PCI Rahul Verma unresponsive.`,
      ['create_escalation_ticket()', 'notify_staff_queue()']
    );
  };

  const handleTriggerAuditCheck = () => {
    addAgentTrace(
      6,
      'Audit & Verification Agent',
      'SUCCESS',
      `Ran grounding verifier on active care plans. 100% tasks grounded in clinical consultation text. Zero hallucination incidents detected.`,
      ['grounding_verifier()', 'detect_unsupported_claims()']
    );
  };

  const handleResetDemoData = () => {
    setTasks(INITIAL_TASKS);
    setReports(INITIAL_REPORTS);
    setEscalations(INITIAL_ESCALATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAppointments(INITIAL_APPOINTMENTS);
    setAgentTraces(INITIAL_AGENT_TRACES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  const currentPatient = tenantPatients.find(p => p.id === selectedPatientId) || tenantPatients[0] || INITIAL_PATIENTS[0];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        activeTenant={activeTenant}
        tenants={tenants}
        onSelectTenant={setActiveTenant}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        overdueCount={overdueCount}
        escalationCount={escalationCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <TopHeader
          activeTenant={activeTenant}
          currentRole={currentRole}
          onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
          onSelectRole={handleSelectRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Routing */}
        <main>
          {currentView === 'dashboard' && (
            <DashboardView
              tenant={activeTenant}
              tasks={tenantTasks}
              patients={tenantPatients}
              appointments={tenantAppointments}
              reports={tenantReports}
              escalations={tenantEscalations}
              userRole={currentRole}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNavigateToApproval={() => setCurrentView('approval')}
              onNavigateToAgentMonitor={() => setCurrentView('agent-monitor')}
              onSelectPatient={(patId) => {
                setSelectedPatientId(patId);
                setCurrentView('patient-portal');
              }}
              onResolveEscalation={handleResolveEscalation}
            />
          )}

          {currentView === 'tasks' && (
            <TaskQueueView
              tenant={activeTenant}
              tasks={tenantTasks}
              patients={tenantPatients}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSelectPatient={(patId) => {
                setSelectedPatientId(patId);
                setCurrentView('patient-portal');
              }}
            />
          )}

          {currentView === 'approval' && (
            <ClinicianApprovalView
              tenant={activeTenant}
              patients={tenantPatients}
              onApproveCarePlan={handleApproveCarePlan}
              onNavigateToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'patient-portal' && (
            <PatientPortalView
              patient={currentPatient}
              tasks={tenantTasks}
              appointments={tenantAppointments}
              tenant={activeTenant}
              onUploadReport={handleUploadReport}
              onCompletePatientTask={handleCompletePatientTask}
            />
          )}

          {currentView === 'agent-monitor' && (
            <AgentOrchestratorView
              tenant={activeTenant}
              traces={agentTraces}
              onTriggerAgentCron={handleTriggerMonitoringCron}
              onTriggerEscalationAgent={handleTriggerUnresponsivePatient}
              onTriggerAuditCheck={handleTriggerAuditCheck}
            />
          )}

          {currentView === 'appointments' && (
            <AppointmentsView
              tenant={activeTenant}
              appointments={tenantAppointments}
              patients={tenantPatients}
              onBookAppointment={handleBookAppointment}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              tenant={activeTenant}
              reports={tenantReports}
              onVerifyReport={handleVerifyReport}
            />
          )}

          {currentView === 'communications' && (
            <CommunicationsView
              tenant={activeTenant}
              notifications={tenantNotifications}
              onRetryNotification={handleRetryNotification}
            />
          )}

          {currentView === 'audit' && (
            <AuditView
              tenant={activeTenant}
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Interactive Simulation Modal */}
      <SimulateEventModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onTriggerMonitoringCron={handleTriggerMonitoringCron}
        onTriggerUnresponsivePatient={handleTriggerUnresponsivePatient}
        onTriggerReportUpload={() => handleUploadReport('task-01', 'simulated_fasting_panel.pdf')}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
export default App;
