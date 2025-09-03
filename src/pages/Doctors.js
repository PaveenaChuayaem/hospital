import React, { useMemo, useState } from 'react';
import { DirectoryAPI, FeedbackAPI } from '../services/api';

export default function Doctors() {
  const departments = DirectoryAPI.listDepartments();
  const [departmentId, setDepartmentId] = useState('');
  const doctors = useMemo(
    () => DirectoryAPI.listDoctors({ departmentId: departmentId || undefined }),
    [departmentId]
  );

  return (
    <div>
      <h2>Doctors</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-row">
          <label className="form-label">Filter by Department</label>
          <select className="select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
            <option value="">All</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid cols-2">
        {doctors.map(doc => {
          const feedback = FeedbackAPI.listForDoctor(doc.id);
          const avg = feedback.length
            ? (feedback.reduce((s, f) => s + Number(f.rating || 0), 0) / feedback.length).toFixed(1)
            : 'N/A';
          return (
            <div key={doc.id} className="card">
              <div style={{ fontWeight: 600 }}>{doc.name}</div>
              <div className="muted">{departments.find(d => d.id === doc.departmentId)?.name}</div>
              <div style={{ marginTop: 8 }}>Avg Rating: {avg} ({feedback.length})</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


