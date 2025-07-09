import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function SingInProtected({ children }) {
  const location = useLocation();
  
  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      return !!(token && user); 
    } catch (error) {
      toast.error("Auth verification error:", error);
      return false;
    }
  };

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
}

export default SingInProtected;