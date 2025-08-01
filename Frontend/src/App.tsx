import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import TurfListing from './pages/TurfListing';
import Login from './pages/auth/Login';
import TurfDetail from './pages/TurfDetail';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingDetail from './pages/BookingDetail';
import AddTurf from './pages/admin/AddTurf';
import EditTurf from './pages/admin/EditTurf';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/turfs" element={<TurfListing />} />
              <Route path="/turfs/:turfId" element={<TurfDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes will be added in next implementation */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route 
                path="/booking/confirm" 
                element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>}
              />
              <Route 
                path="/bookings/:bookingId" 
                element={<ProtectedRoute><BookingDetail /></ProtectedRoute>}
              />
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                } 
              />
              <Route 
                path="/admin"
                element={<ProtectedRoute adminOnly><Navigate to="/admin/dashboard" replace /></ProtectedRoute>}
              />
              <Route 
                path="/admin/turfs/new"
                element={
                  <ProtectedRoute adminOnly><AddTurf /></ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/turfs"
                element={<ProtectedRoute adminOnly><Navigate to="/admin/dashboard" replace /></ProtectedRoute>}
              />
              <Route 
                path="/admin/turfs/edit/:turfId"
                element={
                  <ProtectedRoute adminOnly><EditTurf /></ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;