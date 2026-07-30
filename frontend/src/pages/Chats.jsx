import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { Send, Paperclip, MoreVertical, ShieldCheck, Reply, X, FileText, Image as ImageIcon, MessageCircle, ArrowLeft, Search } from 'lucide-react';

let socket;

const formatChatDateHeader = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = today - d;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
};

const Chats = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [recentChats, setRecentChats] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingMessage, setEditingMessage] = useState(null);
  const [msgMenuOpen, setMsgMenuOpen] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      setMsgMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Socket and fetch initial data
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join_room', user._id);

    fetchRecentChats();

    socket.on('receive_message', (message) => {
      // If the message is for the active chat, append it and mark as read
      if (activeChatUser && (message.senderId._id === activeChatUser._id || message.senderId === activeChatUser._id)) {
        setMessages((prev) => [...prev, message]);
        markAsRead(activeChatUser._id);
      }
    });

    socket.on('update_chat_list', () => {
      fetchRecentChats();
    });

    socket.on('message_edited', (editedMsg) => {
      setMessages((prev) => prev.map(msg => msg._id === editedMsg._id ? editedMsg : msg));
      fetchRecentChats(); // Update sidebar latest message if it was edited
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeChatUser]);

  // Handle URL params for opening a specific chat
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const targetUserId = searchParams.get('user');
    const targetUserName = searchParams.get('name');
    
    if (targetUserId && !activeChatUser) {
      // Fetch user details to set as active chat
      const initializeDirectChat = async () => {
        try {
          // Since we might not have the user details, we can grab it from recent chats or fetch it directly
          const { data } = await api.get('/chat/recent');
          setRecentChats(data);
          const existing = data.find(c => c.user._id === targetUserId);
          if (existing) {
            handleSelectChat(existing.user);
          } else {
            // Need a generic way to fetch a user profile by ID if it's a completely new chat.
            // For now, if it's a new match, they clicked "Chat" from Matches.jsx, we can just fetch history and let the user object be minimal.
            // In a real app, you'd fetch the user profile here.
            setActiveChatUser({ _id: targetUserId, name: targetUserName || 'Loading...' }); 
            fetchMessages(targetUserId);
          }
        } catch (err) {
          console.error(err);
        }
      };
      initializeDirectChat();
    }
  }, [location.search]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecentChats = async () => {
    try {
      const { data } = await api.get('/chat/recent');
      setRecentChats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recent chats:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.get(`/chat/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await api.put(`/chat/read/${userId}`);
      fetchRecentChats(); // refresh unread counts
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSelectChat = (chatUser) => {
    setActiveChatUser(chatUser);
    setReplyToMessage(null);
    setEditingMessage(null);
    setMenuOpen(false);
    
    // Clear URL param without refreshing
    window.history.replaceState({}, '', '/chats');
    
    fetchMessages(chatUser._id);
    markAsRead(chatUser._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    try {
      if (editingMessage) {
        // Edit flow
        const { data } = await api.put(`/chat/message/${editingMessage._id}`, { message: newMessage });
        setMessages((prev) => prev.map(msg => msg._id === data._id ? data : msg));
        setEditingMessage(null);
        setNewMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        fetchRecentChats();
        return;
      }

      // Normal send flow
      const formData = new FormData();
      formData.append('receiverId', activeChatUser._id);
      
      if (newMessage.trim()) formData.append('message', newMessage);
      if (replyToMessage) formData.append('replyTo', replyToMessage._id);
      if (attachment) formData.append('attachment', attachment);

      const { data } = await api.post('/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      setAttachment(null);
      setReplyToMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      fetchRecentChats(); // Update sidebar latest message
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  const handleReportUser = async () => {
    const reason = prompt("Please provide a reason for reporting this user:");
    if (!reason) return;

    try {
      await api.post('/chat/report', {
        reportedUserId: activeChatUser._id,
        reason
      });
      alert('User has been reported. Our team will review the chat logs.');
      setMenuOpen(false);
    } catch (err) {
      alert('Failed to report user.');
    }
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  const cancelReply = () => setReplyToMessage(null);
  const cancelAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };
  
  const handleEditInit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.message);
    setReplyToMessage(null);
    setMsgMenuOpen(null);
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        textareaRef.current.focus();
      }, 0);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const filteredChats = recentChats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 animate-fade-in flex bg-white w-full h-full overflow-hidden min-h-0">
      
      {/* Sidebar: Recent Chats */}
      <div className={`w-full md:w-1/3 flex flex-col border-r border-gray-200 bg-white ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-col gap-3 pt-safe">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Chats</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-0 focus:bg-white focus:shadow-sm transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : recentChats.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={32} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">No chats yet</h3>
              <p className="text-sm text-gray-500 mb-4">You haven't messaged anyone yet. Go to your matches and start a conversation!</p>
              <button onClick={() => navigate('/matches')} className="btn-primary py-2 px-4 text-sm">Find Matches</button>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.user._id} 
                onClick={() => handleSelectChat(chat.user)}
                className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                  activeChatUser?._id === chat.user._id ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                {chat.user.avatar ? (
                  <img src={chat.user.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="avatar" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shadow-sm">
                    {chat.user.name.charAt(0)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-gray-900 truncate pr-2 flex items-center gap-1">
                      {chat.user.name}
                      {chat.user.isIdentityVerified && <ShieldCheck size={14} className="text-success-500" />}
                    </h4>
                    <span className={`text-[11px] whitespace-nowrap ${chat.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                      {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate pr-2 ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {chat.latestMessage.attachmentUrl ? (
                        <span className="flex items-center gap-1">
                          {chat.latestMessage.attachmentType === 'image' ? <ImageIcon size={14}/> : <FileText size={14}/>} 
                          {chat.latestMessage.attachmentType}
                        </span>
                      ) : (
                        chat.latestMessage.message
                      )}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[20px] text-center shadow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className={`
        flex-1 flex flex-col bg-[#efeae2] min-h-0
        ${!activeChatUser ? 'hidden md:flex items-center justify-center' : 'flex'}
        ${activeChatUser ? 'fixed inset-0 z-[100] md:relative md:inset-auto md:z-auto' : ''}
      `}>
        {!activeChatUser ? (
          <div className="text-center text-gray-500 max-w-md p-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle size={48} className="text-primary-300" />
            </div>
            <h3 className="text-2xl font-light text-gray-700 mb-2">Roommate Finder Web</h3>
            <p className="text-sm">Select a chat from the sidebar to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm pt-safe">
              <div className="flex items-center gap-3">
                <button onClick={() => { setActiveChatUser(null); window.history.replaceState({}, '', '/chats'); }} className="md:hidden text-gray-500 hover:text-gray-800">
                  <ArrowLeft size={20} />
                </button>
                {activeChatUser.avatar ? (
                  <img src={activeChatUser.avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {activeChatUser.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-1">
                    {activeChatUser.name}
                    {activeChatUser.isIdentityVerified && <ShieldCheck size={16} className="text-success-500" />}
                  </h3>
                  {activeChatUser.occupationStatus && (
                    <p className="text-xs text-gray-500">{activeChatUser.occupationStatus}</p>
                  )}
                </div>
              </div>
              
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50 animate-scale-in">
                    <button 
                      onClick={handleReportUser}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      Report User
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 relative bg-slate-50 custom-scrollbar">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user._id || msg.senderId._id === user._id;
                const currentDate = new Date(msg.createdAt).toLocaleDateString();
                const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null;
                const showHeader = currentDate !== prevDate;
                
                return (
                  <React.Fragment key={index}>
                    {showHeader && (
                      <div className="flex justify-center my-4">
                        <span className="bg-[#f0f2f5] text-gray-600 text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm border border-gray-100 uppercase tracking-wide">
                          {formatChatDateHeader(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                      <div className="flex items-center gap-2">
                        {/* Desktop Reply & Edit Buttons (Left of bubble if mine) */}
                        {isMe && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {new Date() - new Date(msg.createdAt) <= 15 * 60 * 1000 && !msg.attachmentUrl && (
                              <button 
                                onClick={() => handleEditInit(msg)}
                                className="p-1 text-gray-500 hover:text-primary-600 bg-white/50 rounded-full"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => setReplyToMessage(msg)}
                              className="p-1 text-gray-500 hover:text-gray-800 bg-white/50 rounded-full"
                              title="Reply"
                            >
                              <Reply size={14} className="scale-x-[-1]" />
                            </button>
                          </div>
                        )}
                      
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm relative w-fit min-w-[100px] ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm'}`}>
                        {/* Reply Context */}
                        {msg.replyTo && (
                          <div className={`rounded p-2 mb-1 mt-1 border-l-4 text-sm ${isMe ? 'bg-white/10 border-white text-white' : 'bg-black/5 border-primary-500 text-gray-700'}`}>
                            <p className={`font-bold text-[11px] mb-0.5 ${isMe ? 'text-primary-100' : 'text-primary-600'}`}>
                              {msg.replyTo.senderId === user._id ? 'You' : activeChatUser.name}
                            </p>
                            <p className="text-[13px] line-clamp-2 break-words" style={{ wordBreak: 'break-word' }}>
                              {msg.replyTo.message || 'Attachment'}
                            </p>
                          </div>
                        )}

                        {/* Attachments */}
                        {msg.attachmentUrl && (
                          <div className="mb-1 mt-1">
                            {msg.attachmentType === 'image' ? (
                              <a href={`http://localhost:5000${msg.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:5000${msg.attachmentUrl}`} alt="attachment" className="rounded-lg max-h-64 object-contain bg-black/5" />
                              </a>
                            ) : (
                              <a 
                                href={`http://localhost:5000${msg.attachmentUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded-lg hover:brightness-95 transition-colors mt-1 ${isMe ? 'bg-white/10' : 'bg-black/5'}`}
                              >
                                <FileText size={20} className={`${isMe ? 'text-white' : 'text-gray-500'} flex-shrink-0`} />
                                <span className={`text-[13px] font-medium break-all line-clamp-1 ${isMe ? 'text-white' : 'text-blue-600'}`}>Document</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Message Text and Timestamp */}
                        <div className={`whitespace-pre-wrap text-[15px] leading-snug ${isMe ? 'text-white' : 'text-gray-900'}`} style={{ wordBreak: 'break-word' }}>
                          {msg.message}
                          <span className="inline-block w-[4.5rem] text-transparent select-none">.</span>
                        </div>
                        <div className={`absolute right-2 bottom-1 flex items-center gap-1 text-[10px] ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                          {msg.isEdited && <span className="italic opacity-80">(edited)</span>}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Desktop Reply Button for incoming messages */}
                      {!isMe && (
                        <button 
                          onClick={() => setReplyToMessage(msg)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-800 transition-opacity bg-white/50 rounded-full"
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] p-3 flex flex-col z-10">
              
              {/* Edit Preview */}
              {editingMessage && (
                <div className="bg-white mx-1 mb-2 p-2 rounded-lg border-l-4 border-amber-500 flex justify-between items-center shadow-sm relative">
                  <div className="truncate flex-1 pr-4">
                    <p className="font-bold text-amber-600 text-xs mb-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      Edit Message
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      {editingMessage.message}
                    </p>
                  </div>
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Reply Preview */}
              {replyToMessage && (
                <div className="bg-white mx-1 mb-2 p-2 rounded-lg border-l-4 border-primary-500 flex justify-between items-center shadow-sm relative">
                  <div className="truncate flex-1 pr-4">
                    <p className="font-bold text-primary-600 text-xs mb-0.5">
                      Replying to {replyToMessage.senderId === user._id ? 'yourself' : activeChatUser.name}
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      {replyToMessage.message || 'Attachment'}
                    </p>
                  </div>
                  <button onClick={cancelReply} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Attachment Preview */}
              {attachment && (
                <div className="bg-white mx-1 mb-2 p-2 rounded-lg flex items-center justify-between shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 truncate">
                    {attachment.type.startsWith('image/') ? <ImageIcon size={20} className="text-blue-500"/> : <FileText size={20} className="text-red-500"/>}
                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                  </div>
                  <button onClick={cancelAttachment} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAttachment} 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors self-end mb-1"
                >
                  <Paperclip size={24} />
                </button>
                
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                  placeholder={editingMessage ? "Edit message..." : "Type a message"}
                  className="flex-1 py-2 px-4 bg-white border-none rounded-xl focus:ring-0 focus:outline-none shadow-sm resize-none custom-scrollbar"
                  style={{ minHeight: '40px', maxHeight: '120px', overflowY: 'auto' }}
                />
                
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() && !attachment}
                  className="p-2 text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end mb-1"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chats;
