import React from 'react';
import { Search, Zap, ShieldCheck, Bell, Sparkles } from 'lucide-react';
import { Tenant, UserRole } from '../types';

interface TopHeaderProps {
  activeTenant: Tenant;
  currentRole: UserRole;
  onOpenSimulateModal: () => void;
  onSelectRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTenant,
  currentRole,
  onOpenSimulateModal,
  onSelectRole,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="top-header">
      {/* Search Input */}
      <div className="header-search">
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Search patients, tasks, lab reports, doctor..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Header Center / System Operational Health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span className="live-dot" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>System Status:</span>
        <span style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>Active (99.9% Uptime)</span>
        <span style={{ color: 'var(--border-card)' }}>|</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Tenant: <strong style={{ color: 'var(--text-primary)' }}>{activeTenant.name}</strong>
        </span>
      </div>

      {/* Header Right Actions */}
      <div className="header-actions">
        {/* Role Quick Switch Pills */}
        <div className="role-pill-selector">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Role:</span>
          {(['DOCTOR', 'NURSE', 'CLINIC_ADMIN', 'PATIENT'] as UserRole[]).map(role => (
            <button
              key={role}
              className={`role-pill-btn ${currentRole === role ? 'active' : ''}`}
              onClick={() => onSelectRole(role)}
            >
              {role === 'CLINIC_ADMIN' ? 'ADMIN' : role}
            </button>
          ))}
        </div>

        {/* Simulate Event Button */}
        <button 
          className="btn btn-violet btn-sm"
          onClick={onOpenSimulateModal}
          title="Trigger synthetic multi-agent event (Overdue cron, reminder failure, conflict resolution)"
        >
          <Sparkles size={15} />
          <span>Simulate Agent Event</span>
        </button>

        {/* Notification Bell */}
        <button className="action-btn-icon" title="System alerts and agent notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};
