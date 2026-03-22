import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
      const data = await response.json();

      if (data.success) {
        setUserInfo(data.data);
      } else {
        setError(data.message || 'Invalid or expired reset token.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please login with your new password.' 
            }
          });
        }, 3000);
      } else {
        setError(data.message || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
      }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '500px', padding: '0 20px' }}>
          <div className="card p-12 text-center shadow-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)' 
          }}>
            <Loader style={{ width: '48px', height: '48px', color: '#2563eb', margin: '0 auto 24px' }} className="loading-spinner" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Reset Link...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your password reset link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
        background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #eff6ff 100%)' 
      }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '500px', padding: '0 20px' }}>
          <div className="card p-12 text-center shadow-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)' 
          }}>
            <div className="bg-green-100 mx-auto mb-6" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#059669' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Password Reset Successful! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You can now login with your new password.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
            
            <Link to="/login" className="btn btn-primary">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (invalid/expired token)
  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
        background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 50%, #eff6ff 100%)' 
      }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '500px', padding: '0 20px' }}>
          <div className="card p-12 text-center shadow-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)' 
          }}>
            <div className="bg-red-100 mx-auto mb-6" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle style={{ width: '48px', height: '48px', color: '#dc2626' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-amber-800 mb-2">
                <strong>Possible reasons:</strong>
              </p>
              <ul className="text-sm text-amber-700 text-left space-y-1">
                <li>• The reset link has expired (links expire in 5 minutes)</li>
                <li>• The link has already been used</li>
                <li>• The link is malformed or incomplete</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Reset Link
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
    }}>
      <div style={{ margin: '0 auto', width: '100%', maxWidth: '500px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #2563eb, #9333ea)', 
              padding: '12px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <Lock style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h2>
          {userInfo && (
            <p className="text-sm text-gray-600">
              Hello {userInfo.firstName}! Create a new secure password for your account.
            </p>
          )}
        </div>

        <div className="card py-8 px-6 shadow-2xl" style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)' 
        }}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', marginTop: '2px' }} />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  style={{ 
                    paddingRight: '40px',
                    borderColor: error && !formData.password ? '#dc2626' : undefined 
                  }}
                  placeholder="Enter your new password"
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
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field"
                  style={{ 
                    paddingRight: '40px',
                    borderColor: error && !formData.confirmPassword ? '#dc2626' : undefined 
                  }}
                  placeholder="Confirm your new password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#2563eb', marginTop: '2px' }} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Password Requirements</p>
                  <ul className="space-y-1 text-xs">
                    <li>• At least 6 characters long</li>
                    <li>• Use a combination of letters, numbers, and symbols</li>
                    <li>• Avoid using personal information</li>
                    <li>• Don't reuse old passwords</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                opacity: (isLoading || !formData.password || !formData.confirmPassword) ? 0.5 : 1,
                cursor: (isLoading || !formData.password || !formData.confirmPassword) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader style={{ width: '20px', height: '20px' }} className="loading-spinner" />
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;