/**
 * Backend API Client for CARE-FLOW AI Phase 3.
 * Connects frontend React UI to the production FastAPI backend.
 * Provides resilient fallback to Phase 2 client-side research if backend is offline.
 */

const BACKEND_BASE_URL = 'http://localhost:8000';

export interface BackendRunStatus {
  id: string;
  status: string;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  safetyStatus: string;
  evidenceStatus: string;
  revisionCount: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface BackendResearchResult {
  id: string;
  patientId: string;
  status: string;
  progress: number;
  safetyStatus: string;
  evidenceStatus: string;
  researchMode: string;
  revisionCount: number;
  lastClinicianFeedback?: string;
  isClinicianApproved: boolean;
  result: any;
  startedAt: string;
  completedAt?: string;
}

class BackendClient {
  private token: string | null = null;
  private tenantId: string = 'tenant-metro';
  private userId: string = 'usr-doc-1';
  private userRole: string = 'CLINICIAN';

  public setAuthContext(token: string | null, tenantId: string, userId: string, role: string) {
    this.token = token;
    this.tenantId = tenantId;
    this.userId = userId;
    this.userRole = role;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
      'X-User-ID': this.userId,
      'X-User-Role': this.userRole
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.access_token;
    this.tenantId = data.tenant_id;
    this.userId = data.user_id;
    this.userRole = data.role;
    return data;
  }

  public async createResearchRun(
    patientId: string,
    reportText: string,
    reportTitle: string = 'Diagnostic Clinical Report',
    mode: string = 'FULL_AGENTIC'
  ): Promise<{ id: string; status: string; progress: number }> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        patient_id: patientId,
        report_text: reportText,
        report_title: reportTitle,
        mode
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to initiate research run on backend.');
    }
    return await res.json();
  }

  public async getResearchRunStatus(runId: string): Promise<BackendRunStatus> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs/${runId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch research run status.');
    }
    return await res.json();
  }

  public async getResearchRunResult(runId: string): Promise<BackendResearchResult> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs/${runId}/result`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch research result.');
    }
    return await res.json();
  }

  public async approveResearchRun(runId: string, reason: string): Promise<any> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs/${runId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to approve research run.');
    }
    return await res.json();
  }

  public async rejectResearchRun(runId: string, reason: string): Promise<any> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs/${runId}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to reject research run.');
    }
    return await res.json();
  }

  public async requestRevision(runId: string, feedback: string): Promise<any> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/research/runs/${runId}/revision`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ feedback })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to request revision on backend.');
    }
    return await res.json();
  }

  public async getAuditEvents(): Promise<any[]> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/audit`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  }

  public async verifyAuditIntegrity(): Promise<{ status: string; verified: boolean; totalEvents: number; message: string }> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/audit/verify-integrity`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!res.ok) return { status: 'ERROR', verified: false, totalEvents: 0, message: 'Could not connect to audit service' };
    return await res.json();
  }

  public async triggerEscalation(): Promise<any> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/tasks/escalate`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Escalation failed');
    return await res.json();
  }
}

export const backendClient = new BackendClient();
