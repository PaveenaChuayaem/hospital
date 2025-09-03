import React from 'react';
import { DirectoryAPI } from '../services/api';

export default function Departments() {
  const departments = DirectoryAPI.listDepartments();
  const doctors = DirectoryAPI.listDoctors();

  return (
    <div>
      <h2>Departments</h2>
      <div className="grid cols-2">
        {departments.map(dep => (
          <div key={dep.id} className="card">
            <div style={{ fontWeight: 600 }}>{dep.name}</div>
            <div className="muted">
              Doctors: {doctors.filter(d => d.departmentId === dep.id).map(d => d.name).join(', ') || 'None'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


