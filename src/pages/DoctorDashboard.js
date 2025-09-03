import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppointmentAPI } from '../services/api';

export default function DoctorDashboard() {
  const { session } = useAuth();
  const all = AppointmentAPI.listAppointments();
  const mine = all.filter(a => a.doctorId === session?.doctorId);
  const [message, setMessage] = useState('');
  return (
    <div>
      <h2>My Appointments</h2>
      {message && <div className="card" style={{ borderColor: '#bbf7d0', background: '#ecfdf5', marginBottom: 12 }}>{message}</div>}
      <div className="card">
        <ul>
          {mine.map(a => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <div>
                <strong>{new Date(a.slotISO).toLocaleString()}</strong> — Patient {a.patientName} — Notes: {a.notes || '-'} —
                <span className="muted"> Status: {a.status || 'pending'}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <button className="btn" onClick={() => { AppointmentAPI.setStatus({ id: a.id, status: 'approved' }); setMessage('Appointment approved'); }}>Approve</button>
                <button className="btn" style={{ marginLeft: 8 }} onClick={() => { AppointmentAPI.setStatus({ id: a.id, status: 'rejected' }); setMessage('Appointment rejected'); }}>Reject</button>
              </div>
            </li>
          ))}
          {mine.length === 0 && <li className="muted">No appointments yet.</li>}
        </ul>
      </div>
    </div>
  );
}


