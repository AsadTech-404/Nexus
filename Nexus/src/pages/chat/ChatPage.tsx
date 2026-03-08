import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Ensure this matches your messageRoute setup
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<any>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Fetch Conversations for Sidebar
  const fetchConversations = async () => {
    try {
      const res = await api.get("/message/messages");
      setConversations(res.data.conversations);
      
      // Update chat partner info from the conversation list if it exists
      if (userId) {
        const currentConv = res.data.conversations.find((c: any) => c.otherUser.id === userId);
        if (currentConv) setChatPartner(currentConv.otherUser);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // 2. Fetch Messages between Users
  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/message/${userId}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (currentUser) fetchConversations();
  }, [currentUser, userId]);

  useEffect(() => {
    if (currentUser && userId) fetchMessages();
  }, [currentUser, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send Message to Backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const res = await api.post("/message/send-message", {
        content: newMessage,
        receiverId: userId
      });

      // Update local message state
      setMessages((prev) => [...prev, res.data.newMessage]);
      setNewMessage('');
      
      // Refresh sidebar to update "last message" snippet
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatUserList conversations={conversations} />
      </div>

      <div className="flex-1 flex flex-col">
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{chatPartner.name}</h2>
                  <p className="text-sm text-gray-500">
                    {chatPartner.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="rounded-full p-2"><Phone size={18} /></Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2"><Video size={18} /></Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2"><Info size={18} /></Button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message._id || message.id}
                      message={message}
                      isCurrentUser={message.senderId === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                   <MessageCircle size={32} className="text-gray-400 mb-2" />
                   <h3 className="text-lg font-medium">Say hello!</h3>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2"><Smile size={20} /></Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full p-2 w-10 h-10">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
          </div>
        )}
      </div>
    </div>
  );
};