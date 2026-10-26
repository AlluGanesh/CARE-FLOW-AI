import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "doctor@metrohealth.org",
        "password": "doctor123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "CLINICIAN"
    assert data["tenant_id"] == "tenant-metro"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "doctor@metrohealth.org",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_tenant_isolation_patient_access(client):
    # Log in as MetroHealth doctor
    login_res = client.post("/api/auth/login", json={
        "email": "doctor@metrohealth.org",
        "password": "doctor123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Metro doctor accesses Metro patient (pat-101) -> 200 OK
    res1 = client.get("/api/patients/pat-101", headers=headers)
    assert res1.status_code == 200
    assert res1.json()["name"] == "Ananya Rao"

    # Metro doctor attempts to access St. Jude patient (pat-201) -> 403 FORBIDDEN
    res2 = client.get("/api/patients/pat-201", headers=headers)
    assert res2.status_code == 403
    assert "belongs to another tenant" in res2.json()["error"]["message"]

def test_tenant_isolation_patient_listing(client):
    login_res = client.post("/api/auth/login", json={
        "email": "doctor@metrohealth.org",
        "password": "doctor123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/patients", headers=headers)
    assert res.status_code == 200
    patients = res.json()
    # All returned patients must strictly belong to tenant-metro
    for p in patients:
        assert p["tenant_id"] == "tenant-metro"
