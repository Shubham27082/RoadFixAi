import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredUserType = null, requiredUserTypes = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
      }}>
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ 
            width: '40px', 
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%'
          }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required permissions
  const hasPermission = () => {
    if (requiredUserTypes) {
      return requiredUserTypes.includes(user.userType);
    }
    if (requiredUserType) {
      return user.userType === requiredUserType;
    }
    return true; // No specific role required
  };

  if (!hasPermission()) {
    const requiredRoles = requiredUserTypes ? requiredUserTypes.join(' or ') : requiredUserType;
    
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 50%, #eff6ff 100%)' 
      }}>
        <div className="card p-8 text-center" style={{ maxWidth: '400px' }}>
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Required role: {requiredRoles}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: {user.userType}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;