import React, { useState } from 'react';
import { AppointmentAPI, DirectoryAPI, UsersAPI } from '../services/api';
import { DirectoryAPI as Dir } from '../services/api';

export default function Admin() {
	const appts = AppointmentAPI.listAppointments();
	const doctors = DirectoryAPI.listDoctors();
	const users = UsersAPI.list();
	const [selectedUserId, setSelectedUserId] = useState('');
	const [assignDepartmentId, setAssignDepartmentId] = useState('');
	const [assignRole, setAssignRole] = useState('patient');
	const [message, setMessage] = useState('');
	return (
		<div>
			<h2>Admin Dashboard</h2>
			<div className="card" style={{ marginBottom: 12 }}>
				<h3>Manage Users</h3>
				{message && <div className="card" style={{ borderColor: '#bbf7d0', background: '#ecfdf5', marginBottom: 12 }}>{message}</div>}
				<div className="grid cols-3">
					<div className="form-row">
						<label className="form-label">User</label>
						<select className="select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
							<option value="">Select user</option>
							{users.map(u => (
								<option key={u.id} value={u.id}>ID: {u.id} — {u.name} ({u.username}) — {u.role}</option>
							))}
						</select>
					</div>
					<div className="form-row">
						<label className="form-label">Assign Role</label>
						<select className="select" value={assignRole} onChange={e => setAssignRole(e.target.value)}>
							<option value="patient">Patient</option>
							<option value="doctor">Doctor</option>
							<option value="admin">Admin</option>
						</select>
						<button className="btn" style={{ marginTop: 8 }} onClick={() => { if (selectedUserId) { const u = UsersAPI.updateRole({ userId: selectedUserId, role: assignRole }); if (assignRole !== 'doctor') { /* remove doctorId if demoting */ try { UsersAPI.assignDoctor({ userId: selectedUserId, doctorId: undefined }); } catch (e) {} } setMessage('Role updated successfully'); } }}>Update Role</button>
					</div>
					<div className="form-row">
						<label className="form-label">Assign Department (for doctor role)</label>
						<select className="select" value={assignDepartmentId} onChange={e => setAssignDepartmentId(e.target.value)}>
							<option value="">Select department</option>
							{DirectoryAPI.listDepartments().map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
						</select>
						<button className="btn" style={{ marginTop: 8 }} onClick={() => {
							if (!selectedUserId || !assignDepartmentId) return;
							const user = UsersAPI.updateRole({ userId: selectedUserId, role: 'doctor' });
							Dir.upsertDoctorForUser({ user, departmentId: assignDepartmentId });
							setMessage('Department assigned and doctor updated');
						}}>Assign</button>
					</div>
				</div>
			</div>

			<div className="card" style={{ marginBottom: 12 }}>
				<h3>All Appointments</h3>
				<ul>
					{appts.map(a => (
						<li key={a.id} style={{ marginBottom: 8 }}>
							<span className="muted">ID: {a.id}</span> — {new Date(a.slotISO).toLocaleString()} — Doctor {doctors.find(d => d.id === a.doctorId)?.name} — Patient {a.patientName} — Status: {a.status || 'pending'}
							<button className="btn" style={{ marginLeft: 8 }} onClick={() => { try { AppointmentAPI.adminCancel({ id: a.id }); setMessage('Appointment cancelled by admin'); } catch (e) { setMessage(e.message); } }}>Cancel</button>
						</li>
					))}
				</ul>
			</div>

			<div className="card">
				<h3>Manage Doctors</h3>
				<ul>
					{doctors.map(d => (
						<li key={d.id} style={{ marginBottom: 8 }}>
							<span className="muted">ID: {d.id}</span> — {d.name} — Dept: {DirectoryAPI.listDepartments().find(dep => dep.id === d.departmentId)?.name}
							<button className="btn" style={{ marginLeft: 8 }} onClick={() => {
								try { DirectoryAPI.deleteDoctor({ doctorId: d.id }); setMessage('Doctor deleted'); }
								catch (e) { setMessage(e.message); }
							}}>Delete</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}


