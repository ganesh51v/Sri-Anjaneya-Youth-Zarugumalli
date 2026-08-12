import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const LOCAL_STORAGE_KEY = 'sa_chat_history';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);

  // Sync message history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages.slice(-20))); // Keep last 20 messages
    } catch (e) {
      /* ignore storage quota limits */
    }
  }, [messages]);

  // Handle ESC key to close chat window
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (text) => {
    if (!text || loading) return;

    setError('');
    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          history: messages.slice(-6).map((m) => ({ role: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to connect to AI Assistant. Please try again.');
      }

      const aiMsg = {
        sender: 'ai',
        text: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('[ChatbotWidget] API warning:', err.message);
      setError(err.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setError('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-50 p-3.5 rounded-full bg-gradient-to-tr from-saffron-500 to-gold-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-gold-300/40 group"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="flex items-center gap-1">
              <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-saffron-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
        </div>
      </button>

      {/* Chat Popover Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          loading={loading}
          error={error}
          onSendMessage={handleSendMessage}
          onClearHistory={handleClearHistory}
          onRetry={handleRetry}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatbotWidget;
