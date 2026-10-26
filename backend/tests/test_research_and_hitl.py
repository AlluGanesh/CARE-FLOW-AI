import pytest

SAMPLE_REPORT = """
PATIENT DIAGNOSTIC REPORT
Patient: Ananya Rao | Age: 54 | Gender: Female
Date: 2026-10-24 | Facility: MetroHealth Endocrinology

CLINICAL IMPRESSIONS:
- Type 2 Diabetes Mellitus
- Essential Hypertension

DIAGNOSTIC FINDINGS:
- Hemoglobin A1c (HbA1c): 8.2% (High, reference < 5.7%)
- Fasting Blood Glucose: 168 mg/dL (High)
- Blood Pressure: 138/88 mmHg

CURRENT MEDICATIONS:
- Metformin 500 mg BID
- Lisinopril 10 mg OD

RECOMMENDATIONS & FOLLOW-UP:
Follow-up clinic visit required within 14 days. Recheck renal panel and glycemic logs.
"""

def test_research_run_full_cycle_and_hitl(client):
    # 1. Clinician logs in
    login_res = client.post("/api/auth/login", json={
        "email": "doctor@metrohealth.org",
        "password": "doctor123"
    })
    doc_token = login_res.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # Patient logs in
    pat_login = client.post("/api/auth/login", json={
        "email": "ananya.rao@example.com",
        "password": "patient123"
    })
    pat_token = pat_login.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {pat_token}"}

    # 2. Clinician initiates Research Run for Patient pat-101
    create_res = client.post("/api/research/runs", headers=doc_headers, json={
        "patient_id": "pat-101",
        "report_text": SAMPLE_REPORT,
        "report_title": "Endocrinology Panel - Ananya Rao",
        "mode": "FULL_AGENTIC"
    })
    assert create_res.status_code == 201
    run_id = create_res.json()["id"]

    # 3. Check status: Agent should have advanced to WAITING_FOR_APPROVAL
    status_res = client.get(f"/api/research/runs/{run_id}", headers=doc_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "WAITING_FOR_APPROVAL"
    assert status_data["progress"] >= 80
    assert status_data["safetyStatus"] == "PASSED"
    assert status_data["evidenceStatus"] in ["SUFFICIENT", "PARTIAL"]
    assert status_data["tasksCompleted"] > 0

    # 4. PATIENT VISIBILITY TEST: Patient attempts to view unapproved research
    pat_view_res = client.get(f"/api/research/runs/{run_id}/result", headers=pat_headers)
    assert pat_view_res.status_code == 403
    assert "awaiting clinician review" in pat_view_res.json()["error"]["message"]

    # 5. RBAC TEST: Patient attempts to approve research
    pat_approve_res = client.post(f"/api/research/runs/{run_id}/approve", headers=pat_headers, json={
        "reason": "I approve my own report."
    })
    assert pat_approve_res.status_code == 403

    # 6. REVISION LOOP TEST: Clinician requests revision
    rev_res = client.post(f"/api/research/runs/{run_id}/revision", headers=doc_headers, json={
        "feedback": "Please emphasize renal safety monitoring and eGFR baseline for Metformin."
    })
    assert rev_res.status_code == 200
    assert rev_res.json()["revisionCount"] == 1

    # 7. Clinician reviews result evidence
    res_data = client.get(f"/api/research/runs/{run_id}/result", headers=doc_headers)
    assert res_data.status_code == 200
    result_json = res_data.json()["result"]
    assert len(result_json["conditions"]) > 0
    assert len(result_json["tests"]) > 0
    assert len(result_json["medicines"]) > 0
    assert len(result_json["sources"]) > 0
    assert len(result_json["citations"]) > 0

    # 8. Clinician Approves the research
    approve_res = client.post(f"/api/research/runs/{run_id}/approve", headers=doc_headers, json={
        "reason": "Evidence and educational guidance reviewed and verified."
    })
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 9. PATIENT VISIBILITY TEST: Now that it's approved, patient can view it!
    pat_approved_view = client.get(f"/api/research/runs/{run_id}/result", headers=pat_headers)
    assert pat_approved_view.status_code == 200
    pat_data = pat_approved_view.json()
    assert pat_data["isClinicianApproved"] is True
    assert "patientNotice" in pat_data["result"]
    # Private internal reasoning / traces are omitted for patient
    assert "evidence" not in pat_data["result"]

    # 10. Cryptographic Tamper-Evident Audit Trail Verification
    audit_verify_res = client.get("/api/audit/verify-integrity", headers=doc_headers)
    assert audit_verify_res.status_code == 200
    audit_data = audit_verify_res.json()
    assert audit_data["status"] == "VERIFIED"
    assert audit_data["verified"] is True
    assert audit_data["totalEvents"] >= 4
