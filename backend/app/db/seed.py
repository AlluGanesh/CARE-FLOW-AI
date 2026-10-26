from app.db.session import SessionLocal
from app.models import Tenant, User, Patient, CareTask
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Tenant).count() > 0:
            return

        # 1. Tenants
        metro = Tenant(
            id="tenant-metro",
            name="MetroHealth Hospital Network",
            code="METRO"
        )
        st_jude = Tenant(
            id="tenant-stjude",
            name="St. Jude Community Clinic",
            code="STJUDE"
        )
        db.add_all([metro, st_jude])
        db.flush()

        # 2. Users with explicit RBAC
        users = [
            User(
                id="usr-doc-1",
                tenant_id="tenant-metro",
                email="doctor@metrohealth.org",
                full_name="Dr. Rajesh Sharma, MD",
                role="CLINICIAN",
                hashed_password=get_password_hash("doctor123")
            ),
            User(
                id="usr-nurse-1",
                tenant_id="tenant-metro",
                email="nurse@metrohealth.org",
                full_name="Meera Nair, RN",
                role="STAFF",
                hashed_password=get_password_hash("nurse123")
            ),
            User(
                id="usr-pat-1",
                tenant_id="tenant-metro",
                email="ananya.rao@example.com",
                full_name="Ananya Rao",
                role="PATIENT",
                hashed_password=get_password_hash("patient123")
            ),
            User(
                id="usr-admin-1",
                tenant_id="tenant-metro",
                email="admin@metrohealth.org",
                full_name="Metro Admin",
                role="ADMIN",
                hashed_password=get_password_hash("admin123")
            ),
            # Tenant B User
            User(
                id="usr-doc-2",
                tenant_id="tenant-stjude",
                email="doctor@stjude.org",
                full_name="Dr. Sarah Jenkins, MD",
                role="CLINICIAN",
                hashed_password=get_password_hash("doctor123")
            )
        ]
        db.add_all(users)
        db.flush()

        # 3. Patients (Tenant Metro)
        patients = [
            Patient(
                id="pat-101",
                tenant_id="tenant-metro",
                name="Ananya Rao",
                age=54,
                gender="Female",
                primary_condition="Type 2 Diabetes Mellitus",
                risk_level="HIGH",
                phone="+91 98765 43210",
                email="ananya.rao@example.com",
                metadata_info={
                    "attendingDoctor": "Dr. Rajesh Sharma, MD",
                    "diagnoses": ["Type 2 Diabetes Mellitus", "Essential Hypertension", "Dyslipidemia"],
                    "currentMeds": ["Metformin 500mg BID", "Lisinopril 10mg OD", "Atorvastatin 20mg OD"]
                }
            ),
            Patient(
                id="pat-102",
                tenant_id="tenant-metro",
                name="Marcus Vance",
                age=62,
                gender="Male",
                primary_condition="Stage 2 Hypertension",
                risk_level="CRITICAL",
                phone="+1 555-0192",
                email="marcus.vance@example.com",
                metadata_info={
                    "attendingDoctor": "Dr. Rajesh Sharma, MD",
                    "diagnoses": ["Stage 2 Hypertension", "Chronic Kidney Disease Stage 2"],
                    "currentMeds": ["Amlodipine 10mg OD", "Losartan 50mg OD"]
                }
            ),
            # Patient in Tenant B (St. Jude) for tenant isolation verification
            Patient(
                id="pat-201",
                tenant_id="tenant-stjude",
                name="David Miller",
                age=48,
                gender="Male",
                primary_condition="Asthma",
                risk_level="MEDIUM",
                phone="+1 555-0283",
                email="david.miller@example.com",
                metadata_info={
                    "attendingDoctor": "Dr. Sarah Jenkins, MD",
                    "diagnoses": ["Moderate Persistent Asthma"],
                    "currentMeds": ["Albuterol Inhaler", "Fluticasone"]
                }
            )
        ]
        db.add_all(patients)
        db.flush()

        # 4. Care Tasks
        tasks = [
            CareTask(
                id="task-01",
                tenant_id="tenant-metro",
                patient_id="pat-101",
                title="Fasting Blood Glucose & HbA1c Lab Panel",
                description="3-month glycemic control monitoring panel",
                category="LAB_TEST",
                due_date="2026-10-24",
                status="OVERDUE",
                priority="HIGH",
                assigned_to="Meera Nair, RN",
                escalation_level=1,
                escalation_status="FLAGGED"
            ),
            CareTask(
                id="task-02",
                tenant_id="tenant-metro",
                patient_id="pat-101",
                title="Endocrinology Follow-Up Consultation",
                description="Review lab results and adjust care plan",
                category="APPOINTMENT",
                due_date="2026-10-28",
                status="PENDING",
                priority="HIGH",
                assigned_to="Dr. Rajesh Sharma, MD",
                escalation_level=0,
                escalation_status="NONE"
            )
        ]
        db.add_all(tasks)
        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
