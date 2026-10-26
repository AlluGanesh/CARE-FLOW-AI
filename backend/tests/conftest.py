import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import get_db, Base
from app.db.seed import seed_db

# Use test in-memory SQLite database
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    # Seed data using test db
    db = TestingSessionLocal()
    from app.models import Tenant, User, Patient, CareTask
    from app.core.security import get_password_hash

    # Seed tenants
    metro = Tenant(id="tenant-metro", name="MetroHealth Network", code="METRO")
    stjude = Tenant(id="tenant-stjude", name="St. Jude Clinic", code="STJUDE")
    db.add_all([metro, stjude])
    db.flush()

    # Seed users
    doc = User(id="usr-doc-1", tenant_id="tenant-metro", email="doctor@metrohealth.org", full_name="Dr. Rajesh Sharma, MD", role="CLINICIAN", hashed_password=get_password_hash("doctor123"))
    nurse = User(id="usr-nurse-1", tenant_id="tenant-metro", email="nurse@metrohealth.org", full_name="Meera Nair, RN", role="STAFF", hashed_password=get_password_hash("nurse123"))
    patient_user = User(id="usr-pat-1", tenant_id="tenant-metro", email="ananya.rao@example.com", full_name="Ananya Rao", role="PATIENT", hashed_password=get_password_hash("patient123"))
    stjude_doc = User(id="usr-doc-2", tenant_id="tenant-stjude", email="doctor@stjude.org", full_name="Dr. Sarah Jenkins", role="CLINICIAN", hashed_password=get_password_hash("doctor123"))
    db.add_all([doc, nurse, patient_user, stjude_doc])
    db.flush()

    # Seed patients
    p1 = Patient(id="pat-101", tenant_id="tenant-metro", name="Ananya Rao", age=54, gender="Female", primary_condition="Type 2 Diabetes Mellitus", risk_level="HIGH")
    p2 = Patient(id="pat-201", tenant_id="tenant-stjude", name="David Miller", age=48, gender="Male", primary_condition="Asthma", risk_level="MEDIUM")
    db.add_all([p1, p2])
    db.flush()

    # Seed tasks
    t1 = CareTask(id="task-01", tenant_id="tenant-metro", patient_id="pat-101", title="Fasting Glucose", due_date="2026-10-24", status="OVERDUE")
    db.add(t1)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
