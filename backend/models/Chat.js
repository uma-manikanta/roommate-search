const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
  attachmentUrl: { type: String },
  attachmentType: { type: String, enum: ['image', 'document', 'none'], default: 'none' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  isBlocked: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
