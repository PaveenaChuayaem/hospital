import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthAPI } from '../services/api';

export default function Signup() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (session) return <Navigate to="/" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      AuthAPI.register({ username, password, name });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 360 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Create account</h2>
        <div className="form-row">
          <label className="form-label">Full name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label className="form-label">Username</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-row">
          <label className="form-label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign up</button>
      </form>
    </div>
  );
}





