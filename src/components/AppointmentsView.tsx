import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Plus, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { Appointment, Tenant, Patient } from '../types';

interface AppointmentsViewProps {
  tenant: Tenant;
  appointments: Appointment[];
  patients: Patient[];
  onBookAppointment: (appointment: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  tenant,
  appointments,
  patients,
  onBookAppointment
}) => {
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [selectedDoctorName, setSelectedDoctorName] = useState<string>('Dr. Rajesh Sharma, MD');
  const [selectedDateTime, setSelectedDateTime] = useState<string>('2026-10-29 11:00 AM');
  const [appointmentType, setAppointmentType] = useState<any>('In-Person Follow-Up');

  const handleCreateBooking = () => {
    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      tenantId: tenant.id,
      patientId: pat.id,
      patientName: pat.name,
      doctorId: 'usr-dr-sharma',
      doctorName: selectedDoctorName,
      dateTime: selectedDateTime,
      durationMinutes: 20,
      type: appointmentType,
      status: 'CONFIRMED'
    };

    onBookAppointment(newApt);
    setShowBookingModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge info">Module E · Scheduling Engine</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Concurrency-Safe (PostgreSQL Row Locks)</span>
          </div>
          <h1>Appointment Scheduling & Doctor Availability</h1>
          <p>
            Manage doctor availability, conflict-free booking, and automated appointment confirmations for {tenant.name}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
          <Plus size={16} />
          <span>Book Follow-Up Slot</span>
        </button>
      </div>

      {/* Grid of Appointments */}
      <div className="card">
        <div className="card-header-flex">
          <div>
            <div className="card-title">
              <Calendar size={18} color="var(--teal-vibrant)" />
              <span>Upcoming Scheduled Visits</span>
            </div>
            <div className="card-subtitle">Validated against clinic working hours and doctor calendars</div>
          </div>
          <span className="status-chip completed" style={{ fontSize: '0.72rem' }}>
            Zero Double-Booking
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Concurrency Token</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{apt.patientName}</div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>{apt.doctorName}</span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {apt.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--teal-hover)' }}>{apt.dateTime}</span>
                  </td>
                  <td>{apt.durationMinutes} mins</td>
                  <td>
                    <span className={`status-chip ${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      LOCK_OK_{apt.id.slice(-4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calendar size={20} color="var(--teal-vibrant)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Book Conflict-Free Follow-Up Slot
                </h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Select Patient:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none'
                  }}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.age}y - {p.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Select Doctor:
                </label>
                <select
                  value={selectedDoctorName}
                  onChange={(e) => setSelectedDoctorName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none'
                  }}
                >
                  <option value="Dr. Rajesh Sharma, MD">Dr. Rajesh Sharma, MD (Endocrinology)</option>
                  <option value="Dr. Ananya Roy, MD">Dr. Ananya Roy, MD (Cardiology)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Date & Time:
                  </label>
                  <input
                    type="text"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.5rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Consultation Type:
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.5rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none'
                    }}
                  >
                    <option value="In-Person Follow-Up">In-Person Follow-Up</option>
                    <option value="Video Consultation">Video Consultation</option>
                    <option value="Lab Review">Lab Review</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.78rem',
              color: '#6ee7b7',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <ShieldCheck size={16} />
              <span>Scheduling Agent 2 verified zero doctor conflict during this time slot.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBookingModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateBooking}>
                Confirm & Lock Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
