import { Link } from 'react-router-dom';
import { Camera, MapPin, Shield, BarChart3, Users, Clock, CheckCircle, ArrowRight, Zap, Target, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms automatically detect and classify road damage from photos with 95% accuracy.',
      color: 'bg-blue-500'
    },
    {
      icon: MapPin,
      title: 'GPS Location Tracking',
      description: 'Precise location capture ensures complaints reach the right municipal authorities instantly.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Real-time Tracking',
      description: 'Track your complaint status from submission to completion with live updates and notifications.',
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Municipal authorities get comprehensive analytics for better road maintenance planning.',
      color: 'bg-red-500'
    }
  ];

  const stats = [
    { label: 'Roads Repaired', value: '1,234+', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Active Users', value: '5,678+', icon: Users, color: 'text-blue-600' },
    { label: 'Avg Response Time', value: '2.5 days', icon: Clock, color: 'text-purple-600' },
    { label: 'Success Rate', value: '94%', icon: Award, color: 'text-red-600' }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Capture & Report',
      description: 'Take a photo of road damage. Our AI automatically detects the type and severity.',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    },
    {
      step: '02',
      title: 'AI Processing',
      description: 'Machine learning algorithms analyze damage and generate detailed reports.',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
    },
    {
      step: '03',
      title: 'Track Progress',
      description: 'Monitor repair progress in real-time and receive completion notifications.',
      icon: Target,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content fade-in">
          <div className="hero-badge">
            <Zap style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            AI-Powered Road Management
          </div>
          
          <h1 className="hero-title">
            {isAuthenticated ? `Welcome back, ${user.firstName}!` : 'Smart Road Damage'}<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isAuthenticated ? 'Ready to Report?' : 'Reporting System'}
            </span>
          </h1>
          
          <p className="hero-subtitle">
            {isAuthenticated 
              ? `You're logged in as a ${user.userType}. Start reporting road damage or track your existing complaints.`
              : 'Report road damage with AI-powered detection. Get faster repairs through intelligent complaint management and real-time tracking.'
            }
          </p>
          
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/report" className="hero-btn-primary">
                  <Camera style={{ width: '20px', height: '20px' }} />
                  Report Road Damage
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
                
                <Link to="/track" className="hero-btn-secondary">
                  <Shield style={{ width: '20px', height: '20px' }} />
                  Track Complaint
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hero-btn-primary">
                  <Camera style={{ width: '20px', height: '20px' }} />
                  Get Started - Sign In
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
                
                <Link to="/register" className="hero-btn-secondary">
                  <Shield style={{ width: '20px', height: '20px' }} />
                  Create Account
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 ${stat.color}`} 
                       style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f9fafb', marginBottom: '16px' }}>
                    <Icon style={{ width: '32px', height: '32px' }} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%)' }}>
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 mx-auto" style={{ maxWidth: '600px' }}>
              Simple 3-step process to report and track road damage repairs with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index}>
                  <div className="card p-8 text-center" style={{ height: '100%' }}>
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                      <img 
                        src={item.image} 
                        alt={item.title}
                        style={{ 
                          width: '100%', 
                          height: '192px', 
                          objectFit: 'cover', 
                          borderRadius: '12px', 
                          marginBottom: '16px' 
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '-16px',
                        right: '-16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '18px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                        {item.step}
                      </div>
                    </div>
                    
                    <div className="bg-blue-100 mx-auto mb-6" 
                         style={{ 
                           width: '64px', 
                           height: '64px', 
                           borderRadius: '16px', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center' 
                         }}>
                      <Icon style={{ width: '32px', height: '32px', color: '#2563eb' }} />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 mx-auto" style={{ maxWidth: '600px' }}>
              Advanced technology meets civic responsibility for smarter infrastructure management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index}>
                  <div className="card p-8 text-center" style={{ height: '100%' }}>
                    <div className={`mx-auto mb-6 ${feature.color}`}
                         style={{ 
                           width: '64px', 
                           height: '64px', 
                           borderRadius: '16px', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#22c55e' : index === 2 ? '#8b5cf6' : '#ef4444'
                         }}>
                      <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.2)'
        }}></div>
        
        <div className="container text-center" style={{ position: 'relative', zIndex: 10 }}>
          <h2 className="text-4xl font-bold mb-6">
            {isAuthenticated ? `Welcome ${user.firstName}!` : 'Ready to Report Road Damage?'}
          </h2>
          <p className="text-xl mb-10 mx-auto" style={{ 
            color: '#bfdbfe', 
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            {isAuthenticated 
              ? `You're all set to start reporting road damage and making your community safer. Your account gives you access to all features.`
              : 'Join thousands of citizens making their communities safer, one report at a time. Experience the power of AI-driven infrastructure management.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center" style={{ gap: '24px' }}>
            {isAuthenticated ? (
              <>
                <Link to="/report" className="hero-btn-primary">
                  <Camera style={{ width: '20px', height: '20px' }} />
                  Start Reporting Now
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
                
                {(user.userType === 'admin' || user.userType === 'municipal') && (
                  <Link to="/admin" className="hero-btn-secondary">
                    <BarChart3 style={{ width: '20px', height: '20px' }} />
                    View Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="hero-btn-primary">
                  <Camera style={{ width: '20px', height: '20px' }} />
                  Create Account & Start
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </Link>
                
                <Link to="/login" className="hero-btn-secondary">
                  <BarChart3 style={{ width: '20px', height: '20px' }} />
                  Already Have Account?
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;