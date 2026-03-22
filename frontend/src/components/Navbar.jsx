import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Shield, User, Home, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Report Damage', href: '/report', icon: MapPin, protected: true },
    { name: 'Track Complaint', href: '/track', icon: Shield, protected: true },
    { name: 'Member Dashboard', href: '/member-dashboard', icon: User, protected: true, memberOnly: true },
    { name: 'Admin Panel', href: '/admin', icon: User, protected: true, adminOnly: true },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && (!user || user.userType !== 'admin')) {
      return false;
    }
    if (item.memberOnly && (!user || user.userType !== 'municipal')) {
      return false;
    }
    // Hide "Report Damage" for municipal members
    if (item.name === 'Report Damage' && user && user.userType === 'municipal') {
      return false;
    }
    return true;
  });

  return (
    <nav>
      <div className="nav-container">
        <div className="flex items-center">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="nav-logo-text">RoadFix AI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links md:flex hidden">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            
            if (item.protected && !isAuthenticated) {
              return (
                <Link
                  key={item.name}
                  to="/login"
                  className="nav-link"
                  title="Login required to access this feature"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* User Menu or Login Button */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.userType}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  zIndex: 50
                }}>
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.userType} • {user.ward}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                    >
                      <Settings style={{ width: '16px', height: '16px' }} />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-gray-900 p-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 py-4 space-y-4 bg-white border-t border-gray-200">
            {/* User Info (Mobile) */}
            {isAuthenticated && (
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #9333ea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links (Mobile) */}
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              
              if (item.protected && !isAuthenticated) {
                return (
                  <Link
                    key={item.name}
                    to="/login"
                    className="nav-link"
                    onClick={() => setIsOpen(false)}
                    style={{ 
                      display: 'flex', 
                      width: '100%'
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                  style={{ display: 'flex', width: '100%' }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                  onClick={() => setIsOpen(false)}
                >
                  <Settings style={{ width: '16px', height: '16px' }} />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-login"
                onClick={() => setIsOpen(false)}
                style={{ display: 'block', textAlign: 'center' }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;