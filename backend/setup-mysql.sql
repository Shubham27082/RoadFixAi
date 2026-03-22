-- Road Damage Database Setup for MySQL/XAMPP
-- Run this script in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS road_damage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE road_damage_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    userType ENUM('citizen', 'municipal', 'admin') DEFAULT 'citizen',
    ward ENUM(
        'Ward 1 - Downtown',
        'Ward 2 - North District',
        'Ward 3 - East Side',
        'Ward 4 - West End',
        'Ward 5 - South Central',
        'Ward 6 - Industrial Area',
        'Ward 7 - Residential Zone'
    ) NOT NULL,
    isEmailVerified BOOLEAN DEFAULT FALSE,
    emailVerificationToken VARCHAR(6) NULL,
    emailVerificationExpires DATETIME NULL,
    passwordResetToken VARCHAR(6) NULL,
    passwordResetExpires DATETIME NULL,
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME NULL,
    profileImage VARCHAR(255) NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_userType (userType),
    INDEX idx_ward (ward),
    INDEX idx_isEmailVerified (isEmailVerified),
    INDEX idx_emailVerificationToken (emailVerificationToken)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaintId VARCHAR(20) NOT NULL UNIQUE,
    userId INT NOT NULL,
    locationAddress TEXT NOT NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    damageType ENUM('Pothole', 'Crack', 'Surface Damage', 'Broken Pavement', 'Water Logging', 'Other') NOT NULL,
    severity ENUM('low', 'medium', 'high') NOT NULL,
    description TEXT NULL,
    images JSON NULL,
    aiAnalysis JSON NULL,
    status ENUM('Submitted', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected') DEFAULT 'Submitted',
    assignedToId INT NULL,
    wardMemberNotified JSON NULL,
    statusHistory JSON NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    estimatedCompletionDate DATETIME NULL,
    actualCompletionDate DATETIME NULL,
    repairCost JSON NULL,
    contractorInfo JSON NULL,
    isPublic BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedToId) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_complaintId (complaintId),
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_damageType (damageType),
    INDEX idx_severity (severity),
    INDEX idx_createdAt (createdAt),
    INDEX idx_location (latitude, longitude)
);

-- Insert sample users for testing
INSERT INTO users (firstName, lastName, email, phone, userType, ward, isEmailVerified, password) VALUES
('John', 'Doe', 'citizen@demo.com', '1234567890', 'citizen', 'Ward 1 - Downtown', TRUE, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy'), -- password: password
('Jane', 'Smith', 'municipal@demo.com', '0987654321', 'municipal', 'Ward 5 - South Central', TRUE, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy'), -- password: password
('Admin', 'User', 'admin@demo.com', '5555555555', 'admin', 'Ward 1 - Downtown', TRUE, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJBzwESWy'); -- password: password

-- Show tables
SHOW TABLES;

-- Show users table structure
DESCRIBE users;

-- Show reports table structure  
DESCRIBE reports;

-- Display sample data
SELECT id, firstName, lastName, email, userType, ward, isEmailVerified FROM users;