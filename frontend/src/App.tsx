// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScheduledEmails from './pages/ScheduledEmails';
import SentEmails from './pages/SentEmails';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/scheduled" 
          element={
            <ProtectedRoute>
              <ScheduledEmails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sent" 
          element={
            <ProtectedRoute>
              <SentEmails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compose" 
          element={
            <ProtectedRoute>
              <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold mb-4">Compose New Email</h1>
                <p className="text-gray-600">Compose page coming soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;