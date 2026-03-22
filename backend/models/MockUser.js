// Mock User model for development without MongoDB
const bcrypt = require('bcryptjs');

class MockUser {
  constructor(userData) {
    this.id = Date.now().toString();
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.email = userData.email;
    this.phone = userData.phone;
    this.password = userData.password;
    this.userType = userData.userType || 'citizen';
    this.ward = userData.ward;
    this.isEmailVerified = false;
    this.emailVerificationToken = null;
    this.emailVerificationExpires = null;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    // Hash password if modified
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    // Update timestamp
    this.updatedAt = new Date();
    
    // Store in memory
    MockUser.users.set(this.email, this);
    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  generateEmailVerificationToken() {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationToken = verificationCode;
    this.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    return verificationCode;
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    return obj;
  }

  static users = new Map();

  static async findOne(query) {
    if (query.email) {
      const user = MockUser.users.get(query.email);
      if (!user) return null;

      // Check verification token if provided
      if (query.emailVerificationToken) {
        if (user.emailVerificationToken !== query.emailVerificationToken) return null;
        if (user.emailVerificationExpires < Date.now()) return null;
      }

      return user;
    }
    return null;
  }

  static async findById(id) {
    for (const user of MockUser.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }
}

module.exports = MockUser;