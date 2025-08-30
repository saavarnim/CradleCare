import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import MotherDashboard from './components/MotherDashboard';
import AshaDashboard from './components/AshaDashboard';
import { getCurrentUser } from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getCurrentUser()
        .then(user => setCurrentUser(user))
        .catch(() => localStorage.removeItem('accessToken')) // Token is invalid
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
  };

  return (
    <div>
      {/* This container renders all toast notifications for the app */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* The rest of your App rendering logic */}
      {loading ? (
        <div>Loading...</div>
      ) : !currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : currentUser.role === 'mother' ? (
        <MotherDashboard currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <AshaDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;