import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  
  // Get auth status (moved outside verifyAuth to prevent recreation)
  const getAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        return { isAuthenticated: false, hasRole: false };
      }

      // If no specific roles required, any authenticated user can access
      if (allowedRoles.length === 0) {
        return { isAuthenticated: true, hasRole: true };
      }

      // Check if user has required role
      const hasRole = allowedRoles.includes(user.role?.name);   // AuthZ check
      return { isAuthenticated: true, hasRole };
      
    } catch (error) {
      console.error("Auth verification error:", error);
      return { isAuthenticated: false, hasRole: false };
    }
  };

  const { isAuthenticated, hasRole } = getAuthStatus();

  // Show toast only once using useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access this page', {
        position: "top-right",
        autoClose: 3000,
      });
    } else if (!hasRole) {
      toast.error('You do not have permission to access this page', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [isAuthenticated, hasRole]);

  // Handle unauthenticated users
  if (!isAuthenticated) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Handle unauthorized but authenticated users
  if (!hasRole) {
    // Redirect to a safe fallback route that this user CAN access
    const fallbackRoute = getFallbackRouteForUser();
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  return children;
}

// Helper function to determine where to redirect unauthorized users
function getFallbackRouteForUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.name;
  
  // Define role-specific fallbacks
  const roleFallbacks = {
    'Sales': '/contacts',
    'Project Manager': '/projects',
    'Administrator': '/dashboard',
    'Manager': '/team/all-members',
    'Developer': '/myprojects/allprojects'
  };

  return roleFallbacks[role] || '/signin';
}

export default ProtectedRoute;