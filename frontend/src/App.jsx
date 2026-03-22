import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReportDamage from './pages/ReportDamage';
import TrackComplaint from './pages/TrackComplaint';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import APITest from './pages/APITest';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/api-test" element={<APITest />} />
              
              {/* Protected Routes */}
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute>
                    <ReportDamage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/track" 
                element={
                  <ProtectedRoute>
                    <TrackComplaint />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredUserTypes={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member-dashboard" 
                element={
                  <ProtectedRoute requiredUserTypes={["municipal"]}>
                    <MemberDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;