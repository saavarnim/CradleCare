import React, { useState, useEffect } from 'react';
import GrowthChart from './GrowthChart';
import AppointmentScheduler from './AppointmentScheduler';
import { getGrowthRecords, createGrowthRecord } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const InfantDetail = ({ infant, onBack }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [records, setRecords] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [view, setView] = useState('records');
  const [error, setError] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const fetchRecords = () => {
    getGrowthRecords(infant.id).then(data => setRecords(data));
  };

  useEffect(() => {
    fetchRecords();
  }, [infant.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAnalysis(null);

    const apiPromise = createGrowthRecord(infant.id, { 
        weight_kg: parseFloat(weight), 
        height_cm: parseFloat(height) 
    });

    toast.promise(apiPromise, {
        pending: 'Analyzing growth data with AI...',
        success: 'Analysis complete!',
        error: 'An error occurred. Please check the details below.'
    })
    .then(async (response) => {
        if (response.ok) {
            const result = await response.json();
            setAnalysis(result.analysis);
            setWeight('');
            setHeight('');
            fetchRecords();
        } else {
            const errorData = await response.json();
            setError(errorData.detail || 'An unknown error occurred.');
        }
    })
    .catch((err) => setError('Could not connect to the server.'))
    .finally(() => setIsLoading(false));
  };

  return (
    <>
      <div className="dashboard-container">
        <button onClick={onBack} className="back-button">← Back to List</button>
        <header className="dashboard-header">
          <h1>{infant.name}'s Details</h1>
          <div className="infant-meta">
            <span>Gender: {infant.gender}</span>
            <span>DOB: {new Date(infant.dob).toLocaleDateString()}</span>
            <span>Mother: {infant.mother_name}</span>
          </div>
        </header>
        <main>
          <div className="view-toggle">
            <button onClick={() => setView('records')} className={view === 'records' ? 'active' : ''}>Data Entry</button>
            <button onClick={() => setView('chart')} className={view === 'chart' ? 'active' : ''}>Growth Chart</button>
          </div>
          {view === 'records' ? (
            <>
              <div className="form-container">
                <h3>Enter New Growth Record</h3>
                <form onSubmit={handleSubmit}>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" required disabled={isLoading} />
                  <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="Height (cm)" required disabled={isLoading} />
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Save & Analyze'}
                  </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {analysis && (
                  <div className={`analysis-result ${analysis.risk_level.toLowerCase()}`}>
                    <strong>Risk Level: {analysis.risk_level}</strong>
                    <p>{analysis.suggestion}</p>
                  </div>
                )}
              </div>
              <div className="schedule-action" style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center'}}>
                <button onClick={() => setIsScheduling(true)} disabled={isLoading}>Schedule New Appointment</button>
              </div>
              <div className="records-list">
                <h3>Previous Records</h3>
                {records.map(rec => (
                  <div key={rec.id} className="record-card">
                    <span>Date: {new Date(rec.record_date).toLocaleDateString()}</span>
                    <span>Weight: {rec.weight_kg} kg</span>
                    <span>Height: {rec.height_cm} cm</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-container">
              <GrowthChart records={records} infantDob={infant.dob} />
            </div>
          )}
        </main>
      </div>

      {isScheduling && (
        <AppointmentScheduler
          infant={infant}
          onAppointmentScheduled={() => {
            setIsScheduling(false);
          }}
          onCancel={() => setIsScheduling(false)}
        />
      )}
    </>
  );
};

export default InfantDetail;