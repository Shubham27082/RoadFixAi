const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' },
      len: { args: [2, 50], msg: 'First name must be between 2 and 50 characters' }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name is required' },
      len: { args: [2, 50], msg: 'Last name must be between 2 and 50 characters' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      notEmpty: { msg: 'Email is required' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' },
      is: { args: /^[\+]?[1-9][\d]{0,15}$/, msg: 'Please provide a valid phone number' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters long' }
    }
  },
  userType: {
    type: DataTypes.ENUM('citizen', 'municipal', 'admin'),
    defaultValue: 'citizen',
    allowNull: false
  },
  ward: {
    type: DataTypes.ENUM(
      'Ward 1 - Downtown',
      'Ward 2 - North District', 
      'Ward 3 - East Side',
      'Ward 4 - West End',
      'Ward 5 - South Central',
      'Ward 6 - Industrial Area',
      'Ward 7 - Residential Zone'
    ),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Ward selection is required' }
    }
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['emailVerificationToken'] }
  ],
  hooks: {
    beforeSave: async (user) => {
      // Hash password if it's new or changed
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

User.prototype.generateEmailVerificationToken = function() {
  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set token and expiration (15 minutes)
  this.emailVerificationToken = verificationCode;
  this.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  return verificationCode;
};

User.prototype.generatePasswordResetToken = function() {
  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set token and expiration (10 minutes)
  this.passwordResetToken = resetCode;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetCode;
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Class methods
User.findByVerificationToken = function(token) {
  return this.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });
};

User.findByPasswordResetToken = function(token) {
  return this.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });
};

// Remove password from JSON output
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailVerificationToken;
  delete values.emailVerificationExpires;
  delete values.passwordResetToken;
  delete values.passwordResetExpires;
  return values;
};

// Define associations
User.associate = (models) => {
  // User has many Reports (as reporter)
  User.hasMany(models.Report, {
    foreignKey: 'userId',
    as: 'reports'
  });
};

module.exports = User;