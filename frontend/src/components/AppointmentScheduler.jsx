import React, { useState } from 'react';
import { authenticatedFetch } from '../services/api';
import './Dashboard.css';

const AppointmentScheduler = ({ infant, onAppointmentScheduled, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('checkup');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authenticatedFetch(`/infants/${infant.id}/appointments`, {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          appointment_date: date,
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule appointment.');
      }

      onAppointmentScheduled(); // Tell the parent component to refresh
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Schedule Appointment for {infant.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="checkup">General Check-up</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>
          <div className="input-group">
            <label>Title / Vaccine Name</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Date</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
            <button type="submit" className="confirm-btn">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentScheduler;