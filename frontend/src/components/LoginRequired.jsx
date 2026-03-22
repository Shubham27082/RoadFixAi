import { Link } from 'react-router-dom';
import { Lock, UserPlus, LogIn, Shield } from 'lucide-react';

const LoginRequired = ({ 
  title = "Login Required", 
  message = "Please sign in to access this feature",
  feature = "this feature"
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%)' 
    }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card p-8 text-center shadow-2xl" style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)' 
        }}>
          {/* Icon */}
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock style={{ width: '40px', height: '40px', color: '#2563eb' }} />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-6">
            {message}
          </p>

          {/* Feature Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              With an account, you can:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Shield style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                Report road damage with AI-powered detection
              </li>
              <li className="flex items-center gap-2">
                <Shield style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                Track your complaints in real-time
              </li>
              <li className="flex items-center gap-2">
                <Shield style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                Receive notifications on repair progress
              </li>
              <li className="flex items-center gap-2">
                <Shield style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                Access your complaint history
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              style={{ padding: '12px 24px', fontSize: '16px' }}
            >
              <LogIn style={{ width: '20px', height: '20px' }} />
              Sign In to Continue
            </Link>

            <div className="text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                style={{ textDecoration: 'none' }}
              >
                <UserPlus style={{ width: '16px', height: '16px' }} />
                Create Account
              </Link>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              For demo purposes, you can use:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Citizen:</strong> citizen@demo.com / password</p>
              <p><strong>Municipal:</strong> municipal@demo.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;