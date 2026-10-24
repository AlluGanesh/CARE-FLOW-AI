import React from 'react';
import { Sparkles, Clock, AlertTriangle, FileText, Calendar, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerMonitoringCron: () => void;
  onTriggerUnresponsivePatient: () => void;
  onTriggerReportUpload: () => void;
  onResetDemoData: () => void;
}

export const SimulateEventModal: React.FC<SimulateEventModalProps> = ({
  isOpen,
  onClose,
  onTriggerMonitoringCron,
  onTriggerUnresponsivePatient,
  onTriggerReportUpload,
  onResetDemoData
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--violet-agent)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Simulate Multi-Agent Workflow Events
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Test the automated agentic coordination pipeline without waiting for actual calendar time to elapse.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
          {/* Action 1: Deadline Cron */}
          <button
            onClick={() => {
              onTriggerMonitoringCron();
              onClose();
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
            className="sim-card-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.12)', color: 'var(--teal-vibrant)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  Run Follow-Up Deadline Cron (Agent 4)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Evaluates all patient tasks, flags overdue deadlines, and routes to staff queues.
                </div>
              </div>
            </div>
            <span className="status-chip approved" style={{ fontSize: '0.68rem' }}>Agent 4</span>
          </button>

          {/* Action 2: Unresponsive Escalation */}
          <button
            onClick={() => {
              onTriggerUnresponsivePatient();
              onClose();
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
            className="sim-card-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--rose-bg)', color: 'var(--rose-danger)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  Simulate Unresponsive Patient Escalation (Agent 5)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Simulates 2 failed SMS alerts for post-cardiac patient; raises critical nurse escalation.
                </div>
              </div>
            </div>
            <span className="status-chip escalated" style={{ fontSize: '0.68rem' }}>Agent 5</span>
          </button>

          {/* Action 3: Report Upload & OCR */}
          <button
            onClick={() => {
              onTriggerReportUpload();
              onClose();
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
            className="sim-card-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--amber-bg)', color: 'var(--amber-warning)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  Simulate Lab Upload & OCR Parameter Extraction
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Simulates Priya Patel uploading HbA1c panel; auto-extracts biomarkers and closes pending loop.
                </div>
              </div>
            </div>
            <span className="status-chip pending" style={{ fontSize: '0.68rem' }}>OCR</span>
          </button>
        </div>

        {/* Footer & Reset Data */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              onResetDemoData();
              onClose();
            }}
            style={{ color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo State</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={onClose}>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
