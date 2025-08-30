import React from 'react';
import './LogCreator.css';

// This component will receive a function from its parent (MotherDashboard)
// to call when a button is clicked. We'll name this prop "onLogAdd".
const LogCreator = ({ onLogAdd }) => {
  return (
    <div className="log-creator-container">
      <h2>What would you like to log?</h2>
      <div className="log-buttons">
        <button className="log-button" onClick={() => onLogAdd('Feeding')}>
          <span className="icon">🍼</span>
          <span>Feeding</span>
        </button>
        <button className="log-button" onClick={() => onLogAdd('Sleep')}>
          <span className="icon">😴</span>
          <span>Sleep</span>
        </button>
        <button className="log-button" onClick={() => onLogAdd('Mood')}>
          <span className="icon">😊</span>
          <span>Mood</span>
        </button>
      </div>
    </div>
  );
};

export default LogCreator;