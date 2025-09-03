import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DirectoryAPI } from '../services/api';

export default function DoctorProfile() {
  const { session } = useAuth();
  const doctor = DirectoryAPI.listDoctors().find(d => d.id === session?.doctorId) || {};
  const [specialization, setSpecialization] = useState(doctor.specialization || '');
  const [fee, setFee] = useState(doctor.consultationFee || 0);
  const [days, setDays] = useState(doctor.availability?.days || [1,2,3,4,5]);
  const [startHour, setStartHour] = useState(doctor.availability?.startHour || 9);
  const [endHour, setEndHour] = useState(doctor.availability?.endHour || 17);
  const [message, setMessage] = useState('');

  function toggleDay(d) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function save() {
    try {
      DirectoryAPI.updateDoctorProfile({ doctorId: session.doctorId, specialization, consultationFee: fee });
      DirectoryAPI.updateDoctorAvailability({ doctorId: session.doctorId, days, startHour, endHour });
      setMessage('Doctor profile updated');
    } catch (e) {
      setMessage(e.message);
    }
  }

  return (
    <div>
      <h2>Doctor Profile</h2>
      {message && <div className="card" style={{ borderColor: '#bbf7d0', background: '#ecfdf5', marginBottom: 12 }}>{message}</div>}
      <div className="card">
        <div className="grid cols-2">
          <div className="form-row">
            <label className="form-label">Specialization</label>
            <input className="input" value={specialization} onChange={e => setSpecialization(e.target.value)} />
          </div>
          <div className="form-row">
            <label className="form-label">Consultation Fee</label>
            <input className="input" type="number" value={fee} onChange={e => setFee(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Availability Days (0=Sun...6=Sat)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[0,1,2,3,4,5,6].map(d => (
              <button key={d} type="button" className={days.includes(d) ? 'btn btn-primary' : 'btn'} onClick={() => toggleDay(d)}>{d}</button>
            ))}
          </div>
        </div>
        <div className="grid cols-2">
          <div className="form-row">
            <label className="form-label">Start Hour (0-23)</label>
            <input className="input" type="number" min={0} max={23} value={startHour} onChange={e => setStartHour(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label className="form-label">End Hour (0-23)</label>
            <input className="input" type="number" min={0} max={23} value={endHour} onChange={e => setEndHour(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}





