from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
# --- RELATIVE IMPORTS ---
from . import models
from . import schemas
from .database import engine, get_db

app = FastAPI(title="Study Program Backend", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ DB connected.")
except Exception as e:
    print("❌ DB error:", e)


@app.get("/")
def root(): return {"message": "Backend Online"}


# =========================
# AVAILABILITIES (JSON VERSION)
# =========================

@app.get("/availabilities/", response_model=list[schemas.AvailabilityResponse])
def read_availabilities(db: Session = Depends(get_db)):
    return db.query(models.LecturerAvailability).all()


@app.post("/availabilities/update")
def update_availability(payload: schemas.AvailabilityUpdate, db: Session = Depends(get_db)):
    # Check if a row already exists for this lecturer
    existing = db.query(models.LecturerAvailability).filter(
        models.LecturerAvailability.lecturer_id == payload.lecturer_id
    ).first()

    if existing:
        # Update existing row
        existing.schedule_data = payload.schedule_data
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new row
        new_row = models.LecturerAvailability(
            lecturer_id=payload.lecturer_id,
            schedule_data=payload.schedule_data
        )
        db.add(new_row)
        db.commit()
        db.refresh(new_row)
        return new_row


@app.delete("/availabilities/lecturer/{lecturer_id}")
def delete_lecturer_availability(lecturer_id: int, db: Session = Depends(get_db)):
    db.query(models.LecturerAvailability).filter(
        models.LecturerAvailability.lecturer_id == lecturer_id
    ).delete()
    db.commit()
    return {"ok": True}


# =========================
# LECTURERS
# =========================
@app.get("/lecturers/", response_model=list[schemas.LecturerResponse])
def read_lecturers(db: Session = Depends(get_db)): return db.query(models.Lecturer).all()


@app.post("/lecturers/", response_model=schemas.LecturerResponse)
def create_lecturer(l: schemas.LecturerCreate, db: Session = Depends(get_db)):
    row = models.Lecturer(**l.model_dump());
    db.add(row);
    db.commit();
    db.refresh(row);
    return row


@app.put("/lecturers/{id}", response_model=schemas.LecturerResponse)
def update_lecturer(id: int, l: schemas.LecturerCreate, db: Session = Depends(get_db)):
    row = db.query(models.Lecturer).filter(models.Lecturer.id == id).first()
    if not row: raise HTTPException(404)
    for k, v in l.model_dump().items(): setattr(row, k, v)
    db.commit();
    db.refresh(row);
    return row


@app.delete("/lecturers/{id}")
def delete_lecturer(id: int, db: Session = Depends(get_db)):
    row = db.query(models.Lecturer).filter(models.Lecturer.id == id).first();
    if row: db.delete(row); db.commit()
    return {"ok": True}


# =========================
# STUDY PROGRAMS & SPECS
# =========================
@app.get("/study-programs/", response_model=list[schemas.StudyProgramResponse])
def read_programs(db: Session = Depends(get_db)):
    return db.query(models.StudyProgram).options(joinedload(models.StudyProgram.specializations)).all()


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
    if not db_program: raise HTTPException(status_code=404, detail="Program not found")
    for k, v in program.model_dump().items(): setattr(db_program, k, v)
    db.commit()
    db.refresh(db_program)
    return db_program


@app.delete("/study-programs/{program_id}")
def delete_program(program_id: int, db: Session = Depends(get_db)):
    db_program = db.query(models.StudyProgram).filter(models.StudyProgram.id == program_id).first()
    if not db_program: raise HTTPException(status_code=404, detail="Program not found")
    db.delete(db_program)
    db.commit()
    return {"ok": True}


@app.get("/specializations/", response_model=list[schemas.SpecializationResponse])
def read_specializations(db: Session = Depends(get_db)):
    return db.query(models.Specialization).all()


@app.post("/specializations/", response_model=schemas.SpecializationResponse)
def create_specialization(spec: schemas.SpecializationCreate, db: Session = Depends(get_db)):
    program = db.query(models.StudyProgram).filter(models.StudyProgram.id == spec.program_id).first()
    if not program: raise HTTPException(status_code=404, detail="Program not found")
    data = spec.model_dump()
    data["study_program"] = program.name
    db_spec = models.Specialization(**data)
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec


@app.put("/specializations/{spec_id}", response_model=schemas.SpecializationResponse)
def update_specialization(spec_id: int, spec: schemas.SpecializationCreate, db: Session = Depends(get_db)):
    db_spec = db.query(models.Specialization).filter(models.Specialization.id == spec_id).first()
    if not db_spec: raise HTTPException(status_code=404, detail="Specialization not found")
    data = spec.model_dump()
    if spec.program_id != db_spec.program_id:
        program = db.query(models.StudyProgram).filter(models.StudyProgram.id == spec.program_id).first()
        if program: data["study_program"] = program.name
    else:
        data["study_program"] = db_spec.study_program
    for k, v in data.items(): setattr(db_spec, k, v)
    db.commit()
    db.refresh(db_spec)
    return db_spec


@app.delete("/specializations/{spec_id}")
def delete_specialization(spec_id: int, db: Session = Depends(get_db)):
    db_spec = db.query(models.Specialization).filter(models.Specialization.id == spec_id).first()
    if not db_spec: raise HTTPException(status_code=404, detail="Specialization not found")
    db.delete(db_spec)
    db.commit()
    return {"ok": True}


# =========================
# MODULES
# =========================
@app.get("/modules/", response_model=list[schemas.ModuleResponse])
def read_modules(db: Session = Depends(get_db)):
    return db.query(models.Module).options(joinedload(models.Module.specializations)).all()


@app.post("/modules/", response_model=schemas.ModuleResponse)
def create_module(module: schemas.ModuleCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Module).filter(models.Module.module_code == module.module_code).first()
    if existing: raise HTTPException(status_code=400, detail="Module code exists")

    data = module.model_dump()
    spec_ids = data.pop("specialization_ids", [])
    db_module = models.Module(**data)

    if spec_ids:
        specs = db.query(models.Specialization).filter(models.Specialization.id.in_(spec_ids)).all()
        db_module.specializations = specs

    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module


@app.put("/modules/{module_code}", response_model=schemas.ModuleResponse)
def update_module(module_code: str, module: schemas.ModuleCreate, db: Session = Depends(get_db)):
    db_module = db.query(models.Module).filter(models.Module.module_code == module_code).first()
    if not db_module: raise HTTPException(status_code=404, detail="Module not found")

    data = module.model_dump()
    spec_ids = data.pop("specialization_ids", [])

    for k, v in data.items(): setattr(db_module, k, v)

    specs = db.query(models.Specialization).filter(models.Specialization.id.in_(spec_ids)).all()
    db_module.specializations = specs

    db.commit()
    db.refresh(db_module)
    return db_module


@app.delete("/modules/{module_code}")
def delete_module(module_code: str, db: Session = Depends(get_db)):
    db_module = db.query(models.Module).filter(models.Module.module_code == module_code).first()
    if not db_module: raise HTTPException(status_code=404, detail="Module not found")
    db.delete(db_module)
    db.commit()
    return {"ok": True}


# =========================
# GROUPS, ROOMS, ETC.
# =========================
@app.get("/groups/", response_model=list[schemas.GroupResponse])
def read_groups(db: Session = Depends(get_db)): return db.query(models.Group).all()


@app.post("/groups/", response_model=schemas.GroupResponse)
def create_group(g: schemas.GroupCreate, db: Session = Depends(get_db)):
    row = models.Group(**g.model_dump());
    db.add(row);
    db.commit();
    db.refresh(row);
    return row


@app.put("/groups/{id}", response_model=schemas.GroupResponse)
def update_group(id: int, g: schemas.GroupCreate, db: Session = Depends(get_db)):
    row = db.query(models.Group).filter(models.Group.id == id).first()
    if not row: raise HTTPException(404)
    for k, v in g.model_dump().items(): setattr(row, k, v)
    db.commit();
    db.refresh(row);
    return row


@app.delete("/groups/{id}")
def delete_group(id: int, db: Session = Depends(get_db)):
    row = db.query(models.Group).filter(models.Group.id == id).first();
    if row: db.delete(row); db.commit();
    return {"ok": True}


@app.get("/constraint-types/", response_model=list[schemas.ConstraintTypeResponse])
def read_constraint_types(db: Session = Depends(get_db)): return db.query(models.ConstraintType).all()


@app.get("/rooms/", response_model=list[schemas.RoomResponse])
def read_rooms(db: Session = Depends(get_db)): return db.query(models.Room).all()


@app.post("/rooms/", response_model=schemas.RoomResponse)
def create_room(r: schemas.RoomCreate, db: Session = Depends(get_db)):
    row = models.Room(**r.model_dump());
    db.add(row);
    db.commit();
    db.refresh(row);
    return row


@app.put("/rooms/{id}", response_model=schemas.RoomResponse)
def update_room(id: int, r: schemas.RoomCreate, db: Session = Depends(get_db)):
    row = db.query(models.Room).filter(models.Room.id == id).first()
    if not row: raise HTTPException(404)
    for k, v in r.model_dump().items(): setattr(row, k, v)
    db.commit();
    db.refresh(row);
    return row


@app.delete("/rooms/{id}")
def delete_room(id: int, db: Session = Depends(get_db)):
    row = db.query(models.Room).filter(models.Room.id == id).first();
    if row: db.delete(row); db.commit();
    return {"ok": True}


@app.get("/scheduler-constraints/", response_model=list[schemas.SchedulerConstraintResponse])
def read_cs(db: Session = Depends(get_db)): return db.query(models.SchedulerConstraint).all()


@app.post("/scheduler-constraints/", response_model=schemas.SchedulerConstraintResponse)
def create_c(c: schemas.SchedulerConstraintCreate, db: Session = Depends(get_db)):
    row = models.SchedulerConstraint(**c.model_dump());
    db.add(row);
    db.commit();
    db.refresh(row);
    return row


@app.put("/scheduler-constraints/{id}", response_model=schemas.SchedulerConstraintResponse)
def update_c(id: int, c: schemas.SchedulerConstraintCreate, db: Session = Depends(get_db)):
    row = db.query(models.SchedulerConstraint).filter(models.SchedulerConstraint.id == id).first()
    if not row: raise HTTPException(404)
    for k, v in c.model_dump().items(): setattr(row, k, v)
    db.commit();
    db.refresh(row);
    return row


@app.delete("/scheduler-constraints/{id}")
def delete_c(id: int, db: Session = Depends(get_db)):
    row = db.query(models.SchedulerConstraint).filter(models.SchedulerConstraint.id == id).first();
    if row: db.delete(row); db.commit();
    return {"ok": True}