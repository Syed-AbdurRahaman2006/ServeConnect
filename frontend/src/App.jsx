import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ChatPage from './pages/ChatPage';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminPanel from './pages/AdminPanel';

const App = () => {
  const { initSocket, isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Hide Top Navbar for dashboard-driven layouts
  const hideNavbar = location.pathname.startsWith('/provider') || location.pathname.startsWith('/admin');

  // Initialize WebSocket connection on app load if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    }
  }, [isAuthenticated]);

  // Helper to get the dashboard path for the current user
  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'PROVIDER') return '/provider/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
          },
        }}
      />
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes — redirect logged-in users to dashboard */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute roles={['PROVIDER']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/requests"
          element={
            <ProtectedRoute roles={['PROVIDER']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Chat (USER and PROVIDER) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute roles={['USER', 'PROVIDER']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                <p className="text-dark-400 text-lg">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
