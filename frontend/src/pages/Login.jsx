import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Shield, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'citizen'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userTypes = [
    { value: 'citizen', label: 'Citizen', icon: User, description: 'Report and track road damage' },
    { value: 'municipal', label: 'Municipal Officer', icon: Shield, description: 'Manage complaints and repairs' },
    { value: 'admin', label: 'Administrator', icon: Shield, description: 'System administration and oversight' }
  ];

  // Check for success message from email verification or password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // Clear the location state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, formData.userType);
      
      if (result.success) {
        // Redirect to intended page or dashboard based on user type
        let redirectPath = '/';
        
        if (location.state?.from?.pathname) {
          redirectPath = location.state.from.pathname;
        } else {
          // Role-based redirection
          switch (result.user.userType) {
            case 'admin':
              redirectPath = '/admin';
              break;
            case 'municipal':
              redirectPath = '/member-dashboard';
              break;
            case 'citizen':
            default:
              redirectPath = '/';
              break;
          }
        }
        
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
    }}>
      <div style={{ margin: '0 auto', width: '100%', maxWidth: '400px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #2563eb, #9333ea)', 
              padding: '12px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <MapPin style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to RoadFix AI
          </h2>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600" style={{ textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>
        </div>

        <div className="card py-8 px-6 shadow-2xl" style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)' 
        }}>
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#059669', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginTop: '2px'
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                </div>
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Success!</p>
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', marginTop: '2px' }} />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Login Failed</p>
                  <p>{error}</p>
                  {error.includes('Invalid credentials') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium mb-1">Don't have an account?</p>
                      <p className="text-blue-700 text-xs mb-2">
                        Create a new account to start reporting road damage and tracking repairs.
                      </p>
                      <Link 
                        to="/register" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        Sign up here →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Login as
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        border: '2px solid',
                        padding: '16px',
                        borderColor: formData.userType === type.value ? '#2563eb' : '#e5e7eb',
                        backgroundColor: formData.userType === type.value ? '#eff6ff' : 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon style={{ 
                          width: '20px', 
                          height: '20px',
                          color: formData.userType === type.value ? '#2563eb' : '#9ca3af'
                        }} />
                        <div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: formData.userType === type.value ? '#1e40af' : '#111827'
                          }}>
                            {type.label}
                          </div>
                          <div style={{ 
                            fontSize: '12px',
                            color: formData.userType === type.value ? '#1d4ed8' : '#6b7280'
                          }}>
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Enter your email"
                style={{ 
                  borderColor: error && !formData.email ? '#dc2626' : undefined 
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  style={{ 
                    paddingRight: '40px',
                    borderColor: error && !formData.password ? '#dc2626' : undefined 
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  style={{ 
                    width: '16px', 
                    height: '16px',
                    accentColor: '#2563eb'
                  }}
                />
                <label htmlFor="remember-me" className="text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600" style={{ textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <p><strong>Citizen:</strong> citizen@demo.com / password</p>
                <p><strong>Municipal:</strong> municipal@demo.com / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;