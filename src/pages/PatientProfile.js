import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatientAPI } from '../services/api';

export default function PatientProfile() {
  const { session } = useAuth();
  const initial = session ? PatientAPI.getProfile(session.userId) : { profile: {} };
  const [name, setName] = useState(initial.name || '');
  const [age, setAge] = useState(initial.profile.age || '');
  const [gender, setGender] = useState(initial.profile.gender || '');
  const [contact, setContact] = useState(initial.profile.contact || '');
  const [history, setHistory] = useState(initial.profile.history || '');
  const [message, setMessage] = useState('');

  function save() {
    PatientAPI.updateProfile(session.userId, { name, age, gender, contact, history });
    setMessage('Profile updated successfully');
  }

  return (
    <div>
      <h2>My Profile</h2>
      {message && <div className="card" style={{ borderColor: '#bbf7d0', background: '#ecfdf5', marginBottom: 12 }}>{message}</div>}
      <div className="card">
        <div className="grid cols-2">
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="form-label">Age</label>
            <input className="input" type="number" value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="form-label">Gender</label>
            <input className="input" value={gender} onChange={e => setGender(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="form-label">Contact</label>
            <input className="input" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Medical History</label>
          <input className="input" value={history} onChange={e => setHistory(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}





