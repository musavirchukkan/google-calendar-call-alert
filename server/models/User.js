import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  picture: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  calendarEnabled: {
    type: Boolean,
    default: false
  },
  twilioEnabled: {
    type: Boolean,
    default: false
  },
  tokens: {
    accessToken: {
      type: String,
      default: ''
    },
    refreshToken: {
      type: String,
      default: ''
    },
    tokenExpiry: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

// Method to generate JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Check if Google Calendar is connected
userSchema.methods.isCalendarConnected = function() {
  return this.calendarEnabled && 
         this.tokens.accessToken && 
         this.tokens.refreshToken && 
         this.tokens.tokenExpiry > new Date();
};

// Check if Twilio is configured
userSchema.methods.isTwilioConfigured = function() {
  return this.twilioEnabled && this.phoneNumber;
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Update lastLogin on save if not a new user
  if (!this.isNew) {
    this.lastLogin = Date.now();
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

export default User;