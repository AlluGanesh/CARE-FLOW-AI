import React from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  CheckSquare, 
  Stethoscope, 
  Smartphone, 
  Bot, 
  Calendar, 
  FileText, 
  Send, 
  ShieldAlert, 
  Building2, 
  ChevronDown,
  UserCheck,
  Microscope
} from 'lucide-react';
import { Tenant, UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  activeTenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  overdueCount: number;
  escalationCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeTenant,
  tenants,
  onSelectTenant,
  currentRole,
  onSelectRole,
  overdueCount,
  escalationCount
}) => {
  const [showTenantDropdown, setShowTenantDropdown] = React.useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'DOCTOR', label: 'Doctor (Dr. Sharma)' },
    { role: 'NURSE', label: 'Nurse / Care Coord (Meera)' },
    { role: 'CLINIC_ADMIN', label: 'Clinic Admin (Vikram)' },
    { role: 'PATIENT', label: 'Patient (Priya Patel)' },
    { role: 'RECEPTIONIST', label: 'Receptionist (Frontdesk)' }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Identity */}
      <div className="brand-section">
        <div className="brand-icon">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <h2>CareFlow AI</h2>
          <span className="brand-tagline">Care Coordination SaaS</span>
        </div>
      </div>

      {/* Tenant Selector Dropdown */}
      <div style={{ position: 'relative' }}>
        <button 
          className="tenant-badge-pill" 
          onClick={() => setShowTenantDropdown(!showTenantDropdown)}
          style={{ width: '100%', border: '1px solid var(--border-card)' }}
          title="Switch Tenant (Demonstrates Multi-Tenant Isolation)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <Building2 size={16} color="var(--teal-vibrant)" style={{ flexShrink: 0 }} />
            <div style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeTenant.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {activeTenant.subscriptionPlan} Plan · {activeTenant.city.split(',')[0]}
              </div>
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {showTenantDropdown && (
          <div style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-teal-glow)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            padding: '0.4rem',
            animation: 'modal-pop 0.2s ease'
          }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', fontWeight: 700 }}>
              Select Active Clinic Tenant
            </div>
            {tenants.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTenant(t);
                  setShowTenantDropdown(false);
                }}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: t.id === activeTenant.id ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                  color: t.id === activeTenant.id ? 'var(--teal-hover)' : 'var(--text-primary)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.city}</div>
                </div>
                {t.id === activeTenant.id && <span style={{ fontSize: '0.7rem', color: 'var(--teal-vibrant)' }}>Active</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem' }}>
        <div className="nav-group-title">Operations & Care</div>

        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectView('dashboard')}
        >
          <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
          <span>Operations Dashboard</span>
          {overdueCount > 0 && <span className="nav-badge alert">{overdueCount} Overdue</span>}
        </button>

        <button 
          className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => onSelectView('tasks')}
        >
          <span className="nav-item-icon"><CheckSquare size={18} /></span>
          <span>Follow-Up Task Queue</span>
          {escalationCount > 0 && <span className="nav-badge alert">{escalationCount} Esc</span>}
        </button>

        <button 
          className={`nav-item ${currentView === 'approval' ? 'active' : ''}`}
          onClick={() => onSelectView('approval')}
        >
          <span className="nav-item-icon"><Stethoscope size={18} /></span>
          <span>Doctor Care Plan AI</span>
          <span className="nav-badge info">HITL</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'patient-portal' ? 'active' : ''}`}
          onClick={() => onSelectView('patient-portal')}
        >
          <span className="nav-item-icon"><Smartphone size={18} /></span>
          <span>Patient Follow-Up Portal</span>
        </button>

        <div className="nav-group-title" style={{ marginTop: '1rem' }}>Intelligence & Workflows</div>

        <button 
          className={`nav-item ${currentView === 'research-agent' ? 'active' : ''}`}
          onClick={() => onSelectView('research-agent')}
        >
          <span className="nav-item-icon"><Microscope size={18} color="var(--teal-vibrant)" /></span>
          <span>Research Agent</span>
          <span className="nav-badge info">Phase 2</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'agent-monitor' ? 'active' : ''}`}
          onClick={() => onSelectView('agent-monitor')}
        >
          <span className="nav-item-icon"><Bot size={18} color="var(--violet-agent)" /></span>
          <span>Multi-Agent Orchestrator</span>
          <span className="nav-badge agent">7 Agents</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'appointments' ? 'active' : ''}`}
          onClick={() => onSelectView('appointments')}
        >
          <span className="nav-item-icon"><Calendar size={18} /></span>
          <span>Appointments</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => onSelectView('reports')}
        >
          <span className="nav-item-icon"><FileText size={18} /></span>
          <span>Diagnostic Reports (OCR)</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'communications' ? 'active' : ''}`}
          onClick={() => onSelectView('communications')}
        >
          <span className="nav-item-icon"><Send size={18} /></span>
          <span>Patient Outbox & SMS</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'audit' ? 'active' : ''}`}
          onClick={() => onSelectView('audit')}
        >
          <span className="nav-item-icon"><ShieldAlert size={18} /></span>
          <span>Audit & Traceability</span>
        </button>
      </nav>

      {/* Role Switcher & User Profile Widget */}
      <div className="user-profile-widget" style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div className="avatar-circle">
            {currentRole === 'DOCTOR' ? 'DR' : currentRole === 'NURSE' ? 'RN' : currentRole === 'PATIENT' ? 'PT' : 'AD'}
          </div>
          <div className="user-meta" style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {roles.find(r => r.role === currentRole)?.label.split(' (')[0]}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--teal-vibrant)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <UserCheck size={12} />
              <span>Role: {currentRole}</span>
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {showRoleDropdown && (
          <div style={{
            position: 'absolute',
            bottom: '105%',
            left: 0,
            right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-teal-glow)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 60,
            padding: '0.4rem',
            animation: 'modal-pop 0.2s ease'
          }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', fontWeight: 700 }}>
              Switch User Persona
            </div>
            {roles.map(r => (
              <div
                key={r.role}
                onClick={() => {
                  onSelectRole(r.role);
                  setShowRoleDropdown(false);
                }}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: r.role === currentRole ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                  color: r.role === currentRole ? 'var(--teal-hover)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{r.label}</span>
                {r.role === currentRole && <span style={{ fontSize: '0.7rem', color: 'var(--teal-vibrant)' }}>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
