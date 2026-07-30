import React, { useState, useEffect, useContext, useRef } from 'react';
import { X, Send, AlertTriangle, ShieldAlert, FileText } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import AgreementModal from './AgreementModal';

const ChatDrawer = ({ isOpen, onClose, matchUser }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join_room', user._id);
      
      socketRef.current.on('receive_message', (msg) => {
        if (matchUser && (msg.senderId._id === matchUser._id || msg.receiverId === matchUser._id)) {
          setMessages((prev) => {
            if (prev.find(p => p._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      });
    }
    
    if (isOpen && matchUser) {
      fetchChatHistory();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isOpen, user, matchUser]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chat/${matchUser._id}`);
      setMessages(data);
      setWarning('');
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAgreement = () => {
    setShowAgreementModal(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !matchUser) return;

    try {
      const { data } = await api.post('/chat', {
        receiverId: matchUser._id,
        message: input
      });
      
      // We do NOT manually append to setMessages here if we rely on the socket 'receive_message' event.
      // But since the socket 'receive_message' only emits to receiverId in backend currently, 
      // we still append it locally for the sender!
      setMessages([...messages, data]);
      setInput('');
      setWarning('');
    } catch (err) {
      if (err.response?.status === 403) {
        setWarning(err.response.data.message);
      } else {
        setWarning('Failed to send message.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col transform transition-transform animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-900 text-white">
          <div>
            <h3 className="font-bold text-lg">{matchUser?.name || 'Chat'}</h3>
            <span className="text-xs text-success-500 font-medium">{matchUser?.verificationType || 'Verified User'}</span>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={handleExportAgreement}
              className="text-white hover:text-gray-200 transition-colors flex items-center gap-1 text-sm font-medium mr-2" 
              title="Export Joint Agreement"
            >
              <FileText size={18} /> Export Agreement
            </button>
            <button className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm font-medium" title="Report User">
              <ShieldAlert size={18} /> Report
            </button>
            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Anti-scam Banner */}
        <div className="bg-orange-50 border-b border-orange-200 p-3 flex gap-3 text-orange-800 text-sm">
          <AlertTriangle size={20} className="flex-shrink-0 text-orange-500" />
          <p>
            <strong>Safety Warning:</strong> Never transfer advance rent or token amounts before physically visiting the property and verifying documents.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-400 mt-10 text-sm">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">
              Start the conversation regarding housing logistics.
            </div>
          ) : (
            messages.map((msg, idx) => {
              // msg.senderId could be an object if populated, or just a string/ObjectId. 
              // We compare with current user._id
              const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-success-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{timeString}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          {warning && (
            <div className="mb-3 text-xs font-medium text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-2">
              <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
              {warning}
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-success-500 focus:border-success-500 outline-none"
            />
            <button type="submit" className="bg-primary-900 text-white rounded-full p-2.5 hover:bg-primary-800 transition-colors shadow-sm flex-shrink-0" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
      <AgreementModal isOpen={showAgreementModal} onClose={() => setShowAgreementModal(false)} matchUser={matchUser} />
    </div>
  );
};

export default ChatDrawer;
