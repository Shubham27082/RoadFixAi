import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state or redirect to register
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      navigate('/register');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsVerifying(true);

    // Basic validation
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      setIsVerifying(false);
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Verification code must contain only numbers.');
      setIsVerifying(false);
      return;
    }

    try {
      const result = await verifyEmail(email, verificationCode);
      
      if (result.success) {
        setSuccess(result.message);
        // Redirect to login page after successful verification
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { 
              message: 'Email verified successfully! Please login to access your account.',
              email: email
            }
          });
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setSuccess('New verification code sent to your email!');
        setVerificationCode(''); // Clear the input
      } else {
        setError(result.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  if (success && success.includes('verified successfully')) {
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
              Email Verified Successfully! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Welcome to RoadFix AI! Your account is now active and ready to use.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                You're being redirected to the dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Mail style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-blue-600 mt-1">
            {email}
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
                  <p className="font-medium mb-1">Verification Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#059669', marginTop: '2px' }} />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Success!</p>
                  <p>{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Verification Code Input */}
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code *
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                value={verificationCode}
                onChange={handleCodeChange}
                className="input-field"
                placeholder="Enter 6-digit code"
                style={{ 
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: '600',
                  borderColor: error && !verificationCode ? '#dc2626' : undefined 
                }}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying || verificationCode.length !== 6}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                opacity: (isVerifying || verificationCode.length !== 6) ? 0.5 : 1,
                cursor: (isVerifying || verificationCode.length !== 6) ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader style={{ width: '20px', height: '20px' }} className="loading-spinner" />
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="btn btn-secondary"
              style={{ 
                opacity: isResending ? 0.5 : 1,
                cursor: isResending ? 'not-allowed' : 'pointer'
              }}
            >
              {isResending ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader style={{ width: '16px', height: '16px' }} className="loading-spinner" />
                  Sending...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw style={{ width: '16px', height: '16px' }} />
                  Resend Code
                </div>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Check your spam folder if you don't see the email.
              <br />
              The verification code expires in 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;