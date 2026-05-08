import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SelectionPage from './pages/SelectionPage';
import JackpotPage from './pages/JackpotPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RulesPage from './pages/RulesPage';
import ResultsPage from './pages/ResultsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import MyTickets from './pages/MyTickets';
import TopUpPage from './pages/TopUpPage';

import PageWrapper from './components/PageWrapper';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminControl from './pages/admin/AdminControl';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetails from './pages/admin/AdminUserDetails';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';

const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8">
     <div className="relative">
        <div className="w-20 h-20 border-[3px] border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-6 h-6 bg-red-600 rounded-full"></div>
           </div>
        </div>
     </div>
     <div className="mt-8 text-center">
        <h2 className="text-xl font-black italic uppercase tracking-[0.2em] text-gray-900">Authenticating</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 italic">Securing Diamond Secretariat Connection...</p>
     </div>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/home" replace />;
  
  return children;
};

// --- Unified Landing Logic ---
const LandingPage = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  // Redirect based on database role from a single port
  return user.role === 'admin' 
    ? <Navigate to="/admin" replace /> 
    : <Navigate to="/home" replace />;
};

function App() {
  return (
      <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/home" element={
            <ProtectedRoute>
              <PageWrapper title="Diamond Agency">
                <Dashboard />
              </PageWrapper>
            </ProtectedRoute>
          } />
          
          <Route path="/rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/select/:gameId" element={<ProtectedRoute><SelectionPage /></ProtectedRoute>} />
          <Route path="/jackpot" element={<ProtectedRoute><JackpotPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/topup" element={<ProtectedRoute><TopUpPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><AdminLayout><AdminAnnouncements /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/control" element={<ProtectedRoute role="admin"><AdminLayout><AdminControl /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users/:userId" element={<ProtectedRoute role="admin"><AdminLayout><AdminUserDetails /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
