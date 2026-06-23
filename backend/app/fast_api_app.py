import os
# Try loading environment variables from .env file
try:
    possible_paths = [
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    ]
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        os.environ[k] = v
            break
except Exception as e:
    pass

import sys
import datetime
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List

# Ensure current directory is in path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.cli.fast_api import get_fast_api_app
from .database import SessionLocal, init_db, Shelter, Hospital, Incident, Volunteer, MissingPerson, SosAlert, Route

# Ensure tables are created
init_db()

# Seed database if empty
db = SessionLocal()
if db.query(Shelter).count() == 0:
    db.close()
    from .seed import seed_data
    seed_data()
else:
    db.close()

# Request/Response Pydantic Models
class ShelterCreate(BaseModel):
    name: str
    type: str
    latitude: float
    longitude: float
    address: str
    capacity: int
    occupancy: int = 0
    medical_support: bool = False
    pet_friendly: bool = False
    contact_number: str

class HospitalCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: str
    total_beds: int
    available_beds: int
    blood_types_available: str
    ambulance_contacts: str
    contact_number: str

class IncidentCreate(BaseModel):
    title: str
    description: str
    type: str
    latitude: float
    longitude: float
    severity: str

class VolunteerCreate(BaseModel):
    name: str
    skills: str
    location: str
    contact_number: str

class MissingPersonCreate(BaseModel):
    name: str
    age: int
    last_seen_location: str
    description: str
    contact_info: str

class SosAlertCreate(BaseModel):
    sender_name: str
    sender_phone: str
    latitude: float
    longitude: float
    situation: str

# Create FastAPI app by wrapping the ADK App
AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# In-memory session configuration
session_service_uri = None
artifact_service_uri = None

# Get standard ADK FastAPI app (enables builder web interface and /run endpoints)
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    allow_origins=["*"],
    session_service_uri=session_service_uri,
    artifact_service_uri=artifact_service_uri,
    auto_create_session=True,
)

app.title = "ResQu AI API"
app.description = "API for emergency resource tracking and multi-agent coordination."

# Configure CORS for Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom REST Endpoints
@app.get("/api/incidents")
def read_incidents():
    db = SessionLocal()
    try:
        incidents = db.query(Incident).order_by(Incident.reported_at.desc()).all()
        return incidents
    finally:
        db.close()

@app.post("/api/incidents")
def create_incident(inc: IncidentCreate):
    db = SessionLocal()
    try:
        new_inc = Incident(
            title=inc.title,
            description=inc.description,
            type=inc.type,
            latitude=inc.latitude,
            longitude=inc.longitude,
            status="active",
            severity=inc.severity,
            reported_at=datetime.datetime.utcnow()
        )
        db.add(new_inc)
        db.commit()
        db.refresh(new_inc)
        return new_inc
    finally:
        db.close()

@app.get("/api/shelters")
def read_shelters(
    type: Optional[str] = None,
    pet_friendly: Optional[bool] = None,
    medical_support: Optional[bool] = None
):
    db = SessionLocal()
    try:
        query = db.query(Shelter)
        if type:
            query = query.filter(Shelter.type == type)
        if pet_friendly is not None:
            query = query.filter(Shelter.pet_friendly == pet_friendly)
        if medical_support is not None:
            query = query.filter(Shelter.medical_support == medical_support)
        return query.all()
    finally:
        db.close()

@app.post("/api/shelters")
def create_shelter(s: ShelterCreate):
    db = SessionLocal()
    try:
        new_s = Shelter(
            name=s.name,
            type=s.type,
            latitude=s.latitude,
            longitude=s.longitude,
            address=s.address,
            capacity=s.capacity,
            occupancy=s.occupancy,
            medical_support=s.medical_support,
            pet_friendly=s.pet_friendly,
            contact_number=s.contact_number
        )
        db.add(new_s)
        db.commit()
        db.refresh(new_s)
        return new_s
    finally:
        db.close()

@app.get("/api/hospitals")
def read_hospitals():
    db = SessionLocal()
    try:
        return db.query(Hospital).all()
    finally:
        db.close()

@app.get("/api/volunteers")
def read_volunteers():
    db = SessionLocal()
    try:
        return db.query(Volunteer).order_by(Volunteer.id.desc()).all()
    finally:
        db.close()

@app.post("/api/volunteers")
def create_volunteer(v: VolunteerCreate):
    db = SessionLocal()
    try:
        new_v = Volunteer(
            name=v.name,
            skills=v.skills,
            location=v.location,
            contact_number=v.contact_number,
            status="available",
            assigned_task="None"
        )
        db.add(new_v)
        db.commit()
        db.refresh(new_v)
        return new_v
    finally:
        db.close()

@app.get("/api/missing-persons")
def read_missing_persons():
    db = SessionLocal()
    try:
        return db.query(MissingPerson).order_by(MissingPerson.reported_at.desc()).all()
    finally:
        db.close()

@app.post("/api/missing-persons")
def create_missing_person(mp: MissingPersonCreate):
    db = SessionLocal()
    try:
        new_mp = MissingPerson(
            name=mp.name,
            age=mp.age,
            last_seen_location=mp.last_seen_location,
            last_seen_date=datetime.datetime.now().strftime("%B %d, %Y, %I:%M %p"),
            description=mp.description,
            photo_url="/placeholder_person_1.jpg",
            contact_info=mp.contact_info,
            status="missing",
            reported_at=datetime.datetime.utcnow()
        )
        db.add(new_mp)
        db.commit()
        db.refresh(new_mp)
        return new_mp
    finally:
        db.close()

@app.get("/api/sos-alerts")
def read_sos_alerts():
    db = SessionLocal()
    try:
        return db.query(SosAlert).order_by(SosAlert.reported_at.desc()).all()
    finally:
        db.close()

@app.post("/api/sos-alerts")
def create_sos_alert(sos: SosAlertCreate):
    db = SessionLocal()
    try:
        new_sos = SosAlert(
            sender_name=sos.sender_name,
            sender_phone=sos.sender_phone,
            latitude=sos.latitude,
            longitude=sos.longitude,
            situation=sos.situation,
            status="pending",
            reported_at=datetime.datetime.utcnow()
        )
        db.add(new_sos)
        db.commit()
        
        # Also create active incident for map
        new_inc = Incident(
            title=f"Distress Call: {sos.sender_name}",
            description=f"Logged SOS distress: {sos.situation}. Contact: {sos.sender_phone}",
            type="medical" if "injury" in sos.situation.lower() or "bleed" in sos.situation.lower() else "accident",
            latitude=sos.latitude,
            longitude=sos.longitude,
            status="active",
            severity="critical",
            reported_at=datetime.datetime.utcnow()
        )
        db.add(new_inc)
        db.commit()
        
        db.refresh(new_sos)
        return new_sos
    finally:
        db.close()

@app.get("/api/routes")
def read_routes():
    db = SessionLocal()
    try:
        return db.query(Route).all()
    finally:
        db.close()

@app.post("/api/routes")
def calculate_route_endpoint(start_lat: float, start_lng: float, end_lat: float, end_lng: float):
    # Dynamic calculations utilizing our tool
    from .tools import get_safe_route
    return get_safe_route(start_lat, start_lng, end_lat, end_lng)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
