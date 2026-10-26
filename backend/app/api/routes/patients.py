from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientResponse, PatientCreate
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns patients strictly isolated to the authenticated user's tenant.
    """
    patients = db.query(Patient).filter(Patient.tenant_id == current_user.tenant_id).all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches a specific patient.
    Strictly forbids access if patient belongs to another tenant.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found."
        )

    if patient.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Patient belongs to another tenant. Access denied."
        )

    return patient
