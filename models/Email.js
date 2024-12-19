// models/Email.js
import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  from: { type: String, required: true },
  snippet: String,
  date: { type: Date, required: true },
  isStarred: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ['notInteresting', 'toRead', 'needsAction', null],
    default: null 
  },
  lastModified: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Prevent mongoose from creating plural collection name
const Email = mongoose.models.Email || mongoose.model('Email', emailSchema);

export default Email;