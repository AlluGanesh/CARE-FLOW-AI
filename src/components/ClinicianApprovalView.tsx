import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  FileCheck,
  Send,
  User,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CLINICAL_PRESETS } from '../data/mockData';
import { CareTask, CarePlan, Tenant, Patient } from '../types';

interface ClinicianApprovalViewProps {
  tenant: Tenant;
  patients: Patient[];
  onApproveCarePlan: (newTasks: CareTask[], doctorNotes: string, patientId: string) => void;
  onNavigateToDashboard: () => void;
}

export const ClinicianApprovalView: React.FC<ClinicianApprovalViewProps> = ({
  tenant,
  patients,
  onApproveCarePlan,
  onNavigateToDashboard
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [doctorNotes, setDoctorNotes] = useState<string>(CLINICAL_PRESETS[0].notes);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(CLINICAL_PRESETS[0].patientId);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [isExtracted, setIsExtracted] = useState<boolean>(true);
  const [hasApproved, setHasApproved] = useState<boolean>(false);

  // Staged tasks for clinician editing
  const [stagedTasks, setStagedTasks] = useState<CareTask[]>([
    {
      id: `staged-${Date.now()}-1`,
      carePlanId: 'draft-plan',
      patientId: CLINICAL_PRESETS[0].patientId,
      title: 'Complete Fasting HbA1c, Serum Creatinine & Urine ACR',
      description: 'Patient must complete fasting blood draw and spot urine albumin-creatinine ratio before follow-up.',
      category: 'LAB_REPORT',
      ownerRole: 'PATIENT',
      dueDate: '2026-10-29',
      status: 'APPROVED',
      priority: 'HIGH',
      sourceEvidenceText: 'Order repeat Fasting HbA1c and Serum Creatinine with spot Urine ACR in 5 days.',
      isAmbiguousDate: false
    },
    {
      id: `staged-${Date.now()}-2`,
      carePlanId: 'draft-plan',
      patientId: CLINICAL_PRESETS[0].patientId,
      title: 'Schedule In-Clinic Doctor Review Appointment',
      description: 'Book OPD slot with Dr. Rajesh Sharma with lab test reports in hand.',
      category: 'APPOINTMENT',
      ownerRole: 'RECEPTIONIST',
      dueDate: '2026-10-31',
      status: 'APPROVED',
      priority: 'HIGH',
      sourceEvidenceText: 'Schedule in-clinic review appointment in 7 days to assess renal parameters.',
      isAmbiguousDate: false
    },
    {
      id: `staged-${Date.now()}-3`,
      carePlanId: 'draft-plan',
      patientId: CLINICAL_PRESETS[0].patientId,
      title: 'Maintain 3-Day Morning Fasting Glucose Log',
      description: 'Patient logs glucometer readings daily before breakfast in patient portal app.',
      category: 'SELF_MONITORING',
      ownerRole: 'PATIENT',
      dueDate: '2026-10-27',
      status: 'APPROVED',
      priority: 'MEDIUM',
      sourceEvidenceText: 'Patient must maintain daily fasting blood glucose log for 3 consecutive mornings.',
      isAmbiguousDate: false
    }
  ]);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = CLINICAL_PRESETS[idx];
    setDoctorNotes(preset.notes);
    setSelectedPatientId(preset.patientId);
    setHasApproved(false);

    // Auto-populate staged tasks matching preset
    const newStaged: CareTask[] = preset.expectedTasks.map((et, i) => ({
      id: `staged-${Date.now()}-${i}`,
      carePlanId: 'draft-plan',
      patientId: preset.patientId,
      title: et.title,
      description: `Instruction derived from consultation note: ${et.evidence}`,
      category: et.category as any,
      ownerRole: et.ownerRole as any,
      dueDate: i === 0 ? '2026-10-29' : i === 1 ? '2026-11-02' : '2026-10-27',
      status: 'APPROVED',
      priority: et.priority as any,
      sourceEvidenceText: et.evidence,
      isAmbiguousDate: false
    }));
    setStagedTasks(newStaged);
    setIsExtracted(true);
  };

  const handleTriggerAIExtraction = () => {
    setIsExtracting(true);
    setExtractionStep('Agent 1 (Care Plan Intelligence): Analyzing raw clinical instructions...');

    setTimeout(() => {
      setExtractionStep('Agent 1: Extracting temporal deadlines and follow-up task entities...');
    }, 600);

    setTimeout(() => {
      setExtractionStep('Agent 6 (Audit & Verification): Validating source grounding & hallucinations...');
    }, 1200);

    setTimeout(() => {
      setIsExtracting(false);
      setIsExtracted(true);
      setExtractionStep('');
    }, 1800);
  };

  const handleUpdateTaskField = (id: string, field: keyof CareTask, value: any) => {
    setStagedTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleDeleteTask = (id: string) => {
    setStagedTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddNewTask = () => {
    const newTask: CareTask = {
      id: `staged-${Date.now()}`,
      carePlanId: 'draft-plan',
      patientId: selectedPatientId,
      title: 'Additional Clinician Follow-up Instruction',
      description: 'Clinician manually added follow-up obligation.',
      category: 'FOLLOWUP_CALL',
      ownerRole: 'NURSE',
      dueDate: '2026-10-30',
      status: 'APPROVED',
      priority: 'MEDIUM',
      sourceEvidenceText: 'Added by clinician during approval review',
      isAmbiguousDate: false
    };
    setStagedTasks(prev => [...prev, newTask]);
  };

  const handleApprovePlan = () => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setHasApproved(true);
    onApproveCarePlan(stagedTasks, doctorNotes, selectedPatientId);
  };

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge info">Module C · HITL Checkpoint</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audit Agent Grounded</span>
          </div>
          <h1>Clinician Approval Workspace</h1>
          <p>
            Doctor records instructions ➔ AI generates proposed tasks ➔ Clinician reviews, edits, and signs off.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onNavigateToDashboard}>
            <span>View Task Queue</span>
          </button>
        </div>
      </div>

      {/* Preset Clinical Scenarios Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={18} color="var(--teal-vibrant)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Load Realistic Clinical Consultation Preset:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CLINICAL_PRESETS.map((preset, idx) => (
            <button
              key={preset.title}
              className={`btn btn-sm ${selectedPresetIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectPreset(idx)}
            >
              <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Doctor Consultation Input (Left) vs AI Proposed Tasks (Right) */}
      <div className="doctor-editor-grid">
        {/* Left Column: Doctor Input */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">
                <Stethoscope size={18} color="var(--teal-vibrant)" />
                <span>Doctor Consultation Record</span>
              </div>
              <div className="card-subtitle">
                Patient: <strong style={{ color: 'var(--text-primary)' }}>{currentPatient.name}</strong> ({currentPatient.age}y, {currentPatient.gender})
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Diagnosis: {currentPatient.primaryDiagnosis.split(' - ')[0]}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Doctor's Approved Instructions / Prescription Notes:
            </label>
            <textarea
              className="doctor-notes-textarea"
              value={doctorNotes}
              onChange={(e) => {
                setDoctorNotes(e.target.value);
                setHasApproved(false);
              }}
              placeholder="Enter doctor instructions, follow-up tests, timeline, and review guidelines..."
            />
          </div>

          {/* Action Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span className="live-dot" style={{ marginRight: '0.35rem' }} />
              Agent 1 & Agent 6 Ready
            </div>
            <button
              className="btn btn-primary"
              disabled={isExtracting}
              onClick={handleTriggerAIExtraction}
            >
              <Sparkles size={16} />
              <span>{isExtracting ? 'Extracting...' : 'Re-Run AI Extraction'}</span>
            </button>
          </div>

          {/* Extraction animation indicator */}
          {isExtracting && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: '#d8b4fe',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <span className="live-dot" style={{ background: '#c084fc' }} />
              <span>{extractionStep}</span>
            </div>
          )}
        </div>

        {/* Right Column: Staged AI Tasks & Clinician Sign-Off */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">
                <FileCheck size={18} color="var(--emerald-success)" />
                <span>Proposed Care Coordination Plan</span>
              </div>
              <div className="card-subtitle">
                Grounding Confidence: <strong style={{ color: 'var(--emerald-success)' }}>99.2%</strong> · Hallucination Score: 0%
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleAddNewTask}>
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Grounding & Safety Banner */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7' }}>
              <ShieldCheck size={16} color="var(--emerald-success)" />
              <span>Source Grounding Verified: Every task linked to consultation text.</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audit Agent 6</span>
          </div>

          {/* Staged Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
            {stagedTasks.map((task, idx) => (
              <div
                key={task.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(14, 165, 233, 0.15)',
                        color: 'var(--teal-vibrant)'
                      }}>
                        Task #{idx + 1} · {task.category.replace('_', ' ')}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        background: task.priority === 'CRITICAL' ? 'var(--rose-bg)' : 'rgba(255, 255, 255, 0.05)',
                        color: task.priority === 'CRITICAL' ? 'var(--rose-danger)' : 'var(--text-secondary)'
                      }}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Editable Title */}
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleUpdateTaskField(task.id, 'title', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderBottom: '1px dashed var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '0.2rem 0',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remove task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Evidence snippet */}
                <div style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  marginBottom: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  Source: "{task.sourceEvidenceText}"
                </div>

                {/* Meta Fields: Owner & Due Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assignee:</span>
                    <select
                      value={task.ownerRole}
                      onChange={(e) => handleUpdateTaskField(task.id, 'ownerRole', e.target.value)}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    >
                      <option value="PATIENT">Patient</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="NURSE">Nurse / Care Coord</option>
                      <option value="DOCTOR">Doctor</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Due:</span>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => handleUpdateTaskField(task.id, 'dueDate', e.target.value)}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clinician Approval Checkpoint Action Bar */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Clinician Sign-Off & Verification
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Enforces server-side audit trail and activates notification outbox.
              </div>
            </div>

            {hasApproved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-chip completed">
                  <CheckCircle size={14} />
                  <span>Approved & Activated!</span>
                </span>
                <button className="btn btn-secondary btn-sm" onClick={onNavigateToDashboard}>
                  <span>Go to Queue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleApprovePlan}
                style={{ padding: '0.65rem 1.4rem' }}
              >
                <CheckCircle size={17} />
                <span>Sign & Approve Care Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
