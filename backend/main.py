from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
import models
import schemas
from database import engine, get_db

app = FastAPI(title="Study Program Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.21.252.23:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in Neon DB if they don't exist
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Connected to Neon DB. Tables verified/created.")
except Exception as e:
    print("❌ Error connecting to DB:", e)


@app.get("/")
def root():
    return {"message": "Study Program Backend Online (Real DB)"}


# =========================
# STUDY PROGRAMS (CRUD)
# =========================
@app.get("/study-programs/", response_model=list[schemas.StudyProgramResponse])
def read_programs(db: Session = Depends(get_db)):
    return (
        db.query(models.StudyProgram)
        .options(joinedload(models.StudyProgram.specializations))
        .all()
    )


@app.post("/study-programs/", response_model=schemas.StudyProgramResponse)
def create_program(program: schemas.StudyProgramCreate, db: Session = Depends(get_db)):
    db_program = models.StudyProgram(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


@app.put("/study-programs/{program_id}", response_model=schemas.StudyProgramResponse)
def update_program(program_id: int, program: schemas.StudyProgramCreate, db: Session = Depends(get_db)):
    db_program = db.query(models.StudyProgram).filter(models.StudyProgram.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")

    for k, v in program.model_dump().items():
        setattr(db_program, k, v)

    db.commit()
    db.refresh(db_program)
    return db_program


@app.delete("/study-programs/{program_id}")
def delete_program(program_id: int, db: Session = Depends(get_db)):
    db_program = db.query(models.StudyProgram).filter(models.StudyProgram.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")

    db.delete(db_program)
    db.commit()
    return {"ok": True}


# =========================
# SPECIALIZATIONS (CRUD)
# =========================
@app.post("/specializations/", response_model=schemas.SpecializationResponse)
def create_specialization(spec: schemas.SpecializationCreate, db: Session = Depends(get_db)):
    # 1. Check if program exists
    program = db.query(models.StudyProgram).filter(models.StudyProgram.id == spec.program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # 2. Create the specialization
    db_spec = models.Specialization(**spec.model_dump())
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec


@app.put("/specializations/{spec_id}", response_model=schemas.SpecializationResponse)
def update_specialization(spec_id: int, spec: schemas.SpecializationCreate, db: Session = Depends(get_db)):
    db_spec = db.query(models.Specialization).filter(models.Specialization.id == spec_id).first()
    if not db_spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    # Update fields
    db_spec.name = spec.name
    db_spec.acronym = spec.acronym
    db_spec.start_date = spec.start_date
    db_spec.is_active = spec.is_active
    # We generally don't change program_id, but we can if needed

    db.commit()
    db.refresh(db_spec)
    return db_spec


@app.delete("/specializations/{spec_id}")
def delete_specialization(spec_id: int, db: Session = Depends(get_db)):
    db_spec = db.query(models.Specialization).filter(models.Specialization.id == spec_id).first()
    if not db_spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    db.delete(db_spec)
    db.commit()
    return {"ok": True}


# =========================
# MODULES (CRUD)
# =========================
@app.get("/modules/", response_model=list[schemas.ModuleResponse])
def read_modules(db: Session = Depends(get_db)):
    return db.query(models.Module).all()


@app.post("/modules/", response_model=schemas.ModuleResponse)
def create_module(module: schemas.ModuleCreate, db: Session = Depends(get_db)):
    db_module = models.Module(**module.model_dump())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module


@app.put("/modules/{module_id}", response_model=schemas.ModuleResponse)
def update_module(module_id: int, module: schemas.ModuleCreate, db: Session = Depends(get_db)):
    db_module = db.query(models.Module).filter(models.Module.module_id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")

    for k, v in module.model_dump().items():
        setattr(db_module, k, v)

    db.commit()
    db.refresh(db_module)
    return db_module


@app.delete("/modules/{module_id}")
def delete_module(module_id: int, db: Session = Depends(get_db)):
    db_module = db.query(models.Module).filter(models.Module.module_id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")

    db.delete(db_module)
    db.commit()
    return {"ok": True}


# =========================
# LECTURERS (CRUD)
# =========================
@app.get("/lecturers/", response_model=list[schemas.LecturerResponse])
def read_lecturers(db: Session = Depends(get_db)):
    return db.query(models.Lecturer).all()


@app.post("/lecturers/", response_model=schemas.LecturerResponse)
def create_lecturer(lecturer: schemas.LecturerCreate, db: Session = Depends(get_db)):
    db_lecturer = models.Lecturer(**lecturer.model_dump())
    db.add(db_lecturer)
    db.commit()
    db.refresh(db_lecturer)
    return db_lecturer


@app.put("/lecturers/{lecturer_id}", response_model=schemas.LecturerResponse)
def update_lecturer(lecturer_id: int, lecturer: schemas.LecturerCreate, db: Session = Depends(get_db)):
    row = db.query(models.Lecturer).filter(models.Lecturer.id == lecturer_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Lecturer not found")

    for k, v in lecturer.model_dump().items():
        setattr(row, k, v)

    db.commit()
    db.refresh(row)
    return row


@app.delete("/lecturers/{lecturer_id}")
def delete_lecturer(lecturer_id: int, db: Session = Depends(get_db)):
    row = db.query(models.Lecturer).filter(models.Lecturer.id == lecturer_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Lecturer not found")

    db.delete(row)
    db.commit()
    return {"ok": True}


# =========================
# GROUPS (CRUD)
# =========================
@app.get("/groups/", response_model=list[schemas.GroupResponse])
def read_groups(db: Session = Depends(get_db)):
    return db.query(models.Group).all()


@app.post("/groups/", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    row = models.Group(**group.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.put("/groups/{group_id}", response_model=schemas.GroupResponse)
def update_group(group_id: int, group: schemas.GroupCreate, db: Session = Depends(get_db)):
    row = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group not found")

    for k, v in group.model_dump().items():
        setattr(row, k, v)

    db.commit()
    db.refresh(row)
    return row


@app.delete("/groups/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    row = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group not found")

    db.delete(row)
    db.commit()
    return {"ok": True}


# =========================================================
# SCHEDULER CONSTRAINTS
# =========================================================

@app.get("/constraint-types/", response_model=list[schemas.ConstraintTypeResponse])
def read_constraint_types(db: Session = Depends(get_db)):
    return db.query(models.ConstraintType).order_by(models.ConstraintType.id.asc()).all()


@app.get("/rooms/", response_model=list[schemas.RoomResponse])
def read_rooms(db: Session = Depends(get_db)):
    return db.query(models.Room).order_by(models.Room.id.asc()).all()


@app.get("/scheduler-constraints/", response_model=list[schemas.SchedulerConstraintResponse])
def read_scheduler_constraints(db: Session = Depends(get_db)):
    return db.query(models.SchedulerConstraint).order_by(models.SchedulerConstraint.id.asc()).all()