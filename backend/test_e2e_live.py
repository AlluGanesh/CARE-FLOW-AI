import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_full_live_e2e():
    print("=== LIVE E2E VERIFICATION TEST ===")
    client = httpx.Client(timeout=30.0)
    
    # 1. Health check
    res = client.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] 1. Backend health check: OK")
    
    # 2. Clinician Headers
    clinician_headers = {
        "X-Tenant-ID": "tenant-apex",
        "X-User-ID": "usr-dr-roy",
        "X-User-Role": "CLINICIAN",
        "Content-Type": "application/json"
    }
    
    # Patient Headers
    patient_headers = {
        "X-Tenant-ID": "tenant-apex",
        "X-User-ID": "usr-pat-apex",
        "X-User-Role": "PATIENT",
        "Content-Type": "application/json"
    }
    
    # 3. Create Research Run for Ananya Rao
    report_text = """
    PATIENT EVALUATION REPORT
    Patient: Ananya Rao
    DOB: 12/04/1982 | Gender: Female
    
    DIAGNOSES:
    - Type 2 Diabetes Mellitus (ICD-10 E11.9)
    - Essential Hypertension
    
    LABORATORY FINDINGS:
    - Hemoglobin A1c (HbA1c): 8.2% (High, reference < 5.7%)
    - Fasting Plasma Glucose: 165 mg/dL (Elevated)
    - eGFR: 78 mL/min/1.73m2 (Mild impairment)
    
    CURRENT REGIMEN:
    - Metformin Hydrochloride 500 mg oral tablet twice daily with meals
    - Lisinopril 10 mg daily
    
    PLAN:
    - Re-evaluate glycemic control in 3 months
    - Lifestyle modification and dietary counseling
    """
    
    create_payload = {
        "patient_id": "pat-100",
        "report_text": report_text,
        "report_title": "Diagnostic Follow-Up Evaluation",
        "mode": "FULL_AGENTIC"
    }
    
    res = client.post(f"{BASE_URL}/api/research/runs", json=create_payload, headers=clinician_headers)
    assert res.status_code in (200, 201), f"Create run failed: {res.text}"
    run_data = res.json()
    run_id = run_data["id"]
    print(f"[OK] 2. Created Research Run ID: {run_id} | Status: {run_data['status']}")
    
    # 4. Check Status (Agent executes synchronously or updates to WAITING_FOR_APPROVAL)
    res = client.get(f"{BASE_URL}/api/research/runs/{run_id}", headers=clinician_headers)
    assert res.status_code == 200
    status_data = res.json()
    print(f"[OK] 3. Agent Execution State: {status_data['status']} | Progress: {status_data['progress']}% | Tasks: {status_data['tasksCompleted']}/{status_data['tasksTotal']}")
    assert status_data["status"] == "WAITING_FOR_APPROVAL", f"Expected WAITING_FOR_APPROVAL, got {status_data['status']}"
    
    # 5. PATIENT VISIBILITY BOUNDARY: Patient attempts to access result before approval
    res = client.get(f"{BASE_URL}/api/research/runs/{run_id}/result", headers=patient_headers)
    assert res.status_code == 403, f"Expected 403 Forbidden for patient before approval, got {res.status_code}"
    print(f"[OK] 4. Patient Visibility Boundary Verified: Patient blocked from unapproved research (403 Forbidden)")
    
    # 6. Clinician inspects evidence before approval
    res = client.get(f"{BASE_URL}/api/research/runs/{run_id}/result", headers=clinician_headers)
    assert res.status_code == 200, f"Clinician get result failed: {res.text}"
    result_data = res.json()
    assert result_data["safetyStatus"] == "PASSED", f"Expected safetyStatus PASSED, got {result_data['safetyStatus']}"
    assert len(result_data["result"]["claims"]) > 0, "No claims generated"
    assert len(result_data["result"]["sources"]) > 0, "No sources retrieved"
    print(f"[OK] 5. Clinician Inspected Dossier: {len(result_data['result']['claims'])} Claims | {len(result_data['result']['sources'])} Sources | Safety: {result_data['safetyStatus']}")
    
    # 7. Clinician tests REVISION loop
    rev_payload = {"feedback": "Please ensure renal safety and eGFR threshold is emphasized for Metformin."}
    res = client.post(f"{BASE_URL}/api/research/runs/{run_id}/revision", json=rev_payload, headers=clinician_headers)
    assert res.status_code == 200, f"Revision request failed: {res.text}"
    rev_data = res.json()
    assert rev_data["revisionCount"] >= 1
    print(f"[OK] 6. Clinician Revision Feedback Loop Tested: Iteration count: {rev_data['revisionCount']} | Status: {rev_data['status']}")
    
    # 8. Clinician APPROVES result
    app_payload = {"decision": "APPROVED", "reason": "Verified against clinical standards. Suitable for patient."}
    res = client.post(f"{BASE_URL}/api/research/runs/{run_id}/approve", json=app_payload, headers=clinician_headers)
    assert res.status_code == 200, f"Approval failed: {res.text}"
    app_data = res.json()
    assert app_data["status"] == "APPROVED"
    print(f"[OK] 7. Clinician Approval Gate: APPROVED & RELEASED by Dr. Ananya Roy")
    
    # 9. PATIENT ACCESS AFTER APPROVAL
    res = client.get(f"{BASE_URL}/api/research/runs/{run_id}/result", headers=patient_headers)
    assert res.status_code == 200, f"Patient could not access approved research: {res.text}"
    patient_view = res.json()
    print(f"[OK] 8. Patient Access Granted Post-Approval: Patient can now view educational explanation")
    
    # 10. Audit Chain Verification
    res = client.get(f"{BASE_URL}/api/audit/verify-integrity", headers=clinician_headers)
    assert res.status_code == 200
    audit_data = res.json()
    assert audit_data["verified"] is True
    print(f"[OK] 9. Audit Trail Integrity: SHA-256 Cryptographic Chaining Valid across {audit_data['totalEvents']} events")
    
    print("\n>>> ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_full_live_e2e()
