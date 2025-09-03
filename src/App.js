import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Appointments from './pages/Appointments';
import Admin from './pages/Admin';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientProfile from './pages/PatientProfile';
import DoctorProfile from './pages/DoctorProfile';
import './App.css';

function Layout({ children }) {
  const { session, logout } = useAuth();
  return (
    <div className="App">
      <div className="topbar">
        <div className="container nav">
          <span className="nav-title">MediBook</span>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/doctors">Doctors</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
          {session?.role === 'admin' && (
            <NavLink to="/admin">Admin</NavLink>
          )}
          {session?.role === 'doctor' && (
            <NavLink to="/doctor">My Appointments</NavLink>
          )}
          {session?.role === 'doctor' && (
            <NavLink to="/doctor/profile">Doctor Profile</NavLink>
          )}
          {session?.role === 'patient' && (
            <NavLink to="/profile">My Profile</NavLink>
          )}
          <NavLink to="/feedback">Feedback</NavLink>
          <div className="nav-end">
            {session ? (
              <>
                <span className="muted">{session.name} ({session.role})</span>
                <button className="btn" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn">Login</NavLink>
                <NavLink to="/signup" className="btn btn-primary">Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
      <main className="container" style={{ paddingTop: 16 }}>{children}</main>
    </div>
  );
}

const Home = () => (
  <div className="grid cols-2">
    <div className="card">
      <h2>Welcome to MediBook</h2>
      <p className="muted">Fast, simple hospital appointments.</p>
      <ul>
        <li>Browse doctors and departments</li>
        <li>Book real-time available slots</li>
        <li>Manage and cancel appointments</li>
        <li>Leave feedback for doctors</li>
      </ul>
    </div>
    <div className="card">
      <h3>About our hospital</h3>
      <p>
        We provide multi-specialty care with expert doctors in Cardiology, Dermatology,
        Pediatrics, and Neurology. Our digital portal makes scheduling easy.
      </p>
      <p className="muted">Open Mon–Fri, 9:00–17:00</p>
    </div>
  </div>
);

const DoctorsPage = () => <div><h3>Doctors</h3><p>List of doctors will appear here.</p></div>;
const DepartmentsPage = () => <div><h3>Departments</h3><p>List of departments will appear here.</p></div>;
const AppointmentsPage = () => <div><h3>Appointments</h3><p>Manage your appointments here.</p></div>;
const AdminPage = () => <div><h3>Admin Dashboard</h3><p>Admin controls will appear here.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route element={<ProtectedRoute roles={["patient"]} />}>
            <Route path="/profile" element={<PatientProfile />} />
          </Route>
          <Route element={<ProtectedRoute roles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
