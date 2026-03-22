import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Eye,
  CheckSquare,
  XCircle,
  Settings,
  BarChart3,
  Filter,
  Search,
  Download,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    completedReports: 0,
    highPriority: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Define the sequential workflow for municipal actions
  const getWorkflowSequence = () => {
    return [
      { action: 'approve', label: '✓ Approve', status: 'Approved', description: 'First step: Approve the report' },
      { action: 'assign', label: '👥 Assign', status: 'Assigned', description: 'Second step: Assign to work team' },
      { action: 'start-work', label: '🚧 Start Work', status: 'In Progress', description: 'Third step: Begin repair work' },
      { action: 'resolved', label: '✅ Resolved', status: 'Completed', description: 'Fourth step: Mark as resolved' },
      { action: 'closed', label: '🔒 Close', status: 'Closed', description: 'Final step: Close the report' }
    ];
  };

  // Get the current step index based on report status
  const getCurrentStepIndex = (report) => {
    const workflow = getWorkflowSequence();
    const statusMap = {
      'Submitted': -1,
      'Under Review': -1,
      'Approved': 0,
      'Assigned': 1,
      'In Progress': 2,
      'Delayed': 2, // Delayed is same as In Progress for workflow purposes
      'Completed': 3,
      'Closed': 4,
      'Rejected': -2 // Special case for rejected reports
    };
    
    const currentIndex = statusMap[report.status] ?? -1;
    console.log(`🔍 Report ${report.complaintId} - Status: "${report.status}" → Step Index: ${currentIndex}`);
    return currentIndex;
  };

  // Check if a button should be enabled
  const isButtonEnabled = (report, actionIndex) => {
    const currentStep = getCurrentStepIndex(report);
    
    // If report is rejected, no further actions allowed
    if (report.status === 'Rejected') {
      return false;
    }
    
    // Only allow the next step in sequence
    const isEnabled = actionIndex === currentStep + 1;
    console.log(`🔍 Button ${actionIndex} enabled: ${isEnabled} (current step: ${currentStep})`);
    return isEnabled;
  };

  // Check if a button should be marked as completed
  const isButtonCompleted = (report, actionIndex) => {
    const currentStep = getCurrentStepIndex(report);
    const isCompleted = actionIndex <= currentStep;
    console.log(`🔍 Button ${actionIndex} completed: ${isCompleted} (current step: ${currentStep})`);
    return isCompleted;
  };

  // Enhanced municipal action handler with workflow validation
  const handleMunicipalAction = async (reportId, action, notes = '') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const workflow = getWorkflowSequence();
    const actionIndex = workflow.findIndex(w => w.action === action);
    
    console.log(`🚀 Starting action "${action}" on report ${report.complaintId} (current status: ${report.status})`);
    
    // Validate workflow sequence
    if (!isButtonEnabled(report, actionIndex)) {
      alert('Actions must be completed in sequence. Please complete the previous step first.');
      return;
    }

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
      console.log(`📥 API Response for ${action}:`, result);
      
      if (result.success) {
        // Update the specific report in local state immediately
        const updatedReport = result.data.report;
        console.log(`✅ Updated report status: ${updatedReport.status}`);
        
        setReports(prevReports => prevReports.map(r => 
          r.id === reportId ? {
            ...r,
            status: updatedReport.status,
            statusHistory: updatedReport.statusHistory,
            updatedAt: new Date().toISOString()
          } : r
        ));
        
        // Refresh the reports list and stats to ensure consistency
        await Promise.all([fetchReports(), fetchStats()]);
        
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

  // Handle reject action (can be done at any time before completion)
  const handleRejectAction = async (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Can only reject if not already completed or closed
    if (report.status === 'Completed' || report.status === 'Closed') {
      alert('Cannot reject a completed or closed report.');
      return;
    }

    if (confirm('Are you sure you want to reject this report? This action cannot be undone.')) {
      await handleMunicipalAction(reportId, 'reject', 'Report rejected by municipal officer');
    }
  };

  // Fetch real data from API
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [showAssignedOnly]);

  const fetchReports = async () => {
    console.log('Fetching reports...'); // Debug log
    
    try {
      const token = localStorage.getItem('roadfix_token');
      console.log('Token exists:', !!token); // Debug log
      
      if (!token) {
        console.log('No token found, loading mock data'); // Debug log
        loadMockData();
        return;
      }
      
      // Choose endpoint based on filter
      const endpoint = showAssignedOnly 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/assigned-to-me`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`;
      
      console.log('Fetching from endpoint:', endpoint); // Debug log
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      console.log('API response:', result); // Debug log
      
      if (result.success) {
        console.log('Reports fetched successfully:', result.data.reports.length); // Debug log
        setReports(result.data.reports);
        setLoading(false);
      } else {
        console.error('Failed to fetch reports:', result.message);
        // Load mock data as fallback
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Load mock data as fallback
      loadMockData();
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('roadfix_token');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/stats`;
      
      console.log('🔍 fetchStats DEBUG:');
      console.log('- URL:', url);
      console.log('- Token exists:', !!token);
      console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('- Response status:', response.status);
      console.log('- Response ok:', response.ok);
      
      const result = await response.json();
      console.log('- Response data:', result);
      
      if (result.success) {
        setStats(result.data);
        console.log('✅ Stats updated successfully');
      } else {
        console.log('❌ Stats fetch failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data if API fails
  const loadMockData = () => {
    console.log('Loading mock data for testing...'); // Debug log
    
    const mockReports = [
        {
          id: 1,
          complaintId: 'RD-2024-000001',
          submittedBy: 'John Doe',
          submitterEmail: 'john@example.com',
          location: 'MG Road, Bangalore Urban, Karnataka',
          locationAddress: 'MG Road, Bangalore Urban, Karnataka',
          damageType: 'Pothole',
          severity: 'high',
          status: 'Submitted',
          priority: 'High',
          submissionDate: '2024-12-15',
          description: 'Large pothole causing traffic issues',
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            ward: 'Ward 5'
          },
          aiAnalysis: {
            confidence: 92,
            estimatedCost: '₹15000',
            estimatedRepairTime: '1-2 Days'
          }
        },
        {
          id: 2,
          complaintId: 'RD-2024-000002',
          submittedBy: 'Jane Smith',
          submitterEmail: 'jane@example.com',
          location: 'Brigade Road, Bangalore Urban, Karnataka',
          locationAddress: 'Brigade Road, Bangalore Urban, Karnataka',
          damageType: 'Crack',
          severity: 'medium',
          status: 'Under Review',
          priority: 'Medium',
          submissionDate: '2024-12-14',
          description: 'Road surface cracking near bus stop',
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            ward: 'Ward 5'
          },
          aiAnalysis: {
            confidence: 87,
            estimatedCost: '₹8000',
            estimatedRepairTime: '3-5 Days'
          }
        }
      ];

    console.log('Mock reports loaded:', mockReports.length); // Debug log
    setReports(mockReports);
    setStats({
      totalReports: mockReports.length,
      pendingReports: mockReports.filter(r => r.status === 'Submitted').length,
      approvedReports: mockReports.filter(r => r.status === 'Approved').length,
      completedReports: mockReports.filter(r => r.status === 'Completed').length,
      highPriority: mockReports.filter(r => r.priority === 'High').length
    });
    setLoading(false);
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    console.log('Button clicked! Report ID:', reportId, 'New Status:', newStatus); // Debug log
    
    try {
      const token = localStorage.getItem('roadfix_token');
      console.log('Token exists:', !!token); // Debug log
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }
      
      const notes = newStatus === 'Approved' ? 'Report approved by municipal member' : 
                   newStatus === 'Rejected' ? 'Report rejected by municipal member' : 
                   `Status updated to ${newStatus}`;
      
      console.log('Making API call to update status...'); // Debug log
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes
        })
      });
      
      const result = await response.json();
      console.log('Status update result:', result); // Debug log
      
      if (result.success) {
        console.log('Status update successful, updating UI...'); // Debug log
        
        // Update the report in the local state immediately
        setReports(prevReports => prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
            : report
        ));
        
        // Refresh stats and reports to get latest data
        await Promise.all([fetchStats(), fetchReports()]);
        
        // Show success message
        alert(`Report status updated to "${newStatus}" successfully!`);
      } else {
        console.error('API returned error:', result.message); // Debug log
        alert('Failed to update status: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handlePriorityUpdate = async (reportId, newPriority) => {
    try {
      const token = localStorage.getItem('roadfix_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/priority`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority: newPriority })
      });
      
      const result = await response.json();
      if (result.success) {
        setReports(reports.map(report => 
          report.id === reportId 
            ? { ...report, priority: newPriority }
            : report
        ));
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to update priority: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch = report.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Export report as PDF
  const exportReportPDF = (report) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFillColor(240, 248, 255);
    pdf.rect(0, 0, pageWidth, 45, 'F');
    pdf.setDrawColor(0, 0, 139);
    pdf.setLineWidth(2);
    pdf.line(0, 45, pageWidth, 45);
    
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 139);
    pdf.text('MUNICIPAL REPORT EXPORT', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Road Damage Assessment & Action Report', pageWidth / 2, 28, { align: 'center' });
    pdf.text(`Generated by: ${user?.firstName} ${user?.lastName} - ${user?.ward}`, pageWidth / 2, 36, { align: 'center' });
    
    let yPos = 60;
    
    // Report Information
    pdf.setFillColor(250, 250, 250);
    pdf.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, yPos - 5, pageWidth - 30, 25);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Report ID: ${report.complaintId}`, 20, yPos + 5);
    pdf.text(`Status: ${report.status}`, 20, yPos + 12);
    pdf.text(`Priority: ${report.priority}`, pageWidth - 80, yPos + 5);
    pdf.text(`Exported: ${new Date().toLocaleString()}`, pageWidth - 80, yPos + 12);
    
    yPos += 35;
    
    // Add uploaded image if available
    if (report.images && report.images.length > 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('UPLOADED DAMAGE IMAGE', 20, yPos + 6);
      yPos += 15;
      
      try {
        // Get the first image from the report
        let imageData = report.images[0];
        
        // Detect format and strip data URL prefix if present
        let imgFormat = 'JPEG';
        if (typeof imageData === 'string') {
          if (imageData.startsWith('data:image/png')) {
            imgFormat = 'PNG';
            imageData = imageData.replace(/^data:image\/png;base64,/, '');
          } else if (imageData.startsWith('data:image/')) {
            imageData = imageData.replace(/^data:image\/\w+;base64,/, '');
          }
        }
        
        // Calculate image dimensions to fit within PDF
        const maxWidth = pageWidth - 40;
        const maxHeight = 80;
        
        // Add image to PDF
        pdf.addImage(
          imageData,
          imgFormat,
          20,
          yPos,
          maxWidth,
          maxHeight,
          undefined,
          'MEDIUM'
        );
        
        yPos += maxHeight + 15; // Move position after image
        
        // Add image caption
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Road damage image uploaded by citizen', 20, yPos);
        yPos += 10;
        
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        // If image fails to load, add a placeholder text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Image could not be included in PDF', 20, yPos);
        yPos += 15;
      }
    }
    
    // Report Details
    const reportDetails = [
      ['Submitted By', `${report.user?.firstName} ${report.user?.lastName}`],
      ['Email', report.user?.email || 'N/A'],
      ['Ward', report.user?.ward || 'N/A'],
      ['Location', report.locationAddress || 'N/A'],
      ['Damage Type', report.damageType],
      ['Severity', report.severity],
      ['Description', report.description || 'No description provided'],
      ['Submission Date', new Date(report.createdAt).toLocaleDateString()],
      ['AI Confidence', report.aiAnalysis?.confidence ? `${report.aiAnalysis.confidence}%` : 'N/A'],
      ['Estimated Cost', report.aiAnalysis?.estimatedCost || 'N/A'],
      ['Estimated Time', report.aiAnalysis?.estimatedRepairTime || 'N/A']
    ];
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('REPORT DETAILS', 20, yPos + 6);
    yPos += 15;
    
    reportDetails.forEach((detail) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`${detail[0]}:`, 20, yPos);
      
      const valueText = detail[1].toString();
      if (valueText.length > 50) {
        const splitText = pdf.splitTextToSize(valueText, pageWidth - 90);
        pdf.text(splitText, 70, yPos);
        yPos += splitText.length * 5;
      } else {
        pdf.text(valueText, 70, yPos);
        yPos += 8;
      }
    });
    
    // Municipal Action Section
    yPos += 15;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('MUNICIPAL ASSESSMENT', 20, yPos + 6);
    yPos += 15;
    
    const municipalDetails = [
      ['Reviewed By', `${user?.firstName} ${user?.lastName}`],
      ['Municipal Email', user?.email],
      ['Ward Office', user?.ward],
      ['Review Date', new Date().toLocaleDateString()],
      ['Current Status', report.status],
      ['Priority Level', report.priority],
      ['Assigned Member', report.assignedToId ? 'Yes' : 'Not Assigned']
    ];
    
    municipalDetails.forEach((detail) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`${detail[0]}:`, 20, yPos);
      pdf.text(detail[1], 70, yPos);
      yPos += 8;
    });
    
    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 40;
    pdf.setDrawColor(0, 0, 139);
    pdf.setLineWidth(1);
    pdf.line(15, footerY, pageWidth - 15, footerY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Municipal Road Maintenance Department - Official Export', 20, footerY + 8);
    pdf.text(`Report ID: ${report.complaintId} | Generated: ${new Date().toLocaleString()}`, 20, footerY + 15);
    pdf.text('This is an official municipal document', 20, footerY + 22);
    
    // Save PDF
    pdf.save(`Municipal_Report_${report.complaintId}_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      case 'Urgent': return 'text-red-800 font-bold';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome-section">
            <div>
              <h1 className="dashboard-title">Municipal Member Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back, {user?.firstName} {user?.lastName}</p>
            </div>
            <div className="dashboard-user-info">
              <div className="dashboard-user-avatar">
                <User className="w-6 h-6" />
              </div>
              <div className="dashboard-user-details">
                <p>Ward</p>
                <p>{user?.ward}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav-tabs">
        <div className="dashboard-nav-container">
          <nav className="dashboard-nav-list">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reports', label: 'Review Reports', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    console.log('Tab clicked:', tab.id); // Debug log
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(tab.id);
                  }}
                  className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                  type="button"
                  style={{ cursor: 'pointer' }}
                >
                  <Icon className="dashboard-tab-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>



      {/* Main Content */}
      <div className="dashboard-main-content">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-icon blue">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="stat-card-info">
                    <h3>Total Reports</h3>
                    <p>{stats.totalReports}</p>
                    <div className="stat-card-trend">+12% from last month</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-icon yellow">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="stat-card-info">
                    <h3>Pending Review</h3>
                    <p>{stats.pendingReports}</p>
                    <div className="stat-card-trend">Requires attention</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-icon green">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="stat-card-info">
                    <h3>Approved</h3>
                    <p>{stats.approvedReports}</p>
                    <div className="stat-card-trend">Ready for work</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-icon purple">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div className="stat-card-info">
                    <h3>Completed</h3>
                    <p>{stats.completedReports}</p>
                    <div className="stat-card-trend">This month</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-icon red">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="stat-card-info">
                    <h3>High Priority</h3>
                    <p>{stats.highPriority}</p>
                    <div className="stat-card-trend">Urgent action needed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Responsibilities */}
            <div className="responsibilities-section">
              <div className="responsibilities-header">
                <h3>Key Responsibilities</h3>
                <p>Your primary duties as a municipal member for efficient road maintenance management</p>
              </div>
              <div className="responsibilities-grid">
                <div className="responsibility-item">
                  <div className="responsibility-icon blue">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Review Complaints</h4>
                    <p>View road damage reports submitted by citizens, check uploaded images, location details, and damage assessments.</p>
                  </div>
                </div>

                <div className="responsibility-item">
                  <div className="responsibility-icon green">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Verify & Approve Issues</h4>
                    <p>Confirm the validity of reported damage and approve genuine complaints or reject false/duplicate ones.</p>
                  </div>
                </div>

                <div className="responsibility-item">
                  <div className="responsibility-icon yellow">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Prioritize Repairs</h4>
                    <p>Decide repair urgency based on damage severity, traffic importance, and public safety considerations.</p>
                  </div>
                </div>

                <div className="responsibility-item">
                  <div className="responsibility-icon purple">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Assign Maintenance Work</h4>
                    <p>Forward approved cases to road engineers or repair contractors with expected completion timelines.</p>
                  </div>
                </div>

                <div className="responsibility-item">
                  <div className="responsibility-icon indigo">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Track Repair Status</h4>
                    <p>Monitor progress and update complaint status from pending to in-progress to completed stages.</p>
                  </div>
                </div>

                <div className="responsibility-item">
                  <div className="responsibility-icon red">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="responsibility-content">
                    <h4>Generate Reports</h4>
                    <p>Create area-wise and time-based damage reports for budget planning and maintenance scheduling.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="reports-section">
              <div className="reports-table-header">
                <h3>Recent Reports Requiring Attention</h3>
                <div className="reports-table-actions">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="export-btn"
                  >
                    <Eye className="h-4 w-4" />
                    View All Reports
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Location</th>
                      <th>Damage Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 5).map((report) => (
                      <tr key={report.id}>
                        <td>
                          <a href="#" className="report-id-link">
                            {report.complaintId}
                          </a>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900">{report.locationAddress || report.location || 'Location not specified'}</div>
                            <div className="text-sm text-gray-500">Ward {report.user?.ward || user?.ward}</div>
                          </div>
                        </td>
                        <td>
                          <div className="font-medium">{report.damageType}</div>
                          <div className="text-sm text-gray-500">{report.severity} severity</div>
                        </td>
                        <td>
                          <span className={`font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm text-gray-900">{new Date(report.createdAt).toLocaleDateString() || report.submissionDate}</div>
                          <div className="text-xs text-gray-500">{report.user ? `${report.user.firstName} ${report.user.lastName}` : (report.submittedBy || 'Unknown')}</div>
                        </td>
                        <td>
                          <button
                            onClick={() => setActiveTab('reports')}
                            className="action-btn assign"
                          >
                            <Eye className="h-3 w-3" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="filter-section">
              <div className="filter-controls">
                <div className="filter-left">
                  <div className="search-input-container">
                    <input
                      type="text"
                      placeholder="Search reports by ID, location, or submitter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <Search className="search-icon" />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAssignedOnly}
                        onChange={(e) => setShowAssignedOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Assigned to me only</span>
                    </label>
                  </div>
                </div>
                
                <button className="export-btn">
                  <Download className="h-4 w-4" />
                  <span>Export Reports</span>
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-card-header">
                    <div className="report-card-title">
                      <a href="#" className="report-card-id">{report.complaintId}</a>
                      <div className="report-card-badges">
                        <span className={`status-badge ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`priority-badge ${getPriorityColor(report.priority).replace('text-', 'priority-')}`}>
                          {report.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="report-card-content">
                    <div className="report-details-grid">
                      <div className="report-detail-item">
                        <h4>Submitted By</h4>
                        <p>{report.user ? `${report.user.firstName} ${report.user.lastName}` : (report.submittedBy || 'Unknown')}</p>
                        <p className="email">{report.user?.email || report.submitterEmail || 'No email'}</p>
                      </div>
                      <div className="report-detail-item">
                        <h4>Location</h4>
                        <p>{report.locationAddress || report.location || 'Location not specified'}</p>
                      </div>
                      <div className="report-detail-item">
                        <h4>Damage Details</h4>
                        <p>{report.damageType}</p>
                        <p className="email">{report.severity} severity</p>
                      </div>
                      <div className="report-detail-item">
                        <h4>Submission Date</h4>
                        <p>{new Date(report.createdAt).toLocaleDateString() || report.submissionDate}</p>
                      </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="report-ai-analysis">
                      <h4>
                        <span>🤖</span>
                        AI Analysis Results
                      </h4>
                      <div className="ai-analysis-grid">
                        <div className="ai-analysis-item">
                          <span>Confidence</span>
                          <span>{report.aiAnalysis?.confidence || 'N/A'}%</span>
                        </div>
                        <div className="ai-analysis-item">
                          <span>Est. Cost</span>
                          <span>{report.aiAnalysis?.estimatedCost || 'N/A'}</span>
                        </div>
                        <div className="ai-analysis-item">
                          <span>Est. Time</span>
                          <span>{report.aiAnalysis?.estimatedRepairTime || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="report-description">
                      <h4>Description</h4>
                      <p>{report.description}</p>
                    </div>

                    <div className="report-actions">
                      <div className="action-selects">
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                          className="action-select"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <select
                          value={report.priority}
                          onChange={(e) => handlePriorityUpdate(report.id, e.target.value)}
                          className="action-select"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                          <option value="Urgent">Urgent Priority</option>
                        </select>
                      </div>

                      {/* Municipal Action Buttons - Sequential Workflow */}
                      <div className="workflow-section">
                        <p className="workflow-title">Actions</p>
                        
                        <div className="workflow-progress">
                          <div className="workflow-steps">
                            {getWorkflowSequence().map((step, index) => {
                              const isCompleted = isButtonCompleted(report, index);
                              const isEnabled = isButtonEnabled(report, index);
                              
                              return (
                                <div key={step.action} className="workflow-step">
                                  <div className="step-content">
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleMunicipalAction(report.id, step.action);
                                      }}
                                      className={`workflow-btn ${step.action} ${isCompleted ? 'completed' : ''} ${isEnabled ? 'enabled' : 'disabled'}`}
                                      disabled={!isEnabled}
                                      type="button"
                                      title={step.description}
                                    >
                                      {step.label}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Reject - inline with other buttons */}
                            {report.status !== 'Completed' && report.status !== 'Closed' && report.status !== 'Rejected' && (
                              <div className="workflow-step">
                                <div className="step-content">
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRejectAction(report.id);
                                    }}
                                    className="workflow-btn reject-btn enabled"
                                    type="button"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Delay - inline with other buttons */}
                            {(report.status === 'In Progress' || report.status === 'Delayed') && (
                              <div className="workflow-step">
                                <div className="step-content">
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleMunicipalAction(report.id, 'delay', 'Work delayed due to circumstances');
                                    }}
                                    className={`workflow-btn delay-btn ${report.status === 'Delayed' ? 'completed' : 'enabled'}`}
                                    disabled={report.status === 'Delayed'}
                                    type="button"
                                  >
                                    ⏰ {report.status === 'Delayed' ? 'Delayed' : 'Delay'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Actions */}
                      <div className="additional-actions">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            exportReportPDF(report);
                          }}
                          className="action-btn export"
                          type="button"
                        >
                          <Download className="h-4 w-4" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card p-8 text-center">
              <div className="bg-blue-100 mx-auto mb-6" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp style={{ width: '40px', height: '40px', color: '#2563eb' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Reports</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive analytics dashboard with detailed insights, trends, and performance metrics coming soon.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Ward-wise damage analysis</p>
                <p>• Repair completion trends</p>
                <p>• Budget utilization reports</p>
                <p>• Performance metrics</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card p-8 text-center">
              <div className="bg-purple-100 mx-auto mb-6" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Settings style={{ width: '40px', height: '40px', color: '#8b5cf6' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Settings & Configuration</h3>
              <p className="text-gray-600 mb-6">
                Customize your dashboard preferences, notification settings, and account management options.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Notification preferences</p>
                <p>• Dashboard customization</p>
                <p>• Account security</p>
                <p>• Ward management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;