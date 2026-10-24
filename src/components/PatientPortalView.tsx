import React, { useState } from 'react';
import { 
  Smartphone, 
  Globe, 
  Calendar, 
  CheckCircle, 
  Upload, 
  AlertCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  ShieldAlert,
  Send,
  Heart,
  Activity,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Patient, CareTask, Appointment, Tenant } from '../types';

interface PatientPortalViewProps {
  patient: Patient;
  tasks: CareTask[];
  appointments: Appointment[];
  tenant: Tenant;
  onUploadReport: (taskId: string, fileName: string) => void;
  onCompletePatientTask: (taskId: string) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patient,
  tasks,
  appointments,
  tenant,
  onUploadReport,
  onCompletePatientTask
}) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'es'>(patient.preferredLanguage || 'en');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [glucoseInput, setGlucoseInput] = useState<string>('142');
  const [glucoseSubmitted, setGlucoseSubmitted] = useState<boolean>(false);
  const [uploadSuccessTask, setUploadSuccessTask] = useState<string | null>(null);
  const [showCoordinatorChat, setShowCoordinatorChat] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'patient' | 'coordinator'; text: string; time: string }[]>([
    {
      sender: 'coordinator',
      text: `Hello ${patient.name}, I am Nurse Meera, your care coordinator at ${tenant.name}. Please let us know if you have any questions regarding your upcoming lab tests or appointment.`,
      time: '10:00 AM'
    }
  ]);

  // Multilingual translations for patient reassurance
  const t = {
    en: {
      tagline: 'Your Personalized Care Plan',
      drNotesTitle: "Doctor's Approved Instructions",
      drNotesBody: 'Continue prescribed Metformin 500mg. Please complete your Fasting HbA1c and urine test prior to our appointment. Log your fasting blood sugars for 3 days.',
      upcomingVisit: 'Upcoming Doctor Appointment',
      reschedule: 'Request Reschedule',
      calendar: 'Add to Calendar',
      todoTitle: 'Your Follow-Up Checklist',
      uploadPrompt: 'Upload Diagnostic Report / Lab Bill',
      logGlucose: 'Log Today’s Fasting Glucose Reading',
      submitReading: 'Save Reading',
      emergencyTitle: 'Important Safety Notice',
      emergencyBody: 'CareFlow AI is not an emergency response service. If experiencing chest pain, severe shortness of breath, or emergency symptoms, call emergency services (112 / 911) or visit the nearest hospital emergency room immediately.'
    },
    hi: {
      tagline: 'आपकी व्यक्तिगत देखभाल योजना',
      drNotesTitle: 'डॉक्टर द्वारा अनुमोदित निर्देश',
      drNotesBody: 'निर्धारित मेटफॉर्मिन 500mg जारी रखें। कृपया परामर्श से पहले अपना फास्टिंग एचबीए1सी और यूरिन टेस्ट करवाएं। 3 दिनों तक खाली पेट शुगर रिकॉर्ड करें।',
      upcomingVisit: 'आगामी डॉक्टर परामर्श',
      reschedule: 'समय बदलने का अनुरोध करें',
      calendar: 'कैलेंडर में जोड़ें',
      todoTitle: 'आपकी अनुवर्ती कार्यसूची',
      uploadPrompt: 'लैब रिपोर्ट / रसीद अपलोड करें',
      logGlucose: 'आज का खाली पेट ब्लड शुगर दर्ज करें',
      submitReading: 'सुरक्षित करें',
      emergencyTitle: 'महत्वपूर्ण सुरक्षा सूचना',
      emergencyBody: 'केयरफ्लो एआई आपातकालीन सेवा नहीं है। यदि सीने में दर्द या सांस लेने में गंभीर तकलीफ हो, तो तुरंत आपातकालीन नंबर (112) पर कॉल करें या नजदीकी अस्पताल जाएं।'
    },
    es: {
      tagline: 'Su Plan de Atención Personalizado',
      drNotesTitle: 'Instrucciones Aprobadas por el Médico',
      drNotesBody: 'Continúe con Metformina 500 mg. Complete su prueba de HbA1c en ayunas antes de la cita. Registre sus niveles de glucosa durante 3 días.',
      upcomingVisit: 'Próxima Cita Médica',
      reschedule: 'Reprogramar',
      calendar: 'Añadir al Calendario',
      todoTitle: 'Lista de Tareas de Seguimiento',
      uploadPrompt: 'Subir Informe de Laboratorio',
      logGlucose: 'Registrar Glucosa en Ayunas',
      submitReading: 'Guardar',
      emergencyTitle: 'Aviso de Seguridad Importante',
      emergencyBody: 'CareFlow AI no es un servicio de emergencia. Si tiene dolor de pecho o dificultad para respirar, llame a emergencias (911) inmediatamente.'
    }
  }[language];

  const patientTasks = tasks.filter(t => t.patientId === patient.id || t.ownerRole === 'PATIENT');
  const patientAppointment = appointments.find(a => a.patientId === patient.id) || appointments[0];

  const handleSimulateUpload = (taskId: string) => {
    onUploadReport(taskId, 'hba1c_fasting_panel_oct24.pdf');
    setUploadSuccessTask(taskId);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const handleLogGlucose = (taskId: string) => {
    setGlucoseSubmitted(true);
    onCompletePatientTask(taskId);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch (e) {}
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg = {
      sender: 'patient' as const,
      text: chatMessage,
      time: 'Just now'
    };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulate coordinator reply after 1s
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'coordinator',
          text: `Thank you, ${patient.name}. I have noted this in your care coordination file. Dr. Sharma has been updated.`,
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge info">Module I · Patient Mobile Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Language Accessible</span>
          </div>
          <h1>Patient Follow-Up Portal</h1>
          <p>
            Compassionate, mobile-first interface for patients to view doctor instructions, complete tasks, and upload reports.
          </p>
        </div>

        {/* View Controls: Language + Device Frame Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-md)' }}>
            <Globe size={15} color="var(--teal-vibrant)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en" style={{ background: 'var(--bg-card)' }}>English (US)</option>
              <option value="hi" style={{ background: 'var(--bg-card)' }}>हिंदी (Hindi)</option>
              <option value="es" style={{ background: 'var(--bg-card)' }}>Español (Spanish)</option>
            </select>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          >
            <Smartphone size={15} />
            <span>{deviceFrameMode ? 'Full Width' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Phone Frame or Responsive Card */}
      <div className={deviceFrameMode ? 'patient-device-container' : ''}>
        <div className={deviceFrameMode ? 'mobile-frame' : 'card'} style={!deviceFrameMode ? { maxWidth: '850px', margin: '0 auto' } : {}}>
          {deviceFrameMode && <div className="mobile-notch" />}

          <div className="mobile-screen-content">
            {/* Patient Header Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: patient.avatarBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '1rem'
                  }}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {patient.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {patient.age} yrs · {tenant.name}
                    </div>
                  </div>
                </div>
                <span className="status-chip completed" style={{ fontSize: '0.68rem' }}>
                  Consent Active
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--teal-hover)', fontWeight: 600 }}>
                {t.tagline}
              </div>
            </div>

            {/* Doctor's Approved Care Instructions Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Heart size={16} color="var(--rose-danger)" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.drNotesTitle}
                </h4>
              </div>
              <div style={{
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontStyle: 'italic',
                borderLeft: '3px solid var(--teal-primary)'
              }}>
                "{t.drNotesBody}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span>Verified by Dr. Rajesh Sharma, MD</span>
                <span>Oct 21, 2026</span>
              </div>
            </div>

            {/* Upcoming Appointment */}
            {patientAppointment && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--teal-vibrant)" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t.upcomingVisit}
                    </h4>
                  </div>
                  <span className="status-chip approved" style={{ fontSize: '0.68rem' }}>
                    {patientAppointment.status}
                  </span>
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {patientAppointment.dateTime}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {patientAppointment.type} · {patientAppointment.doctorName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => alert('Calendar event (.ics) generated for ' + patientAppointment.dateTime)}
                  >
                    {t.calendar}
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => alert('Reschedule request sent to clinic coordinator queue.')}
                  >
                    {t.reschedule}
                  </button>
                </div>
              </div>
            )}

            {/* Patient Checklist & Actionable Tasks */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={16} color="var(--emerald-success)" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.todoTitle}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Task 1: Upload Lab Test */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: uploadSuccessTask ? '1px solid var(--emerald-success)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Complete Fasting HbA1c & Urine ACR Test
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Due by Oct 23 · Lab visit required
                      </div>
                    </div>
                    {uploadSuccessTask ? (
                      <span className="status-chip completed" style={{ fontSize: '0.68rem' }}>
                        <Check size={12} /> Received
                      </span>
                    ) : (
                      <span className="status-chip overdue" style={{ fontSize: '0.68rem' }}>
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Upload Action Button */}
                  <div style={{ marginTop: '0.85rem' }}>
                    {uploadSuccessTask ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={14} />
                        <span>hba1c_fasting_panel_oct24.pdf uploaded & OCR analyzed</span>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', fontSize: '0.78rem' }}
                        onClick={() => handleSimulateUpload('task-01')}
                      >
                        <Upload size={14} />
                        <span>{t.uploadPrompt}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Task 2: Self-record Blood Sugar */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: glucoseSubmitted ? '1px solid var(--emerald-success)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.logGlucose}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Day 2 of 3 consecutive mornings
                      </div>
                    </div>
                    {glucoseSubmitted && (
                      <span className="status-chip completed" style={{ fontSize: '0.68rem' }}>
                        <Check size={12} /> Logged
                      </span>
                    )}
                  </div>

                  {!glucoseSubmitted ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                      <input
                        type="number"
                        value={glucoseInput}
                        onChange={(e) => setGlucoseInput(e.target.value)}
                        placeholder="mg/dL"
                        style={{
                          width: '110px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.6rem',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '0.78rem' }}
                        onClick={() => handleLogGlucose('task-03')}
                      >
                        <span>{t.submitReading} (mg/dL)</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={14} />
                      <span>Recorded 142 mg/dL in patient diabetes timeline</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coordinator Support Drawer / Chat */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} color="var(--teal-vibrant)" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Clinic Coordinator Contact
                  </h4>
                </div>
                <span className="live-dot" />
              </div>

              {/* Chat Message Box */}
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: msg.sender === 'patient' ? 'var(--teal-primary)' : 'var(--bg-secondary)',
                      color: msg.sender === 'patient' ? 'white' : 'var(--text-primary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '0.2rem' }}>
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Ask a scheduling or lab question..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    flex: 1,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.6rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSendMessage}>
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Safety & Emergency Notice (Strict Clinical Safety Rule in PRD) */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.76rem',
              color: '#fda4af',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--rose-danger)' }}>
                <ShieldAlert size={15} />
                <span>{t.emergencyTitle}</span>
              </div>
              <div>{t.emergencyBody}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
