from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float, Date
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

INTERNAL_DB_URL = "postgresql://cradlecare_db_user:J2K7tNi5k5pb9rgvqleFkZDjjgG7P6zR@dpg-d2p8a4l6ubrc73c1n4o0-a/cradlecare_db"
SQLALCHEMY_DATABASE_URL = INTERNAL_DB_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    password = Column(String) 
    role = Column(String)
    
    infants = relationship("Infant", back_populates="mother")

class Infant(Base):
    __tablename__ = "infants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    gender = Column(String)
    dob = Column(Date)
    mother_name = Column(String)
    risk_status = Column(String, default="Not Assessed") # NEW COLUMN
    mother_id = Column(Integer, ForeignKey("users.id"))
    
    mother = relationship("User", back_populates="infants")
    logs = relationship("Log", back_populates="infant")
    growth_records = relationship("GrowthRecord", back_populates="infant")
    appointments = relationship("Appointment")

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    infant_id = Column(Integer, ForeignKey("infants.id"))

    infant = relationship("Infant", back_populates="logs")

class GrowthRecord(Base):
    __tablename__ = "growth_records"
    id = Column(Integer, primary_key=True, index=True)
    weight_kg = Column(Float)
    height_cm = Column(Float)
    record_date = Column(DateTime, default=datetime.datetime.utcnow)
    infant_id = Column(Integer, ForeignKey("infants.id"))

    infant = relationship("Infant", back_populates="growth_records")

class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    eligibility = Column(String)
    link = Column(String, nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    appointment_date = Column(DateTime)
    type = Column(String, default="checkup")
    status = Column(String, default="scheduled")
    infant_id = Column(Integer, ForeignKey("infants.id"))

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)