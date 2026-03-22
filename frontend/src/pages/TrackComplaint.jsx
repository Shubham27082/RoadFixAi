import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, CheckCircle, AlertCircle, Wrench, Eye, User, Calendar, FileText, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TrackComplaint = () => {
  const { user } = useAuth();
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAllReports, setShowAllReports] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Municipal action handler
  const handleMunicipalAction = async (reportId, action, notes = '') => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/municipal-action`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the complaint data immediately
        if (complaint && complaint.id === result.data.report.complaintId) {
          // Refresh the complaint details with updated data
          const updatedReport = result.data.report;
          setComplaint(prev => ({
            ...prev,
            status: updatedReport.status,
            timeline: Array.isArray(updatedReport.statusHistory) 
              ? updatedReport.statusHistory.map(item => ({
                  status: item.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                  date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                  time: item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
                  description: item.notes || `Status updated to ${item.status || 'Unknown'}`
                }))
              : prev.timeline
          }));
        }
        
        // Refresh the reports list
        await fetchAllReports();
        
        alert(`Report ${action}d successfully! Citizen has been notified via email.`);
      } else {
        throw new Error(result.message || `Failed to ${action} report`);
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      alert(`Failed to ${action} report: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch all user reports on component mount
  useEffect(() => {
    if (user) {
      fetchAllReports();
    }
  }, [user]);

  // Filter reports based on search term and status
  useEffect(() => {
    let filtered = allReports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.damageType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => {
        const normalizedStatus = report.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
        const normalizedFilter = statusFilter.toLowerCase().replace(/\s+/g, '-');
        return normalizedStatus === normalizedFilter;
      });
    }
    
    setFilteredReports(filtered);
  }, [allReports, searchTerm, statusFilter]);

  const fetchAllReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/my-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setAllReports(result.data.reports);
        console.log('📋 Loaded', result.data.reports.length, 'reports for user');
      } else {
        console.error('Failed to fetch reports:', result.message);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Mock complaint data
  const mockComplaints = {
    'RD-2024-1234': {
      id: 'RD-2024-1234',
      status: 'in-progress',
      damageType: 'Pothole',
      severity: 'High',
      location: '123 Main Street, Downtown',
      coordinates: '40.7128, -74.0060',
      submittedDate: '2024-12-10',
      expectedCompletion: '2024-12-18',
      description: 'Large pothole causing traffic issues',
      aiConfidence: '94%',
      assignedTo: 'Municipal Ward 5',
      images: ['/api/placeholder/400/300'],
      timeline: [
        { status: 'submitted', date: '2024-12-10', time: '09:30 AM', description: 'Complaint submitted by citizen' },
        { status: 'ai-processed', date: '2024-12-10', time: '09:32 AM', description: 'AI analysis completed - Pothole detected with 94% confidence' },
        { status: 'assigned', date: '2024-12-10', time: '10:15 AM', description: 'Assigned to Municipal Ward 5' },
        { status: 'in-progress', date: '2024-12-12', time: '08:00 AM', description: 'Repair work started' },
      ]
    },
    'RD-2024-5678': {
      id: 'RD-2024-5678',
      status: 'completed',
      damageType: 'Surface Crack',
      severity: 'Medium',
      location: '456 Oak Avenue, Suburb',
      coordinates: '40.7589, -73.9851',
      submittedDate: '2024-12-05',
      completedDate: '2024-12-08',
      description: 'Long crack in road surface',
      aiConfidence: '87%',
      assignedTo: 'Municipal Ward 3',
      images: ['/api/placeholder/400/300'],
      timeline: [
        { status: 'submitted', date: '2024-12-05', time: '02:15 PM', description: 'Complaint submitted by citizen' },
        { status: 'ai-processed', date: '2024-12-05', time: '02:17 PM', description: 'AI analysis completed - Surface crack detected' },
        { status: 'assigned', date: '2024-12-05', time: '03:30 PM', description: 'Assigned to Municipal Ward 3' },
        { status: 'in-progress', date: '2024-12-06', time: '09:00 AM', description: 'Repair work started' },
        { status: 'completed', date: '2024-12-08', time: '04:30 PM', description: 'Repair work completed and verified' },
      ]
    }
  };

  const handleReportClick = async (reportId) => {
    setComplaintId(reportId);
    setShowAllReports(false);
    await handleSearch(reportId);
  };

  const handleSearch = async (searchId = null) => {
    const idToSearch = searchId || complaintId;
    
    if (!idToSearch.trim()) {
      setError('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/track/${encodeURIComponent(idToSearch)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('Tracking API Response:', result); // Debug log
      
      if (result.success) {
        // Transform the data to match the expected format
        const report = result.data.report;
        const assignedMember = result.data.assignedMember;
        const timeline = result.data.timeline || [];
        
        // Ensure timeline is properly formatted
        let formattedTimeline = [];
        
        // Handle timeline data - it might be a string, array, or object
        let timelineData = timeline;
        
        // If timeline is a string, try to parse it
        if (typeof timeline === 'string') {
          try {
            timelineData = JSON.parse(timeline);
          } catch (e) {
            console.error('Failed to parse timeline JSON:', e);
            timelineData = [];
          }
        }
        
        // If timeline is still not an array, try statusHistory
        if (!Array.isArray(timelineData)) {
          timelineData = report.statusHistory;
          
          // If statusHistory is a string, try to parse it
          if (typeof timelineData === 'string') {
            try {
              timelineData = JSON.parse(timelineData);
            } catch (e) {
              console.error('Failed to parse statusHistory JSON:', e);
              timelineData = [];
            }
          }
        }
        
        // Now format the timeline
        if (Array.isArray(timelineData) && timelineData.length > 0) {
          formattedTimeline = timelineData.map(item => ({
            status: item.status ? item.status.toLowerCase().replace(' ', '-') : 'unknown',
            date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
            time: item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
            description: item.notes || `Status updated to ${item.status || 'Unknown'}`
          }));
        } else {
          // Create basic timeline from current status
          formattedTimeline = [{
            status: report.status ? report.status.toLowerCase().replace(' ', '-') : 'submitted',
            date: new Date(report.createdAt).toLocaleDateString(),
            time: new Date(report.createdAt).toLocaleTimeString(),
            description: `Report ${report.status || 'submitted'}`
          }];
        }
        
        const transformedComplaint = {
          id: report.complaintId,
          status: report.status || 'Submitted', // Keep original status format
          damageType: report.damageType || 'Unknown',
          severity: report.severity || 'Unknown',
          location: report.locationAddress || 'Location not specified',
          coordinates: report.gpsCoordinates || report.latitude && report.longitude ? 
            `${report.latitude}, ${report.longitude}` : 'Not available',
          submittedDate: new Date(report.createdAt).toLocaleDateString(),
          expectedCompletion: report.estimatedCompletionDate || 'To be determined',
          completedDate: report.actualCompletionDate ? new Date(report.actualCompletionDate).toLocaleDateString() : null,
          description: report.description || 'No description provided',
          aiConfidence: report.aiAnalysis?.confidence ? `${report.aiAnalysis.confidence}%` : 'N/A',
          assignedTo: assignedMember ? 
            `${assignedMember.firstName} ${assignedMember.lastName}` : 
            'Not assigned',
          assignedMemberEmail: assignedMember?.email,
          submittedBy: report.user ? `${report.user.firstName} ${report.user.lastName}` : 'Unknown',
          submitterEmail: report.user?.email,
          ward: report.user?.ward || 'Unknown',
          images: report.images || [],
          timeline: formattedTimeline,
          aiAnalysis: report.aiAnalysis || {}
        };
        
        console.log('Transformed complaint:', transformedComplaint); // Debug log
        setComplaint(transformedComplaint);
      } else {
        setError(result.message || 'Report not found');
        setComplaint(null);
      }
    } catch (error) {
      console.error('Error tracking complaint:', error);
      setError('Failed to track complaint. Please try again.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setShowAllReports(true);
    setComplaint(null);
    setComplaintId('');
    setError('');
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

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
    switch (normalizedStatus) {
      case 'submitted': return <Clock style={{ width: '16px', height: '16px' }} />;
      case 'under-review': return <Eye style={{ width: '16px', height: '16px' }} />;
      case 'approved': return <CheckCircle style={{ width: '16px', height: '16px' }} />;
      case 'assigned': return <User style={{ width: '16px', height: '16px' }} />;
      case 'in-progress': return <Wrench style={{ width: '16px', height: '16px' }} />;
      case 'delayed': return <AlertCircle style={{ width: '16px', height: '16px' }} />;
      case 'completed': return <CheckCircle style={{ width: '16px', height: '16px' }} />;
      case 'closed': return <CheckCircle style={{ width: '16px', height: '16px' }} />;
      case 'rejected': return <AlertCircle style={{ width: '16px', height: '16px' }} />;
      default: return <Clock style={{ width: '16px', height: '16px' }} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ 
      background: 'linear-gradient(135deg, #f3e8ff 0%, #eff6ff 50%, #f0f9ff 100%)' 
    }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 mb-6">
            <Search style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Real-time Tracking
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Track Your Complaints</h1>
          <p className="text-xl text-gray-600 mx-auto" style={{ maxWidth: '600px' }}>
            {showAllReports 
              ? 'View all your submitted road damage reports and their current status.'
              : 'Detailed tracking information for your selected complaint.'
            }
          </p>
        </div>

        {showAllReports ? (
          <>
            {/* Search and Filter Section */}
            <div className="card p-6 mb-8" style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Complaint ID, location, or damage type..."
                    className="input-field"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                  style={{ minWidth: '150px' }}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Filter style={{ width: '16px', height: '16px' }} />
                  Clear
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Showing {filteredReports.length} of {allReports.length} reports
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== 'all' && ` with status "${statusFilter.replace('-', ' ')}"`}
                </p>
              </div>
            </div>

            {/* Reports List */}
            {loadingReports ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="card p-8 text-center">
                <FileText style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {allReports.length === 0 ? 'No Reports Found' : 'No Matching Reports'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {allReports.length === 0 
                    ? 'You haven\'t submitted any road damage reports yet.'
                    : 'No reports match your current search criteria.'
                  }
                </p>
                {allReports.length === 0 && (
                  <a href="/report" className="btn btn-primary">
                    Report Road Damage
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {filteredReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.9)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #e2e8f0'
                    }}
                    onClick={() => handleReportClick(report.complaintId)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.complaintId}
                          </h3>
                          <span className={`status-badge ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <p className="text-sm text-gray-600">Damage Type</p>
                            <p className="font-medium text-gray-900">{report.damageType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Severity</p>
                            <p className={`font-medium ${getSeverityColor(report.severity).split(' ')[0]}`}>
                              {report.severity}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-medium text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin style={{ width: '16px', height: '16px', color: '#9ca3af', marginTop: '2px' }} />
                          <p className="text-sm text-gray-600">{report.locationAddress}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <button className="btn btn-secondary btn-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ← Back to All Reports
              </button>
            </div>

            {/* Individual Report Details */}
            {complaint === null && complaintId && !loading && (
              <div className="card p-6 text-center">
                <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Not Found</h3>
                <p className="text-gray-600">
                  No complaint found with ID: <span style={{ fontFamily: 'monospace' }}>{complaintId}</span>
                </p>
              </div>
            )}

            {complaint && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Complaint Overview */}
                <div className="card p-6" style={{ 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Complaint #{complaint.id}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`status-badge ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity} Priority
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Submitted: {complaint.submittedDate}</p>
                      {complaint.completedDate && (
                        <p>Completed: {complaint.completedDate}</p>
                      )}
                      {complaint.expectedCompletion && !complaint.completedDate && (
                        <p>Expected: {complaint.expectedCompletion}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Damage Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="text-sm">
                        <p><span className="font-medium">Type:</span> {complaint.damageType}</p>
                        <p><span className="font-medium">Severity:</span> {complaint.severity}</p>
                        <p><span className="font-medium">AI Confidence:</span> {complaint.aiConfidence}</p>
                        <p><span className="font-medium">Description:</span> {complaint.description}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Assignment Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="text-sm">
                        <p><span className="font-medium">Assigned to:</span> {complaint.assignedTo}</p>
                        {complaint.assignedMemberEmail && (
                          <p><span className="font-medium">Contact:</span> {complaint.assignedMemberEmail}</p>
                        )}
                        <p><span className="font-medium">Ward:</span> {complaint.ward}</p>
                        <p><span className="font-medium">Submitted by:</span> {complaint.submittedBy}</p>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Location Details</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }} className="text-sm">
                      <MapPin style={{ width: '16px', height: '16px', color: '#9ca3af', marginTop: '2px' }} />
                      <div>
                        <p>{complaint.location}</p>
                        <p className="text-gray-500" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          GPS: {complaint.coordinates}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Municipal Action Buttons - Only show for municipal users */}
                  {user?.userType === 'municipal' && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Municipal Actions</h3>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                        gap: '12px' 
                      }}>
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'approve')}
                          disabled={actionLoading || complaint.status === 'Approved'}
                          className="btn btn-success"
                          style={{ 
                            backgroundColor: complaint.status === 'Approved' ? '#6b7280' : '#10b981',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: (actionLoading || complaint.status === 'Approved') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✓ Approve
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'reject')}
                          disabled={actionLoading || complaint.status === 'Rejected'}
                          className="btn btn-danger"
                          style={{ 
                            backgroundColor: complaint.status === 'Rejected' ? '#6b7280' : '#ef4444',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: (actionLoading || complaint.status === 'Rejected') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✗ Reject
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'assign')}
                          disabled={actionLoading}
                          className="btn btn-primary"
                          style={{ 
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: actionLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          👥 Assign
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'start-work')}
                          disabled={actionLoading || complaint.status === 'In Progress'}
                          className="btn btn-warning"
                          style={{ 
                            backgroundColor: complaint.status === 'In Progress' ? '#6b7280' : '#f59e0b',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: (actionLoading || complaint.status === 'In Progress') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          🚧 Start Work
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'delay')}
                          disabled={actionLoading}
                          className="btn btn-secondary"
                          style={{ 
                            backgroundColor: '#f97316',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: actionLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ⏰ Delay
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'resolved')}
                          disabled={actionLoading || complaint.status === 'Completed'}
                          className="btn btn-success"
                          style={{ 
                            backgroundColor: complaint.status === 'Completed' ? '#6b7280' : '#059669',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: (actionLoading || complaint.status === 'Completed') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✅ Resolved
                        </button>
                        
                        <button
                          onClick={() => handleMunicipalAction(complaint.id.split('-')[2], 'closed')}
                          disabled={actionLoading}
                          className="btn btn-secondary"
                          style={{ 
                            backgroundColor: '#6b7280',
                            opacity: actionLoading ? 0.5 : 1,
                            cursor: actionLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          🔒 Close
                        </button>
                      </div>
                      
                      {actionLoading && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Processing action and sending notification...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Timeline */}
                <div className="card p-6" style={{ 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Progress Timeline</h3>
                  
                  {/* Current Status Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`status-badge ${getStatusColor(complaint.status)}`} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getStatusIcon(complaint.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Current Status: {complaint.status.replace('-', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-blue-700">
                          {complaint.assignedTo !== 'Not assigned' && (
                            <>Assigned to: <strong>{complaint.assignedTo}</strong></>
                          )}
                          {complaint.assignedMemberEmail && (
                            <> ({complaint.assignedMemberEmail})</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {complaint.timeline.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '20px',
                        position: 'relative',
                        paddingBottom: index < complaint.timeline.length - 1 ? '20px' : '0'
                      }}>
                        {/* Timeline Line */}
                        {index < complaint.timeline.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '15px',
                            top: '32px',
                            bottom: '-20px',
                            width: '2px',
                            background: 'linear-gradient(to bottom, #e5e7eb, #f3f4f6)',
                            zIndex: 1
                          }} />
                        )}
                        
                        {/* Status Icon */}
                        <div className={`status-badge ${getStatusColor(item.status)}`} style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 2,
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {getStatusIcon(item.status)}
                        </div>
                        
                        {/* Timeline Content */}
                        <div style={{ 
                          flex: 1,
                          background: '#f8fafc',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <h4 className="font-semibold text-gray-900">{item.description}</h4>
                            <div className="text-sm text-gray-500 font-medium">
                              <span>{item.date}</span>
                              <span style={{ marginLeft: '8px' }}>{item.time}</span>
                            </div>
                          </div>
                          
                          {/* Additional Details */}
                          <div className="text-sm text-gray-600">
                            {item.status === 'submitted' && (
                              <p>• Report submitted by citizen with AI analysis<br/>• Automatic damage detection completed<br/>• Waiting for municipal assignment</p>
                            )}
                            {item.status === 'under-review' && (
                              <p>• Report assigned to municipal member: <strong>{complaint.assignedTo}</strong><br/>• Currently under review for approval<br/>• Municipal member will assess and prioritize</p>
                            )}
                            {item.status === 'approved' && (
                              <p>• Report approved by municipal authority<br/>• Priority level set and confirmed<br/>• Ready for contractor assignment</p>
                            )}
                            {item.status === 'in-progress' && (
                              <p>• Repair work has commenced<br/>• Contractor assigned and on-site<br/>• Work progress being monitored</p>
                            )}
                            {item.status === 'completed' && (
                              <p>• Repair work completed successfully<br/>• Quality verification completed<br/>• Report closed and archived</p>
                            )}
                            {item.status === 'rejected' && (
                              <p>• Report rejected by municipal authority<br/>• Reason: Invalid or duplicate complaint<br/>• No further action required</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Steps */}
                  {complaint.status !== 'completed' && complaint.status !== 'rejected' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Next Steps:</h4>
                      <div className="text-sm text-yellow-700">
                        {complaint.status === 'submitted' && (
                          <p>• Your report is waiting to be assigned to a municipal member<br/>• You will be notified once assignment is complete<br/>• Estimated assignment time: 1-2 business days</p>
                        )}
                        {complaint.status === 'under-review' && (
                          <p>• Municipal member <strong>{complaint.assignedTo}</strong> is reviewing your report<br/>• They will assess priority and approve/reject the complaint<br/>• Estimated review time: 2-3 business days</p>
                        )}
                        {complaint.status === 'approved' && (
                          <p>• Report approved and ready for contractor assignment<br/>• Municipal office will assign appropriate contractor<br/>• Work will begin based on priority level</p>
                        )}
                        {complaint.status === 'in-progress' && (
                          <p>• Repair work is currently in progress<br/>• Contractor is working on-site<br/>• Estimated completion: {complaint.aiAnalysis?.estimatedRepairTime || 'To be determined'}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;