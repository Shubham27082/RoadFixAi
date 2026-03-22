import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, User, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'citizen',
    ward: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const wards = [
    'Ward 1 - Downtown',
    'Ward 2 - North District',
    'Ward 3 - East Side',
    'Ward 4 - West End',
    'Ward 5 - South Central',
    'Ward 6 - Industrial Area',
    'Ward 7 - Residential Zone'
  ];

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          errors[name] = 'This field is required';
        } else if (value.trim().length < 2) {
          errors[name] = 'Must be at least 2 characters';
        } else {
          delete errors[name];
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors[name] = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors[name] = 'Please enter a valid email address';
        } else {
          delete errors[name];
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        if (!value) {
          errors[name] = 'Phone number is required';
        } else if (!phoneRegex.test(cleanPhone)) {
          errors[name] = 'Please enter a valid phone number';
        } else {
          delete errors[name];
        }
        break;

      case 'password':
        if (!value) {
          errors[name] = 'Password is required';
        } else if (value.length < 6) {
          errors[name] = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors[name] = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete errors[name];
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errors[name] = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors[name] = 'Passwords do not match';
        } else {
          delete errors[name];
        }
        break;

      case 'ward':
        if (!value) {
          errors[name] = 'Please select your ward';
        } else {
          delete errors[name];
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });
    
    // Validate field on change (except for checkbox)
    if (type !== 'checkbox') {
      validateField(name, newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (key !== 'agreeToTerms') {
        if (!validateField(key, formData[key])) {
          isValid = false;
        }
      }
    });

    // Check terms agreement
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions to continue.');
      setIsLoading(false);
      return;
    }

    if (!isValid) {
      setError('Please fix the errors above before submitting.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Registration successful, redirect to email verification
        navigate('/verify-email', { 
          state: { email: formData.email },
          replace: true 
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName) => fieldErrors[fieldName];
  const hasFieldError = (fieldName) => !!fieldErrors[fieldName];

  return (
    <div className="min-h-screen flex flex-col justify-center py-12" style={{ 
      background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f5f3ff 100%)' 
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
              <MapPin style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600" style={{ textDecoration: 'none' }}>
              Sign in here
            </Link>
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
                  <p className="font-medium mb-1">Registration Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Name Fields */}
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John"
                  style={{ 
                    borderColor: hasFieldError('firstName') ? '#dc2626' : undefined 
                  }}
                />
                {hasFieldError('firstName') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('firstName')}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Doe"
                  style={{ 
                    borderColor: hasFieldError('lastName') ? '#dc2626' : undefined 
                  }}
                />
                {hasFieldError('lastName') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ 
                    paddingLeft: '40px',
                    borderColor: hasFieldError('email') ? '#dc2626' : undefined 
                  }}
                  placeholder="john.doe@example.com"
                />
                <Mail style={{ 
                  width: '16px', 
                  height: '16px', 
                  color: hasFieldError('email') ? '#dc2626' : '#9ca3af', 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} />
              </div>
              {hasFieldError('email') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ 
                    paddingLeft: '40px',
                    borderColor: hasFieldError('phone') ? '#dc2626' : undefined 
                  }}
                  placeholder="+1 (555) 123-4567"
                />
                <Phone style={{ 
                  width: '16px', 
                  height: '16px', 
                  color: hasFieldError('phone') ? '#dc2626' : '#9ca3af', 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} />
              </div>
              {hasFieldError('phone') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Ward Selection */}
            <div>
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
                Ward/Area *
              </label>
              <select
                id="ward"
                name="ward"
                required
                value={formData.ward}
                onChange={handleInputChange}
                className="input-field"
                style={{ 
                  borderColor: hasFieldError('ward') ? '#dc2626' : undefined 
                }}
              >
                <option value="">Select your ward</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
              {hasFieldError('ward') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('ward')}</p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="userType"
                    value="citizen"
                    checked={formData.userType === 'citizen'}
                    onChange={handleInputChange}
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: '#2563eb'
                    }}
                  />
                  <span className="text-sm text-gray-700">Citizen - Report road damage</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="userType"
                    value="municipal"
                    checked={formData.userType === 'municipal'}
                    onChange={handleInputChange}
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: '#2563eb'
                    }}
                  />
                  <span className="text-sm text-gray-700">Municipal Officer - Manage complaints</span>
                </label>
              </div>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ 
                    paddingRight: '40px',
                    borderColor: hasFieldError('password') ? '#dc2626' : undefined 
                  }}
                  placeholder="Create a strong password"
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
              {hasFieldError('password') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('password')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, and number. Minimum 6 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ 
                    paddingRight: '40px',
                    borderColor: hasFieldError('confirmPassword') ? '#dc2626' : undefined 
                  }}
                  placeholder="Confirm your password"
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
              {hasFieldError('confirmPassword') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                style={{ 
                  width: '16px', 
                  height: '16px',
                  accentColor: '#2563eb',
                  marginTop: '2px'
                }}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-blue-600" style={{ textDecoration: 'none' }}>
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600" style={{ textDecoration: 'none' }}>
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(fieldErrors).length > 0}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px',
                opacity: (isLoading || Object.keys(fieldErrors).length > 0) ? 0.5 : 1,
                cursor: (isLoading || Object.keys(fieldErrors).length > 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              <p className="mb-2">By creating an account, you can:</p>
              <ul style={{ listStyle: 'disc', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Report road damage with AI-powered detection</li>
                <li>Track your complaints in real-time</li>
                <li>Receive notifications on repair progress</li>
                <li>Access historical reports and analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;