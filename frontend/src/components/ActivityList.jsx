import React from 'react';
import './ActivityList.css';

const ActivityList = ({ logs }) => {
  return (
    <div className="activity-list-container">
      <h2>Recent Activity</h2>
      {logs.length === 0 ? (
        <p>No activity logged yet.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              <span className="log-type">{log.type}</span>
              <span className="log-time">{log.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityList;