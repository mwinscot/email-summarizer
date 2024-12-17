const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  from: {
    name: String,
    email: {
      type: String,
      required: true
    }
  },
  to: [{
    name: String,
    email: {
      type: String,
      required: true
    }
  }],
  date: {
    type: Date,
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  snippet: String,
  isStarred: {
    type: Boolean,
    default: false
  },
  folder: {
    type: String,
    enum: ["inbox", "archive", "trash"],
    default: "inbox"
  }
}, {
  timestamps: true
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;