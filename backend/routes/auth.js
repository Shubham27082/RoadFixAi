const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const emailService = require('../services/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user and send verification email
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('ward')
    .isIn([
      'Ward 1 - Downtown',
      'Ward 2 - North District', 
      'Ward 3 - East Side',
      'Ward 4 - West End',
      'Ward 5 - South Central',
      'Ward 6 - Industrial Area',
      'Ward 7 - Residential Zone'
    ])
    .withMessage('Please select a valid ward'),
  body('userType')
    .isIn(['citizen', 'municipal'])
    .withMessage('Please select a valid user type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password, ward, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      ward,
      userType
    });

    // Generate email verification token
    const verificationCode = user.generateEmailVerificationToken();

    // Save verification token
    await user.save();

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      email,
      firstName,
      verificationCode
    );

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      
      // If email fails, return error and don't create user
      await user.destroy(); // Remove the created user
      return res.status(500).json({
        success: false,
        message: 'Registration failed: Unable to send verification email. Please check your email address and try again.',
        error: 'Email service unavailable'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: {
        userId: user.id,
        email: user.email,
        emailSent: emailResult.success
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with 6-digit code
// @access  Public
router.post('/verify-email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Verification code must be 6 digits')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, verificationCode } = req.body;

    // Find user by email and verification token
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        email,
        emailVerificationToken: verificationCode,
        emailVerificationExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    // DO NOT generate JWT token - user must login separately
    res.json({
      success: true,
      message: 'Email verified successfully! Please login to access your account.',
      data: {
        email: user.email,
        firstName: user.firstName,
        isEmailVerified: user.isEmailVerified,
        requiresLogin: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find unverified user
    const user = await User.findOne({ 
      where: {
        email, 
        isEmailVerified: false 
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found or already verified'
      });
    }

    // Generate new verification code
    const verificationCode = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      email,
      user.firstName,
      verificationCode
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        error: 'Email service unavailable'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully! Please check your email.',
      data: {
        emailSent: emailResult.success
      }
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('userType')
    .isIn(['citizen', 'municipal', 'admin'])
    .withMessage('Please select a valid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, userType } = req.body;

    // Find user by email (password is included by default in Sequelize)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user type matches
    if (user.userType !== userType) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user type selected'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          ward: user.ward,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          ward: user.ward,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email (don't reveal if email exists or not)
    const user = await User.findOne({ where: { email } });

    // Always return success message for security (don't reveal if email exists)
    const successMessage = 'If an account with that email exists, we have sent a password reset link.';

    if (!user) {
      // Don't reveal that email doesn't exist
      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Generate secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token and expiration (5 minutes)
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      user.firstName,
      resetUrl
    );

    if (!emailResult.success) {
      console.error('Password reset email failed:', emailResult.error);
      // Reset the token if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: successMessage
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Find user by valid reset token
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Update password (will be hashed by the model hook)
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/verify-reset-token
// @desc    Verify if reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by valid reset token
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
        firstName: user.firstName
      }
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;