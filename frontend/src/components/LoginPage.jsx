import React, { useState } from 'react';
import { login, register, getCurrentUser } from '../services/api';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mother');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // NEW: State to toggle modes

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isRegistering) {
      // --- REGISTRATION LOGIC ---
      try {
        const registerResponse = await register(phone, password, role);
        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.detail || 'Registration failed.');
        }
        // After successful registration, log in to get a token
        const tokenData = await login(phone, password);
        localStorage.setItem('accessToken', tokenData.access_token);
        const userData = await getCurrentUser();
        onLogin(userData);
      } catch (err) {
        setError(err.message);
      }
    } else {
      // --- LOGIN LOGIC ---
      try {
        const tokenData = await login(phone, password);
        localStorage.setItem('accessToken', tokenData.access_token);
        const userData = await getCurrentUser();
        onLogin(userData);
      } catch (err) {
        // Display the specific error from the backend (e.g., "Incorrect password")
        setError(err.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>CradleCare 👶</h1>
          <p>{isRegistering ? 'Create your new account' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* These fields only show when registering */}
          {isRegistering && (
            <div className="input-group">
              <label htmlFor="role">I am a...</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="mother">Mother</option>
                <option value="asha_worker">ASHA Worker</option>
              </select>
            </div>
          )}

          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="toggle-form">
          {isRegistering ? (
            <span>Already have an account? <button onClick={() => setIsRegistering(false)}>Login</button></span>
          ) : (
            <span>Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;