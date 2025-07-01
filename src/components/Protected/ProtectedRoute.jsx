import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProtectedRoute({ children }) {
  const location = useLocation();
  
  const verifyAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        return false;
      }

      return true;
      
    } catch (error) {
      console.error("Auth verification error:", error);
      return false;
    }
  };

  if (!verifyAuth()) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast.error('Please login to access this page', {
      position: "top-right",
      autoClose: 3000,
    });
    
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;