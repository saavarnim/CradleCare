import React, { useState, useEffect } from 'react';
import InfantDetail from './InfantDetail';
import { getInfants } from '../services/api';
import './Dashboard.css';

const AshaDashboard = ({ currentUser, onLogout }) => {
  const [infants, setInfants] = useState([]);
  const [selectedInfant, setSelectedInfant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInfants = () => {
    getInfants().then(data => setInfants(data));
  }

  useEffect(() => {
    fetchInfants();
  }, []);

  const filteredInfants = infants.filter(infant =>
    infant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    infant.mother_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedInfant) {
    return <InfantDetail 
              infant={selectedInfant} 
              onBack={() => {
                setSelectedInfant(null);
                fetchInfants(); // Re-fetch the list to show updated risk status
              }} 
            />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ASHA Worker Dashboard 👩‍⚕️</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>
      <main>
        <h2>All Infants</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by infant or mother's name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </div>
        <div className="infant-list">
          {filteredInfants.length > 0 ? (
            filteredInfants.map(infant => (
              <div key={infant.id} className="infant-card" onClick={() => setSelectedInfant(infant)}>
                <span className={`risk-dot ${infant.risk_status.toLowerCase().replace(' ', '-')}`}></span>
                <strong>{infant.name}</strong>
                <span> (Mother: {infant.mother_name})</span>
              </div>
            ))
          ) : (
            <p>No infants match your search.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AshaDashboard;