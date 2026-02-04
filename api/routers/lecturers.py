from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas, auth
from ..permissions import role_of, is_admin_or_pm

router = APIRouter(prefix="/lecturers", tags=["lecturers"])


# ✅ GET: Ver Lecturers (CON FILTRO DE PRIVACIDAD)
@router.get("/", response_model=List[schemas.LecturerResponse])
def read_lecturers(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    r = role_of(current_user)

    # 🔒 SI ES LECTURER: Solo se ve a sí mismo
    if r == "lecturer":
        # Verificamos si el usuario tiene un lecturer_id asociado
        if hasattr(current_user, "lecturer_id") and current_user.lecturer_id is not None:
            return db.query(models.Lecturer).filter(models.Lecturer.id == current_user.lecturer_id).all()
        else:
            # Si no tiene ID asociado (caso raro), intentamos por email o devolvemos vacío para seguridad
            return db.query(models.Lecturer).filter(models.Lecturer.mdh_email == current_user.email).all()

    # 🔓 SI ES ADMIN/PM/HoSP: Ve la lista completa
    return db.query(models.Lecturer).all()


# ✅ POST: Crear (Solo Admin/PM/HoSP)
@router.post("/", response_model=schemas.LecturerResponse)
def create_lecturer(p: schemas.LecturerCreate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    r = role_of(current_user)
    if r in ["student", "lecturer"]:
        raise HTTPException(status_code=403, detail="Only Admins can create lecturers")

    new_lecturer = models.Lecturer(**p.dict())
    db.add(new_lecturer)
    db.commit()
    db.refresh(new_lecturer)
    return new_lecturer


# ✅ PUT: Editar (Híbrido: Profesor solo edita Contacto)
@router.put("/{lecturer_id}", response_model=schemas.LecturerResponse)
def update_lecturer(lecturer_id: int, p: schemas.LecturerUpdate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    lecturer = db.query(models.Lecturer).filter(models.Lecturer.id == lecturer_id).first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")

    r = role_of(current_user)

    # Lógica de Permisos
    if is_admin_or_pm(current_user) or r == "hosp":
        # Admin/Jefe: Actualiza
        for key, value in p.dict(exclude_unset=True).items():
            setattr(lecturer, key, value)

    elif r == "lecturer":
        # Profesor: Solo actualiza Phone y Personal Email
        # Verificamos que esté editando SU propio perfil
        if hasattr(current_user, "lecturer_id") and current_user.lecturer_id != lecturer_id:
            raise HTTPException(status_code=403, detail="You can only edit your own profile")

        if p.phone is not None:
            lecturer.phone = p.phone
        if p.personal_email is not None:
            lecturer.personal_email = p.personal_email

    else:
        raise HTTPException(status_code=403, detail="Not authorized to edit lecturers")

    db.commit()
    db.refresh(lecturer)
    return lecturer


# ✅ DELETE: Borrar (Solo Admin/PM/HoSP)
@router.delete("/{lecturer_id}")
def delete_lecturer(lecturer_id: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    r = role_of(current_user)
    if r in ["student", "lecturer"]:
        raise HTTPException(status_code=403, detail="Only Admins can delete lecturers")

    lecturer = db.query(models.Lecturer).filter(models.Lecturer.id == lecturer_id).first()
    if lecturer:
        db.delete(lecturer)
        db.commit()
    return {"ok": True}