from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal


class SpecializationCreate(BaseModel):
    name: str
    acronym: str
    start_date: str
    is_active: bool


class SpecializationResponse(SpecializationCreate):
    id: int
    program_id: int

    class Config:
        from_attributes = True


class StudyProgramCreate(BaseModel):
    name: str
    acronym: str
    head_of_program: str
    is_active: bool
    start_date: str
    total_ects: int


class StudyProgramResponse(StudyProgramCreate):
    id: int
    specializations: List[SpecializationResponse] = []

    class Config:
        from_attributes = True


# ---------------- MODULES ----------------

class ModuleCreate(BaseModel):
    module_name: str
    room_type: str
    sessions_per_week: int
    semester: int
    total_sessions: int
    class_duration: int
    number_of_students: int
    onsite_online: str


class ModuleResponse(ModuleCreate):
    module_id: int

    class Config:
        from_attributes = True


# ---------------- LECTURERS ----------------

class LecturerCreate(BaseModel):
    full_name: str
    domain: str
    employment_type: str
    personal_email: Optional[str] = None
    mdh_email: Optional[str] = None


class LecturerResponse(LecturerCreate):
    id: int

    class Config:
        from_attributes = True


# ---------------- GROUPS ----------------

class GroupCreate(BaseModel):
    group_name: str
    size: int
    description: Optional[str] = None
    email: Optional[str] = None


class GroupResponse(GroupCreate):
    id: int

    class Config:
        from_attributes = True


# =========================================================
# SCHEDULER CONSTRAINTS (NEW)
# =========================================================

Hardness = Literal["HARD", "SOFT"]
Scope = Literal["GLOBAL", "LECTURER", "GROUP", "MODULE", "ROOM", "PROGRAM", "SPECIALIZATION"]


class ConstraintTypeCreate(BaseModel):
    code: str
    description: str
    default_hardness: Hardness
    is_active: bool = True


class ConstraintTypeResponse(ConstraintTypeCreate):
    id: int

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    name: str
    capacity: int = Field(ge=0)
    capabilities: List[str] = []
    is_active: bool = True


class RoomResponse(RoomCreate):
    id: int

    class Config:
        from_attributes = True


class SchedulerConstraintCreate(BaseModel):
    constraint_type_id: int
    hardness: Hardness
    weight: Optional[int] = Field(default=None, ge=0)

    scope: Scope
    target_id: Optional[int] = None

    config: Dict[str, Any] = {}
    is_enabled: bool = True
    notes: Optional[str] = None


class SchedulerConstraintResponse(SchedulerConstraintCreate):
    id: int

    class Config:
        from_attributes = True
