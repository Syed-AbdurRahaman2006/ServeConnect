import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — Redirects to login if not authenticated.
 * Optionally restricts by role.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
