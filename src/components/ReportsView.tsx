import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Upload, Download } from 'lucide-react';
import { DiagnosticReport, Tenant } from '../types';

interface ReportsViewProps {
  tenant: Tenant;
  reports: DiagnosticReport[];
  onVerifyReport: (reportId: string, status: 'VERIFIED_NORMAL' | 'VERIFIED_CRITICAL') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tenant,
  reports,
  onVerifyReport
}) => {
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(reports[0] || null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge info">Module G · Diagnostic Report Tracking</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OCR-Assisted Metadata Extraction</span>
          </div>
          <h1>Diagnostic Report Tracking & OCR Stream</h1>
          <p>
            Track incoming lab results, associate them with active care tasks, and route for clinician verification.
          </p>
        </div>
      </div>

      {/* Safety Notice per PRD Module G */}
      <div style={{
        background: 'rgba(14, 165, 233, 0.08)',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <ShieldCheck size={20} color="var(--teal-vibrant)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Clinical Safety Boundary (PRD Module G):</strong>{' '}
          CareFlow AI extracts parameters for visibility and task closing; it does not autonomously diagnose illness or alter prescription regimens.
        </div>
      </div>

      {/* Grid: Reports List (Left) vs OCR Inspector Details (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
        {/* Reports List */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">
                <FileText size={18} color="var(--teal-vibrant)" />
                <span>Uploaded Reports Queue</span>
              </div>
              <div className="card-subtitle">Linked to active patient follow-up tasks</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reports.map(rep => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  style={{
                    background: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-secondary)',
                    border: isSelected ? '1px solid var(--teal-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {rep.testName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Patient: <strong style={{ color: 'var(--teal-hover)' }}>{rep.patientName}</strong> · Uploaded: {rep.uploadedAt}
                      </div>
                    </div>
                    <span className={`status-chip ${rep.status === 'PENDING_REVIEW' ? 'pending' : 'completed'}`} style={{ fontSize: '0.68rem' }}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <span>Associated Task: #{rep.taskId}</span>
                    <span>·</span>
                    <span style={{ color: rep.ocrExtracted.flags.length > 0 ? 'var(--amber-warning)' : 'var(--emerald-success)' }}>
                      {rep.ocrExtracted.flags.length} Parameter Flag(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OCR Inspector Details Card */}
        {selectedReport && (
          <div className="card">
            <div className="card-header-flex">
              <div>
                <div className="card-title">
                  <Eye size={18} color="var(--amber-warning)" />
                  <span>OCR Inspector: {selectedReport.patientName}</span>
                </div>
                <div className="card-subtitle">{selectedReport.fileUrl || 'Diagnostic Document'}</div>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => alert('Downloading original lab PDF from secure tenant S3 bucket')}
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
            </div>

            {/* Extracted Key-Value Table */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Extracted Biomarkers & Reference Tolerances
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(selectedReport.ocrExtracted.keyValues).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: val.includes('High') ? 'rgba(244, 63, 94, 0.08)' : 'rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{key}</span>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: val.includes('High') ? 'var(--rose-danger)' : 'var(--teal-hover)',
                      fontFamily: 'monospace'
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter Flags */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Automated Clinical Flags
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selectedReport.ocrExtracted.flags.map((flag, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '3px solid var(--amber-warning)',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      color: '#fef08a'
                    }}
                  >
                    ⚠️ {flag}
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Review Actions */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onVerifyReport(selectedReport.id, 'VERIFIED_NORMAL')}
              >
                <span>Verify Normal</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onVerifyReport(selectedReport.id, 'VERIFIED_CRITICAL')}
              >
                <CheckCircle2 size={15} />
                <span>Mark Staff Reviewed</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
