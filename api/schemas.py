from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal

Hardness = Literal["Hard", "Soft"]
Scope = Literal["Global", "Program", "Specialization", "Module", "Lecturer", "Group", "Room"]
ProgramLevel = Literal["Bachelor", "Master"]

# --- Availability Schemas (UPDATED for JSON) ---
class AvailabilityResponse(BaseModel):
    id: int
    lecturer_id: int
    schedule_data: Dict[str, Any]
    model_config = ConfigDict(from_attributes=True)

class AvailabilityUpdate(BaseModel):
    lecturer_id: int
    schedule_data: Dict[str, Any]

# --- Existing Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SpecializationLink(BaseModel):
    id: int
    name: str
    acronym: str
    start_date: str
    status: bool
    model_config = ConfigDict(from_attributes=True)

class SpecializationCreate(BaseModel):
    name: str
    acronym: str
    start_date: str
    status: bool = True
    program_id: int

class SpecializationResponse(SpecializationCreate):
    id: int
    study_program: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class StudyProgramCreate(BaseModel):
    name: str
    acronym: str
    head_of_program: str
    status: bool = True
    start_date: str
    total_ects: int
    location: Optional[str] = None
    level: ProgramLevel = "Bachelor"

class StudyProgramResponse(StudyProgramCreate):
    id: int
    specializations: List[SpecializationResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ModuleCreate(BaseModel):
    module_code: str
    name: str
    ects: int
    room_type: str
    semester: int
    assessment_type: Optional[str] = None
    category: Optional[str] = None
    program_id: Optional[int] = None
    specialization_ids: List[int] = []

class ModuleResponse(BaseModel):
    module_code: str
    name: str
    ects: int
    room_type: str
    semester: int
    assessment_type: Optional[str] = None
    category: Optional[str] = None
    program_id: Optional[int] = None
    specializations: List[SpecializationLink] = []
    model_config = ConfigDict(from_attributes=True)

class LecturerCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    title: str
    employment_type: str
    personal_email: Optional[str] = None
    mdh_email: str # Mandatory
    phone: Optional[str] = None
    location: Optional[str] = None
    teaching_load: Optional[str] = None
class LecturerResponse(LecturerCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class GroupCreate(BaseModel):
    name: str
    size: int
    description: Optional[str] = None
    email: Optional[str] = None
    program: Optional[str] = None
    parent_group: Optional[str] = None
class GroupResponse(GroupCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ConstraintTypeCreate(BaseModel):
    name: str
    active: bool = True
    constraint_level: Optional[str] = None
    constraint_format: Optional[str] = None
    constraint_rule: Optional[str] = None
    constraint_target: Optional[str] = None
class ConstraintTypeResponse(ConstraintTypeCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class RoomCreate(BaseModel):
    name: str
    capacity: int
    type: str
    status: bool
    equipment: Optional[str] = None
    location: Optional[str] = None
class RoomResponse(RoomCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)