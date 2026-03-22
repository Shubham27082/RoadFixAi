import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              Check Your Email
            </h2>
            
            <p className="text-gray-600 mb-6">
              If an account with that email exists, we've sent you a password reset link.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800 mb-2">
                <strong>What to do next:</strong>
              </p>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Check your email inbox for a reset link</li>
                <li>• The link expires in 5 minutes</li>
                <li>• Check your spam folder if you don't see it</li>
                <li>• Click the link to reset your password</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="btn btn-secondary"
              >
                Send Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
      background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 50%, #eff6ff 100%)' 
    }}>
      <div style={{ margin: '0 auto', width: '100%', maxWidth: '500px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              padding: '12px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <Mail style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
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
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ 
                    paddingLeft: '40px',
                    borderColor: error && !email ? '#dc2626' : undefined 
                  }}
                  placeholder="Enter your registered email"
                />
                <Mail style={{ 
                  width: '16px', 
                  height: '16px', 
                  color: error && !email ? '#dc2626' : '#9ca3af', 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a password reset link to this email address
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#d97706', marginTop: '2px' }} />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Reset links expire in 5 minutes for security</li>
                    <li>• Each link can only be used once</li>
                    <li>• We'll never ask for your password via email</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                opacity: (isLoading || !email) ? 0.5 : 1,
                cursor: (isLoading || !email) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader style={{ width: '20px', height: '20px' }} className="loading-spinner" />
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              style={{ textDecoration: 'none', gap: '8px' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;