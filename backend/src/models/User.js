const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  profilePhoto: String,
  tokens: {
    access: String,
    refresh: String,
    expiry: Date
  },
  preferences: {
    emailsPerPage: {
      type: Number,
      default: 20
    },
    summarizeNewEmails: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system"
    }
  },
  lastSync: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add the isTokenExpired method to the schema
userSchema.methods.isTokenExpired = function() {
  if (!this.tokens || !this.tokens.expiry) {
    return true;
  }
  return new Date() >= this.tokens.expiry;
};

const User = mongoose.model("User", userSchema);

module.exports = User;