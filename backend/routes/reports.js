const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { User, Report } = require('../models');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get reports (user's own reports for citizens, all reports for municipal/admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, ward } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Role-based filtering
    if (req.user.userType === 'citizen') {
      // Citizens can only see their own reports
      whereClause.userId = req.user.id;
    } else if (req.user.userType === 'municipal') {
      // Municipal members can see ALL reports for review and approval
      // No additional filtering - they need to see all reports to manage them
      // whereClause remains empty to show all reports
    }
    // Admin users can see all reports (no additional filtering)

    if (status) {
      whereClause.status = status;
    }

    if (ward && (req.user.userType === 'admin')) {
      // Only admin can filter by specific ward
      const wardUsers = await User.findAll({
        where: { ward },
        attributes: ['id']
      });
      const wardUserIds = wardUsers.map(user => user.id);
      whereClause.userId = wardUserIds;
    }

    const reports = await Report.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reports: reports.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reports.count / limit),
          totalReports: reports.count,
          hasNext: offset + reports.rows.length < reports.count,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// @route   GET /api/reports/assigned-to-me
// @desc    Get reports assigned to the current municipal member
// @access  Private (Municipal members only)
router.get('/assigned-to-me', auth, authorize('municipal'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {
      assignedToId: req.user.id
    };
    
    if (status) {
      whereClause.status = status;
    }

    const reports = await Report.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reports: reports.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reports.count / limit),
          totalReports: reports.count,
          hasNext: offset + reports.rows.length < reports.count,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching assigned reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned reports'
    });
  }
});

// @route   GET /api/reports/stats
// @desc    Get report statistics (municipal/admin only)
// @access  Private
router.get('/stats', auth, authorize('municipal', 'admin'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    let whereClause = {};
    
    // Role-based filtering for stats
    if (req.user.userType === 'municipal') {
      const wardUsers = await User.findAll({
        where: { ward: req.user.ward },
        attributes: ['id']
      });
      const wardUserIds = wardUsers.map(user => user.id);
      whereClause.userId = wardUserIds;
    }

    const totalReports = await Report.count({ where: whereClause });
    
    // Get detailed workflow status counts
    const submitted = await Report.count({
      where: { ...whereClause, status: 'Submitted' }
    });
    
    const underReview = await Report.count({
      where: { ...whereClause, status: 'Under Review' }
    });
    
    const approved = await Report.count({
      where: { ...whereClause, status: 'Approved' }
    });
    
    const assigned = await Report.count({
      where: { ...whereClause, status: 'Assigned' }
    });
    
    const inProgress = await Report.count({
      where: { ...whereClause, status: 'In Progress' }
    });
    
    const delayed = await Report.count({
      where: { ...whereClause, status: 'Delayed' }
    });
    
    const completed = await Report.count({
      where: { ...whereClause, status: 'Completed' }
    });
    
    const closed = await Report.count({
      where: { ...whereClause, status: 'Closed' }
    });
    
    const rejected = await Report.count({
      where: { ...whereClause, status: 'Rejected' }
    });

    // Calculate grouped stats for compatibility
    const pendingReports = submitted + underReview + delayed;
    const approvedReports = approved + assigned + inProgress;
    const completedReports = completed + closed;

    const highPriorityReports = await Report.count({
      where: {
        ...whereClause,
        priority: {
          [Op.in]: ['High', 'Urgent']
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        approvedReports,
        completedReports,
        highPriority: highPriorityReports,
        // Detailed workflow breakdown for AdminDashboard
        workflow: {
          submitted,
          underReview,
          approved,
          assigned,
          inProgress,
          delayed,
          completed,
          closed,
          rejected
        }
      }
    });

  } catch (error) {
    console.error('Error fetching report statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics'
    });
  }
});

// @route   PUT /api/reports/:id/municipal-action
// @desc    Update report status with municipal actions and send email notification
// @access  Private (Municipal/Admin only)
router.put('/:id/municipal-action', auth, authorize('municipal', 'admin'), async (req, res) => {
  try {
    const { action, notes } = req.body;
    
    // Define valid actions and their corresponding statuses
    const actionStatusMap = {
      'approve': 'Approved',
      'reject': 'Rejected', 
      'assign': 'Assigned',
      'start-work': 'In Progress',
      'delay': 'Delayed',
      'resolved': 'Completed',
      'closed': 'Closed'
    };

    const newStatus = actionStatusMap[action];
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const report = await Report.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status and add to history
    let statusHistory = [];
    
    // Ensure statusHistory is an array
    if (report.statusHistory && Array.isArray(report.statusHistory)) {
      statusHistory = [...report.statusHistory];
    } else if (report.statusHistory && typeof report.statusHistory === 'string') {
      try {
        statusHistory = JSON.parse(report.statusHistory);
      } catch (e) {
        statusHistory = [];
      }
    }
    
    statusHistory.push({
      status: newStatus,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      notes: notes || `Status updated to ${newStatus} by municipal officer`,
      action: action
    });

    await report.update({
      status: newStatus,
      statusHistory
    });

    // Send email notification to citizen
    const emailService = require('../services/emailService');
    const citizenEmail = report.user.email;
    const citizenName = `${report.user.firstName} ${report.user.lastName}`;
    
    // Define email content based on action
    const emailContent = {
      'approve': {
        subject: `Report Approved - ${report.complaintId}`,
        message: `Your road damage report has been approved and will proceed to repair scheduling.`,
        status: 'Approved for Repair'
      },
      'reject': {
        subject: `Report Status Update - ${report.complaintId}`,
        message: `Your road damage report has been reviewed. Please contact municipal office for details.`,
        status: 'Under Review'
      },
      'assign': {
        subject: `Contractor Assigned - ${report.complaintId}`,
        message: `A contractor has been assigned to your road damage report. Work will begin soon.`,
        status: 'Contractor Assigned'
      },
      'start-work': {
        subject: `Work Started - ${report.complaintId}`,
        message: `Repair work has started on your reported road damage. Our team is actively working on the issue.`,
        status: 'Work in Progress'
      },
      'delay': {
        subject: `Work Delayed - ${report.complaintId}`,
        message: `There has been a delay in the repair work. We apologize for the inconvenience and will update you soon.`,
        status: 'Work Delayed'
      },
      'resolved': {
        subject: `Work Completed - ${report.complaintId}`,
        message: `Great news! The repair work on your reported road damage has been completed successfully.`,
        status: 'Work Completed'
      },
      'closed': {
        subject: `Report Closed - ${report.complaintId}`,
        message: `Your road damage report has been closed. Thank you for helping improve our roads.`,
        status: 'Report Closed'
      }
    };

    const content = emailContent[action];
    
    try {
      await emailService.sendStatusUpdateEmail(
        citizenEmail,
        citizenName,
        report.complaintId,
        content.subject,
        content.message,
        content.status,
        report.locationAddress
      );
      console.log(`✅ Status update email sent to ${citizenEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Report ${action}d successfully and citizen notified`,
      data: { 
        report: await Report.findByPk(report.id, {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
          }]
        })
      }
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
});

// @route   GET /api/reports/my-reports
// @desc    Get all reports for the current user
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {
      userId: req.user.id
    };
    
    if (status) {
      whereClause.status = status;
    }

    const reports = await Report.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reports: reports.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reports.count / limit),
          totalReports: reports.count,
          hasNext: offset + reports.rows.length < reports.count,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// @route   GET /api/reports/ward-members/:ward
// @desc    Get municipal members from specific ward
// @access  Private
router.get('/ward-members/:ward', auth, async (req, res) => {
  try {
    const { ward } = req.params;
    
    // Find all municipal members from the specified ward
    const wardMembers = await User.findAll({
      where: {
        userType: 'municipal',
        ward: ward,
        isActive: true,
        isEmailVerified: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'ward'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        wardMembers,
        ward
      }
    });

  } catch (error) {
    console.error('Error fetching ward members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ward members'
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a specific report by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id // Ensure user can only access their own reports
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
});

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      locationAddress,
      state,
      district,
      city,
      latitude,
      longitude,
      gpsCoordinates,
      damageType,
      severity,
      description,
      aiAnalysis,
      priority,
      imageData,
      assignedTo,
      sendToWard
    } = req.body;

    // Validate required fields
    if (!locationAddress || !damageType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Location address, damage type, and severity are required'
      });
    }

    // Parse GPS coordinates if provided as string
    let parsedLatitude = null;
    let parsedLongitude = null;
    
    if (gpsCoordinates && typeof gpsCoordinates === 'string') {
      const coords = gpsCoordinates.split(',').map(coord => coord.trim());
      if (coords.length === 2) {
        parsedLatitude = parseFloat(coords[0]);
        parsedLongitude = parseFloat(coords[1]);
      }
    } else if (latitude && longitude) {
      parsedLatitude = parseFloat(latitude);
      parsedLongitude = parseFloat(longitude);
    }

    // Generate unique complaint ID using timestamp
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const complaintId = `RD-${year}-${timestamp}`;

    // Determine initial status based on ward member assignment
    const initialStatus = (sendToWard && assignedTo) ? 'Under Review' : 'Submitted';
    const initialNotes = (sendToWard && assignedTo) 
      ? 'Report submitted and assigned to ward member' 
      : 'Report submitted by user';

    // Create the report
    const report = await Report.create({
      complaintId,
      userId: req.user.id,
      locationAddress: locationAddress || `${city}, ${district}, ${state}`,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      damageType,
      severity: severity.toLowerCase(),
      description: description || null,
      aiAnalysis: aiAnalysis || {},
      priority: priority || 'Medium',
      images: imageData ? [imageData] : [],
      status: initialStatus,
      assignedToId: (sendToWard && assignedTo) ? assignedTo : null,
      statusHistory: [{
        status: initialStatus,
        updatedAt: new Date(),
        updatedBy: req.user.id,
        notes: initialNotes
      }]
    });

    // Fetch the created report with user details
    const createdReport = await Report.findByPk(report.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report: createdReport,
        complaintId: report.complaintId
      }
    });

  } catch (error) {
    console.error('Error creating report:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('Unique constraint error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status (municipal/admin only)
// @access  Private
router.put('/:id/status', auth, authorize('municipal', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const validStatuses = ['Submitted', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status and add to history
    let statusHistory = [];
    
    // Ensure statusHistory is an array
    if (report.statusHistory && Array.isArray(report.statusHistory)) {
      statusHistory = [...report.statusHistory];
    } else if (report.statusHistory && typeof report.statusHistory === 'string') {
      try {
        statusHistory = JSON.parse(report.statusHistory);
      } catch (e) {
        statusHistory = [];
      }
    }
    
    statusHistory.push({
      status,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      notes: notes || null
    });

    await report.update({
      status,
      statusHistory
    });

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
});

// @route   PUT /api/reports/:id/priority
// @desc    Update report priority (municipal/admin only)
// @access  Private
router.put('/:id/priority', auth, authorize('municipal', 'admin'), async (req, res) => {
  try {
    const { priority } = req.body;
    
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.update({ priority });

    res.json({
      success: true,
      message: 'Report priority updated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Error updating report priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report priority'
    });
  }
});

// @route   PUT /api/reports/:id/assign
// @desc    Assign report to a specific ward member
// @access  Private
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedToId, notes } = req.body;
    
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status and add to history
    let statusHistory = [];
    
    // Ensure statusHistory is an array
    if (report.statusHistory && Array.isArray(report.statusHistory)) {
      statusHistory = [...report.statusHistory];
    } else if (report.statusHistory && typeof report.statusHistory === 'string') {
      try {
        statusHistory = JSON.parse(report.statusHistory);
      } catch (e) {
        statusHistory = [];
      }
    }
    
    statusHistory.push({
      status: 'Assigned',
      assignedToId: assignedToId,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      notes: notes || 'Report assigned to ward member'
    });

    await report.update({
      assignedToId: assignedToId,
      status: 'Under Review',
      statusHistory,
      wardMemberNotified: [assignedToId]
    });

    // Get assigned member details
    const assignedMember = await User.findByPk(assignedToId, {
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    res.json({
      success: true,
      message: 'Report assigned successfully',
      data: { 
        report,
        assignedTo: assignedMember
      }
    });

  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign report'
    });
  }
});

// @route   GET /api/reports/track/:complaintId
// @desc    Track a report by complaint ID (public access for citizens)
// @access  Private
router.get('/track/:complaintId', auth, async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    const report = await Report.findOne({
      where: { complaintId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Citizens can only track their own reports, municipal members can track any
    if (req.user.userType === 'citizen' && report.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only track your own reports'
      });
    }

    // Get assigned member details if assigned
    let assignedMember = null;
    if (report.assignedToId) {
      assignedMember = await User.findByPk(report.assignedToId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
      });
    }

    // Ensure statusHistory is properly formatted
    let timeline = [];
    
    console.log('Raw statusHistory:', typeof report.statusHistory, report.statusHistory);
    
    if (report.statusHistory) {
      try {
        // Handle both JSON string and array formats
        let statusHistory = report.statusHistory;
        
        // If it's a string, try to parse it
        if (typeof statusHistory === 'string') {
          try {
            statusHistory = JSON.parse(statusHistory);
          } catch (parseError) {
            console.error('Failed to parse statusHistory JSON:', parseError);
            statusHistory = [];
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(statusHistory)) {
          timeline = statusHistory.map(item => ({
            status: item.status || 'Unknown',
            updatedAt: item.updatedAt || new Date().toISOString(),
            updatedBy: item.updatedBy || report.userId,
            notes: item.notes || `Status updated to ${item.status}`,
            assignedToId: item.assignedToId
          }));
        } else {
          console.log('statusHistory is not an array after parsing:', typeof statusHistory);
          // Create basic timeline from current status
          timeline = [{
            status: report.status,
            updatedAt: report.updatedAt || report.createdAt,
            updatedBy: report.userId,
            notes: `Report ${report.status}`
          }];
        }
      } catch (error) {
        console.error('Error processing statusHistory:', error);
        // Create basic timeline from current status
        timeline = [{
          status: report.status,
          updatedAt: report.updatedAt || report.createdAt,
          updatedBy: report.userId,
          notes: `Report ${report.status}`
        }];
      }
    } else {
      // Create basic timeline if no history exists
      timeline = [{
        status: report.status,
        updatedAt: report.createdAt,
        updatedBy: report.userId,
        notes: 'Report submitted'
      }];
    }

    // Final safety check - ensure timeline is always an array
    if (!Array.isArray(timeline)) {
      console.error('Timeline is still not an array, forcing array creation');
      timeline = [{
        status: report.status,
        updatedAt: report.createdAt,
        updatedBy: report.userId,
        notes: 'Report submitted'
      }];
    }
    
    console.log('Final timeline:', timeline.length, 'entries');

    console.log('Tracking response for', complaintId, ':', {
      reportId: report.id,
      status: report.status,
      timelineLength: timeline.length,
      assignedMember: assignedMember ? `${assignedMember.firstName} ${assignedMember.lastName}` : 'None'
    });

    // Ensure the response has the timeline as an array
    const responseData = {
      report: {
        ...report.toJSON(),
        statusHistory: timeline // Override with parsed timeline
      },
      assignedMember,
      timeline: timeline // Ensure timeline is always an array
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error tracking report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track report'
    });
  }
});

module.exports = router;