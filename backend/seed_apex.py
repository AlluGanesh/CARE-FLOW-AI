from app.db.session import SessionLocal
from app.models import Tenant, User, Patient
from app.core.security import get_password_hash

def seed_apex():
    db = SessionLocal()
    try:
        # 1. Tenant Apex
        apex = db.query(Tenant).filter(Tenant.id == "tenant-apex").first()
        if not apex:
            apex = Tenant(
                id="tenant-apex",
                name="Apex Multispeciality Clinic",
                code="APEX"
            )
            db.add(apex)
            db.flush()

        # 2. Users for Apex
        usr_roy = db.query(User).filter(User.id == "usr-dr-roy").first()
        if not usr_roy:
            usr_roy = User(
                id="usr-dr-roy",
                tenant_id="tenant-apex",
                email="dr.roy@apexclinic.health",
                full_name="Dr. Ananya Roy, MD",
                role="CLINICIAN",
                hashed_password=get_password_hash("doctor123")
            )
            db.add(usr_roy)

        usr_doc1 = db.query(User).filter(User.id == "usr-doc-1-apex").first()
        if not usr_doc1:
            usr_doc1 = User(
                id="usr-doc-1-apex",
                tenant_id="tenant-apex",
                email="doc1@apexclinic.health",
                full_name="Dr. Rajesh Sharma, MD",
                role="CLINICIAN",
                hashed_password=get_password_hash("doctor123")
            )
            db.add(usr_doc1)

        usr_pat = db.query(User).filter(User.id == "usr-pat-apex").first()
        if not usr_pat:
            usr_pat = User(
                id="usr-pat-apex",
                tenant_id="tenant-apex",
                email="ananya.patient@apexclinic.health",
                full_name="Ananya Rao",
                role="PATIENT",
                hashed_password=get_password_hash("patient123")
            )
            db.add(usr_pat)

        db.flush()

        # 3. Patients for Apex (pat-100 is Ananya Rao in frontend mockData)
        pat_100 = db.query(Patient).filter(Patient.id == "pat-100").first()
        if not pat_100:
            pat_100 = Patient(
                id="pat-100",
                tenant_id="tenant-apex",
                name="Ananya Rao",
                age=42,
                gender="Female",
                primary_condition="Type 2 Diabetes Mellitus Follow-Up",
                risk_level="HIGH",
                phone="+91 98450 11223",
                email="ananya.rao@example.com",
                metadata_info={
                    "attendingDoctor": "Dr. Ananya Roy, MD",
                    "diagnoses": ["Type 2 Diabetes Mellitus", "Essential Hypertension"],
                    "currentMeds": ["Metformin 500mg BID"]
                }
            )
            db.add(pat_100)

        db.commit()
        print("Apex clinic seeded successfully into DB.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding Apex: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_apex()
