# CareFlow AI — Intelligent Patient Care Coordination SaaS

> **Tagline**: Intelligent Patient Care Coordination & Follow-Up Automation  
> **Target Users**: Clinics, Doctors, Nurses, Care Coordinators, Clinic Admins, and Patients  
> **Architecture**: Multi-tenant SaaS with Multi-Agent AI Orchestration (LangGraph-ready)  

---

## 🌟 Overview & Key Capabilities

CareFlow AI is an Agentic AI-powered healthcare coordination platform that solves post-consultation leakage. It connects doctors, administrative staff, diagnostic centers, and patients to close the care loop.

### Core Modules Implemented (PRD v1.0)
1. **Clinic Operations Dashboard (Module H)**: Real-time operational overview with KPI metrics (≥80% completion target), active overdue task queues, pending reports, and critical escalations.
2. **Clinician Approval Workspace (Module C & HITL Checkpoint)**: Doctor consultation notes parsing, AI task extraction, explicit source text grounding (99.2% recall, 0% hallucinations), inline task editor, and 1-click clinical sign-off.
3. **Patient Care Portal (Module I)**: Mobile-responsive patient interface with multilingual toggle (English, Hindi, Spanish), doctor-approved instructions, calendar sync, lab report drag-and-drop upload, and daily glucose logger.
4. **Multi-Agent Orchestrator (Section 6)**: Visual state machine and live trace terminal monitoring all 6 specialized agents:
   - **Agent 1**: Care Plan Intelligence Agent
   - **Agent 6**: Audit & Verification Agent
   - **Agent 2**: Scheduling Agent (Conflict-free booking with concurrency tokens)
   - **Agent 3**: Patient Engagement Agent (Multilingual notification outbox)
   - **Agent 4**: Follow-Up Monitoring Agent (Deterministic deadline crons)
   - **Agent 5**: Escalation Agent (Critical staff work queues)
5. **Diagnostic Reports Tracking (Module G)**: OCR parameter extraction (HbA1c, Fasting Glucose, eGFR, Urine ACR) with threshold alert flags.
6. **Communications Outbox (Module F)**: SMS, WhatsApp, and Email dispatch tracking with automatic retry counter.
7. **Security & Clinical Audit Trail (Module 11 & Section 8)**: Cryptographically timestamped audit log of all consequential AI and clinician actions.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on: http://127.0.0.1:5173/

# Type check and production build
npm run build
```

---

## 🛡️ Clinical Safety Principles

- **AI Proposes, Clinician Approves**: Consequential follow-up tasks require qualified clinical sign-off before patient activation.
- **Strict Grounding**: Every generated task cites the verbatim doctor note sentence. No phantom deadlines.
- **Emergency Safeguard**: The patient portal prominently displays emergency triage warnings directing patients to 112 / 911 for acute symptoms.
