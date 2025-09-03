import React, { useState } from 'react';
import { DirectoryAPI, FeedbackAPI, AuthAPI } from '../services/api';

export default function Feedback() {
  const session = AuthAPI.currentSession() || { name: 'Guest' };
  const doctors = DirectoryAPI.listDoctors();
  const [doctorId, setDoctorId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const list = doctorId ? FeedbackAPI.listForDoctor(doctorId) : [];

  function submit() {
    if (!doctorId) return;
    FeedbackAPI.submit({ doctorId, patientName: session.name, rating, comment });
    setComment('');
  }

  return (
    <div>
      <h2>Feedback & Ratings</h2>
      <div className="card">
        <div className="grid cols-3">
          <div className="form-row">
            <label className="form-label">Doctor</label>
            <select className="select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
              <option value="">Select</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Rating</label>
            <input className="input" type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label className="form-label">Comment</label>
            <input className="input" value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={!doctorId}>Submit</button>
      </div>
      {doctorId && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Recent Feedback</h4>
          <ul>
            {list.slice().reverse().map(item => (
              <li key={item.id}>
                {item.rating}/5 — {item.comment} — {item.patientName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


