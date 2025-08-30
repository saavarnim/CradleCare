from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta, datetime
import database as db
import ai_service
from database import SessionLocal
from security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from security import SECRET_KEY, ALGORITHM

db.create_db_and_tables()
app = FastAPI()

# --- THIS IS THE CRUCIAL CORS MIDDLEWARE BLOCK ---
# It tells the backend to allow requests from your frontend's origin.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------------------------

@app.on_event("startup")
def on_startup():
    db.create_db_and_tables()
    database = db.SessionLocal()
    if database.query(db.Scheme).count() == 0:
        sample_schemes = [
            db.Scheme(name="Janani Suraksha Yojana (JSY)", description="A safe motherhood intervention promoting institutional delivery among poor pregnant women.", eligibility="Pregnant women.", link="#"),
            db.Scheme(name="Pradhan Mantri Matru Vandana Yojana (PMMVY)", description="A maternity benefit program offering cash incentives for wage-loss.", eligibility="Pregnant and lactating mothers for the first live birth.", link="#")
        ]
        database.add_all(sample_schemes)
        database.commit()
    database.close()

# --- Pydantic Models ---
class Token(BaseModel): access_token: str; token_type: str
class TokenData(BaseModel): phone: Optional[str] = None
class LogCreate(BaseModel): type: str
class InfantCreate(BaseModel): name: str; gender: str; dob: date; mother_name: str; mother_id: int
class UserCreate(BaseModel): phone: str; password: str; role: str
class UserLogin(BaseModel): phone: str; password: str
class GrowthRecordCreate(BaseModel): weight_kg: float; height_cm: float
class AppointmentCreate(BaseModel): title: str; appointment_date: datetime; type: str

# --- Dependencies ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")
def get_db():
    database = SessionLocal()
    try: yield database
    finally: database.close()

def get_current_user(token: str = Depends(oauth2_scheme), database: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None: raise credentials_exception
        token_data = TokenData(phone=phone)
    except JWTError:
        raise credentials_exception
    user = database.query(db.User).filter(db.User.phone == token_data.phone).first()
    if user is None: raise credentials_exception
    return user

# --- API Endpoints ---
@app.get("/")
def read_root(): return {"message": "Welcome to the CradleCare API!"}

@app.get("/api/schemes")
def get_schemes(database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    return database.query(db.Scheme).all()

@app.post("/api/users/register")
def register_user(user: UserCreate, database: Session = Depends(get_db)):
    db_user = database.query(db.User).filter(db.User.phone == user.phone).first()
    if db_user: raise HTTPException(status_code=400, detail="Phone number already registered")
    hashed_password = get_password_hash(user.password)
    new_user = db.User(phone=user.phone, password=hashed_password, role=user.role)
    database.add(new_user); database.commit(); database.refresh(new_user); return new_user

@app.post("/api/users/login", response_model=Token)
def login_for_access_token(user_login: UserLogin, database: Session = Depends(get_db)):
    db_user = database.query(db.User).filter(db.User.phone == user_login.phone).first()
    if not db_user or not verify_password(user_login.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": db_user.phone}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me")
def read_users_me(current_user: db.User = Depends(get_current_user)):
    return current_user

@app.post("/api/infants")
def create_infant(infant: InfantCreate, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    new_infant = db.Infant(**infant.dict()); database.add(new_infant); database.commit(); database.refresh(new_infant); return new_infant

@app.get("/api/infants")
def get_all_infants(database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    return database.query(db.Infant).all()

@app.get("/api/logs/{infant_id}")
def get_logs_for_infant(infant_id: int, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    return database.query(db.Log).filter(db.Log.infant_id == infant_id).order_by(db.Log.id.desc()).all()

@app.post("/api/logs/{infant_id}")
def create_log_for_infant(infant_id: int, log_entry: LogCreate, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    new_log = db.Log(type=log_entry.type, infant_id=infant_id); database.add(new_log); database.commit(); database.refresh(new_log); return new_log

@app.post("/api/infants/{infant_id}/growth")
def create_growth_record(infant_id: int, record: GrowthRecordCreate, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    if not (0.5 < record.weight_kg < 40): raise HTTPException(status_code=400, detail="Invalid weight. Please enter a value between 0.5 and 40 kg.")
    if not (20 < record.height_cm < 150): raise HTTPException(status_code=400, detail="Invalid height. Please enter a value between 20 and 150 cm.")
    infant = database.query(db.Infant).filter(db.Infant.id == infant_id).first()
    if not infant: raise HTTPException(status_code=404, detail="Infant not found")
    new_record_data = {"weight_kg": round(record.weight_kg, 2), "height_cm": round(record.height_cm, 2), "infant_id": infant_id}
    new_record = db.GrowthRecord(**new_record_data)
    database.add(new_record)
    analysis_result = ai_service.get_ai_analysis(record.dict(), infant.dob)
    infant.risk_status = analysis_result.get("risk_level", "Error")
    database.commit()
    database.refresh(new_record)
    database.refresh(infant)
    return {"record": new_record, "analysis": analysis_result}

@app.get("/api/infants/{infant_id}/growth")
def get_growth_records(infant_id: int, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    return database.query(db.GrowthRecord).filter(db.GrowthRecord.infant_id == infant_id).order_by(db.GrowthRecord.id.desc()).all()

@app.get("/api/infants/{infant_id}/appointments")
def get_appointments(infant_id: int, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    return database.query(db.Appointment).filter(db.Appointment.infant_id == infant_id).order_by(db.Appointment.appointment_date.asc()).all()

@app.post("/api/infants/{infant_id}/appointments")
def create_appointment(infant_id: int, appt: AppointmentCreate, database: Session = Depends(get_db), current_user: db.User = Depends(get_current_user)):
    new_appt = db.Appointment(**appt.dict(), infant_id=infant_id)
    database.add(new_appt)
    database.commit()
    database.refresh(new_appt)
    return new_appt