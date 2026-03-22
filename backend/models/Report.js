const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  complaintId: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  locationAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Location address is required' }
    }
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gpsCoordinates: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  damageType: {
    type: DataTypes.ENUM('Pothole', 'Crack', 'Surface Damage', 'Broken Pavement', 'Water Logging', 'Road Collapse', 'Manhole Issues', 'Other'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Damage type is required' }
    }
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Severity level is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Description cannot exceed 1000 characters' }
    }
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  aiAnalysis: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    get() {
      const rawValue = this.getDataValue('aiAnalysis');
      if (!rawValue) return {};
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return {};
        }
      }
      return rawValue;
    }
  },
  status: {
    type: DataTypes.ENUM('Submitted', 'Under Review', 'Approved', 'Assigned', 'In Progress', 'Delayed', 'Completed', 'Closed', 'Rejected'),
    defaultValue: 'Submitted'
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  wardMemberNotified: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  statusHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    defaultValue: 'Medium'
  },
  estimatedCompletionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualCompletionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  repairCost: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { estimated: null, actual: null }
  },
  contractorInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'reports',
  timestamps: true,
  indexes: [
    { fields: ['complaintId'], unique: true },
    { fields: ['userId'] },
    { fields: ['status'] }
  ],
  hooks: {
    beforeCreate: async (report) => {
      if (!report.complaintId) {
        const year = new Date().getFullYear();
        // Use sequelize directly to avoid circular reference
        const { sequelize } = require('../config/database');
        const [results] = await sequelize.query('SELECT COUNT(*) as count FROM reports');
        const count = results[0].count;
        report.complaintId = `RD-${year}-${String(count + 1).padStart(6, '0')}`;
      }
    },
    beforeUpdate: (report) => {
      if (report.changed('status')) {
        const statusHistory = report.statusHistory || [];
        statusHistory.push({
          status: report.status,
          updatedAt: new Date(),
          notes: null
        });
        report.statusHistory = statusHistory;
      }
    }
  }
});

// Instance methods
Report.prototype.getDaysSinceReported = function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
};

Report.prototype.addStatusUpdate = function(status, updatedBy, notes = null) {
  const statusHistory = this.statusHistory || [];
  statusHistory.push({
    status,
    updatedBy,
    updatedAt: new Date(),
    notes
  });
  this.statusHistory = statusHistory;
  this.status = status;
};

// Class methods
Report.getReportsByWard = async function(ward) {
  const User = require('./User');
  return await this.findAll({
    include: [{
      model: User,
      as: 'user',
      where: { ward },
      attributes: ['id', 'firstName', 'lastName', 'email', 'ward']
    }],
    order: [['createdAt', 'DESC']]
  });
};

Report.getStatistics = async function() {
  const { Op } = require('sequelize');
  
  const totalReports = await this.count();
  const pendingReports = await this.count({
    where: {
      status: {
        [Op.in]: ['Submitted', 'Under Review', 'Approved']
      }
    }
  });
  const completedReports = await this.count({
    where: { status: 'Completed' }
  });
  const inProgressReports = await this.count({
    where: { status: 'In Progress' }
  });

  return {
    totalReports,
    pendingReports,
    completedReports,
    inProgressReports
  };
};

// Define associations
Report.associate = (models) => {
  // Report belongs to User (reporter)
  Report.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Report;