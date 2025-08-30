import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../services/api'; // We'll add this to api.js
import './Dashboard.css';

const Schemes = ({ onBack }) => {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    const fetchSchemes = async () => {
      const response = await authenticatedFetch(`/schemes`);
      const data = await response.json();
      setSchemes(data);
    };
    fetchSchemes();
  }, []);

  return (
    <div className="dashboard-container">
      <button onClick={onBack} className="back-button">← Back to Dashboard</button>
      <header className="dashboard-header">
        <h1>Government Health Schemes</h1>
      </header>
      <main className="schemes-list">
        {schemes.map(scheme => (
          <div key={scheme.id} className="scheme-card">
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
            <p><strong>Eligibility:</strong> {scheme.eligibility}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Schemes;