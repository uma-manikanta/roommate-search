const Chat = require('../models/Chat');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    const chatMsg = await Chat.create({
      senderId: req.user.id,
      receiverId,
      message
    });

    // Populate senderId to match GET history format if needed, or just emit raw
    await chatMsg.populate('senderId', 'name');

    // Emit via Socket.io
    if (req.io) {
      req.io.to(receiverId).emit('receive_message', chatMsg);
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
    }).sort({ createdAt: 1 }); // Oldest to newest

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory
};
