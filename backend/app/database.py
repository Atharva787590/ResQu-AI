import os
import json
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///database.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    type = Column(String) # flood, fire, earthquake, cyclone, landslide, accident, medical
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="active") # active, resolved, monitoring
    severity = Column(String) # low, medium, high, critical
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)

class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String) # shelter, relief camp, food center, assembly point
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    capacity = Column(Integer)
    occupancy = Column(Integer, default=0)
    medical_support = Column(Boolean, default=False)
    pet_friendly = Column(Boolean, default=False)
    contact_number = Column(String)

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    total_beds = Column(Integer)
    available_beds = Column(Integer)
    blood_types_available = Column(String) # comma-separated list
    ambulance_contacts = Column(String) # comma-separated list
    contact_number = Column(String)

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    skills = Column(String) # comma-separated list
    location = Column(String)
    contact_number = Column(String)
    status = Column(String, default="available") # available, deployed, offline
    assigned_task = Column(String)

class MissingPerson(Base):
    __tablename__ = "missing_persons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    last_seen_location = Column(String)
    last_seen_date = Column(String)
    description = Column(String)
    photo_url = Column(String) # local path or mock url
    contact_info = Column(String)
    status = Column(String, default="missing") # missing, found, reunited
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)

class SosAlert(Base):
    __tablename__ = "sos_alerts"
    id = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String, nullable=False)
    sender_phone = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    situation = Column(String)
    status = Column(String, default="pending") # pending, dispatched, resolved
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    state = Column(String) # safe, blocked, flooded, landslide
    path_coordinates = Column(String) # JSON array of [lat, lng] pairs

def init_db():
    Base.metadata.create_all(bind=engine)
