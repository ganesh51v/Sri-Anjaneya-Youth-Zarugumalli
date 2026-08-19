import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const LOCAL_STORAGE_KEY = 'sa_chat_history';
const MAX_STORED_MESSAGES = 20;
const MAX_HISTORY_MESSAGES = 8;

const createConversationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `conv_${crypto.randomUUID()}`;
  }

  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const createMessage = (sender, text) => ({
  id: `${sender}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

const readStoredMessages = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((msg) => msg && typeof msg.text === 'string' && ['user', 'ai'].includes(msg.sender))
      .slice(-MAX_STORED_MESSAGES)
      .map((msg) => ({ ...msg, id: msg.id || createMessage(msg.sender, msg.text).id }));
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  }
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(readStoredMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedPrompt, setFailedPrompt] = useState('');
  const conversationIdRef = useRef(createConversationId());
  const abortControllerRef = useRef(null);
  const messagesRef = useRef(messages);

  // Sync message history to localStorage
  useEffect(() => {
    messagesRef.current = messages;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    } catch {
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

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleSendMessage = useCallback(async (text, options = {}) => {
    if (!text || loading) return;

    const cleanText = text.trim().slice(0, 500);
    if (!cleanText) return;

    setError('');
    setFailedPrompt('');

    const currentMessages = messagesRef.current;
    const lastMessage = currentMessages[currentMessages.length - 1];
    const historyMessages =
      lastMessage?.sender === 'user' && lastMessage.text === cleanText
        ? currentMessages.slice(0, -1)
        : currentMessages;
    const requestMessages = options.retry
      ? currentMessages
      : [...currentMessages, createMessage('user', cleanText)];

    setMessages(requestMessages);
    messagesRef.current = requestMessages;

    setLoading(true);
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: cleanText,
          conversationId: conversationIdRef.current,
          history: historyMessages
            .slice(-MAX_HISTORY_MESSAGES)
            .map((m) => ({ role: m.sender === 'ai' ? 'assistant' : 'user', text: m.text }))
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to connect to AI Assistant. Please try again.');
      }

      conversationIdRef.current = data.conversationId || conversationIdRef.current;
      const aiSources = Array.isArray(data.sources) ? data.sources : [];
      setMessages((prev) => {
        const aiMsg = createMessage('ai', data.message || 'Namaste! I am ready to help with Sri Anjaneya Youth Association information.');
        aiMsg.sources = aiSources;
        const next = [...prev, aiMsg];
        messagesRef.current = next;
        return next;
      });
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.warn('[ChatbotWidget] API warning:', err.message);
      setFailedPrompt(cleanText);
      setError(err.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleClearHistory = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    messagesRef.current = [];
    setError('');
    setFailedPrompt('');
    conversationIdRef.current = createConversationId();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleRetry = () => {
    if (failedPrompt) {
      handleSendMessage(failedPrompt, { retry: true });
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        aria-controls="sri-anjaneya-ai-chat"
        className="fixed bottom-5 right-5 z-50 p-3.5 rounded-full bg-gradient-to-tr from-saffron-500 to-gold-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-gold-300/40 group"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="flex items-center gap-1">
              <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <MessageSquare className="w-3.5 h-3.5 -ml-2 mt-3 opacity-90" />
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
