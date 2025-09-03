import { v4 as uuidv4 } from 'uuid';
import { addMinutes, formatISO, isEqual } from 'date-fns';

const STORAGE_KEYS = {
  users: 'app_users',
  departments: 'app_departments',
  doctors: 'app_doctors',
  appointments: 'app_appointments',
  sessions: 'app_sessions',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  if (!read(STORAGE_KEYS.users)) {
    const users = [
      { id: 'u-admin', username: 'admin', password: 'Adm1n!23', name: 'Hospital Admin', role: 'admin' },
      { id: 'u-john', username: 'john', password: 'Patient@123', name: 'John Doe', role: 'patient' },
      { id: 'u-alice', username: 'dr-alice', password: 'Doctor@123', name: 'Dr. Alice Heart', role: 'doctor', doctorId: 'd1' },
    ];
    write(STORAGE_KEYS.users, users);
  }
  if (!read(STORAGE_KEYS.departments)) {
    const departments = [
      { id: 'cardiology', name: 'Cardiology' },
      { id: 'dermatology', name: 'Dermatology' },
      { id: 'pediatrics', name: 'Pediatrics' },
      { id: 'neurology', name: 'Neurology' },
    ];
    write(STORAGE_KEYS.departments, departments);
  }

  if (!read(STORAGE_KEYS.doctors)) {
    const doctors = [
      { id: 'd1', name: 'Dr. Alice Heart', departmentId: 'cardiology', specialization: 'Cardiologist', consultationFee: 100, availability: { days: [1,2,3,4,5], startHour: 9, endHour: 17 } },
      { id: 'd2', name: 'Dr. Bob Skin', departmentId: 'dermatology', specialization: 'Dermatologist', consultationFee: 80, availability: { days: [1,3,5], startHour: 10, endHour: 16 } },
      { id: 'd3', name: 'Dr. Carol Kids', departmentId: 'pediatrics', specialization: 'Pediatrician', consultationFee: 90, availability: { days: [2,4], startHour: 9, endHour: 15 } },
      { id: 'd4', name: 'Dr. Neil Brain', departmentId: 'neurology', specialization: 'Neurologist', consultationFee: 120, availability: { days: [1,2,3,4,5], startHour: 11, endHour: 18 } },
    ];
    write(STORAGE_KEYS.doctors, doctors);
  }
}

seed();

export const AuthAPI = {
  currentSession() {
    return read(STORAGE_KEYS.sessions, null);
  },
  login({ username, password }) {
    const users = read(STORAGE_KEYS.users, []);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const session = { id: uuidv4(), userId: user.id, name: user.name, role: user.role, doctorId: user.doctorId };
    write(STORAGE_KEYS.sessions, session);
    return session;
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.sessions);
  },
  register({ username, password, name }) {
    const users = read(STORAGE_KEYS.users, []);
    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    const user = { id: uuidv4(), username, password, name, role: 'patient' };
    users.push(user);
    write(STORAGE_KEYS.users, users);
    const session = { id: uuidv4(), userId: user.id, name: user.name, role: user.role };
    write(STORAGE_KEYS.sessions, session);
    return session;
  },
};

export const DirectoryAPI = {
  listDepartments() {
    return read(STORAGE_KEYS.departments, []);
  },
  listDoctors({ departmentId, specialization } = {}) {
    const doctors = read(STORAGE_KEYS.doctors, []);
    let list = doctors;
    if (departmentId) list = list.filter(d => d.departmentId === departmentId);
    if (specialization) list = list.filter(d => (d.specialization || '').toLowerCase().includes(specialization.toLowerCase()));
    return list;
  },
  upsertDoctorForUser({ user, departmentId }) {
    const doctors = read(STORAGE_KEYS.doctors, []);
    let doctor = doctors.find(d => d.id === user.doctorId);
    if (!doctor) {
      doctor = { id: user.doctorId || `doc-${user.id}`, name: user.name, departmentId, specialization: '', consultationFee: 0, availability: { days: [1,2,3,4,5], startHour: 9, endHour: 17 } };
      doctors.push(doctor);
    } else {
      doctor.name = user.name;
      doctor.departmentId = departmentId;
    }
    write(STORAGE_KEYS.doctors, doctors);
    // Ensure the user record stores the doctorId so future logins get doctor functionality
    const users = read(STORAGE_KEYS.users, []);
    const u = users.find(x => x.id === user.id);
    if (u) {
      u.doctorId = doctor.id;
      write(STORAGE_KEYS.users, users);
    }
    return doctor;
  },
  updateDoctorProfile({ doctorId, specialization, consultationFee }) {
    const doctors = read(STORAGE_KEYS.doctors, []);
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) throw new Error('Doctor not found');
    if (specialization !== undefined) doc.specialization = specialization;
    if (consultationFee !== undefined) doc.consultationFee = Number(consultationFee) || 0;
    write(STORAGE_KEYS.doctors, doctors);
    return doc;
  },
  updateDoctorAvailability({ doctorId, days, startHour, endHour }) {
    const doctors = read(STORAGE_KEYS.doctors, []);
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) throw new Error('Doctor not found');
    const start = Number(startHour), end = Number(endHour);
    if (end <= start) throw new Error('End hour must be after start hour');
    doc.availability = { days: days && days.length ? days : doc.availability.days, startHour: start, endHour: end };
    write(STORAGE_KEYS.doctors, doctors);
    return doc;
  },
  deleteDoctor({ doctorId }) {
    const doctors = read(STORAGE_KEYS.doctors, []);
    const users = read(STORAGE_KEYS.users, []);
    const appts = read(STORAGE_KEYS.appointments, []);
    if (!doctors.find(d => d.id === doctorId)) throw new Error('Doctor not found');
    if (users.some(u => u.doctorId === doctorId)) throw new Error('Doctor is linked to a user; detach first');
    if (appts.some(a => a.doctorId === doctorId)) throw new Error('Doctor has appointments; cancel them first');
    const next = doctors.filter(d => d.id !== doctorId);
    write(STORAGE_KEYS.doctors, next);
  }
};

export const AppointmentAPI = {
  listAppointments({ userName } = {}) {
    const appts = read(STORAGE_KEYS.appointments, []);
    return userName ? appts.filter(a => a.patientName === userName) : appts;
  },
  listByDoctor(doctorId) {
    const appts = read(STORAGE_KEYS.appointments, []);
    return appts.filter(a => a.doctorId === doctorId);
  },
  availableSlots({ doctorId, dateISO, slotMinutes = 30, startHour = 9, endHour = 17 }) {
    const doctor = read(STORAGE_KEYS.doctors, []).find(d => d.id === doctorId);
    const configStart = doctor?.availability?.startHour ?? startHour;
    const configEnd = doctor?.availability?.endHour ?? endHour;
    const allowedDays = doctor?.availability?.days ?? [1,2,3,4,5];
    const date = new Date(dateISO);
    const weekday = date.getDay();
    if (!allowedDays.includes(weekday)) return [];
    const start = new Date(dateISO);
    start.setHours(configStart, 0, 0, 0);
    const end = new Date(dateISO);
    end.setHours(configEnd, 0, 0, 0);

    const slots = [];
    for (let t = start; t < end; t = addMinutes(t, slotMinutes)) {
      slots.push(formatISO(t));
    }

    const existing = read(STORAGE_KEYS.appointments, []).filter(a => a.doctorId === doctorId && a.dateISO.startsWith(dateISO.slice(0, 10)));
    const taken = new Set(existing.map(e => e.slotISO));
    return slots.filter(s => !taken.has(s));
  },
  book({ doctorId, patientName, dateISO, slotISO, notes }) {
    const appts = read(STORAGE_KEYS.appointments, []);
    const nowDate = new Date();
    if (new Date(slotISO) <= nowDate) throw new Error('Cannot book a past time');
    const conflictDoctor = appts.find(a => a.doctorId === doctorId && isEqual(new Date(a.slotISO), new Date(slotISO)));
    if (conflictDoctor) throw new Error('This doctor already has an appointment at that time');
    const conflictPatient = appts.find(a => a.patientName === patientName && isEqual(new Date(a.slotISO), new Date(slotISO)));
    if (conflictPatient) throw new Error('You already have an appointment at that time');
    const appt = { id: uuidv4(), doctorId, patientName, dateISO, slotISO, status: 'pending', notes: notes || '' };
    appts.push(appt);
    write(STORAGE_KEYS.appointments, appts);
    return appt;
  },
  cancel({ id }) {
    const appts = read(STORAGE_KEYS.appointments, []);
    const appt = appts.find(a => a.id === id);
    if (!appt) return;
    if (new Date(appt.slotISO) <= new Date()) throw new Error('Cannot cancel after scheduled time');
    const next = appts.filter(a => a.id !== id);
    write(STORAGE_KEYS.appointments, next);
  },
  adminCancel({ id }) {
    const appts = read(STORAGE_KEYS.appointments, []);
    const next = appts.filter(a => a.id !== id);
    write(STORAGE_KEYS.appointments, next);
  },
  setStatus({ id, status }) {
    const appts = read(STORAGE_KEYS.appointments, []);
    const appt = appts.find(a => a.id === id);
    if (!appt) throw new Error('Appointment not found');
    appt.status = status;
    write(STORAGE_KEYS.appointments, appts);
    return appt;
  },
  reschedule({ id, newSlotISO }) {
    const appts = read(STORAGE_KEYS.appointments, []);
    const appt = appts.find(a => a.id === id);
    if (!appt) throw new Error('Appointment not found');
    if (new Date(newSlotISO) <= new Date()) throw new Error('Cannot reschedule to past time');
    const conflict = appts.find(a => a.doctorId === appt.doctorId && isEqual(new Date(a.slotISO), new Date(newSlotISO)));
    if (conflict) throw new Error('New slot not available');
    appt.slotISO = newSlotISO;
    appt.status = 'pending';
    write(STORAGE_KEYS.appointments, appts);
    return appt;
  },
};

export const PatientAPI = {
  getProfile(userId) {
    const users = read(STORAGE_KEYS.users, []);
    const u = users.find(x => x.id === userId);
    if (!u) throw new Error('User not found');
    return { id: u.id, name: u.name, username: u.username, role: u.role, profile: u.profile || {} };
  },
  updateProfile(userId, profile) {
    const users = read(STORAGE_KEYS.users, []);
    const u = users.find(x => x.id === userId);
    if (!u) throw new Error('User not found');
    u.profile = { ...(u.profile || {}), ...profile };
    if (profile.name) u.name = profile.name;
    write(STORAGE_KEYS.users, users);
    const session = read(STORAGE_KEYS.sessions, null);
    if (session?.userId === userId) {
      write(STORAGE_KEYS.sessions, { ...session, name: u.name });
    }
    return { id: u.id, profile: u.profile };
  },
};

export const UsersAPI = {
  list() {
    const users = read(STORAGE_KEYS.users, []);
    return users.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role, doctorId: u.doctorId }));
  },
  assignDoctor({ userId, doctorId }) {
    const users = read(STORAGE_KEYS.users, []);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.doctorId = doctorId || undefined;
    write(STORAGE_KEYS.users, users);
    const session = read(STORAGE_KEYS.sessions, null);
    if (session?.userId === userId) {
      write(STORAGE_KEYS.sessions, { ...session, doctorId: user.doctorId });
    }
    return user;
  },
  updateRole({ userId, role }) {
    const users = read(STORAGE_KEYS.users, []);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    if (role !== 'doctor') {
      user.doctorId = undefined;
    }
    write(STORAGE_KEYS.users, users);
    const session = read(STORAGE_KEYS.sessions, null);
    if (session?.userId === userId) {
      write(STORAGE_KEYS.sessions, { ...session, role, doctorId: user.doctorId });
    }
    return user;
  },
};

export const NotificationAPI = {
  sendEmailReminder({ to, subject, body }) {
    console.log('Email reminder:', { to, subject, body });
  },
  sendSMSReminder({ to, body }) {
    console.log('SMS reminder:', { to, body });
  }
};

export const FeedbackAPI = {
  listForDoctor(doctorId) {
    return read(`feedback_${doctorId}`, []);
  },
  submit({ doctorId, patientName, rating, comment }) {
    const list = read(`feedback_${doctorId}`, []);
    const item = { id: uuidv4(), doctorId, patientName, rating, comment, createdAt: formatISO(new Date()) };
    list.push(item);
    write(`feedback_${doctorId}`, list);
    return item;
  },
};


