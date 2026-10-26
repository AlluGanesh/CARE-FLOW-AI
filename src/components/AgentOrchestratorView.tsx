import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Terminal, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { AgentExecutionTrace, Tenant } from '../types';

interface AgentOrchestratorViewProps {
  tenant: Tenant;
  traces: AgentExecutionTrace[];
  onTriggerAgentCron: () => void;
  onTriggerEscalationAgent: () => void;
  onTriggerAuditCheck: () => void;
}

export const AgentOrchestratorView: React.FC<AgentOrchestratorViewProps> = ({
  tenant,
  traces,
  onTriggerAgentCron,
  onTriggerEscalationAgent,
  onTriggerAuditCheck
}) => {
  const [activeAgentId, setActiveAgentId] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationMsg, setSimulationMsg] = useState<string>('');

  const agents = [
    {
      num: 1,
      name: 'Care Plan Intelligence',
      role: 'Parses doctor consultation notes into structured proposed tasks with strict source grounding.',
      tools: ['extract_entities()', 'resolve_temporal_deadlines()', 'schema_validator()'],
      safeguard: 'Zero hallucinated tasks; clinical instructions never altered silently.',
      status: 'SUCCESS'
    },
    {
      num: 6,
      name: 'Audit & Verification',
      role: 'Cross-verifies proposed tasks against original doctor text before clinician sign-off.',
      tools: ['grounding_verifier()', 'detect_unsupported_claims()', 'log_audit_event()'],
      safeguard: 'Requires human clinician approval checkpoint before activating tasks.',
      status: 'SUCCESS'
    },
    {
      num: 2,
      name: 'Scheduling Agent',
      role: 'Queries doctor availability and proposes conflict-free follow-up slots.',
      tools: ['query_doctor_calendar()', 'check_working_hours()', 'reserve_slot_lock()'],
      safeguard: 'Backend concurrency locks prevent double-booking.',
      status: 'SUCCESS'
    },
    {
      num: 3,
      name: 'Patient Engagement',
      role: 'Dispatches personalized reminders across SMS, WhatsApp, and Email based on consent.',
      tools: ['template_selector()', 'verify_consent()', 'enqueue_outbox()', 'retry_handler()'],
      safeguard: 'No autonomous medical diagnoses or treatment recommendations.',
      status: 'SUCCESS'
    },
    {
      num: 4,
      name: 'Follow-Up Monitoring',
      role: 'Periodic deterministic cron evaluating overdue deadlines and missing diagnostic reports.',
      tools: ['evaluate_task_deadlines()', 'flag_overdue()', 'generate_work_queue()'],
      safeguard: 'Deterministic deadline logic, not LLM guesswork.',
      status: 'FLAGGED'
    },
    {
      num: 5,
      name: 'Escalation Agent',
      role: 'Routes unresolved follow-up gaps, unresponsive patients, or abnormal delays to clinic staff.',
      tools: ['create_escalation_ticket()', 'summarize_unresolved_history()', 'notify_staff_queue()'],
      safeguard: 'Clinical concerns always routed to qualified clinicians.',
      status: 'SUCCESS'
    },
    {
      num: 7,
      name: 'Medical Research Agent',
      role: 'Autonomous research planning, authoritative regulatory source retrieval (FDA/MedlinePlus), evidence extraction, claim verification, grounded explanation synthesis, and citation generation.',
      tools: ['search_medical_sources()', 'retrieve_source()', 'extract_evidence()', 'verify_claim()', 'generate_explanation()', 'validate_safety()', 'build_citation()'],
      safeguard: 'RESEARCH → VERIFY → EXPLAIN → CITE. Zero autonomous prescribing or diagnosis; ungrounded assertions strictly rejected.',
      status: 'SUCCESS'
    }
  ];

  const handleRunSimulation = (name: string, callback: () => void) => {
    setIsSimulating(true);
    setSimulationMsg(`Executing ${name}...`);
    callback();

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationMsg('');
    }, 1200);
  };

  const selectedAgent = agents.find(a => a.num === activeAgentId) || agents[0];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="nav-badge agent">Section 6 · State Machine Orchestrator</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LangGraph Multi-Agent Architecture</span>
          </div>
          <h1>Multi-Agent AI Orchestration & Live Tracing</h1>
          <p>
            Event-driven multi-agent execution pipeline: Agentic intelligence governed by deterministic verification and human checkpoints.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => handleRunSimulation('Audit & Verification Check', onTriggerAuditCheck)}
            disabled={isSimulating}
          >
            <ShieldCheck size={14} color="var(--emerald-success)" />
            <span>Verify Defenses</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleRunSimulation('Follow-Up Monitoring Cron', onTriggerAgentCron)}
            disabled={isSimulating}
          >
            <Play size={14} />
            <span>Run Monitoring Cron</span>
          </button>
        </div>
      </div>

      {/* Visual Agent Pipeline Grid */}
      <div className="agent-pipeline-container" style={{ marginBottom: '2rem' }}>
        <div className="agent-nodes-grid">
          {agents.map((ag) => {
            const isSelected = activeAgentId === ag.num;
            return (
              <div
                key={ag.num}
                className={`agent-node-card ${isSelected ? 'active' : ''} ${ag.status === 'FLAGGED' ? 'running' : ''}`}
                onClick={() => setActiveAgentId(ag.num)}
              >
                <div className="agent-badge-number">Agent {ag.num}</div>
                <div className="agent-name">{ag.name}</div>
                <div className="agent-status-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                  <span className="live-dot" style={{
                    background: ag.status === 'FLAGGED' ? 'var(--amber-warning)' : 'var(--emerald-success)'
                  }} />
                  <span style={{ color: ag.status === 'FLAGGED' ? 'var(--amber-warning)' : '#6ee7b7', fontWeight: 600 }}>
                    {ag.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Selected Agent Spec (Left) vs Real-Time Trace Log (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1.5rem' }}>
        {/* Left Column: Agent Inspector Card */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <div className="card-title">
                <Bot size={20} color="var(--violet-agent)" />
                <span>Agent {selectedAgent.num}: {selectedAgent.name}</span>
              </div>
              <div className="card-subtitle">Architecture specification & safety boundaries</div>
            </div>
            <span className="status-chip approved" style={{ fontSize: '0.72rem' }}>
              LangGraph Node
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
              Primary Role & Workflow
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {selectedAgent.role}
            </div>
          </div>

          {/* Authorized Tool Allowlists */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
              Authorized Tool Call Allowlist
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {selectedAgent.tools.map(tool => (
                <span
                  key={tool}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: 'var(--teal-vibrant)'
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Safety Safeguard */}
          <div style={{
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-hover)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} />
              <span>Safety & Clinical Boundary</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {selectedAgent.safeguard}
            </div>
          </div>

          {/* Quick Simulation Trigger for Selected Agent */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectedAgent.num === 5 && (
              <button
                className="btn btn-danger btn-sm"
                style={{ width: '100%' }}
                onClick={() => handleRunSimulation('Escalation Agent', onTriggerEscalationAgent)}
                disabled={isSimulating}
              >
                <span>Trigger Escalation Evaluation</span>
              </button>
            )}
            {selectedAgent.num === 4 && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => handleRunSimulation('Monitoring Agent', onTriggerAgentCron)}
                disabled={isSimulating}
              >
                <span>Evaluate Task Deadlines</span>
              </button>
            )}
            {(selectedAgent.num === 1 || selectedAgent.num === 6) && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => handleRunSimulation('Grounding Verification', onTriggerAuditCheck)}
                disabled={isSimulating}
              >
                <span>Run Grounding Verifier</span>
              </button>
            )}
            {(selectedAgent.num === 2 || selectedAgent.num === 3) && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => handleRunSimulation('Agent Pipeline Step', onTriggerAgentCron)}
                disabled={isSimulating}
              >
                <span>Execute Step</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Execution Terminal */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="terminal-dots">
                <span className="t-dot red" />
                <span className="t-dot yellow" />
                <span className="t-dot green" />
              </div>
              <span>CareFlow Multi-Agent Execution Stream · LangGraph Trace</span>
            </div>
            <span style={{ color: 'var(--teal-vibrant)' }}>Tenant: {tenant.id}</span>
          </div>

          <div className="terminal-body">
            {isSimulating && (
              <div className="terminal-line" style={{ color: '#c084fc' }}>
                <span className="t-time">[LIVE]</span>
                <span className="t-tag agent">[ORCHESTRATOR]</span>
                <span className="t-msg">{simulationMsg}</span>
              </div>
            )}

            {traces.map((trace) => (
              <div key={trace.id} className="terminal-line">
                <span className="t-time">[{trace.timestamp.split(' ')[1]}]</span>
                <span className={`t-tag ${trace.status === 'SUCCESS' ? 'verify' : trace.status === 'FLAGGED' ? 'warn' : 'info'}`}>
                  [Agent {trace.agentNumber}]
                </span>
                <div style={{ flex: 1 }}>
                  <div className="t-msg">{trace.logMessage}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Tools: {trace.toolCalls.join(' ➔ ')} ({trace.latencyMs}ms)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
