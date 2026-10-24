import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ExternalLink, 
  User, 
  Plus, 
  Search,
  Check
} from 'lucide-react';
import { CareTask, Patient, TaskStatus, TaskCategory, Tenant } from '../types';

interface TaskQueueViewProps {
  tenant: Tenant;
  tasks: CareTask[];
  patients: Patient[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onSelectPatient: (patientId: string) => void;
}

export const TaskQueueView: React.FC<TaskQueueViewProps> = ({
  tenant,
  tasks,
  patients,
  onUpdateTaskStatus,
  onSelectPatient
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOwner, setFilterOwner] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getPatient = (id: string) => patients.find(p => p.id === id);

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterOwner !== 'ALL' && t.ownerRole !== filterOwner) return false;
    if (searchTerm) {
      const p = getPatient(t.patientId);
      const matchesTitle = t.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPatient = p?.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesTitle && !matchesPatient) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge alert">Module D · Deterministic Task Engine</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overdue Tracking Active</span>
          </div>
          <h1>Follow-Up Task Queue</h1>
          <p>
            Track and resolve patient care follow-up obligations across doctors, nurses, receptionists, and patients.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search tasks or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </div>

      {/* Task Filters */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['ALL', 'PENDING', 'OVERDUE', 'ESCALATED', 'COMPLETED'] as const).map(st => (
            <button
              key={st}
              className={`btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(st)}
              style={{ fontSize: '0.78rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Owner Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Owner:</span>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.3rem 0.6rem',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patient</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Details</th>
                <th>Patient</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Source Lineage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const pat = getPatient(task.patientId);
                return (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                        {task.description}
                      </div>
                    </td>
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--teal-hover)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => onSelectPatient(task.patientId)}
                      >
                        {pat ? pat.name : 'Unknown Patient'}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {task.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {task.ownerRole}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: task.status === 'OVERDUE' ? 700 : 500,
                        color: task.status === 'OVERDUE' ? 'var(--rose-danger)' : 'var(--text-primary)'
                      }}>
                        {task.dueDate}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '200px', display: 'block' }}>
                        "{task.sourceEvidenceText}"
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {task.status !== 'COMPLETED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onUpdateTaskStatus(task.id, 'COMPLETED')}
                          >
                            <Check size={14} color="var(--emerald-success)" />
                            <span>Done</span>
                          </button>
                        )}
                        {task.status === 'OVERDUE' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onUpdateTaskStatus(task.id, 'ESCALATED')}
                          >
                            <span>Escalate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
