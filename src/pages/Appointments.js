import React, { useMemo, useState } from 'react';
import { addDays, formatISO } from 'date-fns';
import { AppointmentAPI, DirectoryAPI, AuthAPI } from '../services/api';
import { scheduleLocalReminders } from '../services/notifications';

function todayISODate() {
  return formatISO(new Date()).slice(0, 10);
}

export default function Appointments() {
  const session = AuthAPI.currentSession() || { name: 'Guest', role: 'patient' };
  const departments = DirectoryAPI.listDepartments();
  const [departmentId, setDepartmentId] = useState('');
  const doctors = useMemo(
    () => DirectoryAPI.listDoctors({ departmentId: departmentId || undefined }),
    [departmentId]
  );
  const [doctorId, setDoctorId] = useState('');
  const [dateISO, setDateISO] = useState(todayISODate());
  const [notes, setNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const slots = useMemo(() => {
    if (!doctorId) return [];
    return AppointmentAPI.availableSlots({ doctorId, dateISO });
  }, [doctorId, dateISO]);

  const myAppointments = useMemo(() => {
    return AppointmentAPI.listAppointments({ userName: session.name });
  }, [session.name, refreshTick]);

  function handleBook() {
    setError('');
    try {
      const appt = AppointmentAPI.book({
        doctorId,
        patientName: session.name || 'Guest',
        dateISO,
        slotISO: selectedSlot,
        notes,
      });
      scheduleLocalReminders(appt);
      setSelectedSlot('');
      setNotes('');
      setMessage('Appointment booked successfully');
      setRefreshTick(t => t + 1);
    } catch (e) {
      setError(e.message || 'Failed to book');
    }
  }

  return (
    <div>
      <h2>Book Appointment</h2>
      {message && <div className="card" style={{ borderColor: '#bbf7d0', background: '#ecfdf5', marginBottom: 12 }}>{message}</div>}
      <div className="card">
        <div className="grid cols-3">
          <div className="form-row">
            <label className="form-label">Department</label>
            <select className="select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">All</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Doctor</label>
            <select className="select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
              <option value="">Select</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Date</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="date" value={dateISO} min={todayISODate()} onChange={e => setDateISO(e.target.value)} />
              <button className="btn" onClick={() => setDateISO(todayISODate())}>Today</button>
              <button className="btn" onClick={() => setDateISO(formatISO(addDays(new Date(dateISO), 1)).slice(0,10))}>+1</button>
            </div>
          </div>
        </div>
      </div>

      {doctorId && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Available Slots</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {slots.length === 0 && <span>No slots available</span>}
            {slots.map(s => (
              <button
                className={selectedSlot === s ? 'btn btn-primary' : 'btn'}
                key={s}
                onClick={() => setSelectedSlot(s)}
              >
                {new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Confirm</h4>
          <div className="form-row">
            <label className="form-label">Notes</label>
            <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
          </div>
          <button className="btn btn-primary" disabled={!doctorId || !selectedSlot} onClick={handleBook}>Book</button>
          <div className="muted" style={{ marginTop: 8 }}>You cannot book if you or the doctor already has an appointment at the same time.</div>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>My Appointments</h3>
        <ul>
          {myAppointments.map(a => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <span className="muted">ID: {a.id}</span> — {new Date(a.slotISO).toLocaleString()} — Doctor {DirectoryAPI.listDoctors().find(d => d.id === a.doctorId)?.name} — Status: {a.status || 'pending'}
              <button
                className="btn"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  try {
                    AppointmentAPI.cancel({ id: a.id });
                    setMessage('Appointment cancelled successfully');
                    setRefreshTick(t => t + 1);
                  } catch (err) {
                    setMessage(err.message || 'Unable to cancel appointment');
                  }
                }}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


