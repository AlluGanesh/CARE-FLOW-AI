import React, { useState } from 'react';
import { Send, CheckCircle, RefreshCw, AlertCircle, MessageCircle, Mail, Smartphone, Globe } from 'lucide-react';
import { NotificationItem, Tenant } from '../types';

interface CommunicationsViewProps {
  tenant: Tenant;
  notifications: NotificationItem[];
  onRetryNotification: (notifId: string) => void;
}

export const CommunicationsView: React.FC<CommunicationsViewProps> = ({
  tenant,
  notifications,
  onRetryNotification
}) => {
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  const filtered = notifications.filter(n => {
    if (channelFilter !== 'ALL' && n.channel !== channelFilter) return false;
    return true;
  });

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'WHATSAPP': return <MessageCircle size={15} color="#25D366" />;
      case 'SMS': return <Smartphone size={15} color="var(--teal-vibrant)" />;
      case 'EMAIL': return <Mail size={15} color="var(--amber-warning)" />;
      default: return <Send size={15} />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge info">Module F · Notification Outbox</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background Worker & Retry Queue</span>
          </div>
          <h1>Patient Communications & Notification Outbox</h1>
          <p>
            Transactional message dispatch across WhatsApp, SMS, and Email with guaranteed delivery and retry tracking.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['ALL', 'WHATSAPP', 'SMS', 'EMAIL'] as const).map(ch => (
            <button
              key={ch}
              className={`btn-sm ${channelFilter === ch ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChannelFilter(ch)}
              style={{ fontSize: '0.78rem' }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Outbox Status Table */}
      <div className="card">
        <div className="card-header-flex">
          <div>
            <div className="card-title">
              <Send size={18} color="var(--teal-vibrant)" />
              <span>Outbox Message Queue</span>
            </div>
            <div className="card-subtitle">Consent-verified patient dispatches with multilingual templates</div>
          </div>
          <span className="status-chip completed" style={{ fontSize: '0.72rem' }}>
            97.4% Dispatch Success
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Channel</th>
                <th>Scheduled & Sent</th>
                <th>Language</th>
                <th>Message Content</th>
                <th>Delivery Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(notif => (
                <tr key={notif.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{notif.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Task #{notif.taskId}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      {getChannelIcon(notif.channel)}
                      <span>{notif.channel}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {notif.sentAt || notif.scheduledFor}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)'
                    }}>
                      {notif.language.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', maxWidth: '380px', lineHeight: 1.5 }}>
                      "{notif.messageText}"
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className={`status-chip ${notif.status === 'DELIVERED' ? 'completed' : 'overdue'}`} style={{ fontSize: '0.7rem' }}>
                        {notif.status.replace('_', ' ')}
                      </span>
                      {notif.retryCount > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--rose-danger)' }}>
                          Retries: {notif.retryCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {notif.status === 'FAILED_RETRYING' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onRetryNotification(notif.id)}
                        title="Retry Outbox Dispatch"
                      >
                        <RefreshCw size={13} />
                        <span>Retry</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
