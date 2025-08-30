import React, { useState, useEffect } from 'react';
import LogCreator from './LogCreator';
import ActivityList from './ActivityList';
import Schemes from './Schemes';
import AppointmentCalendar from './AppointmentCalendar';
import { getInfants, createInfant, getLogsForInfant, addLogForInfant } from '../services/api';
import { authenticatedFetch } from '../services/api';
import './Dashboard.css';

const MotherDashboard = ({ currentUser, onLogout }) => {
  // State for data
  const [infant, setInfant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // State for UI control
  const [view, setView] = useState('dashboard'); // 'dashboard', 'schemes', or 'calendar'
  
  // State for the infant registration form
  const [infantName, setInfantName] = useState('');
  const [infantGender, setInfantGender] = useState('Male');
  const [infantDob, setInfantDob] = useState('');
  const [motherName, setMotherName] = useState('');

  const fetchDashboardData = async () => {
    try {
      const allInfants = await getInfants();
      const myInfant = allInfants.find(inf => inf.mother_id === currentUser.id);
      
      if (myInfant) {
        setInfant(myInfant);
        const logsData = await getLogsForInfant(myInfant.id);
        setLogs(logsData);
        const appointmentsResponse = await authenticatedFetch(`/infants/${myInfant.id}/appointments`);
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser.id]);

  const handleCreateInfant = async (e) => {
    e.preventDefault();
    const response = await createInfant({ 
        name: infantName, 
        gender: infantGender,
        dob: infantDob,
        mother_name: motherName,
        mother_id: currentUser.id 
    });
    if(response.ok) {
        fetchDashboardData();
    }
  };

  const handleAddLog = async (logType) => {
    if (!infant) return;
    await addLogForInfant(infant.id, logType);
    fetchDashboardData();
  };

  // --- RENDER LOGIC ---
  if (view === 'schemes') {
    return <Schemes onBack={() => setView('dashboard')} />;
  }
  if (view === 'calendar') {
    return (
        <div className="dashboard-container">
            <button onClick={() => setView('dashboard')} className="back-button">← Back to Dashboard</button>
            <header className="dashboard-header"><h1>Appointment Calendar</h1></header>
            <AppointmentCalendar appointments={appointments} />
        </div>
    );
  }
  if (!infant) {
    return (
        <div className="dashboard-container form-container">
            <h2>Welcome, Mother!</h2>
            <p>Please register your infant to begin tracking.</p>
            <form onSubmit={handleCreateInfant} className="infant-reg-form">
                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Enter Mother's Name" required />
                <input type="text" value={infantName} onChange={(e) => setInfantName(e.target.value)} placeholder="Enter Infant's Name" required />
                <select value={infantGender} onChange={(e) => setInfantGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <input type="date" value={infantDob} onChange={(e) => setInfantDob(e.target.value)} placeholder="Date of Birth" required />
                <button type="submit">Register Infant</button>
            </form>
             <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
    );
  }

  const upcomingAppointment = appointments
    .filter(apt => new Date(apt.appointment_date) > new Date())
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0];

  return (
    <div className="dashboard-container">
        <header className="dashboard-header">
            <h1>{infant.name}'s Dashboard 🤱</h1>
            <button onClick={onLogout} className="logout-button">Logout</button>
        </header>
        <main>
            {upcomingAppointment && (
                <div className="reminder-card">
                    <span className="reminder-icon">
                        {upcomingAppointment.type === 'vaccination' ? '💉' : '📅'}
                    </span>
                    <div className="reminder-text">
                        <strong>Reminder:</strong> Your next appointment, "{upcomingAppointment.title}", is on {new Date(upcomingAppointment.appointment_date).toLocaleDateString()}.
                    </div>
                </div>
            )}
            <div className="dashboard-actions">
                <button onClick={() => setView('schemes')}>View Govt. Schemes</button>
                <button onClick={() => setView('calendar')}>View Calendar</button>
            </div>
            <LogCreator onLogAdd={handleAddLog} />
            <ActivityList logs={logs} />
        </main>
    </div>
  );
};

export default MotherDashboard;