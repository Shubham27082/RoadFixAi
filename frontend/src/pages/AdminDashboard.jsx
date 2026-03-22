import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    completedReports: 0,
    highPriority: 0,
    workflow: null
  });
  const [reports, setReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setReports(result.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        // Get the 5 most recent reports for activity feed
        setRecentActivity(result.data.reports.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
    switch (normalizedStatus) {
      case 'submitted': return 'status-submitted';
      case 'under-review': return 'status-under-review';
      case 'approved': return 'status-approved';
      case 'assigned': return 'status-assigned';
      case 'in-progress': return 'status-in-progress';
      case 'delayed': return 'status-delayed';
      case 'completed': return 'status-completed';
      case 'closed': return 'status-closed';
      case 'rejected': return 'status-rejected';
      default: return 'status-unknown';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusForFilter = (status) => {
    switch (status) {
      case 'Submitted':
      case 'Under Review':
      case 'Rejected':
      case 'Delayed':
        return 'pending';
      case 'Approved':
      case 'Assigned':
      case 'In Progress':
        return 'in-progress';
      case 'Completed':
      case 'Closed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || getStatusForFilter(report.status) === filterStatus;
    const severityMatch = filterSeverity === 'all' || report.severity?.toLowerCase() === filterSeverity;
    return statusMatch && severityMatch;
  });

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const calculatePerformanceMetrics = () => {
    if (reports.length === 0) return { avgResponseTime: 'N/A', successRate: 'N/A', aiAccuracy: 'N/A' };
    
    const completedReports = reports.filter(r => ['Completed', 'Closed'].includes(r.status));
    const successRate = ((completedReports.length / reports.length) * 100).toFixed(1);
    
    // Calculate average AI confidence
    const reportsWithAI = reports.filter(r => r.aiAnalysis?.confidence);
    const avgAIAccuracy = reportsWithAI.length > 0 
      ? (reportsWithAI.reduce((sum, r) => sum + r.aiAnalysis.confidence, 0) / reportsWithAI.length).toFixed(1)
      : 'N/A';
    
    return {
      avgResponseTime: '2.3 days', // This would need more complex calculation
      successRate: `${successRate}%`,
      aiAccuracy: `${avgAIAccuracy}%`
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();

  const StatCard = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
    <div className="card p-6" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon style={{ width: '32px', height: '32px' }} className={color} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Municipal Dashboard</h1>
              <p className="text-gray-600">Road Damage Management System</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download style={{ width: '16px', height: '16px' }} />
                Export Report
              </button>
              <button className="btn btn-primary">
                New Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'complaints', label: 'Complaints' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'team', label: 'Team Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 4px',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '24px' }}>
                  <StatCard
                    title="Total Reports"
                    value={stats.totalReports}
                    icon={BarChart3}
                  />
                  <StatCard
                    title="Pending Review"
                    value={stats.pendingReports}
                    icon={Clock}
                    color="text-yellow-600"
                  />
                  <StatCard
                    title="In Workflow"
                    value={stats.approvedReports}
                    icon={AlertTriangle}
                    color="text-blue-600"
                  />
                  <StatCard
                    title="Completed"
                    value={stats.completedReports}
                    icon={CheckCircle}
                    color="text-green-600"
                  />
                </div>

                {/* Workflow Summary */}
                {stats.workflow && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8" style={{ gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.workflow.submitted}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Submitted</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.workflow.underReview}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Under Review</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.workflow.approved}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Approved</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>{stats.workflow.assigned}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Assigned</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.workflow.inProgress}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>In Progress</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{stats.workflow.completed}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Resolved</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>{stats.workflow.closed}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Closed</div>
                      </div>
                      {stats.workflow.rejected > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.workflow.rejected}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Rejected</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {recentActivity.length > 0 ? recentActivity.map((report, index) => (
                        <div key={report.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: index < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <div>
                            <p className="font-medium">{report.complaintId} - {report.damageType}</p>
                            <p className="text-sm text-gray-600">{getTimeAgo(report.createdAt)}</p>
                          </div>
                          <span className={`status-badge ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      )) : (
                        <p className="text-gray-500">No recent activity</p>
                      )}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-gray-600">Average Response Time</span>
                        <span className="font-semibold">{performanceMetrics.avgResponseTime}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-semibold text-green-600">{performanceMetrics.successRate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-gray-600">AI Accuracy</span>
                        <span className="font-semibold text-blue-600">{performanceMetrics.aiAccuracy}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-gray-600">High Priority Cases</span>
                        <span className="font-semibold text-red-600">{stats.highPriority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filters */}
            <div className="card p-4">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field"
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="input-field"
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button className="btn btn-secondary">
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Complaint ID
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Type & Location
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Severity
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Assigned To
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: 'white' }}>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2">Loading reports...</p>
                        </td>
                      </tr>
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                          <p className="text-gray-500">No reports found matching the current filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr key={report.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.complaintId}</div>
                              <div className="text-sm text-gray-500">
                                AI: {report.aiAnalysis?.confidence ? `${report.aiAnalysis.confidence}%` : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.damageType}</div>
                              <div className="text-sm text-gray-500" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin style={{ width: '12px', height: '12px' }} />
                                {report.locationAddress || 'Location not specified'}
                              </div>
                              <div className="text-xs text-gray-400">
                                Ward: {report.user?.ward || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span className={`text-sm font-medium ${getSeverityColor(report.severity)}`}>
                              {report.severity || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span className={`status-badge ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                            <div>
                              <div>{report.assignedToId ? 'Assigned' : 'Unassigned'}</div>
                              <div className="text-xs text-gray-500">
                                {report.user ? `${report.user.firstName} ${report.user.lastName}` : 'Unknown User'}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                title="View Details"
                              >
                                <Eye style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button 
                                style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                title="Edit Report"
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button 
                                style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                title="Delete Report"
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage Type Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      const damageTypes = {};
                      reports.forEach(report => {
                        damageTypes[report.damageType] = (damageTypes[report.damageType] || 0) + 1;
                      });
                      
                      const total = reports.length;
                      const colors = ['#2563eb', '#3b82f6', '#eab308', '#6b7280', '#10b981', '#f59e0b'];
                      
                      return Object.entries(damageTypes)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([type, count], index) => {
                          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                          return (
                            <div key={type}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span>{type}</span>
                                <span className="font-semibold">{percentage}% ({count})</span>
                              </div>
                              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                                <div style={{ 
                                  width: `${percentage}%`, 
                                  backgroundColor: colors[index % colors.length], 
                                  borderRadius: '4px', 
                                  height: '8px' 
                                }}></div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const statusCounts = {
                        'Pending': (stats.workflow?.submitted || 0) + (stats.workflow?.underReview || 0),
                        'In Progress': (stats.workflow?.approved || 0) + (stats.workflow?.assigned || 0) + (stats.workflow?.inProgress || 0),
                        'Completed': (stats.workflow?.completed || 0) + (stats.workflow?.closed || 0),
                        'Rejected': stats.workflow?.rejected || 0,
                        'Delayed': stats.workflow?.delayed || 0
                      };
                      
                      const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
                      
                      return Object.entries(statusCounts)
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => {
                          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                          const colors = {
                            'Pending': '#f59e0b',
                            'In Progress': '#3b82f6',
                            'Completed': '#22c55e',
                            'Rejected': '#ef4444',
                            'Delayed': '#f97316'
                          };
                          
                          return (
                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{status}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="text-sm text-gray-600">{percentage}% ({count})</span>
                                <div style={{ width: '80px', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                                  <div style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: colors[status], 
                                    borderRadius: '4px', 
                                    height: '8px' 
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const priorityCounts = {};
                      reports.forEach(report => {
                        const priority = report.priority || 'Medium';
                        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
                      });
                      
                      const total = reports.length;
                      const colors = {
                        'Low': '#22c55e',
                        'Medium': '#f59e0b',
                        'High': '#ef4444',
                        'Urgent': '#991b1b'
                      };
                      
                      return Object.entries(priorityCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([priority, count]) => {
                          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                          return (
                            <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{priority} Priority</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="text-sm text-gray-600">{percentage}% ({count})</span>
                                <div style={{ width: '80px', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                                  <div style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: colors[priority], 
                                    borderRadius: '4px', 
                                    height: '8px' 
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Performance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const wardStats = {};
                      reports.forEach(report => {
                        const ward = report.user?.ward || 'Unknown Ward';
                        if (!wardStats[ward]) {
                          wardStats[ward] = { total: 0, completed: 0 };
                        }
                        wardStats[ward].total++;
                        if (['Completed', 'Closed'].includes(report.status)) {
                          wardStats[ward].completed++;
                        }
                      });
                      
                      return Object.entries(wardStats)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .slice(0, 5)
                        .map(([ward, stats]) => {
                          const performance = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
                          return (
                            <div key={ward} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span>{ward}</span>
                                <div className="text-xs text-gray-500">{stats.total} reports</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="text-sm text-gray-600">{performance}%</span>
                                <div style={{ width: '80px', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                                  <div style={{ 
                                    width: `${performance}%`, 
                                    backgroundColor: '#22c55e', 
                                    borderRadius: '4px', 
                                    height: '8px' 
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Team Management Tab */}
        {activeTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button className="btn btn-primary">Add Member</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
                {[
                  { name: 'John Smith', role: 'Senior Engineer', ward: 'Ward 5', active: 12 },
                  { name: 'Sarah Johnson', role: 'Field Supervisor', ward: 'Ward 7', active: 8 },
                  { name: 'Mike Davis', role: 'Maintenance Lead', ward: 'Ward 3', active: 15 },
                ].map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#eff6ff', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Users style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="text-sm">
                      <p><span className="font-medium">Assigned:</span> {member.ward}</p>
                      <p><span className="font-medium">Active Cases:</span> {member.active}</p>
                    </div>
                    <div className="mt-4" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        View Profile
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        Assign Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;