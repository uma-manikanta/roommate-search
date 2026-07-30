const Chat = require('../models/Chat');
const Report = require('../models/Report');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, replyTo } = req.body;
    let attachmentUrl = null;
    let attachmentType = 'none';

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      // Basic type inference
      if (req.file.mimetype.startsWith('image/')) {
        attachmentType = 'image';
      } else {
        attachmentType = 'document';
      }
    }
    
    if (!receiverId || (!message && !attachmentUrl)) {
      return res.status(400).json({ message: 'Receiver ID and either message or attachment are required' });
    }

    const chatMsg = await Chat.create({
      senderId: req.user.id,
      receiverId,
      message: message || '',
      attachmentUrl,
      attachmentType,
      replyTo: replyTo || null
    });

    await chatMsg.populate('senderId', 'name avatar');
    if (replyTo) {
      await chatMsg.populate('replyTo');
    }

    // Emit via Socket.io
    if (req.io) {
      req.io.to(receiverId).emit('receive_message', chatMsg);
      // Emit an event to update chat list unread count specifically
      req.io.to(receiverId).emit('update_chat_list');
    }

    res.status(201).json(chatMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat history with a user
// @route   GET /api/chat/:userId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id }
      ]
    })
    .populate('replyTo')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent chats list (WhatsApp sidebar style)
// @route   GET /api/chat/recent/list
// @access  Private
const getRecentChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate to find the latest message per user and count unreads
    const recentChats = await Chat.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 } // Sort by newest first
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          latestMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details for each chat partner
    const populatedChats = await User.populate(recentChats, {
      path: '_id',
      select: 'name avatar isIdentityVerified occupationStatus'
    });

    // Format output
    const formattedChats = populatedChats.map(chat => ({
      user: chat._id,
      latestMessage: chat.latestMessage,
      unreadCount: chat.unreadCount
    })).sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json(formattedChats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark chat as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;

    await Chat.updateMany(
      { senderId: otherUserId, receiverId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report a user
// @route   POST /api/chat/report
// @access  Private
const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'User ID and reason are required' });
    }

    await Report.create({
      reporterId: req.user.id,
      reportedUserId,
      reason
    });

    res.status(201).json({ message: 'User reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/message/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chatMsg = await Chat.findById(id);

    if (!chatMsg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can edit
    if (chatMsg.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Check if within 15 mins (900000 ms)
    const now = Date.now();
    const createdAt = chatMsg.createdAt.getTime();
    if (now - createdAt > 15 * 60 * 1000) {
      return res.status(403).json({ message: 'Message can only be edited within 15 minutes of sending' });
    }

    chatMsg.message = message;
    chatMsg.isEdited = true;
    await chatMsg.save();

    await chatMsg.populate('senderId', 'name avatar');
    if (chatMsg.replyTo) {
      await chatMsg.populate('replyTo');
    }

    if (req.io) {
      // Broadcast to receiver
      req.io.to(chatMsg.receiverId.toString()).emit('message_edited', chatMsg);
      // Also broadcast to sender (in case they have multiple tabs open)
      req.io.to(req.user.id).emit('message_edited', chatMsg);
      // Update sidebar
      req.io.to(chatMsg.receiverId.toString()).emit('update_chat_list');
    }

    res.json(chatMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get total unread count for navbar badge
// @route   GET /api/chat/unread/count
// @access  Private
const getTotalUnreadCount = async (req, res) => {
  try {
    const count = await Chat.countDocuments({
      receiverId: req.user.id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getRecentChats,
  markAsRead,
  reportUser,
  editMessage,
  getTotalUnreadCount
};
